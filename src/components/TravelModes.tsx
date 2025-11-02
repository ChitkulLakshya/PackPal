import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Plane, Train, Bus, Clock, DollarSign } from 'lucide-react';
import { motion } from 'framer-motion';

interface TravelMode {
  type: 'flight' | 'train' | 'bus';
  duration: string;
  cost: number;
  recommended?: boolean;
}

interface TravelModesProps {
  destination: string;
  distance?: number;
}

const TravelModes = ({ destination, distance = 500 }: TravelModesProps) => {
  // Mock data - In production, use Google Directions API or similar
  const travelModes: TravelMode[] = [
    {
      type: 'flight',
      duration: `${Math.round(distance / 800)}h ${Math.round((distance / 800) * 60) % 60}m`,
      cost: Math.round(distance * 0.15 + 50),
      recommended: distance > 400,
    },
    {
      type: 'train',
      duration: `${Math.round(distance / 120)}h ${Math.round((distance / 120) * 60) % 60}m`,
      cost: Math.round(distance * 0.12 + 30),
      recommended: distance <= 400 && distance > 100,
    },
    {
      type: 'bus',
      duration: `${Math.round(distance / 80)}h ${Math.round((distance / 80) * 60) % 60}m`,
      cost: Math.round(distance * 0.08 + 15),
      recommended: distance <= 100,
    },
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case 'flight':
        return <Plane className="w-6 h-6" />;
      case 'train':
        return <Train className="w-6 h-6" />;
      case 'bus':
        return <Bus className="w-6 h-6" />;
      default:
        return null;
    }
  };

  const getModeColor = (type: string) => {
    switch (type) {
      case 'flight':
        return 'text-blue-500';
      case 'train':
        return 'text-green-500';
      case 'bus':
        return 'text-orange-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Travel Options to {destination}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-3 gap-4">
          {travelModes.map((mode, index) => (
            <motion.div
              key={mode.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`relative p-4 rounded-lg border-2 transition-all ${
                mode.recommended
                  ? 'border-primary bg-primary/5 shadow-lg'
                  : 'border-border hover:border-primary/50'
              }`}
            >
              {mode.recommended && (
                <Badge className="absolute -top-2 -right-2 bg-gradient-to-r from-primary to-secondary">
                  Best Option
                </Badge>
              )}
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className={getModeColor(mode.type)}>{getIcon(mode.type)}</div>
                  <h3 className="text-lg font-semibold capitalize">{mode.type}</h3>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Duration:</span>
                    <span className="font-medium">{mode.duration}</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Est. Cost:</span>
                    <span className="font-medium">₹{Math.round(mode.cost).toLocaleString("en-IN")}</span>
                  </div>
                </div>

                {mode.recommended && (
                  <p className="text-xs text-primary font-medium mt-2">
                    ✓ Most efficient for this distance
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <p className="text-xs text-muted-foreground mt-4 text-center">
          * Estimates based on average travel times and costs. Actual prices may vary.
        </p>
      </CardContent>
    </Card>
  );
};

export default TravelModes;
