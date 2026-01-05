import { motion } from 'framer-motion';
import { Heart, MapPin, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { PlaceCard } from '@/components/places/PlaceCard';
import { MapView } from '@/components/map/MapView';
import { useSavedPlaces } from '@/hooks/useSavedPlaces';
import { Place } from '@/types';
import { useState } from 'react';

export default function Wishlist() {
  const { savedPlaces, isLoading, removePlace } = useSavedPlaces();
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);

  // Convert saved places to Place type for map
  const placesForMap: Place[] = savedPlaces.map((p) => ({
    id: p.id,
    name: p.name,
    description: p.description,
    category: p.category,
    latitude: p.latitude,
    longitude: p.longitude,
    imageUrl: p.imageUrl,
    city: p.city,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg gradient-sunset flex items-center justify-center">
                <Heart className="w-5 h-5 text-accent-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                My Wishlist
              </h1>
            </div>
            <p className="text-muted-foreground">
              {savedPlaces.length} saved places
            </p>
          </motion.div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-48 bg-muted rounded-t-lg" />
                  <div className="p-4 bg-card rounded-b-lg space-y-3">
                    <div className="h-5 bg-muted rounded w-3/4" />
                    <div className="h-4 bg-muted rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : savedPlaces.length > 0 ? (
            <div className="lg:grid lg:grid-cols-2 gap-6">
              {/* Places List */}
              <div className="space-y-4 lg:max-h-[calc(100vh-12rem)] lg:overflow-y-auto lg:pr-2">
                {savedPlaces.map((place, index) => (
                  <motion.div
                    key={place.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex gap-4 p-4 bg-card rounded-lg border border-border hover:shadow-md transition-shadow"
                  >
                    <img
                      src={place.imageUrl || '/placeholder.svg'}
                      alt={place.name}
                      className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-display font-semibold text-foreground line-clamp-1">
                        {place.name}
                      </h3>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-2">
                        <MapPin className="w-3 h-3" />
                        <span>{place.city || 'Unknown'}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {place.description}
                      </p>
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-muted-foreground hover:text-destructive"
                        onClick={() => removePlace.mutate(place.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setSelectedPlace(place as Place)}
                      >
                        <MapPin className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Map */}
              <div className="hidden lg:block sticky top-24 h-[calc(100vh-10rem)]">
                <MapView
                  places={placesForMap}
                  selectedPlace={selectedPlace}
                  onPlaceSelect={setSelectedPlace}
                />
              </div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Heart className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                No Saved Places Yet
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start exploring and save your favorite places to build your travel wishlist
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
