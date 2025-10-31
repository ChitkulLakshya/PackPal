import { useState } from "react";
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
import { Plus, Calendar, Briefcase, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";

const TripPlanner = () => {
  const navigate = useNavigate();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [currentDestination, setCurrentDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripType, setTripType] = useState("");
  const [selectedFrom, setSelectedFrom] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedTo, setSelectedTo] = useState<{ lat: number; lon: number } | null>(null);

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

    // If this is the first destination, set it as "from"
    if (destinations.length === 0) {
      setSelectedFrom({ lat: suggestion.lat, lon: suggestion.lon });
    } else if (destinations.length === 1) {
      // If this is the second destination, set it as "to"
      setSelectedTo({ lat: suggestion.lat, lon: suggestion.lon });
    }

    toast.success(`${suggestion.displayName} added to your trip`);
  };

  const handleRemoveDestination = (id: string) => {
    const updated = destinations.filter((d) => d.id !== id);
    // Reorder remaining destinations
    const reordered = updated.map((d, index) => ({
      ...d,
      order: index + 1,
    }));
    setDestinations(reordered);

    // Update from/to if needed
    if (reordered.length === 0) {
      setSelectedFrom(null);
      setSelectedTo(null);
    } else if (reordered.length === 1) {
      setSelectedFrom({ lat: reordered[0].lat, lon: reordered[0].lon });
      setSelectedTo(null);
    } else {
      setSelectedFrom({ lat: reordered[0].lat, lon: reordered[0].lon });
      setSelectedTo({ lat: reordered[reordered.length - 1].lat, lon: reordered[reordered.length - 1].lon });
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Plan Your Multi-Destination Trip
            </h1>
            <p className="text-muted-foreground text-lg">
              Add multiple destinations, compare transport options, and see live weather updates
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Trip Setup */}
            <div className="lg:col-span-1 space-y-6">
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

              <Card className="shadow-lg">
                <CardHeader>
                  <CardTitle>Add Destination</CardTitle>
                  <CardDescription>
                    Search and add destinations to your trip
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DestinationAutocomplete
                    value={currentDestination}
                    onChange={setCurrentDestination}
                    onSelect={handleDestinationSelect}
                    placeholder="Search destinations..."
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {destinations.length} destination{destinations.length !== 1 ? "s" : ""} added
                  </p>
                </CardContent>
              </Card>

              {/* Transport Comparison */}
              {selectedFrom && selectedTo && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <TransportComparison
                    from={selectedFrom}
                    to={selectedTo}
                  />
                </motion.div>
              )}
            </div>

            {/* Right Column - Overview */}
            <div className="lg:col-span-2">
              {destinations.length === 0 ? (
                <Card className="shadow-lg">
                  <CardContent className="flex flex-col items-center justify-center py-16">
                    <div className="text-6xl mb-4">✈️</div>
                    <h3 className="text-xl font-semibold mb-2">
                      Start Planning Your Trip
                    </h3>
                    <p className="text-muted-foreground text-center max-w-md">
                      Add your first destination using the search box on the left.
                      You can add multiple destinations to plan a complete journey.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
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

