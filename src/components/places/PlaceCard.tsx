import { motion } from 'framer-motion';
import { MapPin, Heart, Navigation, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Place } from '@/types';
import { cn } from '@/lib/utils';

interface PlaceCardProps {
  place: Place;
  index?: number;
  isSaved?: boolean;
  onSave?: () => void;
  onRemove?: () => void;
  onGetDirections?: () => void;
  onSelect?: () => void;
  isSelected?: boolean;
}

export function PlaceCard({
  place,
  index = 0,
  isSaved,
  onSave,
  onRemove,
  onGetDirections,
  onSelect,
  isSelected,
}: PlaceCardProps) {
  const categoryColors: Record<string, string> = {
    nature: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
    food: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    history: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
    adventure: 'bg-red-500/10 text-red-600 border-red-500/20',
    religious: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
    shopping: 'bg-pink-500/10 text-pink-600 border-pink-500/20',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <Card
        className={cn(
          "overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg",
          isSelected && "ring-2 ring-primary shadow-glow"
        )}
        onClick={onSelect}
      >
        {/* Image */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={place.imageUrl || '/placeholder.svg'}
            alt={place.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent" />
          
          {/* Category Badge */}
          <Badge
            className={cn(
              "absolute top-3 left-3",
              categoryColors[place.category.toLowerCase()] || "bg-primary/10 text-primary"
            )}
          >
            {place.category}
          </Badge>

          {/* Save Button */}
          <Button
            size="icon"
            variant="ghost"
            className={cn(
              "absolute top-3 right-3 bg-card/80 hover:bg-card transition-colors",
              isSaved && "text-red-500"
            )}
            onClick={(e) => {
              e.stopPropagation();
              isSaved ? onRemove?.() : onSave?.();
            }}
          >
            <Heart className={cn("w-4 h-4", isSaved && "fill-current")} />
          </Button>
        </div>

        <CardContent className="p-4">
          {/* Title */}
          <h3 className="font-display font-semibold text-lg text-foreground mb-1 line-clamp-1">
            {place.name}
          </h3>

          {/* Location */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
            <MapPin className="w-3 h-3" />
            <span className="line-clamp-1">{place.city || 'Unknown location'}</span>
          </div>

          {/* Description */}
          <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
            {place.description}
          </p>

          {/* Actions */}
          <div className="flex gap-2">
            {onGetDirections && (
              <Button
                size="sm"
                variant="secondary"
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onGetDirections();
                }}
              >
                <Navigation className="w-4 h-4 mr-1" />
                Directions
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${place.latitude},${place.longitude}`,
                  '_blank'
                );
              }}
            >
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
