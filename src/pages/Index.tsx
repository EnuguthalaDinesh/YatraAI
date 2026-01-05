import { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Navigation, MessageCircle, Sparkles, ChevronRight, Compass, Calendar, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SearchBar } from '@/components/search/SearchBar';
import { Navbar } from '@/components/layout/Navbar';
import { useAuth } from '@/contexts/AuthContext';
import { InterestCategory } from '@/types';

const features = [
  {
    icon: Sparkles,
    title: 'AI-Powered Discovery',
    description: 'Get personalized place recommendations based on your interests using advanced AI.',
  },
  {
    icon: Navigation,
    title: 'Turn-by-Turn Navigation',
    description: 'Get detailed directions with multiple travel modes - driving, walking, or cycling.',
  },
  {
    icon: MessageCircle,
    title: 'Travel AI Chatbot',
    description: 'Plan your entire trip with our intelligent chatbot. Ask anything about travel!',
  },
  {
    icon: Calendar,
    title: 'Smart Itineraries',
    description: 'Generate day-by-day itineraries with budget estimates and optimized routes.',
  },
];

const destinations = [
  { name: 'Jaipur', image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?w=400', tag: 'Heritage' },
  { name: 'Goa', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?w=400', tag: 'Beach' },
  { name: 'Varanasi', image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?w=400', tag: 'Spiritual' },
  { name: 'Manali', image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=400', tag: 'Adventure' },
];

export default function Index() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (city: string, interests: InterestCategory[]) => {
    if (!user) {
      navigate('/auth', { state: { from: { pathname: '/results' } } });
      return;
    }
    
    // Navigate to results with search params
    navigate('/results', { state: { city, interests } });
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-sky opacity-5" />
        <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />

        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-4xl mx-auto"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6"
            >
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">AI-Powered Travel Discovery</span>
            </motion.div>

            {/* Headline */}
            <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6">
              Discover Your Next
              <span className="text-gradient-ocean block">Adventure</span>
            </h1>

            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
              Let AI be your travel guide. Discover amazing places, get real-time navigation, 
              and plan the perfect trip tailored to your interests.
            </p>

            {/* Search Bar */}
            <SearchBar
              onSearch={handleSearch}
              isLoading={isSearching}
              disabled={false}
            />

            {!user && (
              <p className="mt-4 text-sm text-muted-foreground">
                <Button variant="link" onClick={() => navigate('/auth')} className="p-0 h-auto">
                  Sign in
                </Button>{' '}
                to unlock all features
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Popular Destinations
            </h2>
            <p className="text-muted-foreground">Start exploring these trending locations</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {destinations.map((dest, index) => (
              <motion.div
                key={dest.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer"
                onClick={() => user && navigate('/results', { state: { city: dest.name, interests: ['nature', 'history'] as InterestCategory[] } })}
              >
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-foreground/80 via-foreground/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <span className="text-xs font-medium text-primary-foreground/80 bg-primary/80 px-2 py-1 rounded-full">
                    {dest.tag}
                  </span>
                  <h3 className="font-display font-semibold text-xl text-primary-foreground mt-2">
                    {dest.name}
                  </h3>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
              Everything You Need
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              From discovery to navigation, we've got your travel planning covered
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-6 rounded-xl bg-card border border-border hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="w-12 h-12 rounded-lg gradient-ocean flex items-center justify-center mb-4 group-hover:shadow-glow transition-shadow">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h3 className="font-display font-semibold text-lg text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 relative overflow-hidden">
        <div className="absolute inset-0 gradient-ocean opacity-5" />
        <div className="container mx-auto px-4 relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="max-w-3xl mx-auto text-center"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of travelers discovering new places with AI assistance
            </p>
            <Button
              size="lg"
              className="gradient-ocean text-primary-foreground shadow-glow"
              onClick={() => navigate(user ? '/results' : '/auth')}
            >
              {user ? 'Start Exploring' : 'Get Started Free'}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-ocean flex items-center justify-center">
                <MapPin className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold">
                Yatra<span className="text-primary">AI</span>
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2025 YatraAI. Discover • Navigate • Plan with AI
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
