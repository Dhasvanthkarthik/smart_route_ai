import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CloudLightning, 
  TrafficCone, 
  Settings, 
  ShieldAlert, 
  ChevronDown, 
  Search,
  Bot,
  Info,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import AIChatBot from '@/components/AIChatBot';
import { api } from '@/lib/api';

type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';
type AlertCategory = 'Traffic' | 'Weather' | 'Risk' | 'System';

interface AlertItem {
  id: string;
  severity: AlertSeverity;
  category: AlertCategory;
  time: string;
  title: string;
  description: string;
  actionLabel?: string;
}



export default function Alerts() {
  const [activeTab, setActiveTab] = useState<'Active' | 'Historical'>('Active');
  const [filter, setFilter] = useState('All Alerts');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    fetchAlerts();
    // Real-time updates via polling
    const interval = setInterval(fetchAlerts, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchAlerts = async () => {
    try {
      const data = await api.alerts.getAll();
      updateAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  const updateAlerts = (data: any[]) => {
    const mappedAlerts: AlertItem[] = data.map((a: any) => ({
      id: a.id.toString(),
      severity: a.severity as AlertSeverity,
      category: a.category as AlertCategory,
      time: new Date(a.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title: a.title,
      description: a.description,
      actionLabel: a.action_label || 'Acknowledge'
    }));
    setAlerts(mappedAlerts);
  };

  const filters = [
    { label: 'All Alerts', icon: ShieldAlert },
    { label: 'Traffic', icon: TrafficCone },
    { label: 'Weather', icon: CloudLightning },
    { label: 'Risk', icon: AlertTriangle },
    { label: 'System', icon: Settings },
  ];

  const filteredAlerts = alerts.filter(alert => {
    if (filter === 'All Alerts') return true;
    return alert.category === filter;
  });

  return (
    <div className="p-6 lg:p-10 space-y-8 max-w-[1600px] mx-auto overflow-y-auto h-[calc(100vh-64px)] no-scrollbar relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2">
          <h2 className="text-3xl font-extrabold text-on-surface tracking-tight">Alerts Center</h2>
          <p className="text-on-surface-variant max-w-2xl leading-relaxed">
            AI-orchestrated monitoring across your entire logistics ecosystem.
          </p>
        </div>
        
        <div className="bg-surface-container-low p-1 rounded-full flex gap-1">
          <button 
            onClick={() => setActiveTab('Active')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all",
              activeTab === 'Active' ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
            )}
          >Active</button>
          <button 
            onClick={() => setActiveTab('Historical')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all",
              activeTab === 'Historical' ? "bg-white text-primary shadow-sm" : "text-on-surface-variant hover:text-primary"
            )}
          >Historical</button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-3">
        {filters.map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.label)}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold transition-all border",
              filter === f.label 
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20" 
                : "bg-white text-on-surface-variant border-outline-variant/20 hover:border-primary/30 hover:text-primary"
            )}
          >
            <f.icon className="w-4 h-4" />
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Status Cards */}
        <div className="lg:col-span-4 space-y-6">
          {/* Network Status Card */}
          <div className="bg-primary rounded-[2rem] p-8 text-white shadow-xl shadow-primary/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl"></div>
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <p className="text-[10px] font-bold uppercase tracking-widest opacity-60">Network Status</p>
                <div className="w-2 h-2 bg-error rounded-full animate-pulse"></div>
              </div>
              <h4 className="text-2xl font-extrabold tracking-tight mb-2 leading-tight">Attention Required</h4>
              <p className="text-xs text-white/70 leading-relaxed mb-8">
                {activeTab === 'Active' ? filteredAlerts.filter(a => a.severity === 'CRITICAL').length : 0} critical events are currently impacting the Central Corridor.
              </p>
              
              <div className="grid grid-cols-2 gap-4 border-t border-white/10 pt-6">
                <div>
                  <p className="text-[10px] opacity-60 uppercase font-bold mb-1">Resolution Rate</p>
                  <p className="text-xl font-black">92%</p>
                </div>
                <div>
                  <p className="text-[10px] opacity-60 uppercase font-bold mb-1">Avg response</p>
                  <p className="text-xl font-black">4.2m</p>
                </div>
              </div>
            </div>
          </div>

          {/* Visual Insight Card */}
          <div className="bg-surface-container-lowest rounded-[2rem] overflow-hidden shadow-sm border border-outline-variant/10 group">
            <div className="h-48 bg-surface-container relative overflow-hidden">
              <img 
                src="https://picsum.photos/seed/chicago-map/800/400?grayscale&blur=2" 
                alt="Chicago Hub" 
                className="w-full h-full object-cover opacity-50"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-error rounded-full animate-ping opacity-75"></div>
                <div className="w-6 h-6 bg-error rounded-full absolute"></div>
              </div>
              <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-bold">
                SAT-VIEW: I-94 YM2K
              </div>
            </div>
            <div className="p-6">
              <h5 className="font-bold text-sm mb-1">Chicago Hub Congestion</h5>
              <p className="text-[10px] text-on-surface-variant leading-relaxed">
                Real-time satellite data suggests 2.4h delay for heavy freight.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Alert List */}
        <div className="lg:col-span-8 space-y-4">
          <AnimatePresence mode="popLayout">
            {activeTab === 'Active' ? (
              filteredAlerts.length > 0 ? (
                filteredAlerts.map((alert, idx) => (
                  <motion.div
                    key={alert.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white rounded-[2rem] p-6 flex flex-col md:flex-row items-start md:items-center gap-6 shadow-sm border border-outline-variant/10 hover:shadow-md transition-shadow group"
                  >
                    <div className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0",
                      alert.severity === 'CRITICAL' ? "bg-error/10 text-error" : 
                      alert.severity === 'WARNING' ? "bg-warning/10 text-warning" : "bg-info/10 text-info"
                    )}>
                      {alert.category === 'Weather' && <CloudLightning className="w-6 h-6" />}
                      {alert.category === 'Traffic' && <TrafficCone className="w-6 h-6" />}
                      {alert.category === 'System' && <Settings className="w-6 h-6" />}
                      {alert.category === 'Risk' && <ShieldAlert className="w-6 h-6" />}
                    </div>

                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider",
                          alert.severity === 'CRITICAL' ? "bg-error text-white" : 
                          alert.severity === 'WARNING' ? "bg-warning text-white" : "bg-info text-white"
                        )}>{alert.severity}</span>
                        <span className="text-[10px] font-bold text-on-surface-variant">{alert.category} • {alert.time}</span>
                      </div>
                      <h4 className="text-lg font-bold text-on-surface">{alert.title}</h4>
                      <p className="text-xs text-on-surface-variant leading-relaxed max-w-2xl">
                        {alert.description}
                      </p>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button className={cn(
                        "px-6 py-2.5 rounded-full text-xs font-bold transition-all active:scale-95",
                        alert.severity === 'CRITICAL' ? "bg-primary text-white shadow-lg shadow-primary/20 hover:bg-primary-dim" :
                        alert.severity === 'WARNING' ? "bg-secondary-container text-primary hover:bg-primary/10" :
                        "border border-outline-variant/30 hover:bg-surface-container"
                      )}>
                        {alert.actionLabel}
                      </button>
                      {alert.severity === 'CRITICAL' && (
                        <button className="text-[10px] font-bold text-on-surface-variant hover:underline px-4">Dismiss</button>
                      )}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="bg-surface-container-lowest rounded-[2rem] p-12 text-center border-2 border-dashed border-outline-variant/20">
                  <p className="text-on-surface-variant font-bold">No active alerts found for this category.</p>
                </div>
              )
            ) : (
              <div className="bg-surface-container-lowest rounded-[2rem] p-12 text-center border-2 border-dashed border-outline-variant/20">
                <p className="text-on-surface-variant font-bold">Historical data is not available in the current view.</p>
              </div>
            )}
          </AnimatePresence>

          <button className="w-full py-6 flex items-center justify-center gap-2 text-primary font-bold text-sm hover:underline group">
            Load Historical Data
            <ChevronDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>

      {/* Floating AI Action Button */}
      <button 
        onClick={() => setIsAIChatOpen(true)}
        className="fixed bottom-8 right-8 w-14 h-14 bg-primary text-white rounded-2xl shadow-2xl flex items-center justify-center hover:bg-primary-dim transition-all active:scale-95 group z-50"
      >
        <Bot className="w-6 h-6" />
        <div className="absolute right-full mr-4 bg-white text-primary px-4 py-2 rounded-xl text-xs font-bold shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap border border-primary/10">
          Ask AI Orchestrator
        </div>
      </button>

      {/* AI Chat Bot Component */}
      <AIChatBot 
        isOpen={isAIChatOpen} 
        onClose={() => setIsAIChatOpen(false)} 
        contextData={{
          activeAlerts: alerts,
          currentFilter: filter,
          activeTab: activeTab
        }}
      />
    </div>
  );
}
