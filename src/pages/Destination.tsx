import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { MapContainer, TileLayer, Marker, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import api from "@/utils/api";
import { motion } from "framer-motion";

type LatLng = { lat: number; lon: number };

const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const FlyTo: React.FC<{ center?: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.flyTo(center, 7, { duration: 1.25 });
  }, [center, map]);
  return null;
};

const Destination = () => {
  const navigate = useNavigate();
  const query = useQuery();
  const destination = query.get("dest") || "";
  const startDate = query.get("startDate") || "";
  const endDate = query.get("endDate") || "";
  const tripType = query.get("tripType") || "";

  const [userLocation, setUserLocation] = useState<LatLng | null>(null);
  const [destLocation, setDestLocation] = useState<LatLng | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][]>([]);
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState<any>(null);
  const [forecast, setForecast] = useState<any[]>([]);
  const [travelOptions, setTravelOptions] = useState<any[]>([]);

  // Geocode destination via Nominatim
  useEffect(() => {
    if (!destination) return;
    (async () => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(destination)}`
        );
        const data = await res.json();
        if (data?.length) {
          setDestLocation({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
        } else {
          toast.error("Destination not found");
        }
      } catch {
        toast.error("Failed to locate destination");
      }
    })();
  }, [destination]);

  // Get user location
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude }),
      () => {}
    );
  }, []);

  const fetchRoute = async () => {
    if (!userLocation || !destLocation) return;
    setLoading(true);
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${userLocation.lon},${userLocation.lat};${destLocation.lon},${destLocation.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      const coords: [number, number][] = data?.routes?.[0]?.geometry?.coordinates?.map((c: [number, number]) => [c[1], c[0]]) || [];
      setRouteCoords(coords);

      const distanceKm = (data?.routes?.[0]?.distance || 0) / 1000;
      const durationH = (data?.routes?.[0]?.duration || 0) / 3600;

      // Heuristic travel options (drive/train/bus/flight)
      const flightSpeed = 750; // km/h
      const trainSpeed = 120; // km/h
      const busSpeed = 70; // km/h
      const driveSpeed = Math.max(distanceKm / durationH || 60, 50);

      const options = [
        { mode: "flight", timeH: distanceKm / flightSpeed + 1.0, cost: Math.max(60, distanceKm * 0.12) + 20 },
        { mode: "train", timeH: distanceKm / trainSpeed + 0.5, cost: Math.max(15, distanceKm * 0.08) },
        { mode: "bus", timeH: distanceKm / busSpeed + 0.3, cost: Math.max(10, distanceKm * 0.06) },
        { mode: "drive", timeH: durationH, cost: distanceKm * 0.12 },
      ].map((o) => ({ ...o, timeH: Number(o.timeH.toFixed(2)), cost: Number(o.cost.toFixed(2)) }));

      const fastest = options.reduce((a, b) => (a.timeH < b.timeH ? a : b));
      const cheapest = options.reduce((a, b) => (a.cost < b.cost ? a : b));
      const highlighted = options.map((o) => ({
        ...o,
        fastest: o.mode === fastest.mode,
        cheapest: o.mode === cheapest.mode,
      }));
      setTravelOptions(highlighted);
    } catch {
      toast.error("Failed to calculate route");
    } finally {
      setLoading(false);
    }
  };

  // Weather
  useEffect(() => {
    (async () => {
      try {
        if (!destLocation) return;
        const key = import.meta.env.VITE_OPENWEATHER_API_KEY;
        if (!key) return;
        const w = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${destLocation.lat}&lon=${destLocation.lon}&units=metric&appid=${key}`);
        const wj = await w.json();
        setWeather(wj);
        const f = await fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${destLocation.lat}&lon=${destLocation.lon}&units=metric&appid=${key}`);
        const fj = await f.json();
        setForecast(fj?.list?.slice(0, 5) || []);
      } catch {}
    })();
  }, [destLocation]);

  const saveTrip = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.info("Log in to save your trip");
        navigate("/login");
        return;
      }
      const weatherSummary = weather ? `${weather?.weather?.[0]?.main || ""}, ${Math.round(weather?.main?.temp)}°C` : "";
      await api.post("/api/trips/save", {
        destination,
        coordinates: destLocation ? { lat: destLocation.lat, lon: destLocation.lon } : undefined,
        tripType,
        startDate,
        endDate,
        weatherSummary,
        travelOptions,
        route: routeCoords.length ? routeCoords : undefined,
      });
      toast.success("Trip saved");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to save trip";
      toast.error(msg);
    }
  };

  const center: [number, number] | undefined = destLocation ? [destLocation.lat, destLocation.lon] : userLocation ? [userLocation.lat, userLocation.lon] : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
          <div>
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{destination || "Destination"}</span>
                    {tripType && <Badge className="capitalize">{tripType}</Badge>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border">
                    {center && (
                      <MapContainer style={{ height: 420, width: "100%" }} center={center} zoom={6} scrollWheelZoom>
                        <TileLayer attribution='&copy; OpenStreetMap contributors' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                        {userLocation && <Marker position={[userLocation.lat, userLocation.lon]} icon={defaultIcon} />}
                        {destLocation && <Marker position={[destLocation.lat, destLocation.lon]} icon={defaultIcon} />}
                        {routeCoords.length > 0 && (
                          <Polyline positions={routeCoords} color="#2563eb" weight={5} />
                        )}
                        <FlyTo center={center} />
                      </MapContainer>
                    )}
                  </div>
                  <div className="mt-4 flex gap-3">
                    <Button variant="hero" onClick={fetchRoute} disabled={!userLocation || !destLocation || loading}>
                      {loading ? "Calculating..." : "Get Route"}
                    </Button>
                    <Button variant="outline" onClick={saveTrip}>Save Trip</Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Travel Options</CardTitle>
                </CardHeader>
                <CardContent>
                  {travelOptions.length === 0 ? (
                    <div className="text-muted-foreground">Calculate a route to see options.</div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-3">
                      {travelOptions.map((o) => (
                        <div key={o.mode} className={`p-4 border rounded-lg ${o.fastest || o.cheapest ? "bg-green-50 border-green-300" : ""}`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium capitalize">{o.mode}</span>
                            <div className="flex gap-2">
                              {o.fastest && <Badge variant="secondary">Fastest</Badge>}
                              {o.cheapest && <Badge variant="secondary">Cheapest</Badge>}
                            </div>
                          </div>
                          <div className="text-sm text-muted-foreground">~ {o.timeH} h • ₹{Math.round(o.cost).toLocaleString("en-IN")}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card>
              <CardHeader>
                <CardTitle>Weather</CardTitle>
              </CardHeader>
              <CardContent>
                {weather ? (
                  <div>
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-2xl font-semibold">{Math.round(weather.main.temp)}°C</span>
                      <span className="capitalize text-muted-foreground">{weather.weather?.[0]?.description}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mb-4">Humidity: {weather.main.humidity}%</div>
                    <div className="grid grid-cols-5 gap-2">
                      {forecast.map((f, i) => (
                        <div key={i} className="p-3 border rounded text-center">
                          <div className="text-xs mb-1">{new Date(f.dt * 1000).toLocaleDateString()}</div>
                          <div className="font-medium">{Math.round(f.main.temp)}°C</div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">Add your OpenWeather API key to show weather.</div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Destination;


