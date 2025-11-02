import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import DestinationAutocomplete, { DestinationSuggestion } from "@/components/DestinationAutocomplete";
import TransportComparison from "@/components/TransportComparison";
import TripOverview, { Destination } from "@/components/TripOverview";
import WeatherReport from "@/components/WeatherReport";
import EstimatedCostCard from "@/components/EstimatedCostCard";
import { Calendar, Briefcase } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

// Simple Weather Display Component - Shows only temperature
const SimpleWeatherDisplay = ({ lat, lon, destinationName }: { lat: number; lon: number; destinationName?: string }) => {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchWeather = async () => {
      if (!lat || !lon) return;

      setLoading(true);
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${
            import.meta.env.VITE_OPENWEATHER_API_KEY
          }&units=metric`
        );
        const data = await res.json();
        if (data.cod === 200) {
          setWeather(data);
        }
      } catch (err) {
        console.error("Weather fetch failed:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
  }, [lat, lon]);

  if (loading || !weather) {
    return null;
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Weather</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <img
              src={`https://openweathermap.org/img/wn/${weather.weather[0].icon}@2x.png`}
              alt={weather.weather[0].description}
              className="w-12 h-12"
            />
            <div>
              <p className="text-3xl font-bold">{Math.round(weather.main.temp)}°C</p>
              <p className="text-sm text-muted-foreground capitalize">{weather.weather[0].description}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

const TripPlanner = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [currentDestination, setCurrentDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripType, setTripType] = useState("");
  const [selectedFrom, setSelectedFrom] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedTo, setSelectedTo] = useState<{ lat: number; lon: number } | null>(null);
  const [fromName, setFromName] = useState<string>("");
  const [toName, setToName] = useState<string>("");
  const [distanceKm, setDistanceKm] = useState<number>(0);

  const handleDestinationSelect = (suggestion: DestinationSuggestion) => {
    const newDestination: Destination = {
      id: Date.now().toString(),
      name: suggestion.displayName,
      lat: suggestion.lat,
      lon: suggestion.lon,
      country: suggestion.country,
      order: destinations.length + 1,
    };

    setDestinations([...destinations, newDestination]);
    setCurrentDestination("");

    if (destinations.length === 0) {
      setSelectedFrom({ lat: suggestion.lat, lon: suggestion.lon });
      setFromName(suggestion.displayName);
      setSelectedTo(null);
      setToName("");
    } else {
      setSelectedTo({ lat: suggestion.lat, lon: suggestion.lon });
      setToName(suggestion.displayName);
    }

    toast.success(`${suggestion.displayName} added to your trip`);
  };

  const handleRemoveDestination = (id: string) => {
    const updated = destinations.filter((d) => d.id !== id);
    const reordered = updated.map((d, index) => ({
      ...d,
      order: index + 1,
    }));
    setDestinations(reordered);

    if (reordered.length === 0) {
      setSelectedFrom(null);
      setSelectedTo(null);
      setFromName("");
      setToName("");
    } else if (reordered.length === 1) {
      setSelectedFrom({ lat: reordered[0].lat, lon: reordered[0].lon });
      setFromName(reordered[0].name);
      setSelectedTo(null);
      setToName("");
    } else {
      setSelectedFrom({ lat: reordered[0].lat, lon: reordered[0].lon });
      setFromName(reordered[0].name);
      setSelectedTo({ lat: reordered[reordered.length - 1].lat, lon: reordered[reordered.length - 1].lon });
      setToName(reordered[reordered.length - 1].name);
    }
  };

  const handleFetchMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    toast.info("Fetching your current location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Reverse geocode to get readable location name
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();

        const name =
          data?.display_name ||
          `Lat: ${latitude.toFixed(2)}, Lon: ${longitude.toFixed(2)}`;

        const newDestination: Destination = {
          id: Date.now().toString(),
          name,
          lat: latitude,
          lon: longitude,
          country: data?.address?.country || "Unknown",
          order: destinations.length + 1,
        };

        setDestinations([...destinations, newDestination]);

        // Update selectedFrom/selectedTo similar to handleDestinationSelect
        if (destinations.length === 0) {
          setSelectedFrom({ lat: latitude, lon: longitude });
          setFromName(name);
          setSelectedTo(null);
          setToName("");
        } else {
          setSelectedTo({ lat: latitude, lon: longitude });
          setToName(name);
        }

        toast.success(`📍 ${name} added as your current location`);
      },
      (error) => {
        toast.error("Failed to fetch location. Please allow location access.");
        console.error(error);
      }
    );
  };

  // Calculate distance when destinations change
  useEffect(() => {
    const calculateDistance = async () => {
      if (!selectedFrom || !selectedTo) {
        setDistanceKm(0);
        return;
      }

      try {
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${selectedFrom.lon},${selectedFrom.lat};${selectedTo.lon},${selectedTo.lat}?overview=full&geometries=geojson`;
        const routeResponse = await fetch(osrmUrl);
        const routeData = await routeResponse.json();
        const distance = (routeData?.routes?.[0]?.distance || 0) / 1000;
        setDistanceKm(distance);
      } catch (error) {
        console.error("Error calculating distance:", error);
        setDistanceKm(0);
      }
    };

    calculateDistance();
  }, [selectedFrom, selectedTo]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />

      {/* ✅ Increased top padding to show title below navbar */}
      <main className="flex-1 container mx-auto px-4 pt-24 sm:pt-28 md:pt-32 pb-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Plan Your Multi-Destination Trip
            </h1>
            <p className="text-muted-foreground text-lg">
              Add multiple destinations, compare transport options, and see live weather updates
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column */}
            <div className="lg:col-span-1 space-y-6">
              {/* Trip Details */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Trip Details</CardTitle>
                  <CardDescription>Configure your journey</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      Start Date
                    </Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-primary" />
                      End Date
                    </Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      min={startDate || new Date().toISOString().split("T")[0]}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="tripType" className="flex items-center gap-2">
                      <Briefcase className="w-4 h-4 text-primary" />
                      Trip Type
                    </Label>
                    <Select value={tripType} onValueChange={setTripType}>
                      <SelectTrigger id="tripType">
                        <SelectValue placeholder="Select trip type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="leisure">🏖️ Leisure</SelectItem>
                        <SelectItem value="business">💼 Business</SelectItem>
                        <SelectItem value="adventure">⛰️ Adventure</SelectItem>
                        <SelectItem value="family">👨‍👩‍👧‍👦 Family</SelectItem>
                        <SelectItem value="romantic">💑 Romantic</SelectItem>
                        <SelectItem value="solo">🧳 Solo Travel</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Add Destination */}
              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Add Destination</CardTitle>
                  <CardDescription>Search and add destinations to your trip</CardDescription>
                </CardHeader>
                <CardContent>
                  <DestinationAutocomplete
                    value={currentDestination}
                    onChange={setCurrentDestination}
                    onSelect={handleDestinationSelect}
                    placeholder="Search destinations..."
                  />
                  <Button
                    variant="outline"
                    className="mt-3 w-full flex items-center justify-center gap-2"
                    onClick={handleFetchMyLocation}
                  >
                    📍 Fetch My Location
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    {destinations.length} destination{destinations.length !== 1 ? "s" : ""} added
                  </p>
                </CardContent>
              </Card>

              {/* 🌤️ Weather Section - Below Add Destination */}
              {selectedTo && (
                <WeatherReport
                  lat={selectedTo.lat}
                  lon={selectedTo.lon}
                  destinationName={toName}
                />
              )}

              {/* Estimated Trip Cost */}
              {distanceKm > 0 && (
                <EstimatedCostCard distanceKm={distanceKm} />
              )}

              {/* Transport & Travel Options */}
              {selectedFrom && selectedTo && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <TransportComparison from={selectedFrom} to={selectedTo} />
                </motion.div>
              )}

              {/* Simple Weather Display - Replaces Travel Options */}
              {selectedTo && (
                <SimpleWeatherDisplay
                  lat={selectedTo.lat}
                  lon={selectedTo.lon}
                  destinationName={toName}
                />
              )}
            </div>

            {/* Right Column (Map + Trip Overview) */}
            <div className="lg:col-span-2 flex flex-col space-y-6 min-h-[calc(100vh-12rem)]">
              {destinations.length === 0 ? (
                <Card className="shadow-lg">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="text-6xl mb-4">✈️</div>
                    <h3 className="text-xl font-semibold mb-2">Start Planning Your Trip</h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Add your first destination using the search box on the left.
                      You can add multiple destinations to plan a complete journey.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex-1 flex flex-col">
                  <TripOverview
                    destinations={destinations}
                    onRemoveDestination={handleRemoveDestination}
                    startDate={startDate}
                    endDate={endDate}
                    tripType={tripType}
                  />
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TripPlanner;
