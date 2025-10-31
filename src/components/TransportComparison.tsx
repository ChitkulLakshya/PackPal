import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, Train, Bus, Car, Zap, DollarSign, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export interface TransportOption {
  mode: "plane" | "train" | "bus" | "drive";
  timeH: number;
  cost: number;
  distance: number;
  co2: number; // kg CO2
  fastest?: boolean;
  cheapest?: boolean;
}

interface TransportComparisonProps {
  from: { lat: number; lon: number };
  to: { lat: number; lon: number };
  onRouteCalculated?: (distance: number) => void;
}

const TransportComparison = ({
  from,
  to,
  onRouteCalculated,
}: TransportComparisonProps) => {
  const [options, setOptions] = useState<TransportOption[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (from.lat && from.lon && to.lat && to.lon) {
      calculateTransportOptions();
    }
  }, [from, to]);

  const calculateTransportOptions = async () => {
    setLoading(true);
    try {
      // Calculate route distance using OSRM
      const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${from.lon},${from.lat};${to.lon},${to.lat}?overview=full&geometries=geojson`;
      const routeResponse = await fetch(osrmUrl);
      const routeData = await routeResponse.json();

      const distanceKm =
        (routeData?.routes?.[0]?.distance || 0) / 1000;
      const driveDurationH =
        (routeData?.routes?.[0]?.duration || 0) / 3600;

      onRouteCalculated?.(distanceKm);

      // Calculate transport options
      const flightSpeed = 750; // km/h average
      const trainSpeed = 120; // km/h average
      const busSpeed = 70; // km/h average

      // Time calculations (including check-in/boarding time)
      const flightTime = distanceKm / flightSpeed + 2.5; // +2.5h for airport procedures
      const trainTime = distanceKm / trainSpeed + 0.5; // +0.5h for boarding
      const busTime = distanceKm / busSpeed + 0.3; // +0.3h for stops

      // Cost calculations (approximate)
      const flightCost = Math.max(80, distanceKm * 0.15) + 30; // Base + per km
      const trainCost = Math.max(25, distanceKm * 0.1);
      const busCost = Math.max(15, distanceKm * 0.05);
      const driveCost = distanceKm * 0.12; // Fuel + tolls

      // CO2 emissions (kg per passenger)
      const flightCO2 = distanceKm * 0.255; // kg CO2 per km for short flights
      const trainCO2 = distanceKm * 0.014; // kg CO2 per km
      const busCO2 = distanceKm * 0.089; // kg CO2 per km
      const driveCO2 = distanceKm * 0.12; // kg CO2 per km (average car)

      const transportOptions: TransportOption[] = [
        {
          mode: "plane",
          timeH: Number(flightTime.toFixed(2)),
          cost: Number(flightCost.toFixed(2)),
          distance: Number(distanceKm.toFixed(2)),
          co2: Number(flightCO2.toFixed(2)),
        },
        {
          mode: "train",
          timeH: Number(trainTime.toFixed(2)),
          cost: Number(trainCost.toFixed(2)),
          distance: Number(distanceKm.toFixed(2)),
          co2: Number(trainCO2.toFixed(2)),
        },
        {
          mode: "bus",
          timeH: Number(busTime.toFixed(2)),
          cost: Number(busCost.toFixed(2)),
          distance: Number(distanceKm.toFixed(2)),
          co2: Number(busCO2.toFixed(2)),
        },
        {
          mode: "drive",
          timeH: Number(driveDurationH.toFixed(2)),
          cost: Number(driveCost.toFixed(2)),
          distance: Number(distanceKm.toFixed(2)),
          co2: Number(driveCO2.toFixed(2)),
        },
      ];

      // Find fastest and cheapest
      const fastest = transportOptions.reduce((a, b) =>
        a.timeH < b.timeH ? a : b
      );
      const cheapest = transportOptions.reduce((a, b) =>
        a.cost < b.cost ? a : b
      );

      // Mark fastest and cheapest
      const highlighted = transportOptions.map((opt) => ({
        ...opt,
        fastest: opt.mode === fastest.mode,
        cheapest: opt.mode === cheapest.mode,
      }));

      setOptions(highlighted);
    } catch (error) {
      console.error("Error calculating transport options:", error);
    } finally {
      setLoading(false);
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case "plane":
        return <Plane className="w-5 h-5" />;
      case "train":
        return <Train className="w-5 h-5" />;
      case "bus":
        return <Bus className="w-5 h-5" />;
      case "drive":
        return <Car className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getModeLabel = (mode: string) => {
    switch (mode) {
      case "plane":
        return "✈️ Flight";
      case "train":
        return "🚆 Train";
      case "bus":
        return "🚌 Bus";
      case "drive":
        return "🚗 Drive";
      default:
        return mode;
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (options.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          Transport Options
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid sm:grid-cols-2 gap-4">
          {options.map((option, index) => (
            <motion.div
              key={option.mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 border rounded-lg transition-all ${
                option.fastest || option.cheapest
                  ? "bg-primary/10 border-primary"
                  : ""
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  {getModeIcon(option.mode)}
                  <span className="font-semibold">{getModeLabel(option.mode)}</span>
                </div>
                <div className="flex gap-1 flex-wrap">
                  {option.fastest && (
                    <Badge variant="secondary" className="text-xs">
                      Fastest
                    </Badge>
                  )}
                  {option.cheapest && (
                    <Badge variant="secondary" className="text-xs">
                      Cheapest
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span>
                    <span className="font-medium">{option.timeH}h</span>{" "}
                    <span className="text-muted-foreground">travel time</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-muted-foreground" />
                  <span>
                    <span className="font-medium">${option.cost}</span>{" "}
                    <span className="text-muted-foreground">approx. cost</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">
                    🌍 {option.co2} kg CO₂
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TransportComparison;

