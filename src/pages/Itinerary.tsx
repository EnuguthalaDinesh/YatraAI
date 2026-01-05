import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Plus, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/layout/Navbar';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Activity {
  time?: string;
  description?: string;
}

interface ItineraryDay {
  day: number;
  title: string;
  activities: (string | Activity)[];
}

// Helper to render activity - handles both string and object formats
const renderActivity = (activity: string | Activity): string => {
  if (typeof activity === 'string') {
    return activity;
  }
  if (activity.time && activity.description) {
    return `${activity.time} - ${activity.description}`;
  }
  return activity.description || activity.time || '';
};

interface GeneratedItinerary {
  title: string;
  days: ItineraryDay[];
  budgetEstimate: string;
  tips: string[];
}

export default function Itinerary() {
  const [city, setCity] = useState('');
  const [days, setDays] = useState('3');
  const [budget, setBudget] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [itinerary, setItinerary] = useState<GeneratedItinerary | null>(null);

  const handleGenerate = async () => {
    if (!city) {
      toast.error('Please enter a destination');
      return;
    }

    setIsGenerating(true);
    setItinerary(null);

    try {
      const { data, error } = await supabase.functions.invoke('generate-itinerary', {
        body: { city, days: parseInt(days), budget },
      });

      if (error) throw error;

      if (data?.itinerary) {
        setItinerary(data.itinerary);
        toast.success('Itinerary generated!');
      }
    } catch (error) {
      console.error('Failed to generate itinerary:', error);
      toast.error('Failed to generate itinerary. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

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
              <div className="w-10 h-10 rounded-lg gradient-ocean flex items-center justify-center">
                <Calendar className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                AI Itinerary Planner
              </h1>
            </div>
            <p className="text-muted-foreground">
              Generate a personalized day-by-day travel itinerary
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Form */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-1"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Plan Your Trip</CardTitle>
                  <CardDescription>
                    Enter your destination and preferences
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="city">Destination</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="city"
                        placeholder="e.g., Goa, India"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="days">Number of Days</Label>
                    <Select value={days} onValueChange={setDays}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7].map((d) => (
                          <SelectItem key={d} value={d.toString()}>
                            {d} {d === 1 ? 'day' : 'days'}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="budget">Budget (optional)</Label>
                    <Input
                      id="budget"
                      placeholder="e.g., ₹10,000 or $500"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                    />
                  </div>

                  <Button
                    className="w-full gradient-ocean text-primary-foreground"
                    onClick={handleGenerate}
                    disabled={isGenerating || !city}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 mr-2" />
                        Generate Itinerary
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>

            {/* Generated Itinerary */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="lg:col-span-2"
            >
              {isGenerating ? (
                <Card className="h-full">
                  <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="text-center">
                      <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 animate-pulse" />
                      <p className="text-muted-foreground">
                        AI is crafting your perfect itinerary...
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ) : itinerary ? (
                <Card>
                  <CardHeader>
                    <CardTitle>{itinerary.title}</CardTitle>
                    <CardDescription>
                      Estimated budget: {itinerary.budgetEstimate}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {itinerary.days.map((day) => (
                      <div
                        key={day.day}
                        className="p-4 bg-muted/50 rounded-lg"
                      >
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-8 h-8 rounded-full gradient-ocean flex items-center justify-center text-primary-foreground text-sm font-bold">
                            {day.day}
                          </div>
                          <h3 className="font-display font-semibold">
                            {day.title}
                          </h3>
                        </div>
                        <ul className="space-y-2 ml-10">
                          {day.activities.map((activity, i) => (
                            <li
                              key={i}
                              className="text-sm text-muted-foreground flex items-start gap-2"
                            >
                              <span className="text-primary">•</span>
                              {renderActivity(activity)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    {itinerary.tips.length > 0 && (
                      <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
                        <h4 className="font-semibold text-primary mb-2">
                          Travel Tips
                        </h4>
                        <ul className="space-y-1">
                          {itinerary.tips.map((tip, i) => (
                            <li key={i} className="text-sm text-muted-foreground">
                              • {tip}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <Card className="h-full">
                  <CardContent className="flex items-center justify-center h-full min-h-[400px]">
                    <div className="text-center">
                      <Calendar className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                      <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                        No Itinerary Yet
                      </h3>
                      <p className="text-muted-foreground max-w-sm">
                        Enter your destination and preferences to generate a
                        personalized travel itinerary
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
