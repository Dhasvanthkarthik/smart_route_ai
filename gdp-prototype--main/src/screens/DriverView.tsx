import React from 'react';
import { 
  Truck, 
  Navigation, 
  Bell, 
  BarChart3, 
  Menu, 
  Home, 
  Camera, 
  CheckCircle2, 
  ChevronRight,
  Zap,
  HelpCircle
} from 'lucide-react';
import { motion } from 'motion/react';
import { User } from '@/types';

interface DriverViewProps {
  user: User;
}

export default function DriverView({ user }: DriverViewProps) {
  return (
    <div className="bg-background text-on-surface min-h-screen pb-24 flex flex-col">
      {/* TopNavBar */}
      <header className="bg-white/70 backdrop-blur-md w-full sticky top-0 z-40 shadow-[0_12px_32px_-4px_rgba(92,74,180,0.08)]">
        <div className="flex justify-between items-center px-6 py-3 w-full">
          <div className="flex items-center gap-3">
            <span className="text-xl font-bold tracking-tight text-primary">SmartRoute AI</span>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors active:scale-95 duration-200">
              <Bell className="w-5 h-5" />
            </button>
            <div className="w-8 h-8 rounded-full overflow-hidden bg-primary-container">
              <img 
                alt={user.name} 
                className="w-full h-full object-cover"
                src={user.avatar || `https://picsum.photos/seed/${user.id}/100/100`}
              />
            </div>
          </div>
        </div>
      </header>

      <main className="px-4 pt-4 space-y-6 flex-1 overflow-y-auto no-scrollbar">
        {/* Hero Section: Map & ETA */}
        <section className="relative overflow-hidden rounded-[2rem] bg-surface-container-lowest shadow-[0_12px_32px_-4px_rgba(92,74,180,0.08)]">
          <div className="h-64 w-full relative">
            <img 
              className="w-full h-full object-cover grayscale opacity-40" 
              src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000"
              alt="Map"
              referrerPolicy="no-referrer"
            />
            {/* Floating Route Indicator */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <motion.div 
                animate={{ y: [0, -10, 0] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="bg-primary text-white p-3 rounded-full shadow-lg scale-110"
              >
                <Truck className="w-6 h-6" />
              </motion.div>
            </div>
            {/* Glass Gradient Overlay for Info */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white/90 via-white/40 to-transparent p-6 pt-12">
              <div className="flex justify-between items-end">
                <div className="space-y-1">
                  <span className="text-sm font-bold uppercase tracking-widest text-primary opacity-80">Next Destination</span>
                  <h2 className="text-2xl font-extrabold text-on-surface leading-tight">O'Hare Logistics Hub</h2>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold uppercase tracking-widest text-primary opacity-80">ETA</span>
                  <div className="text-4xl font-black text-primary tracking-tighter">14:20</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Dynamic Status Section */}
        <section className="grid grid-cols-2 gap-4">
          <div className="col-span-2 bg-surface-container-low rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                <Navigation className="text-primary w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">Current Leg</p>
                <p className="text-lg font-bold text-on-surface">Route #SR-9421</p>
              </div>
            </div>
            <div className="flex flex-col items-end">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary-container text-primary text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse mr-2"></span>
                LIVE
              </span>
            </div>
          </div>

          {/* Active Tasks */}
          <div className="col-span-2 space-y-4">
            <p className="text-sm font-bold text-on-surface-variant uppercase tracking-widest px-1">Active Tasks</p>
            <button className="w-full bg-surface-container-lowest p-6 rounded-[1.5rem] flex items-center justify-between group active:scale-95 transition-all duration-200 shadow-sm">
              <div className="flex items-center gap-5">
                <div className="w-14 h-14 bg-secondary-container rounded-2xl flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors">
                  <Camera className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <span className="block text-lg font-bold text-on-surface">Upload Cargo Photo</span>
                  <span className="block text-sm text-on-surface-variant">Mid-Journey Verification</span>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-outline-variant" />
            </button>
            
            <button className="w-full bg-primary py-6 rounded-full flex items-center justify-center gap-3 shadow-lg active:scale-95 transition-all duration-200">
              <CheckCircle2 className="w-6 h-6 text-white" />
              <span className="text-lg font-extrabold text-white">Mark as Delivered</span>
            </button>
          </div>

          {/* Stats Mini-Grid */}
          <div className="bg-surface-container-low p-4 rounded-2xl">
            <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Distance Left</span>
            <span className="text-xl font-extrabold text-on-surface">12.4 <span className="text-sm font-medium opacity-60">mi</span></span>
          </div>
          <div className="bg-surface-container-low p-4 rounded-2xl">
            <span className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Fuel Range</span>
            <span className="text-xl font-extrabold text-on-surface">340 <span className="text-sm font-medium opacity-60">mi</span></span>
          </div>
        </section>

        {/* Insight Panel */}
        <section className="bg-secondary-container/30 p-5 rounded-[2rem] flex flex-col gap-3">
          <div className="flex items-center gap-2 text-primary">
            <Zap className="w-4 h-4" />
            <span className="text-sm font-bold uppercase tracking-wider">AI Optimizer</span>
          </div>
          <p className="text-on-secondary-container font-medium text-sm leading-relaxed">
            Traffic clearing on I-90. Stick to current route for a <span className="font-bold">4-minute gain</span>. Parking available at Hub Gate 4.
          </p>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full flex justify-around items-center px-4 py-3 pb-8 bg-white/80 backdrop-blur-xl z-50 md:hidden rounded-t-[24px] shadow-[0_-8px_24px_rgba(92,74,180,0.06)]">
        <button className="flex flex-col items-center justify-center text-on-surface-variant hover:opacity-80 active:scale-90 duration-150">
          <Home className="w-6 h-6" />
          <span className="text-[10px] uppercase tracking-wider mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-secondary-container text-primary rounded-2xl px-4 py-1.5 active:scale-90 duration-150">
          <Navigation className="w-6 h-6 fill-current" />
          <span className="text-[10px] uppercase tracking-wider mt-1 font-bold">Track</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant hover:opacity-80 active:scale-90 duration-150">
          <Bell className="w-6 h-6" />
          <span className="text-[10px] uppercase tracking-wider mt-1">Alerts</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant hover:opacity-80 active:scale-90 duration-150">
          <BarChart3 className="w-6 h-6" />
          <span className="text-[10px] uppercase tracking-wider mt-1">Stats</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant hover:opacity-80 active:scale-90 duration-150">
          <Menu className="w-6 h-6" />
          <span className="text-[10px] uppercase tracking-wider mt-1">Menu</span>
        </button>
      </nav>
    </div>
  );
}
