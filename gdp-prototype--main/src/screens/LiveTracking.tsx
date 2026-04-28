import React, { useState, useRef, useEffect } from 'react';
import { api } from '../lib/api';
import { 
  Truck, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Plus, 
  Minus, 
  Layers, 
  Maximize2,
  Bell,
  HelpCircle,
  User,
  Search,
  Navigation,
  Activity,
  Zap,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';

interface FleetUnit {
  id: string;
  truckId: string;
  route: string;
  status: 'In Transit' | 'Delayed' | 'Idle';
  statusDetail?: string;
  eta?: string;
  duration?: string;
  lat: number;
  lng: number;
  speed?: string;
  riskScore?: string;
}

const MOCK_FLEET: FleetUnit[] = [
  {
    id: '1',
    truckId: 'CH-9942',
    route: 'Chicago → Detroit',
    status: 'In Transit',
    eta: '14:30 PM',
    lat: 41.8781,
    lng: -87.6298,
    speed: '64 mph',
    riskScore: '0.02 Low'
  },
  {
    id: '2',
    truckId: 'NY-4412',
    route: 'NYC → Philadelphia',
    status: 'Delayed',
    statusDetail: 'Weather',
    eta: '+45m',
    lat: 40.7128,
    lng: -74.0060
  },
  {
    id: '3',
    truckId: 'LA-1082',
    route: 'Stationary • Dock 14',
    status: 'Idle',
    duration: '02:14:00',
    lat: 34.0522,
    lng: -118.2437
  },
  {
    id: '4',
    truckId: 'TX-5510',
    route: 'Houston → Dallas',
    status: 'In Transit',
    eta: '11:15 AM',
    lat: 29.7604,
    lng: -95.3698
  }
];



export default function LiveTracking() {
  const [filter, setFilter] = useState('All Units');
  const [fleet, setFleet] = useState<FleetUnit[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<FleetUnit | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchFleet();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchFleet, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchFleet = async () => {
    try {
      const trucks = await api.trucks.getAll();
      if (!Array.isArray(trucks)) return;

      const mappedFleet: FleetUnit[] = await Promise.all(trucks.map(async (t: any) => {
        try {
          const gps = await api.trucks.getGps(t.id);
          return {
            id: t.id.toString(),
            truckId: t.license_plate || `TRK-${t.id}`,
            route: "Active Route",
            status: t.status === 'Delayed' ? 'Delayed' : t.status === 'Idle' ? 'Idle' : 'In Transit',
            lat: gps?.latitude || 41.8781,
            lng: gps?.longitude || -87.6298,
            speed: gps?.speed ? `${Math.round(gps.speed)} mph` : "0 mph",
            riskScore: "Low",
            eta: "Calculating..."
          };
        } catch (e) {
          console.error(`Failed to fetch GPS for truck ${t.id}:`, e);
          return {
            id: t.id.toString(),
            truckId: t.license_plate || `TRK-${t.id}`,
            route: "Offline",
            status: 'Idle',
            lat: 41.8781,
            lng: -87.6298,
            speed: "0 mph",
            eta: "N/A"
          };
        }
      }));
      setFleet(mappedFleet);
      setSelectedUnit(prev => {
        if (!prev && mappedFleet.length > 0) return mappedFleet[0];
        return mappedFleet.find(u => u.id === prev?.id) || prev;
      });
    } catch (error) {
      console.error('Failed to fetch fleet:', error);
    }
  };

  const [trafficOverlay, setTrafficOverlay] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);
  const [isFleetPaneOpen, setIsFleetPaneOpen] = useState(false);

  const filters = ['All Units', 'In Transit', 'Delayed', 'Idle'];

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.2, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.2, 0.5));

  const containerRef = useRef<HTMLDivElement>(null);

  const filteredFleet = fleet.filter(unit => {
    if (filter === 'All Units') return true;
    return unit.status === filter;
  });

  return (
    <div ref={containerRef} className="relative h-[calc(100vh-64px)] w-full overflow-hidden bg-[#0a1120]">
      {/* Draggable Fleet List Button - Always Visible */}
      <motion.button
        drag
        dragMomentum={false}
        dragConstraints={containerRef}
        onClick={() => setIsFleetPaneOpen(!isFleetPaneOpen)}
        className={cn(
          "absolute top-6 left-6 z-50 w-12 h-12 rounded-2xl shadow-2xl flex items-center justify-center transition-all cursor-move",
          isFleetPaneOpen ? "bg-[#6366F1] text-white" : "bg-white text-[#6366F1]"
        )}
      >
        <Truck className="w-5 h-5" />
      </motion.button>

      {/* Floating Fleet List Pane */}
      <AnimatePresence>
        {isFleetPaneOpen && !isFullscreen && (
          <motion.div 
            initial={{ x: -280, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: -280, opacity: 0 }}
            className="absolute top-20 left-6 bottom-6 w-64 z-40 pointer-events-none"
          >
            <div className="h-full bg-white/10 backdrop-blur-2xl rounded-2xl shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] border border-white/10 flex flex-col pointer-events-auto overflow-hidden">
              <div className="p-4 pb-2">
                <div className="flex justify-between items-center mb-1">
                  <h2 className="text-xl font-black text-white">Fleet</h2>
                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
                </div>
                <p className="text-[9px] text-white/40 mb-5 uppercase tracking-widest font-black">124 Units</p>
                
                <div className="flex gap-1.5 mb-5 overflow-x-auto no-scrollbar">
                  {filters.map((f) => (
                    <button
                      key={f}
                      onClick={() => setFilter(f)}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-[9px] font-bold transition-all whitespace-nowrap",
                        filter === f 
                          ? "bg-[#6366F1] text-white shadow-lg" 
                          : "bg-white/5 text-white/50 hover:bg-white/10"
                      )}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-2.5 no-scrollbar">
                {filteredFleet.map((unit) => (
                  <motion.div
                    key={unit.id}
                    layout
                    onClick={() => setSelectedUnit(unit)}
                    className={cn(
                      "p-3.5 rounded-2xl cursor-pointer transition-all border-2",
                      selectedUnit?.id === unit.id 
                        ? "bg-white border-[#6366F1] shadow-xl" 
                        : "bg-white/95 border-transparent hover:bg-white"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className={cn(
                          "w-8 h-8 rounded-lg flex items-center justify-center",
                          unit.status === 'Delayed' ? "bg-rose-500/10 text-rose-500" : 
                          unit.status === 'Idle' ? "bg-slate-500/10 text-slate-500" : "bg-[#6366F1]/10 text-[#6366F1]"
                        )}>
                          <Truck className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-xs">{unit.truckId}</h4>
                          <p className="text-[8px] text-slate-500 font-medium tracking-wide uppercase">{unit.route}</p>
                        </div>
                      </div>
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        unit.status === 'Delayed' ? "bg-rose-500" : 
                        unit.status === 'Idle' ? "bg-slate-400" : "bg-indigo-500"
                      )}></div>
                    </div>

                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Status</p>
                        <p className={cn(
                          "text-[10px] font-black",
                          unit.status === 'Delayed' ? "text-rose-500" : "text-[#6366F1]"
                        )}>
                          {unit.status}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
                          {unit.status === 'Idle' ? 'Duration' : 'ETA'}
                        </p>
                        <p className="text-[10px] font-black text-slate-900">
                          {unit.status === 'Idle' ? unit.duration : unit.eta}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* World Map Container (Full Screen) */}
      <div className="absolute inset-0 z-0 overflow-hidden">
          <motion.div 
            animate={{ scale: zoom }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="w-full h-full relative"
          >
            {/* Styled World Map SVG (Conceptual implementation of the image's map style) */}
            <svg 
              viewBox="0 0 1000 500" 
              className="w-full h-full opacity-60 mix-blend-screen" 
              preserveAspectRatio="xMidYMid slice"
            >
              <defs>
                <radialGradient id="mapGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#6366F1" stopOpacity="0.1" />
                  <stop offset="100%" stopColor="#0a1120" stopOpacity="0" />
                </radialGradient>
              </defs>
              {/* This path represents an abstract world map with a glowing geometric pattern */}
              <path 
                d="M100,100 L900,100 L900,400 L100,400 Z" 
                fill="url(#mapGlow)" 
              />
              <image 
                href="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000" 
                width="100%" 
                height="100%" 
                preserveAspectRatio="xMidYMid slice"
                className="opacity-20 contrast-150 saturate-0 invert"
              />
              {/* Route Arcs */}
              <circle cx="580" cy="270" r="100" fill="none" stroke="#6366F1" strokeWidth="1" strokeDasharray="4 4" className="opacity-40" />
              <path d="M400,350 Q600,450 850,300" fill="none" stroke="#F43F5E" strokeWidth="1.5" strokeDasharray="5 5" className="opacity-30" />
            </svg>

            {/* Map Markers */}
            {filteredFleet.map((unit) => (
              <div 
                key={unit.id}
                className="absolute"
                style={{ 
                  left: `${(unit.lng + 180) * (100 / 360)}%`, 
                  top: `${(90 - unit.lat) * (100 / 180)}%` 
                }}
              >
                <motion.div 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="relative cursor-pointer"
                  onClick={() => setSelectedUnit(unit)}
                >
                  {/* Halo pulse */}
                  <motion.div 
                    animate={{ scale: [1, 2], opacity: [0.5, 0] }}
                    transition={{ repeat: Infinity, duration: 2 }}
                    className={cn(
                      "absolute inset-0 rounded-full",
                      unit.status === 'Delayed' ? "bg-rose-500" : "bg-indigo-500"
                    )}
                  />
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center shadow-2xl relative z-10 transition-transform group-hover:scale-110",
                    unit.status === 'Delayed' ? "bg-rose-500 text-white" : 
                    unit.status === 'Idle' ? "bg-slate-500 text-white" : "bg-indigo-600 text-white"
                  )}>
                    <Truck className="w-5 h-5" />
                  </div>

                  {/* Ship Detail Tooltip (When selected) */}
                  <AnimatePresence>
                    {selectedUnit?.id === unit.id && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.9 }}
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-40 bg-white rounded-xl shadow-2xl p-3 z-40 border border-slate-100"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h4 className="text-xs font-black text-slate-900 leading-tight">{unit.truckId}</h4>
                            <p className="text-[7px] text-slate-400 font-black uppercase tracking-[0.05em]">Express Freight</p>
                          </div>
                          <span className="bg-indigo-600 text-white text-[7px] font-black px-1.5 py-0.5 rounded-full uppercase tracking-wider whitespace-nowrap">
                            {unit.status}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-1.5 mb-2">
                          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center">
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">ETA</p>
                            <p className="text-[10px] font-black text-indigo-600">{unit.eta}</p>
                          </div>
                          <div className="bg-slate-50 p-1.5 rounded-lg border border-slate-100 text-center">
                            <p className="text-[7px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Risk</p>
                            <p className="text-[10px] font-black text-indigo-900">{unit.riskScore ? unit.riskScore.split(' ')[0] : '0.00'}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 text-[8px] font-bold text-slate-500">
                          <div className="w-4 h-4 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                            <Navigation className="w-2 h-2 text-slate-900" />
                          </div>
                          <span className="text-slate-900 font-black text-[9px]">{unit.speed || '64 mph'}</span>
                        </div>

                        <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-white rotate-45 -mt-1 shadow-[2px_2px_5px_-1px_rgba(0,0,0,0.1)] border-r border-b border-slate-100"></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              </div>
            ))}
          </motion.div>
        </div>

        {/* Right Side Map Controls Overlay */}
        <div className="absolute bottom-10 right-10 z-20 flex flex-col gap-6 items-end">

          {/* Icon Controls Stack */}
          <div className="flex flex-col gap-3">
            {/* Zoom Controls */}
            <div className="bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden">
              <button 
                onClick={handleZoomIn}
                className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all active:scale-90"
              >
                <Plus className="w-6 h-6" />
              </button>
              <div className="h-px bg-slate-100 mx-4"></div>
              <button 
                onClick={handleZoomOut}
                className="w-14 h-14 flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all active:scale-90"
              >
                <Minus className="w-6 h-6" />
              </button>
            </div>

            {/* Fullscreen Control */}
            <button 
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="w-14 h-14 bg-white rounded-2xl shadow-2xl flex items-center justify-center text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all active:scale-95"
            >
              <Maximize2 className="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    );
}
