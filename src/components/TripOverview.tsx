import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Calendar } from "lucide-react";
import api from "@/utils/api";
import { toast } from "sonner";

export interface Destination {
  id: string;
  name: string;
  lat: number;
  lon: number;
  country?: string;
  weather?: {
    temp: number;
    humidity: number;
    description: string;
    icon: string;
  };
  order: number;
}

interface TripOverviewProps {
  destinations: Destination[];
  onRemoveDestination: (id: string) => void;
  onReorder?: (destinations: Destination[]) => void;
  startDate?: string;
  endDate?: string;
  tripType?: string;
}

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function MapBounds({ destinations }: { destinations: Destination[] }) {
  const map = useMap();
  
  useEffect(() => {
    if (destinations.length === 0) return;
    
    if (destinations.length === 1) {
      map.setView([destinations[0].lat, destinations[0].lon], 10);
    } else {
      const bounds = L.latLngBounds(
        destinations.map((d) => [d.lat, d.lon] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [destinations, map]);
  
  return null;
}

// Component to handle map resize - fixes Leaflet sizing issues
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    // Initial invalidate after mount
    const timer = setTimeout(() => {
      map.invalidateSize();
    }, 100);

    // Handle window resize
    const handleResize = () => {
      map.invalidateSize();
    };

    window.addEventListener('resize', handleResize);

    // Use ResizeObserver for container size changes
    const container = map.getContainer().parentElement;
    if (container) {
      const resizeObserver = new ResizeObserver(() => {
        // Debounce to avoid too many calls
        setTimeout(() => {
          map.invalidateSize();
        }, 150);
      });

      resizeObserver.observe(container);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('resize', handleResize);
        resizeObserver.disconnect();
      };
    }

    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', handleResize);
    };
  }, [map]);

  return null;
}

const TripOverview = ({
  destinations,
  onRemoveDestination,
  onReorder,
  startDate,
  endDate,
  tripType,
}: TripOverviewProps) => {
  const [totalTime, setTotalTime] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [totalCO2, setTotalCO2] = useState(0);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);

  const [destinationsWithWeather, setDestinationsWithWeather] = useState<Destination[]>(destinations);

  // Fetch weather for all destinations
  useEffect(() => {
    setDestinationsWithWeather(destinations);
    
    const fetchWeather = async () => {
      const apiKey = import.meta.env.VITE_OPENWEATHER_API_KEY;
      if (!apiKey) return;

      const weatherPromises = destinations.map(async (dest) => {
        if (dest.weather) return dest; // Already fetched

        try {
          const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${dest.lat}&lon=${dest.lon}&units=metric&appid=${apiKey}`
          );
          const data = await response.json();
          
          if (data.main) {
            return {
              ...dest,
              weather: {
                temp: data.main.temp,
                humidity: data.main.humidity,
                description: data.weather[0]?.description || "N/A",
                icon: data.weather[0]?.icon || "",
              },
            };
          }
        } catch (error) {
          console.error(`Error fetching weather for ${dest.name}:`, error);
        }
        return dest;
      });

      const updated = await Promise.all(weatherPromises);
      setDestinationsWithWeather(updated);
    };

    if (destinations.length > 0) {
      fetchWeather();
    }
  }, [destinations]);

  // Calculate route and totals
  useEffect(() => {
    if (destinations.length < 2) {
      setRouteCoords([]);
      return;
    }

    const calculateRoute = async () => {
      try {
        // Build waypoints for OSRM
        const waypoints = destinations
          .sort((a, b) => a.order - b.order)
          .map((d) => `${d.lon},${d.lat}`)
          .join(";");

        const url = `https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`;
        const response = await fetch(url);
        const data = await response.json();

        if (data?.routes?.[0]?.geometry?.coordinates) {
          const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
            (c: [number, number]) => [c[1], c[0]]
          );
          setRouteCoords(coords);

          const totalDistance = (data.routes[0].distance || 0) / 1000; // km
          const totalDuration = (data.routes[0].duration || 0) / 3600; // hours

          setTotalTime(Number(totalDuration.toFixed(2)));
          
          // Estimate costs and CO2 for the entire route
          const flightCO2 = totalDistance * 0.255;
          const flightCost = Math.max(80, totalDistance * 0.15) + 30;
          
          setTotalCO2(Number(flightCO2.toFixed(2)));
          setTotalCost(Number(flightCost.toFixed(2)));
        }
      } catch (error) {
        console.error("Error calculating route:", error);
      }
    };

    calculateRoute();
  }, [destinations]);

  const saveTrip = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.info("Log in to save your trip");
        return;
      }

      await api.post("/api/trips/save", {
        destinations: destinations.map((d) => ({
          name: d.name,
          coordinates: { lat: d.lat, lon: d.lon },
        })),
        tripType,
        startDate,
        endDate,
        route: routeCoords,
        totalTime,
        totalCost,
        totalCO2,
      });
      
      toast.success("Trip saved successfully!");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to save trip";
      toast.error(msg);
    }
  };


  const center: [number, number] | undefined =
    destinations.length > 0
      ? [destinations[0].lat, destinations[0].lon]
      : undefined;

  return (
    <div className="space-y-6 flex flex-col h-full">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Trip Overview</span>
            {tripType && <Badge className="capitalize">{tripType}</Badge>}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-3 gap-4 mb-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{totalTime}h</div>
              <div className="text-sm text-muted-foreground">Total Time</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">₹{Math.round(totalCost).toLocaleString("en-IN")}</div>
              <div className="text-sm text-muted-foreground">Est. Cost</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold">{totalCO2} kg</div>
              <div className="text-sm text-muted-foreground">CO₂ Emissions</div>
            </div>
          </div>
          
          {(startDate || endDate) && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              {startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Start: {new Date(startDate).toLocaleDateString()}
                </div>
              )}
              {endDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  End: {new Date(endDate).toLocaleDateString()}
                </div>
              )}
            </div>
          )}
          
          <Button onClick={saveTrip} variant="hero" className="w-full mt-4">
            Save Trip Plan
          </Button>
        </CardContent>
      </Card>

      {/* Map View */}
      {destinations.length > 0 && center && (
        <Card className="flex-1 flex flex-col">
          <CardHeader>
            <CardTitle>Route Map</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <div 
              className="rounded-lg overflow-hidden border flex-1 m-6"
              style={{ minHeight: 0 }}
            >
              <MapContainer
                key={`map-${destinations.length}`}
                style={{ height: "100%", width: "100%", minHeight: "400px" }}
                center={center}
                zoom={6}
                scrollWheelZoom={true}
                zoomControl={true}
                whenCreated={(mapInstance) => {
                  // Invalidate size after map is created
                  setTimeout(() => {
                    mapInstance.invalidateSize();
                  }, 100);
                }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  maxZoom={19}
                  updateWhenZooming={false}
                  updateWhenIdle={true}
                />
                <MapResizeHandler />
                {destinations.map((dest, index) => (
                  <Marker
                    key={dest.id}
                    position={[dest.lat, dest.lon]}
                    icon={defaultIcon}
                  >
                    <Popup>
                      <div>
                        <div className="font-semibold">{dest.name}</div>
                        <div className="text-xs text-muted-foreground">
                          Stop {index + 1}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {routeCoords.length > 0 && (
                  <Polyline positions={routeCoords} color="#2563eb" weight={4} />
                )}
                <MapBounds destinations={destinations} />
              </MapContainer>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TripOverview;

