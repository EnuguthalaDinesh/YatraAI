import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Place } from '@/types';
import { toast } from 'sonner';

export function useSavedPlaces() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: savedPlaces = [], isLoading } = useQuery({
    queryKey: ['savedPlaces', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('saved_places')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data.map(place => ({
        id: place.id,
        name: place.name,
        description: place.description || '',
        category: place.category || '',
        latitude: place.latitude,
        longitude: place.longitude,
        imageUrl: place.image_url || '',
        city: place.city || '',
        createdAt: place.created_at,
      }));
    },
    enabled: !!user,
  });

  const savePlace = useMutation({
    mutationFn: async (place: Place) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('saved_places').insert({
        user_id: user.id,
        name: place.name,
        description: place.description,
        category: place.category,
        latitude: place.latitude,
        longitude: place.longitude,
        image_url: place.imageUrl,
        city: place.city,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedPlaces', user?.id] });
      toast.success('Place saved to wishlist!');
    },
    onError: () => {
      toast.error('Failed to save place');
    },
  });

  const removePlace = useMutation({
    mutationFn: async (placeId: string) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase
        .from('saved_places')
        .delete()
        .eq('id', placeId)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['savedPlaces', user?.id] });
      toast.success('Place removed from wishlist');
    },
    onError: () => {
      toast.error('Failed to remove place');
    },
  });

  const isPlaceSaved = (placeId: string) => {
    return savedPlaces.some(p => p.id === placeId);
  };

  return { savedPlaces, isLoading, savePlace, removePlace, isPlaceSaved };
}
