import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PackingCategory from "@/components/PackingCategory";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { generatePackingList, PackingCategory as PackingCategoryType } from "@/utils/packingListGenerator";
import { ArrowLeft, Download, Share2, Luggage } from "lucide-react";
import { toast } from "sonner";

const Checklist = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<PackingCategoryType[]>([]);
  const [tripInfo, setTripInfo] = useState<any>(null);

  useEffect(() => {
    const tripData = localStorage.getItem("currentTrip");
    if (!tripData) {
      toast.error("No trip data found");
      navigate("/new-trip");
      return;
    }

    const trip = JSON.parse(tripData);
    setTripInfo(trip);
    
    // Generate packing list based on trip data
    const packingList = generatePackingList(trip.tripType, trip.destination);
    setCategories(packingList);
  }, [navigate]);

  const handleToggleItem = (itemId: string) => {
    setCategories(prevCategories =>
      prevCategories.map(category => ({
        ...category,
        items: category.items.map(item =>
          item.id === itemId ? { ...item, packed: !item.packed } : item
        ),
      }))
    );
  };

  const totalItems = categories.reduce((sum, cat) => sum + cat.items.length, 0);
  const packedItems = categories.reduce(
    (sum, cat) => sum + cat.items.filter(item => item.packed).length,
    0
  );
  const progress = totalItems > 0 ? (packedItems / totalItems) * 100 : 0;

  const handleSaveTrip = () => {
    // Save to localStorage for now
    const savedTrips = JSON.parse(localStorage.getItem("savedTrips") || "[]");
    savedTrips.push({
      ...tripInfo,
      categories,
      savedAt: new Date().toISOString(),
    });
    localStorage.setItem("savedTrips", JSON.stringify(savedTrips));
    toast.success("Trip saved successfully!");
  };

  if (!tripInfo) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-24">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-8 animate-fade-in">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/new-trip")}
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Trip Details
            </Button>

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2">
                  Packing for {tripInfo.destination}
                </h1>
                <p className="text-muted-foreground">
                  {new Date(tripInfo.startDate).toLocaleDateString()} -{" "}
                  {new Date(tripInfo.endDate).toLocaleDateString()}
                </p>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
                <Button variant="default" size="sm" onClick={handleSaveTrip}>
                  Save Trip
                </Button>
              </div>
            </div>

            {/* Progress Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-xl p-6 border border-primary/20"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                    <Luggage className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Packing Progress</h3>
                    <p className="text-sm text-muted-foreground">
                      {packedItems} of {totalItems} items packed
                    </p>
                  </div>
                </div>
                <div className="text-3xl font-bold text-primary">
                  {Math.round(progress)}%
                </div>
              </div>
              <Progress value={progress} className="h-3" />
            </motion.div>
          </div>

          {/* Categories */}
          <div className="space-y-6 animate-slide-up">
            {categories.map((category) => (
              <PackingCategory
                key={category.id}
                category={category}
                onToggleItem={handleToggleItem}
              />
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checklist;
