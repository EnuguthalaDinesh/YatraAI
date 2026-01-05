import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, MapPin, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { InterestCategory } from '@/types';
import { cn } from '@/lib/utils';

const interests: { id: InterestCategory; label: string; emoji: string }[] = [
  { id: 'nature', label: 'Nature', emoji: '🌿' },
  { id: 'food', label: 'Food', emoji: '🍜' },
  { id: 'history', label: 'History', emoji: '🏛️' },
  { id: 'adventure', label: 'Adventure', emoji: '🎯' },
  { id: 'religious', label: 'Religious', emoji: '🛕' },
  { id: 'shopping', label: 'Shopping', emoji: '🛍️' },
];

interface SearchBarProps {
  onSearch: (city: string, interests: InterestCategory[]) => void;
  isLoading?: boolean;
  disabled?: boolean;
}

export function SearchBar({ onSearch, isLoading, disabled }: SearchBarProps) {
  const [city, setCity] = useState('');
  const [selectedInterests, setSelectedInterests] = useState<InterestCategory[]>([]);

  const toggleInterest = (interest: InterestCategory) => {
    setSelectedInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (city.trim() && selectedInterests.length > 0) {
      onSearch(city.trim(), selectedInterests);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      onSubmit={handleSubmit}
      className="w-full max-w-2xl mx-auto space-y-4"
    >
      {/* City Input */}
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Enter a city or destination..."
          value={city}
          onChange={(e) => setCity(e.target.value)}
          disabled={disabled}
          className="pl-12 pr-4 h-14 text-lg bg-card border-border shadow-sm"
        />
      </div>

      {/* Interest Tags */}
      <div className="flex flex-wrap gap-2 justify-center">
        {interests.map((interest) => (
          <Badge
            key={interest.id}
            variant={selectedInterests.includes(interest.id) ? "default" : "outline"}
            className={cn(
              "cursor-pointer px-4 py-2 text-sm transition-all",
              selectedInterests.includes(interest.id)
                ? "gradient-ocean text-primary-foreground border-transparent"
                : "hover:border-primary hover:text-primary",
              disabled && "opacity-50 cursor-not-allowed"
            )}
            onClick={() => !disabled && toggleInterest(interest.id)}
          >
            <span className="mr-1">{interest.emoji}</span>
            {interest.label}
          </Badge>
        ))}
      </div>

      {/* Search Button */}
      <Button
        type="submit"
        size="lg"
        disabled={!city.trim() || selectedInterests.length === 0 || isLoading || disabled}
        className="w-full h-14 text-lg gradient-ocean text-primary-foreground shadow-glow"
      >
        {isLoading ? (
          <>
            <Sparkles className="w-5 h-5 mr-2 animate-pulse" />
            Discovering places...
          </>
        ) : (
          <>
            <Search className="w-5 h-5 mr-2" />
            Discover with AI
          </>
        )}
      </Button>
    </motion.form>
  );
}
