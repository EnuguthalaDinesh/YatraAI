import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MapPin, Filter, Grid, Map as MapIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/layout/Navbar';
import { SearchBar } from '@/components/search/SearchBar';
import { PlaceCard } from '@/components/places/PlaceCard';
import { MapView } from '@/components/map/MapView';
import { DirectionsPanel } from '@/components/directions/DirectionsPanel';
import { LoadingGrid, MapSkeleton } from '@/components/ui/loading-skeleton';
import { useSavedPlaces } from '@/hooks/useSavedPlaces';
import { Place, RouteInfo, TravelMode, InterestCategory } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type ViewMode = 'grid' | 'map' | 'split';

export default function Results() {
  const location = useLocation();
  const { savedPlaces, savePlace, removePlace, isPlaceSaved } = useSavedPlaces();
  
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('split');
  const [selectedPlace, setSelectedPlace] = useState<Place | null>(null);
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [travelMode, setTravelMode] = useState<TravelMode>('driving');
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [searchCity, setSearchCity] = useState('');

  // Get initial search params from navigation state
  useEffect(() => {
    const state = location.state as { city?: string; interests?: InterestCategory[] } | null;
    if (state?.city && state?.interests) {
      handleSearch(state.city, state.interests);
    }
  }, [location.state]);

  // Get user location
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
      () => console.log('Location not available')
    );
  }, []);

  const handleSearch = async (city: string, interests: InterestCategory[]) => {
    setIsLoading(true);
    setPlaces([]);
    setSelectedPlace(null);
    setRoute(null);
    setSearchCity(city);

    try {
      const { data, error } = await supabase.functions.invoke('generate-places', {
        body: { city, interests },
      });

      if (error) throw error;

      if (data?.places) {
        setPlaces(data.places);
        toast.success(`Found ${data.places.length} places in ${city}!`);
      }
    } catch (error) {
      console.error('Failed to generate places:', error);
      toast.error('Failed to discover places. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetDirections = async (place: Place) => {
    if (!userLocation) {
      toast.error('Please enable location access for directions');
      return;
    }

    setSelectedPlace(place);
    setIsLoadingRoute(true);
    setRoute(null);

    try {
      const { data, error } = await supabase.functions.invoke('get-directions', {
        body: {
          origin: { lat: userLocation[0], lng: userLocation[1] },
          destination: { lat: place.latitude, lng: place.longitude },
          mode: travelMode,
        },
      });

      if (error) throw error;

      if (data?.route) {
        setRoute(data.route);
      }
    } catch (error) {
      console.error('Failed to get directions:', error);
      toast.error('Failed to get directions. Please try again.');
    } finally {
      setIsLoadingRoute(false);
    }
  };

  const handleModeChange = (mode: TravelMode) => {
    setTravelMode(mode);
    if (selectedPlace) {
      handleGetDirections(selectedPlace);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4">
          {/* Search Section */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <SearchBar onSearch={handleSearch} isLoading={isLoading} />
          </motion.div>

          {/* Results Header */}
          {(places.length > 0 || isLoading) && (
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-bold text-foreground">
                  {isLoading ? 'Discovering...' : `Places in ${searchCity}`}
                </h2>
                <p className="text-muted-foreground">
                  {isLoading
                    ? 'AI is finding the best spots for you'
                    : `${places.length} places found`}
                </p>
              </div>

              {/* View Toggle */}
              <div className="flex gap-1 bg-muted rounded-lg p-1">
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'map' ? 'secondary' : 'ghost'}
                  onClick={() => setViewMode('map')}
                >
                  <MapIcon className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'split' ? 'secondary' : 'ghost'}
                  onClick={() => setViewMode('split')}
                  className="hidden lg:flex"
                >
                  Split
                </Button>
              </div>
            </div>
          )}

          {/* Content */}
          {isLoading ? (
            <div className={cn(viewMode === 'split' && 'lg:grid lg:grid-cols-2 gap-6')}>
              <LoadingGrid count={6} />
              {viewMode === 'split' && (
                <div className="hidden lg:block sticky top-24 h-[calc(100vh-8rem)]">
                  <MapSkeleton />
                </div>
              )}
            </div>
          ) : places.length > 0 ? (
            <div
              className={cn(
                'gap-6',
                viewMode === 'split' && 'lg:grid lg:grid-cols-2',
                viewMode === 'map' && 'h-[calc(100vh-14rem)]'
              )}
            >
              {/* Places Grid */}
              {viewMode !== 'map' && (
                <div className={cn(viewMode === 'split' && 'lg:max-h-[calc(100vh-14rem)] lg:overflow-y-auto lg:pr-2')}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {places.map((place, index) => (
                      <PlaceCard
                        key={place.id}
                        place={place}
                        index={index}
                        isSaved={isPlaceSaved(place.id)}
                        onSave={() => savePlace.mutate(place)}
                        onRemove={() => {
                          const saved = savedPlaces.find(p => p.name === place.name);
                          if (saved) removePlace.mutate(saved.id);
                        }}
                        onGetDirections={() => handleGetDirections(place)}
                        onSelect={() => setSelectedPlace(place)}
                        isSelected={selectedPlace?.id === place.id}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Map */}
              {viewMode !== 'grid' && (
                <div
                  className={cn(
                    viewMode === 'split'
                      ? 'hidden lg:block sticky top-24 h-[calc(100vh-8rem)]'
                      : 'h-full'
                  )}
                >
                  <div className="h-full flex flex-col gap-4">
                    <div className="flex-1 min-h-0">
                      <MapView
                        places={places}
                        selectedPlace={selectedPlace}
                        onPlaceSelect={setSelectedPlace}
                        onGetDirections={handleGetDirections}
                        route={route}
                      />
                    </div>
                    {(selectedPlace || route) && (
                      <div className="h-72">
                        <DirectionsPanel
                          route={route}
                          isLoading={isLoadingRoute}
                          selectedMode={travelMode}
                          onModeChange={handleModeChange}
                          originName="Your Location"
                          destinationName={selectedPlace?.name}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <MapPin className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                Start Your Discovery
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Enter a city and select your interests above to discover amazing places with AI
              </p>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
