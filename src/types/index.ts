export interface Place {
  id: string;
  name: string;
  description: string;
  category: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  city?: string;
}

export interface SavedPlace extends Place {
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  places: Place[];
  notes?: string;
}

export interface Itinerary {
  id: string;
  title: string;
  city: string;
  days: number;
  budgetEstimate?: string;
  content: ItineraryDay[];
  createdAt: string;
}

export interface RouteInfo {
  distance: string;
  duration: string;
  steps: RouteStep[];
  geometry: [number, number][];
}

export interface RouteStep {
  instruction: string;
  distance: string;
  duration: string;
}

export type TravelMode = 'driving' | 'walking' | 'cycling';

export type InterestCategory = 
  | 'nature'
  | 'food'
  | 'history'
  | 'adventure'
  | 'religious'
  | 'shopping';

export interface SearchParams {
  city: string;
  interests: InterestCategory[];
}

export interface UserProfile {
  id: string;
  userId: string;
  fullName?: string;
  avatarUrl?: string;
  preferredTravelMode: TravelMode;
  language: string;
}
