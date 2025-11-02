import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plane, Train, Bus, Car, Ship, Loader2, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import api from "@/utils/api";

interface TravelOption {
  mode: string;
  price: number;
  duration: string;
}

interface TravelOptionsData {
  from: string;
  to: string;
  distance_km: number;
  isInternational: boolean;
  options: TravelOption[];
}

interface TravelOptionsDisplayProps {
  from: string | { lat: number; lon: number };
  to: string | { lat: number; lon: number };
  fromName?: string;
  toName?: string;
}

const TravelOptionsDisplay = ({
  from,
  to,
  fromName,
  toName,
}: TravelOptionsDisplayProps) => {
  const [data, setData] = useState<TravelOptionsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTravelOptions = async () => {
      // Convert coordinates to city names if needed
      let fromQuery = "";
      let toQuery = "";

      if (typeof from === "string") {
        fromQuery = from;
      } else if (fromName) {
        fromQuery = fromName;
      } else {
        // If we have coordinates but no name, we can't proceed
        return;
      }

      if (typeof to === "string") {
        toQuery = to;
      } else if (toName) {
        toQuery = toName;
      } else {
        return;
      }

      if (!fromQuery || !toQuery) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await api.get("/travel-options", {
          params: { from: fromQuery, to: toQuery },
        });
        setData(response.data);
      } catch (err: any) {
        console.error("Error fetching travel options:", err);
        setError(
          err.response?.data?.message || "Failed to fetch travel options"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchTravelOptions();
  }, [from, to, fromName, toName]);

  const getModeIcon = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "flight":
        return <Plane className="w-6 h-6" />;
      case "train":
        return <Train className="w-6 h-6" />;
      case "bus":
        return <Bus className="w-6 h-6" />;
      case "car":
        return <Car className="w-6 h-6" />;
      case "ship":
        return <Ship className="w-6 h-6" />;
      default:
        return <Plane className="w-6 h-6" />;
    }
  };

  const getModeEmoji = (mode: string) => {
    switch (mode.toLowerCase()) {
      case "flight":
        return "✈️";
      case "train":
        return "🚆";
      case "bus":
        return "🚌";
      case "car":
        return "🚗";
      case "ship":
        return "🚢";
      default:
        return "✈️";
    }
  };

  const formatPrice = (price: number) => {
    // Determine currency based on context (you can make this more sophisticated)
    // For now, using ₹ for Indian context, but you could detect from location
    return `₹${price.toLocaleString()}`;
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Loading travel options...</span>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <AlertCircle className="w-6 h-6 text-destructive mr-2" />
          <span className="text-destructive">{error}</span>
        </CardContent>
      </Card>
    );
  }

  if (!data || data.options.length === 0) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="text-4xl mb-2">🌍</div>
            <p className="text-muted-foreground">No routes available.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plane className="w-5 h-5 text-primary" />
          Travel Options
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-1">
          {data.from} → {data.to}
          {data.isInternational && (
            <span className="ml-2 text-xs bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-2 py-0.5 rounded">
              International
            </span>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          Distance: {data.distance_km.toLocaleString()} km
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-4">
          {data.options.map((option, index) => (
            <motion.div
              key={option.mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="p-4 border rounded-lg hover:shadow-md transition-all bg-card"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {getModeIcon(option.mode)}
                  </div>
                  <div>
                    <div className="font-semibold text-lg">
                      {getModeEmoji(option.mode)} {option.mode}
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Price:</span>
                  <span className="font-bold text-lg text-primary">
                    {formatPrice(option.price)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Duration:</span>
                  <span className="font-medium">{option.duration}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TravelOptionsDisplay;

