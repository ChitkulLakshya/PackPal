import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import Navbar from "@/components/Navbar";
import DestinationAutocomplete, { DestinationSuggestion } from "@/components/DestinationAutocomplete";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, MapPin, Navigation, Save } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import api from "@/utils/api";

// Fix for default marker icons in React Leaflet
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

let DefaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = DefaultIcon;

// Create custom icons for origin and destination
const createCustomIcon = (color: string, label: string) => {
  return L.divIcon({
    className: "custom-marker",
    html: `<div style="background-color: ${color}; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; box-shadow: 0 2px 8px rgba(0,0,0,0.3);">${label}</div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
  });
};

interface Position {
  lat: number;
  lon: number;
}

function MapUpdater({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

const RoutePlanner = () => {
  const [currentPosition, setCurrentPosition] = useState<Position | null>(null);
  const [destination, setDestination] = useState<DestinationSuggestion | null>(null);
  const [destinationInput, setDestinationInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [routePoints, setRoutePoints] = useState<[number, number][]>([]);
  const [saving, setSaving] = useState(false);
  const user = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user") || "{}") : null;

  // Get current location
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      setLoading(false);
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition({
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
        setLoading(false);
        toast.success("Current location detected");
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Could not get your location. Please enable location permissions.");
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Calculate route when destination is selected
  useEffect(() => {
    if (currentPosition && destination) {
      // Create a simple straight line route (for demo)
      // In production, you'd use a routing service like OSRM or Mapbox Directions API
      setRoutePoints([
        [currentPosition.lat, currentPosition.lon],
        [destination.lat, destination.lon],
      ]);
    } else {
      setRoutePoints([]);
    }
  }, [currentPosition, destination]);

  const handleDestinationSelect = (selected: DestinationSuggestion) => {
    setDestination(selected);
    toast.success(`Destination set: ${selected.displayName}`);
  };

  const handleSaveTrip = async () => {
    if (!user) {
      toast.error("Please log in to save trips");
      return;
    }

    if (!currentPosition || !destination) {
      toast.error("Please select a destination first");
      return;
    }

    setSaving(true);
    try {
      await api.post("/api/trips/save", {
        destination: destination.displayName,
        coordinates: {
          lat: destination.lat,
          lon: destination.lon,
        },
        originCoordinates: {
          lat: currentPosition.lat,
          lon: currentPosition.lon,
        },
        route: routePoints,
        tripType: "leisure",
        startDate: new Date(),
        endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
      });
      toast.success("Trip saved successfully!");
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Failed to save trip");
    } finally {
      setSaving(false);
    }
  };

  const getMapCenter = (): [number, number] => {
    if (currentPosition && destination) {
      // Center between origin and destination
      return [
        (currentPosition.lat + destination.lat) / 2,
        (currentPosition.lon + destination.lon) / 2,
      ];
    }
    if (currentPosition) {
      return [currentPosition.lat, currentPosition.lon];
    }
    if (destination) {
      return [destination.lat, destination.lon];
    }
    return [48.8566, 2.3522]; // Default to Paris
  };

  const getMapZoom = (): number => {
    if (currentPosition && destination) {
      // Calculate approximate zoom based on distance
      const latDiff = Math.abs(currentPosition.lat - destination.lat);
      const lonDiff = Math.abs(currentPosition.lon - destination.lon);
      const maxDiff = Math.max(latDiff, lonDiff);
      
      if (maxDiff > 10) return 4;
      if (maxDiff > 5) return 5;
      if (maxDiff > 1) return 6;
      if (maxDiff > 0.5) return 7;
      if (maxDiff > 0.1) return 8;
      return 9;
    }
    return 10;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <div className="flex-1 relative pt-20">
        {/* Map Container - Takes most of the screen */}
        <div className="absolute inset-0 w-full h-full">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center bg-muted/30">
              <div className="text-center">
                <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                <p className="text-foreground">Getting your location...</p>
              </div>
            </div>
          ) : (
            <MapContainer
              center={getMapCenter()}
              zoom={getMapZoom()}
              style={{ height: "100%", width: "100%" }}
              scrollWheelZoom={true}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {currentPosition && (
                <Marker
                  position={[currentPosition.lat, currentPosition.lon]}
                  icon={createCustomIcon("#8AFF80", "O")}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>Your Location</strong>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {currentPosition.lat.toFixed(4)}, {currentPosition.lon.toFixed(4)}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              )}

              {destination && (
                <Marker
                  position={[destination.lat, destination.lon]}
                  icon={createCustomIcon("#FF6B6B", "D")}
                >
                  <Popup>
                    <div className="text-center">
                      <strong>{destination.name}</strong>
                      <br />
                      <span className="text-xs text-muted-foreground">
                        {destination.displayName}
                      </span>
                    </div>
                  </Popup>
                </Marker>
              )}

              {routePoints.length > 0 && (
                <Polyline
                  positions={routePoints}
                  color="#8AFF80"
                  weight={4}
                  opacity={0.7}
                  dashArray="10, 5"
                />
              )}

              <MapUpdater center={getMapCenter()} zoom={getMapZoom()} />
            </MapContainer>
          )}
        </div>

        {/* Search Card - Floating on top */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute top-24 left-4 right-4 md:left-auto md:right-8 md:max-w-md z-40"
        >
          <Card className="bg-card/95 backdrop-blur-md border-border/50 shadow-2xl">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-bold">Plan Your Route</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Destination
                  </label>
                  <DestinationAutocomplete
                    value={destinationInput}
                    onChange={setDestinationInput}
                    onSelect={handleDestinationSelect}
                    placeholder="Type destination (e.g., Paris, New Delhi)..."
                  />
                </div>

                {currentPosition && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>
                      Current: {currentPosition.lat.toFixed(4)},{" "}
                      {currentPosition.lon.toFixed(4)}
                    </span>
                  </div>
                )}

                {destination && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span>{destination.displayName}</span>
                  </div>
                )}

                {user && currentPosition && destination && (
                  <Button
                    onClick={handleSaveTrip}
                    disabled={saving}
                    className="w-full bg-primary text-primary-foreground hover:opacity-90"
                  >
                    {saving ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4 mr-2" />
                        Save Trip
                      </>
                    )}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default RoutePlanner;

