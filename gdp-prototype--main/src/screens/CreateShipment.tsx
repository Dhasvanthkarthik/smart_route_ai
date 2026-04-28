import React, { useState, useEffect } from 'react';
import { 
  Package, 
  MapPin, 
  ChevronRight, 
  Info, 
  Settings, 
  ArrowRight,
  Route,
  Zap,
  Lock,
  Flag,
  Truck as TruckIcon,
  Loader2
} from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { Shipment } from '@/types';
import { api } from '@/lib/api';

export default function CreateShipment({ onCreate }: { onCreate: (shipment: Omit<Shipment, 'id'>) => void }) {
  const [step, setStep] = useState(1);
  const [cargoType, setCargoType] = useState('Electronics');
  const [value, setValue] = useState('45000');
  const [weight, setWeight] = useState('1250');
  const [source, setSource] = useState('Chennai');
  const [destination, setDestination] = useState('Mumbai');
  const [trucks, setTrucks] = useState<any[]>([]);
  const [selectedTruckId, setSelectedTruckId] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    api.trucks.getAll().then((data: any[]) => {
      setTrucks(data);
      if (data.length > 0) setSelectedTruckId(data[0].id);
    }).catch(console.error);
  }, []);

  const handleNextStep = async () => {
    if (step < 2) {
      setStep(step + 1);
    } else {
      setIsSubmitting(true);
      try {
        await api.shipments.create({
          truck_id: selectedTruckId,
          source,
          destination,
          cargo_type: cargoType,
          cargo_value: parseFloat(value) || 45000,
          weight: parseFloat(weight) || 1250,
        });
        onCreate({
          truckId: trucks.find(t => t.id === selectedTruckId)?.license_plate || `TRK-${selectedTruckId}`,
          status: 'IN TRANSIT',
          route: `${source} → ${destination}`,
          eta: 'Calculating...'
        });
      } catch (err) {
        console.error('Failed to create shipment:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto overflow-y-auto h-[calc(100vh-64px)] no-scrollbar">
      {/* Header & Stepper */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <h2 className="text-2xl font-extrabold text-primary tracking-tight">Create Shipment</h2>
        
        <div className="flex items-center gap-4 bg-surface-container-low p-2 rounded-full px-6">
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
              step >= 1 ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"
            )}>1</div>
            <span className={cn("text-xs font-bold", step >= 1 ? "text-primary" : "text-on-surface-variant")}>Cargo Details</span>
          </div>
          <div className="w-12 h-px bg-outline-variant/30"></div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
              step >= 2 ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"
            )}>2</div>
            <span className={cn("text-xs font-bold", step >= 2 ? "text-primary" : "text-on-surface-variant")}>Route Info</span>
          </div>
          <div className="w-12 h-px bg-outline-variant/30"></div>
          <div className="flex items-center gap-2">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold",
              step >= 3 ? "bg-primary text-white" : "bg-surface-container text-on-surface-variant"
            )}>3</div>
            <span className={cn("text-xs font-bold", step >= 3 ? "text-primary" : "text-on-surface-variant")}>Assignment</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Sections */}
        <div className="lg:col-span-8 space-y-8">
          {/* Cargo Details Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm border border-outline-variant/10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Package className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">Cargo Details</h3>
                <p className="text-sm text-on-surface-variant">Define what you're transporting today</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Cargo Type</label>
                <select 
                  value={cargoType}
                  onChange={(e) => setCargoType(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                >
                  <option>Electronics</option>
                  <option>Pharmaceuticals</option>
                  <option>Perishables</option>
                  <option>Machinery</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Estimated Value (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">$</span>
                  <input 
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    className="w-full bg-surface-container-low border-none rounded-2xl py-4 pl-8 pr-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                    placeholder="45000" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Gross Weight (KG)</label>
                <input 
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none" 
                  placeholder="1250" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Assign Truck</label>
                <select
                  value={selectedTruckId}
                  onChange={(e) => setSelectedTruckId(Number(e.target.value))}
                  className="w-full bg-surface-container-low border-none rounded-2xl py-4 px-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                >
                  {trucks.length === 0 ? (
                    <option value={1}>Loading trucks...</option>
                  ) : (
                    trucks.map((t: any) => (
                      <option key={t.id} value={t.id}>
                        {t.license_plate} — {t.driver_name} ({t.status})
                      </option>
                    ))
                  )}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Handling Requirements</label>
                <div className="flex gap-2 pt-1">
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1.5 rounded-lg">FRAGILE</span>
                  <span className="bg-surface-container text-on-surface-variant text-[10px] font-bold px-3 py-1.5 rounded-lg">DRY LOAD</span>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-8 border-t border-outline-variant/10">
              <button 
                onClick={handleNextStep}
                disabled={isSubmitting}
                className="w-full md:w-auto bg-primary text-white py-4 px-10 rounded-full font-bold shadow-lg hover:shadow-primary/20 hover:bg-primary-dim transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</> : <><Zap className="w-5 h-5 fill-current" /> Quick Create Shipment</>}
              </button>
            </div>
          </motion.div>

          {/* Route Network Card */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm border border-outline-variant/10"
          >
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
                <Route className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">Route Network</h3>
                <p className="text-sm text-on-surface-variant">AI-optimized source and destination mapping</p>
              </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-4 mb-8">
              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1">Origin</label>
                <div className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                    placeholder="e.g. Chennai"
                    className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-on-surface-variant/50"
                  />
                </div>
              </div>
              
              <div className="bg-surface-container-low p-2 rounded-full hidden md:block">
                <ArrowRight className="w-4 h-4 text-primary" />
              </div>

              <div className="flex-1 w-full space-y-2">
                <label className="text-[10px] font-bold text-primary uppercase tracking-widest ml-1 text-right block">Destination</label>
                <div className="bg-surface-container-low rounded-2xl p-4 flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-primary shadow-sm shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <input
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Mumbai"
                    className="flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-on-surface-variant/50"
                  />
                  <Flag className="w-4 h-4 text-error opacity-40 shrink-0" />
                </div>
              </div>
            </div>

            <div className="relative h-64 rounded-[1.5rem] overflow-hidden">
              <img 
                className="w-full h-full object-cover grayscale opacity-40" 
                src="https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000"
                alt="Route Map"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
              
              <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Estimated Distance</p>
                <p className="text-xl font-black text-primary">1,337 KM</p>
              </div>

              <div className="absolute bottom-4 right-4 bg-primary text-white px-4 py-2 rounded-full flex items-center gap-2 text-[10px] font-bold shadow-lg">
                <Zap className="w-3 h-3 fill-current" />
                AI Route Active
              </div>
            </div>
          </motion.div>

          {/* Assignment Card (Locked) */}
          <motion.div 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-surface-container-low/50 rounded-[2rem] p-8 border border-dashed border-outline-variant/30"
          >
            <div className="flex items-center gap-4 mb-8 opacity-40">
              <div className="w-12 h-12 bg-surface-container rounded-2xl flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-on-surface">Assignment</h3>
                <p className="text-sm text-on-surface-variant">Locked until route validation</p>
              </div>
            </div>

            <div className="h-32 flex items-center justify-center border border-dashed border-outline-variant/30 rounded-2xl bg-white/30">
              <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                <Lock className="w-5 h-5 opacity-40" />
                <p className="text-xs font-medium">Step 3 activates after Route Details confirmation.</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: AI Strategy & Summary */}
        <div className="lg:col-span-4 space-y-6">
          {/* AI Orchestrator Card */}
          <motion.div 
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            className="bg-primary rounded-[2rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-5 h-5" />
                <span className="text-[10px] font-bold uppercase tracking-widest opacity-80">AI Orchestrator</span>
              </div>
              
              <h4 className="text-2xl font-extrabold tracking-tight mb-8">Optimized Logistics Strategy</h4>
              
              <div className="space-y-4">
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Recommended Vehicle</p>
                  <p className="text-lg font-bold">Heavy-Duty EV Truck (Model X4)</p>
                </div>
                
                <div className="bg-white/10 p-4 rounded-2xl border border-white/10">
                  <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-2">Expected Transit Time</p>
                  <p className="text-lg font-bold">28 Hours 15 Mins</p>
                </div>
              </div>

              <p className="mt-8 text-xs text-white/70 leading-relaxed">
                AI indicates 12% fuel savings by routing through the NH-48 corridor during off-peak hours.
              </p>
            </div>
          </motion.div>

          {/* Configuration Summary */}
          <div className="bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm border border-outline-variant/10">
            <h4 className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-6">Configuration Summary</h4>
            
            <div className="space-y-4 mb-8">
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Base Rate</span>
                <span className="font-bold">$1,240.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Express Surcharge</span>
                <span className="font-bold text-tertiary">+$150.00</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-on-surface-variant">Insurance (Premium)</span>
                <span className="font-bold text-tertiary">+$45.00</span>
              </div>
              <div className="pt-4 border-t border-outline-variant/10 flex justify-between items-center">
                <span className="text-lg font-bold">Total Est. Cost</span>
                <span className="text-2xl font-black text-primary">$1,435.00</span>
              </div>
            </div>

            <button 
              onClick={handleNextStep}
              disabled={isSubmitting}
              className="w-full bg-primary text-white py-4 rounded-full font-bold shadow-lg hover:bg-primary-dim transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70"
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Creating...</>
              ) : (
                <>{step === 1 ? 'Next: Route Info' : 'Create & Optimize Shipment'}<ArrowRight className="w-5 h-5" /></>
              )}
            </button>
            
            <button className="w-full mt-4 text-on-surface-variant text-sm font-bold hover:text-primary transition-colors">
              Save as Draft
            </button>
          </div>

          {/* Assistance Box */}
          <div className="bg-error-container/10 border-l-4 border-error-container p-6 rounded-2xl flex gap-4">
            <Info className="w-6 h-6 text-error-container shrink-0" />
            <div>
              <p className="text-sm font-bold text-on-surface mb-1">Need assistance?</p>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Our logistics specialists are available 24/7 to help with special handling requirements.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
