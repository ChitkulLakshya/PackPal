import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Plane, Train, Bus, Car, Ship } from "lucide-react";
import { motion } from "framer-motion";

interface EstimatedCostCardProps {
  distanceKm: number;
}

interface CostEstimate {
  mode: string;
  emoji: string;
  icon: React.ReactNode;
  minCost: number;
  maxCost: number;
}

const EstimatedCostCard = ({ distanceKm }: EstimatedCostCardProps) => {
  // Rate table per km
  const costEstimates: CostEstimate[] = [
    {
      mode: "Flight",
      emoji: "✈️",
      icon: <Plane className="w-5 h-5" />,
      minCost: distanceKm * 5,
      maxCost: distanceKm * 10,
    },
    {
      mode: "Train",
      emoji: "🚆",
      icon: <Train className="w-5 h-5" />,
      minCost: distanceKm * 1,
      maxCost: distanceKm * 2,
    },
    {
      mode: "Bus",
      emoji: "🚌",
      icon: <Bus className="w-5 h-5" />,
      minCost: distanceKm * 2,
      maxCost: distanceKm * 3,
    },
    {
      mode: "Car",
      emoji: "🚗",
      icon: <Car className="w-5 h-5" />,
      minCost: distanceKm * 3,
      maxCost: distanceKm * 6,
    },
    {
      mode: "Ship",
      emoji: "🚢",
      icon: <Ship className="w-5 h-5" />,
      minCost: distanceKm * 4,
      maxCost: distanceKm * 8,
    },
  ];

  const formatCurrency = (amount: number) => {
    return `₹${Math.round(amount).toLocaleString("en-IN")}`;
  };

  if (!distanceKm || distanceKm <= 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Estimated Trip Cost</CardTitle>
          <CardDescription>
            Cost estimates based on distance ({distanceKm.toLocaleString("en-IN")} km)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {costEstimates.map((estimate, index) => (
              <motion.div
                key={estimate.mode}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {estimate.icon}
                  </div>
                  <div>
                    <div className="font-semibold">
                      {estimate.emoji} {estimate.mode}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-lg text-primary">
                    {formatCurrency(estimate.minCost)} - {formatCurrency(estimate.maxCost)}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 text-center">
            * Estimates are approximate and may vary based on route, time, and service provider
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default EstimatedCostCard;
