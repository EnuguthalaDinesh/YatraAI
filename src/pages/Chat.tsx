import { Navbar } from '@/components/layout/Navbar';
import { TravelChatbot } from '@/components/chat/TravelChatbot';

export default function Chat() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="pt-20 pb-8 h-screen">
        <div className="container mx-auto px-4 h-[calc(100vh-6rem)]">
          <TravelChatbot />
        </div>
      </main>
    </div>
  );
}
