import { motion } from 'framer-motion';
import { Car, Footprints, Bike, Clock, Route } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { RouteInfo, TravelMode } from '@/types';
import { cn } from '@/lib/utils';

const travelModes: { id: TravelMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'driving', label: 'Drive', icon: Car },
  { id: 'walking', label: 'Walk', icon: Footprints },
  { id: 'cycling', label: 'Cycle', icon: Bike },
];

interface DirectionsPanelProps {
  route: RouteInfo | null;
  isLoading?: boolean;
  selectedMode: TravelMode;
  onModeChange: (mode: TravelMode) => void;
  originName?: string;
  destinationName?: string;
}

export function DirectionsPanel({
  route,
  isLoading,
  selectedMode,
  onModeChange,
  originName = 'Your Location',
  destinationName = 'Destination',
}: DirectionsPanelProps) {
  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Route className="w-5 h-5 text-primary" />
          Directions
        </CardTitle>
        
        {/* Travel Mode Selector */}
        <div className="flex gap-1 mt-2">
          {travelModes.map((mode) => (
            <Button
              key={mode.id}
              size="sm"
              variant={selectedMode === mode.id ? 'default' : 'outline'}
              className={cn(
                'flex-1',
                selectedMode === mode.id && 'gradient-ocean text-primary-foreground'
              )}
              onClick={() => onModeChange(mode.id)}
            >
              <mode.icon className="w-4 h-4 mr-1" />
              {mode.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-2" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : route ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col"
          >
            {/* Summary */}
            <div className="flex items-center gap-4 mb-4 p-3 bg-secondary rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">{route.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <Route className="w-4 h-4 text-muted-foreground" />
                <span className="font-semibold">{route.distance}</span>
              </div>
            </div>

            {/* Route endpoints */}
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-sm font-medium">{originName}</span>
              </div>
              <div className="ml-1.5 w-px h-4 bg-border" />
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-accent" />
                <span className="text-sm font-medium">{destinationName}</span>
              </div>
            </div>

            {/* Step-by-step instructions */}
            <ScrollArea className="flex-1">
              <div className="space-y-3 pr-4">
                {route.steps.map((step, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{step.instruction}</p>
                      <div className="flex gap-3 mt-1 text-xs text-muted-foreground">
                        <span>{step.distance}</span>
                        <span>{step.duration}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </motion.div>
        ) : (
          <div className="h-full flex items-center justify-center text-center">
            <div className="text-muted-foreground">
              <Route className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Select a place to get directions</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
