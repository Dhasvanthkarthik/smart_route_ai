import React from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Navigation, 
  Bell, 
  BarChart3, 
  Settings, 
  LogOut,
  Activity,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onNewShipment: () => void;
  onSignOut: () => void;
}

export default function Sidebar({ activeTab, onTabChange, onNewShipment, onSignOut }: SidebarProps) {
  const { t } = useLanguage();

  const navItems = [
    { id: 'dashboard', labelKey: 'Dashboard', icon: LayoutDashboard },
    { id: 'shipments', labelKey: 'Shipments', icon: Truck },
    { id: 'tracking', labelKey: 'Live Tracking', icon: Navigation },
    { id: 'alerts', labelKey: 'Alerts', icon: Bell },
    { id: 'analytics', labelKey: 'Analytics', icon: BarChart3 },
    { id: 'settings', labelKey: 'Settings', icon: Settings },
  ];

  return (
    <aside className="h-screen w-64 fixed left-0 top-0 hidden md:flex flex-col bg-surface-container-low p-4 space-y-2 z-50">
      <div className="flex items-center gap-3 px-2 mb-8">
        <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-extrabold text-primary leading-none">SmartRoute AI</h1>
          <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1 font-bold">
            {t('Kinetic Orchestrator')}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => onTabChange(item.id)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 transition-all duration-300 rounded-full",
              activeTab === item.id 
                ? "bg-white text-primary font-semibold shadow-sm" 
                : "text-on-surface-variant hover:text-primary hover:translate-x-1"
            )}
          >
            <item.icon className="w-5 h-5" />
            {t(item.labelKey)}
          </button>
        ))}
      </nav>

      <div className="pt-4 mt-4 border-t border-outline-variant/30 space-y-1">
        <button 
          onClick={onNewShipment}
          className="w-full mb-4 bg-primary text-white py-3 rounded-full font-bold shadow-lg hover:bg-primary-dim transition-all active:scale-95 duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t('New Shipment')}
        </button>
      </div>
    </aside>
  );
}
