import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Calendar, Briefcase } from "lucide-react";
import { toast } from "sonner";
import api from "@/utils/api";

const TripForm = () => {
  const navigate = useNavigate();
  const [destination, setDestination] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripType, setTripType] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!destination || !startDate || !endDate || !tripType) {
      toast.error("Please fill in all fields");
      return;
    }

    // Store trip data in localStorage for now
    const tripData = {
      destination,
      startDate,
      endDate,
      tripType,
      id: Date.now().toString(),
    };

    localStorage.setItem("currentTrip", JSON.stringify(tripData));
    // Attempt to save trip for logged-in users
    try {
      const token = localStorage.getItem("token");
      if (token) {
        await api.post("/api/trips/save", {
          destination,
          tripType,
          startDate,
          endDate,
          weatherSummary: "",
        });
      }
    } catch (err: any) {
      // Non-blocking: still proceed to checklist
    }
    
    toast.success("Trip created! Generating your packing list...");
    navigate("/checklist");
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-2xl mx-auto animate-fade-in">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">Plan Your Trip</h1>
            <p className="text-muted-foreground text-lg">
              Tell us about your journey and we'll create a smart packing list for you
            </p>
          </div>

          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle>Trip Details</CardTitle>
              <CardDescription>
                Enter your trip information to get personalized packing recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="destination" className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-primary" />
                    Destination
                  </Label>
                  <Input
                    id="destination"
                    placeholder="e.g., Paris, France"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
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
                      min={new Date().toISOString().split('T')[0]}
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
                      min={startDate || new Date().toISOString().split('T')[0]}
                    />
                  </div>
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

                <Button type="submit" variant="hero" size="lg" className="w-full">
                  Generate Packing List
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default TripForm;
