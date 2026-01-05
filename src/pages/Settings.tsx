import { useState } from 'react';
import { motion } from 'framer-motion';
import { Settings as SettingsIcon, Car, Footprints, Bike, Globe, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { useProfile } from '@/hooks/useProfile';
import { TravelMode } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const travelModes: { id: TravelMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: 'driving', label: 'Driving', icon: Car },
  { id: 'walking', label: 'Walking', icon: Footprints },
  { id: 'cycling', label: 'Cycling', icon: Bike },
];

const languages = [
  { code: 'en', label: 'English' },
  { code: 'hi', label: 'Hindi' },
  { code: 'es', label: 'Spanish' },
  { code: 'fr', label: 'French' },
];

export default function Settings() {
  const { user, signOut } = useAuth();
  const { profile, isLoading, updateProfile } = useProfile();
  const [isSaving, setIsSaving] = useState(false);

  const handleTravelModeChange = async (mode: TravelMode) => {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({ preferred_travel_mode: mode });
      toast.success('Travel mode updated');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLanguageChange = async (language: string) => {
    setIsSaving(true);
    try {
      await updateProfile.mutateAsync({ language });
      toast.success('Language updated');
    } catch (error) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="pt-20 pb-8">
        <div className="container mx-auto px-4 max-w-2xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-lg gradient-ocean flex items-center justify-center">
                <SettingsIcon className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="font-display text-3xl font-bold text-foreground">
                Settings
              </h1>
            </div>
            <p className="text-muted-foreground">
              Manage your preferences and account
            </p>
          </motion.div>

          <div className="space-y-6">
            {/* Account Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Your account information</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label className="text-muted-foreground">Email</Label>
                      <p className="font-medium">{user?.email}</p>
                    </div>
                    {profile?.full_name && (
                      <div>
                        <Label className="text-muted-foreground">Name</Label>
                        <p className="font-medium">{profile.full_name}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Travel Mode */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Preferred Travel Mode</CardTitle>
                  <CardDescription>
                    Default travel mode for getting directions
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={profile?.preferred_travel_mode || 'driving'}
                    onValueChange={(value) => handleTravelModeChange(value as TravelMode)}
                    className="grid grid-cols-3 gap-4"
                    disabled={isLoading || isSaving}
                  >
                    {travelModes.map((mode) => (
                      <Label
                        key={mode.id}
                        htmlFor={mode.id}
                        className={cn(
                          'flex flex-col items-center gap-2 p-4 rounded-lg border cursor-pointer transition-all',
                          profile?.preferred_travel_mode === mode.id
                            ? 'border-primary bg-primary/5'
                            : 'border-border hover:border-primary/50'
                        )}
                      >
                        <RadioGroupItem value={mode.id} id={mode.id} className="sr-only" />
                        <mode.icon className="w-6 h-6" />
                        <span className="text-sm font-medium">{mode.label}</span>
                      </Label>
                    ))}
                  </RadioGroup>
                </CardContent>
              </Card>
            </motion.div>

            {/* Language */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    Language
                  </CardTitle>
                  <CardDescription>
                    Choose your preferred language
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Select
                    value={profile?.language || 'en'}
                    onValueChange={handleLanguageChange}
                    disabled={isLoading || isSaving}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      {languages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            </motion.div>

            {/* Sign Out */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <Card className="border-destructive/20">
                <CardHeader>
                  <CardTitle>Sign Out</CardTitle>
                  <CardDescription>
                    Sign out of your account on this device
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="destructive"
                    onClick={signOut}
                    className="w-full sm:w-auto"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
