import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapPin, Calendar, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import api from "@/utils/api";

const MyTrips = () => {
  const navigate = useNavigate();
  const [trips, setTrips] = useState<any[]>([]);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user) {
      const savedTrips = JSON.parse(localStorage.getItem("savedTrips") || "[]");
      setTrips(savedTrips);
      return;
    }
    (async () => {
      try {
        const { data } = await api.get(`/api/trips/user/${user._id}`);
        setTrips(data);
      } catch (err: any) {
        const message = err?.response?.data?.message || "Failed to fetch trips";
        toast.error(message);
      }
    })();
  }, []);

  const handleDeleteTrip = async (index: number) => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const trip = trips[index];
    if (user && trip?._id) {
      try {
        await api.delete(`/api/trips/${trip._id}`);
        setTrips((prev) => prev.filter((_, i) => i !== index));
        toast.success("Trip deleted");
        return;
      } catch (err: any) {
        const message = err?.response?.data?.message || "Failed to delete trip";
        toast.error(message);
        return;
      }
    }
    const updatedTrips = trips.filter((_, i) => i !== index);
    localStorage.setItem("savedTrips", JSON.stringify(updatedTrips));
    setTrips(updatedTrips);
    toast.success("Trip deleted");
  };

  const getTripTypeEmoji = (type: string) => {
    const emojis: Record<string, string> = {
      leisure: "🏖️",
      business: "💼",
      adventure: "⛰️",
      family: "👨‍👩‍👧‍👦",
      romantic: "💑",
      solo: "🧳",
    };
    return emojis[type] || "🧳";
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8 animate-fade-in">
            <div>
              <h1 className="text-4xl font-bold mb-2">My Trips</h1>
              <p className="text-muted-foreground">
                View and manage your saved packing lists
              </p>
            </div>
            <Button variant="hero" onClick={() => navigate("/new-trip")}>
              <Plus className="w-4 h-4 mr-2" />
              New Trip
            </Button>
          </div>

          {trips.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-primary/10 flex items-center justify-center">
                <MapPin className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">No trips yet</h2>
              <p className="text-muted-foreground mb-6">
                Start planning your next adventure!
              </p>
              <Button variant="hero" onClick={() => navigate("/new-trip")}>
                <Plus className="w-4 h-4 mr-2" />
                Plan Your First Trip
              </Button>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 animate-slide-up">
              {trips.map((trip, index) => {
                const totalItems = trip.categories?.reduce(
                  (sum: number, cat: any) => sum + cat.items.length,
                  0
                ) || 0;
                const packedItems = trip.categories?.reduce(
                  (sum: number, cat: any) =>
                    sum + cat.items.filter((item: any) => item.packed).length,
                  0
                ) || 0;
                const progress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="hover:shadow-lg transition-shadow cursor-pointer group">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="flex items-center gap-2 mb-2">
                              <span className="text-2xl">
                                {getTripTypeEmoji(trip.tripType)}
                              </span>
                              {trip.destination}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                              <Calendar className="w-4 h-4" />
                              {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
                            </CardDescription>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteTrip(index);
                            }}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <Badge variant="secondary" className="capitalize">
                            {trip.tripType}
                          </Badge>
                          
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-muted-foreground">Packing Progress</span>
                              <span className="font-semibold text-primary">
                                {Math.round(progress)}%
                              </span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-primary to-secondary transition-all"
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                          </div>

                          <Button
                            variant="outline"
                            className="w-full mt-4"
                            onClick={() => {
                              localStorage.setItem("currentTrip", JSON.stringify(trip));
                              navigate("/checklist");
                            }}
                          >
                            View Packing List
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MyTrips;
