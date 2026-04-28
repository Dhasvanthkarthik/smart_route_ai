import React, { useState, useRef, useEffect } from 'react';
import { Search, Bell, LogOut, Headset, ChevronDown, AlertTriangle, CloudLightning, TrafficCone, HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { User } from '@/types';
import { motion, AnimatePresence } from 'motion/react';

interface TopNavProps {
  user: User;
  activeTab: string;
  onTabChange: (tab: string) => void;
  onSignOut: () => void;
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export default function TopNav({ user, activeTab, onTabChange, onSignOut, searchTerm = '', onSearchChange }: TopNavProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const alertsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
      if (alertsRef.current && !alertsRef.current.contains(event.target as Node)) {
        setIsAlertsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="w-full sticky top-0 z-40 bg-white/70 backdrop-blur-md shadow-[0_12px_32px_-4px_rgba(92,74,180,0.08)]">
      <div className="flex justify-between items-center px-6 py-3 w-full">
        <div className="flex items-center gap-6 flex-1">
          {activeTab === 'settings' ? (
            <div className="flex items-center gap-2 text-sm font-medium">
              <span className="text-on-surface-variant">System</span>
              <span className="text-on-surface-variant">/</span>
              <span className="text-on-surface font-bold">Settings</span>
            </div>
          ) : (
            <div className="relative group w-full max-w-md">
              <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant">
                <Search className="w-4 h-4" />
              </span>
              <input 
                className="bg-surface-container-low border-none rounded-full py-2 pl-10 pr-4 text-sm w-full focus:ring-2 focus:ring-primary/20 transition-all outline-none" 
                placeholder={
                  activeTab === 'alerts' ? "Search alerts or route IDs..." : 
                  activeTab === 'tracking' ? "Search vehicle, driver or route..." :
                  activeTab === 'shipments' ? "Search shipments by ID or truck..." :
                  "Search fleet, routes, or analytics..."
                } 
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange?.(e.target.value)}
              />
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="hidden lg:flex items-center gap-6 font-medium text-sm">
              <button className="text-on-surface-variant hover:text-primary transition-colors">Overview</button>
              <button className="text-primary font-bold border-b-2 border-primary">Real-time Performance</button>
              <button className="text-on-surface-variant hover:text-primary transition-colors">Reports</button>
            </div>
          )}

          {activeTab === 'tracking' && (
            <div className="hidden xl:flex items-center gap-8 bg-white/50 backdrop-blur-xl rounded-full px-8 py-2 ml-4 border border-white/20">
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Active Fleet</p>
                <p className="text-sm font-black text-slate-900">92%</p>
              </div>
              <div className="h-6 w-px bg-slate-300/50"></div>
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">Efficiency</p>
                <p className="text-sm font-black text-indigo-600">+12.4%</p>
              </div>
              <div className="h-6 w-px bg-slate-300/50"></div>
              <div className="text-center">
                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-0.5">On-Time</p>
                <p className="text-sm font-black text-slate-900">88/92</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Alerts Popover */}
          <div className="relative" ref={alertsRef}>
            <button 
              onClick={() => setIsAlertsOpen(!isAlertsOpen)}
              className={cn(
                "p-2 rounded-full transition-all active:scale-95 relative",
                isAlertsOpen ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container-low"
              )}
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-error rounded-full border-2 border-white"></span>
            </button>

            <AnimatePresence>
              {isAlertsOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-outline-variant/10 flex justify-between items-center">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <button className="text-[10px] font-bold text-primary hover:underline">Mark all as read</button>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-2 space-y-1">
                    <div 
                      onClick={() => { onTabChange('alerts'); setIsAlertsOpen(false); }}
                      className="p-3 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer flex gap-3"
                    >
                      <div className="w-10 h-10 bg-tertiary/10 text-tertiary rounded-full flex items-center justify-center shrink-0">
                        <CloudLightning className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Storm Warning: I-80</p>
                        <p className="text-[10px] text-on-surface-variant">Heavy rain affecting 3 shipments. Reroute suggested.</p>
                        <p className="text-[9px] text-primary font-bold mt-1">2 mins ago</p>
                      </div>
                    </div>
                    <div 
                      onClick={() => { onTabChange('alerts'); setIsAlertsOpen(false); }}
                      className="p-3 hover:bg-surface-container-low rounded-xl transition-colors cursor-pointer flex gap-3"
                    >
                      <div className="w-10 h-10 bg-error/10 text-error rounded-full flex items-center justify-center shrink-0">
                        <TrafficCone className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-bold">Congestion: Chicago Hub</p>
                        <p className="text-[10px] text-on-surface-variant">Accident on I-94 Southbound. Expect delays.</p>
                        <p className="text-[9px] text-primary font-bold mt-1">15 mins ago</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => { onTabChange('alerts'); setIsAlertsOpen(false); }}
                    className="w-full py-3 bg-surface-container-low text-primary text-xs font-bold hover:bg-surface-container transition-colors"
                  >
                    View All Alerts
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          
          <div className="h-8 w-px bg-outline-variant/30 mx-1"></div>
          
          {/* Profile Dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center gap-3 pl-2 hover:bg-surface-container-low p-1 rounded-full transition-all active:scale-95"
            >
              <div className="text-right hidden sm:block">
                <p className="text-sm font-bold text-primary">{user.name}</p>
                <p className="text-[10px] text-on-surface-variant font-medium uppercase tracking-wider">{user.role}</p>
              </div>
              <div className="relative">
                <img 
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border-2 border-primary-container" 
                  src={user.avatar || `https://picsum.photos/seed/${user.id}/100/100`}
                />
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
                  <ChevronDown className={cn("w-3 h-3 text-primary transition-transform", isProfileOpen && "rotate-180")} />
                </div>
              </div>
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-2xl border border-outline-variant/20 overflow-hidden z-50"
                >
                  <div className="p-4 border-b border-outline-variant/10">
                    <p className="text-xs font-bold text-on-surface">Account Settings</p>
                    <p className="text-[10px] text-on-surface-variant">{user.email}</p>
                  </div>
                  <div className="p-2 space-y-1">
                    <button className="w-full flex items-center gap-3 px-4 py-2 text-sm text-on-surface-variant hover:text-primary hover:bg-surface-container-low rounded-xl transition-all">
                      <Headset className="w-4 h-4" />
                      Support
                    </button>
                    <button 
                      onClick={onSignOut}
                      className="w-full flex items-center gap-3 px-4 py-2 text-sm text-error hover:bg-error/5 rounded-xl transition-all"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  );
}
