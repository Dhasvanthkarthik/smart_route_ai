import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  ChevronRight, 
  AlertTriangle, 
  CloudLightning, 
  TrafficCone, 
  Sparkles,
  ArrowRight,
  Info,
  Plus,
  Minus,
  Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Alert, Shipment } from '@/types';
import { api } from '@/lib/api';

const MOCK_ALERTS: Alert[] = [
  { 
    id: 'a1', 
    type: 'weather', 
    title: 'Storm Warning: I-80', 
    description: 'Heavy rain affecting 3 shipments', 
    recommendation: 'Reroute TRK-8829 and TRK-4412 via Hwy-30. Estimated time savings: 22 mins.',
    severity: 'high' 
  },
  { 
    id: 'a2', 
    type: 'traffic', 
    title: 'Congestion: Chicago Hub', 
    description: 'Accident on I-94 Southbound', 
    severity: 'medium' 
  },
];

export default function Dashboard({ shipments, onTabChange }: { shipments: Shipment[], onTabChange: (tab: string) => void }) {
  const [filter, setFilter] = React.useState<'ALL' | 'DELAYED' | 'IDLE'>('ALL');
  const [activeMenu, setActiveMenu] = React.useState<'fleet' | 'health' | 'ai' | 'alerts' | null>(null);
  const [selectedShipmentId, setSelectedShipmentId] = React.useState<string | null>(null);
  const [isMenuExpanded, setIsMenuExpanded] = React.useState(false);
  const [zoom, setZoom] = React.useState(1);
  const [isFullscreen, setIsFullscreen] = React.useState(false);
  const [alerts, setAlerts] = React.useState<Alert[]>([]);
  const mapContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await api.alerts.getAll();
      const mappedAlerts: Alert[] = data.map((a: any) => ({
        id: a.id.toString(),
        type: a.category.toLowerCase() as any,
        title: a.title,
        description: a.description,
        severity: a.severity.toLowerCase() === 'critical' ? 'high' : 
                  a.severity.toLowerCase() === 'warning' ? 'medium' : 'low'
      }));
      setAlerts(mappedAlerts);
    } catch (error) {
      console.error('Failed to fetch alerts in Dashboard:', error);
    }
  };

  const handleZoomIn = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(prev => Math.min(prev + 0.2, 3));
  };
  
  const handleZoomOut = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoom(prev => Math.max(prev - 0.2, 0.5));
  };

  const filteredShipments = shipments.filter(s => {
    if (filter === 'ALL') return true;
    return s.status === filter;
  });

  const selectedShipment = shipments.find(s => s.id === selectedShipmentId);

  // Define marker positions for mock visualization
  const markerPositions: Record<string, { top: string, left: string }> = {
    '1': { top: '30%', left: '45%' },
    '2': { top: '55%', left: '62%' },
    '3': { top: '45%', left: '30%' },
    '4': { top: '65%', left: '40%' },
  };

  const menuItems = [
    { id: 'fleet', icon: Truck, label: 'Shipment History' },
    { id: 'health', icon: Activity, label: 'Health' },
    { id: 'ai', icon: Sparkles, label: 'AI' },
    { id: 'alerts', icon: AlertTriangle, label: 'Alerts' },
  ] as const;

  return (
    <div 
      ref={mapContainerRef}
      className="flex-1 relative flex flex-col h-[calc(100vh-64px)] overflow-hidden" 
      onClick={() => setSelectedShipmentId(null)}
    >
      {/* Full Width Map Background */}
      <div className="absolute inset-0 z-0 bg-surface-container-low" onClick={(e) => e.stopPropagation()}>
        <motion.div 
          animate={{ scale: zoom }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-full h-full relative overflow-hidden"
        >
          <img 
            className="w-full h-full object-cover opacity-60 grayscale brightness-110" 
            src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=2000"
            alt="Map background"
            referrerPolicy="no-referrer"
          />
          
          {/* Dynamic Vehicle Markers */}
          <AnimatePresence>
            {filteredShipments.map((shipment) => {
              const pos = markerPositions[shipment.id] || { top: '50%', left: '50%' };
              return (
                <motion.div 
                  key={shipment.id}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0 }}
                  onClick={(e) => { e.stopPropagation(); setSelectedShipmentId(shipment.id); }}
                  className={cn(
                    "absolute w-6 h-6 rounded-lg flex items-center justify-center shadow-lg cursor-pointer z-10 transition-transform active:scale-95",
                    shipment.status === 'DELAYED' ? "bg-error text-white" : 
                    shipment.status === 'IDLE' ? "bg-on-surface-variant text-white" : "bg-primary text-white"
                  )}
                  style={{ top: pos.top, left: pos.left }}
                >
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 2 + Math.random() }}
                  >
                    <Truck className="w-4 h-4" />
                  </motion.div>
                  <AnimatePresence>
                    {selectedShipmentId === shipment.id && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.8, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 10 }}
                        className="absolute -top-12 left-1/2 -translate-x-1/2 bg-white px-3 py-2 rounded-xl shadow-2xl text-[10px] font-bold text-on-surface whitespace-nowrap border border-outline-variant/10"
                      >
                        {shipment.truckId} | {shipment.status}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </AnimatePresence>
          
          {/* Decorative Map Elements */}
          <div className="absolute top-[20%] left-[10%] w-32 h-32 border border-primary/20 rounded-full animate-pulse"></div>
          <div className="absolute bottom-[15%] right-[25%] w-48 h-48 border border-tertiary/20 rounded-full animate-pulse delay-700"></div>

        </motion.div>
      </div>

      {/* Map Controls - Stable Location */}
      <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-20 pointer-events-auto">
        <button 
          onClick={handleZoomIn}
          className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors active:scale-95"
        >
          <Plus className="w-5 h-5" />
        </button>
        <button 
          onClick={handleZoomOut}
          className="w-10 h-10 bg-white rounded-xl shadow-lg flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors active:scale-95"
        >
          <Minus className="w-5 h-5" />
        </button>
        <button 
          onClick={(e) => { e.stopPropagation(); setIsFullscreen(!isFullscreen); if (!isFullscreen) setActiveMenu(null); }}
          className={cn(
            "w-10 h-10 rounded-xl shadow-lg flex items-center justify-center transition-colors active:scale-95",
            isFullscreen ? "bg-primary text-white" : "bg-white text-on-surface-variant hover:text-primary"
          )}
        >
          <div className="w-5 h-5 border-2 border-current rounded-sm"></div>
        </button>
      </div>

      {/* Draggable FAB (Trigger) */}
      {!isFullscreen && (
        <motion.div 
          drag
          dragMomentum={false}
          dragConstraints={mapContainerRef}
          dragElastic={0}
          className="absolute bottom-24 right-8 z-50 pointer-events-auto flex items-center gap-4"
          style={{ touchAction: 'none' }}
        >
          <button 
            onClick={() => setIsMenuExpanded(!isMenuExpanded)}
            className={cn(
              "w-16 h-16 rounded-[24px] shadow-2xl flex items-center justify-center transition-all active:scale-90 cursor-move shrink-0",
              isMenuExpanded ? "bg-primary text-white" : "bg-white text-primary"
            )}
          >
            {isMenuExpanded ? <Plus className="w-8 h-8 rotate-45" /> : <Sparkles className="w-8 h-8 animate-pulse" />}
          </button>
  
          <AnimatePresence>
            {isMenuExpanded && (
              <div className="flex gap-3 h-16 items-center">
                {menuItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.5, x: -20 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.5, x: -20 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => {
                      setActiveMenu(activeMenu === item.id ? null : item.id);
                    }}
                    className={cn(
                      "w-12 h-12 rounded-2xl shadow-xl flex items-center justify-center transition-all hover:scale-110 active:scale-95 group relative shrink-0",
                      activeMenu === item.id ? "bg-primary text-white" : "bg-white text-on-surface-variant"
                    )}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="absolute bottom-14 bg-on-surface text-white px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                      {item.label}
                    </span>
                  </motion.button>
                ))}
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Conditional Overlays */}
      <AnimatePresence>
        {activeMenu === 'fleet' && (
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="absolute top-6 left-6 z-40 w-80 pointer-events-auto max-h-[80%]"
          >
            <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/40 flex flex-col h-full overflow-hidden">
               <div className="p-6 pb-2">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-sm font-black text-primary uppercase tracking-widest">Shipment History</h2>
                  <span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-1 rounded-full">
                    {shipments.filter(s => s.status !== 'COMPLETED').length} ACTIVE
                  </span>
                </div>
                <div className="flex gap-2 mb-4 text-[10px] font-bold">
                  {['ALL', 'DELAYED', 'IDLE'].map((f) => (
                    <button 
                      key={f}
                      onClick={() => setFilter(f as any)}
                      className={cn(
                        "flex-1 py-2 rounded-xl transition-all",
                        filter === f ? "bg-primary text-white" : "bg-white/50 text-on-surface-variant hover:bg-white"
                      )}
                    >{f}</button>
                  ))}
                </div>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar px-6 pb-6 space-y-3">
                {filteredShipments.map((shipment) => (
                  <div 
                    key={shipment.id} 
                    onClick={(e) => { e.stopPropagation(); setSelectedShipmentId(shipment.id); }}
                    className={cn(
                      "p-4 bg-white/60 rounded-2xl border-l-4 shadow-sm cursor-pointer hover:bg-white transition-all",
                      shipment.status === 'DELAYED' ? "border-error" : "border-primary",
                      selectedShipmentId === shipment.id && "ring-2 ring-primary/20"
                    )}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="text-[11px] font-black">{shipment.truckId}</span>
                      <span className={cn("text-[8px] font-black uppercase", shipment.status === 'DELAYED' ? "text-error" : "text-primary")}>{shipment.status}</span>
                    </div>
                    <p className="text-[9px] text-on-surface-variant font-bold">{shipment.route}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Selected Shipment Detail Card (New Detail Overlay) */}
        {selectedShipment && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="absolute top-24 left-[400px] z-50 w-72 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white/90 backdrop-blur-3xl rounded-[32px] p-6 shadow-2xl border border-primary/10 overflow-hidden relative">
              <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full -mr-8 -mt-8"></div>
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-black text-on-surface leading-tight">{selectedShipment.truckId}</h3>
                  <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mt-1">Route Active</p>
                </div>
                <button 
                  onClick={() => setSelectedShipmentId(null)}
                  className="w-8 h-8 rounded-full bg-surface-container-low flex items-center justify-center text-on-surface-variant hover:bg-error/10 hover:text-error transition-colors"
                >
                  <Plus className="w-4 h-4 rotate-45" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="bg-surface-container-low p-4 rounded-2xl">
                  <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Current Sector</p>
                  <p className="text-sm font-black">{selectedShipment.route}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-surface-container-low p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">Status</p>
                    <p className={cn("text-xs font-black", selectedShipment.status === 'DELAYED' ? "text-error" : "text-primary")}>
                      {selectedShipment.status}
                    </p>
                  </div>
                  <div className="bg-surface-container-low p-3 rounded-2xl">
                    <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">ETA</p>
                    <p className="text-xs font-black">{selectedShipment.eta}</p>
                  </div>
                </div>
              </div>

          <button 
            onClick={() => onTabChange('tracking')}
            className="w-full bg-primary text-white py-3 rounded-2xl font-bold shadow-lg hover:bg-primary-dim transition-all active:scale-95 flex items-center justify-center gap-2 text-xs"
          >
            View Tracking Details
            <ArrowRight className="w-4 h-4" />
          </button>
            </div>
          </motion.div>
        )}

        {activeMenu === 'health' && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute bottom-24 right-32 z-40 w-72 pointer-events-auto"
          >
            <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] p-6 shadow-2xl border border-white/40">
              <h3 className="text-[10px] font-black text-on-surface-variant uppercase tracking-widest mb-4">System Health</h3>
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16">
                  <svg className="w-full h-full" viewBox="0 0 36 36">
                    <path className="text-primary/10" strokeDasharray="100, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" />
                    <path className="text-primary" strokeDasharray="88, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-black text-primary">88%</span>
                  </div>
                </div>
                <div>
                  <p className="text-sm font-black">Performance: High</p>
                  <p className="text-[10px] text-on-surface-variant font-bold">Latency under 12ms</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeMenu === 'ai' && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-24 right-6 z-40 w-80 pointer-events-auto"
          >
            <div className="bg-primary/90 backdrop-blur-2xl rounded-[32px] p-6 text-white shadow-2xl border border-white/10 overflow-hidden relative">
              <Sparkles className="absolute -right-4 -top-4 w-24 h-24 text-white/10" />
              <div className="relative z-10">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="w-5 h-5 text-tertiary-container" />
                  <span className="font-black text-xs uppercase tracking-widest">AI Intelligence</span>
                </div>
                <p className="text-xs text-primary-container font-medium mb-6">Orchestrator is analyzing 1,402 signal inputs per second to ensure route stability.</p>
                <div className="bg-white/10 rounded-2xl p-4">
                  <p className="text-[10px] text-white/60 font-bold uppercase mb-1">Network Stability</p>
                  <p className="text-xl font-black">STABLE</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeMenu === 'alerts' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="absolute top-6 left-1/2 -translate-x-1/2 z-40 w-96 pointer-events-auto"
          >
            <div className="bg-white/80 backdrop-blur-2xl rounded-[32px] shadow-2xl border border-white/40 overflow-hidden max-h-[400px] flex flex-col">
              <div className="p-6 border-b border-primary/5 flex justify-between items-center bg-white/20">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-tertiary" />
                  <h2 className="text-xs font-black text-on-background uppercase tracking-widest">Priority Alerts</h2>
                </div>
                <span className="bg-tertiary/10 text-tertiary text-[10px] font-black px-2 py-1 rounded-lg">2 NEW</span>
              </div>
              <div className="flex-1 overflow-y-auto no-scrollbar p-6 space-y-4">
                {alerts.map((alert) => (
                  <div key={alert.id} className="group relative bg-white/60 p-4 rounded-2xl border border-white transition-all hover:bg-white hover:shadow-md">
                    <div className="flex gap-4">
                      <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", alert.type === 'weather' ? "bg-tertiary/10 text-tertiary" : "bg-error/10 text-error")}>
                        {alert.type === 'weather' ? <CloudLightning className="w-5 h-5" /> : <TrafficCone className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black">{alert.title}</h4>
                        <p className="text-[9px] text-on-surface-variant font-bold mt-1 line-clamp-2">{alert.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Real-time Data Stream Ticker (New Detail) */}
      <div className="absolute bottom-0 left-0 right-0 bg-white/50 backdrop-blur-sm border-t border-white/20 py-1.5 px-6 z-30 pointer-events-none">
        <div className="flex items-center gap-8 animate-marquee whitespace-nowrap overflow-hidden">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Live Stream</span>
          </div>
          <p className="text-[10px] text-on-surface-variant font-medium">
            TRK-8829: Signal strength 98% • ORD Hub: Gate 12 cleared • Weather: Clear skies over I-80 • MIA Hub: Processing delay +12m • System: AI Orchestrator v2.4 active
          </p>
        </div>
      </div>
    </div>
  );
}
