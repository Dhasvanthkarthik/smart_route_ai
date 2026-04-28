import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  LogOut,
  MapPin,
  Bell,
  Route,
  Monitor,
  Database,
  HelpCircle,
  ChevronRight,
  Check,
  RefreshCw,
  Trash2,
  Download,
  Sun,
  Moon,
  Map,
  List,
  Globe,
  Volume2,
  VolumeX,
  Phone,
  Mail,
  Info,
  Eye,
  EyeOff,
  PackageSearch,
  Navigation,
  Truck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { Language } from '@/lib/i18n';

// ─── Types ───────────────────────────────────────────────────────────────────
interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
}

// ─── Reusable Toggle Switch ───────────────────────────────────────────────────
function Toggle({ checked, onChange, id }: ToggleProps) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/40',
        checked ? 'bg-primary' : 'bg-surface-container'
      )}
    >
      <span
        className={cn(
          'absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all duration-200',
          checked ? 'left-7' : 'left-1'
        )}
      />
    </button>
  );
}

// ─── Section Card Wrapper ─────────────────────────────────────────────────────
function SectionCard({
  children,
  delay = 0,
}: {
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay }}
      className="bg-surface-container-lowest rounded-3xl p-6 shadow-sm border border-outline-variant/10"
    >
      {children}
    </motion.div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
function SectionHeader({ icon: Icon, title, subtitle }: { icon: React.ElementType; title: string; subtitle?: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className="w-10 h-10 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-5 h-5 text-primary" />
      </div>
      <div>
        <h3 className="text-base font-bold text-on-surface">{title}</h3>
        {subtitle && <p className="text-xs text-on-surface-variant">{subtitle}</p>}
      </div>
    </div>
  );
}

// ─── Row: label + toggle ──────────────────────────────────────────────────────
function ToggleRow({
  label,
  description,
  checked,
  onChange,
  id,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  id?: string;
}) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-outline-variant/10 last:border-0">
      <div>
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        {description && <p className="text-xs text-on-surface-variant mt-0.5">{description}</p>}
      </div>
      <Toggle checked={checked} onChange={onChange} id={id} />
    </div>
  );
}

// ─── Danger Button ────────────────────────────────────────────────────────────
function DangerButton({ onClick, icon: Icon, label, id }: { onClick: () => void; icon: React.ElementType; label: string; id?: string }) {
  return (
    <button
      id={id}
      onClick={onClick}
      className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-error bg-error/8 hover:bg-error/15 transition-colors"
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  );
}

// ─── Main Settings Component ──────────────────────────────────────────────────
export default function Settings({ onViewChange }: { onViewChange?: (tab: string) => void }) {
  const SECTION_IDS = [
    'account', 'tracking', 'notifications', 'route', 'display', 'data', 'help',
  ] as const;
  type SectionId = typeof SECTION_IDS[number];

  const [activeSection, setActiveSection] = useState<SectionId>('account');

  // Account
  const [username, setUsername] = useState('Alex Orchestrator');
  const [email, setEmail] = useState('alex@smartroute.ai');
  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);

  // Tracking
  const [shipmentId, setShipmentId] = useState('');
  const [trackingOn, setTrackingOn] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState<'10' | '30'>('10');

  // Notifications
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [delayAlerts, setDelayAlerts] = useState(true);
  const [deliveryAlerts, setDeliveryAlerts] = useState(true);
  const [soundOn, setSoundOn] = useState(false);

  // Route
  const [routeType, setRouteType] = useState<'fastest' | 'shortest'>('fastest');
  const [autoReRoute, setAutoReRoute] = useState(true);

  // Display – load persisted prefs on mount
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('display_darkMode') === 'true';
  });
  const [mapView, setMapView] = useState<'map' | 'list'>(() => {
    return (localStorage.getItem('display_mapView') as 'map' | 'list') || 'map';
  });

  // Language comes from global context — changes instantly propagate to all components
  const { language, setLanguage: setContextLanguage } = useLanguage();
  const [displaySaved, setDisplaySaved] = useState(false);

  // Apply dark mode class to <html> on mount and whenever darkMode changes
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleDarkModeChange = (value: boolean) => {
    setDarkMode(value);
    localStorage.setItem('display_darkMode', String(value));
  };

  const handleMapViewChange = (value: 'map' | 'list') => {
    setMapView(value);
    localStorage.setItem('display_mapView', value);
    // Immediately switch the active tab so the user sees the effect
    if (onViewChange) {
      onViewChange(value === 'list' ? 'shipments' : 'dashboard');
    }
  };

  const handleLanguageChange = (value: string) => {
    // Update global context — all translated components update instantly
    setContextLanguage(value as Language);
  };

  const handleSaveDisplay = () => {
    localStorage.setItem('display_darkMode', String(darkMode));
    localStorage.setItem('display_mapView', mapView);
    setDisplaySaved(true);
    setTimeout(() => setDisplaySaved(false), 2500);
  };

  // Data
  const [historyCleared, setHistoryCleared] = useState(false);

  const sidebarItems: { id: SectionId; label: string; icon: React.ElementType }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'tracking', label: 'Tracking', icon: PackageSearch },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'route', label: 'Route', icon: Navigation },
    { id: 'display', label: 'Display', icon: Monitor },
    { id: 'data', label: 'Data', icon: Database },
    { id: 'help', label: 'Help & Support', icon: HelpCircle },
  ];

  const handleSavePw = () => {
    setPwSaved(true);
    setCurrentPw('');
    setNewPw('');
    setTimeout(() => { setPwSaved(false); setShowPwForm(false); }, 2000);
  };

  const handleClearHistory = () => {
    setHistoryCleared(true);
    setTimeout(() => setHistoryCleared(false), 3000);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] overflow-hidden">
      {/* ── Sidebar Navigation ─────────────────────────── */}
      <aside className="w-64 shrink-0 border-r border-outline-variant/10 bg-surface-container-lowest overflow-y-auto py-6 px-4 hidden md:flex flex-col gap-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant px-3 mb-3">Settings</p>
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            id={`settings-nav-${item.id}`}
            onClick={() => setActiveSection(item.id)}
            className={cn(
              'w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-150 text-left',
              activeSection === item.id
                ? 'bg-primary text-white shadow-md shadow-primary/20'
                : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
            )}
          >
            <item.icon className="w-4 h-4 shrink-0" />
            {item.label}
          </button>
        ))}
      </aside>

      {/* ── Mobile Tab Bar ─────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-surface-container-lowest border-t border-outline-variant/10 flex overflow-x-auto no-scrollbar px-2 py-2 gap-1">
        {sidebarItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveSection(item.id)}
            className={cn(
              'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl shrink-0 text-[10px] font-semibold transition-all',
              activeSection === item.id ? 'bg-primary text-white' : 'text-on-surface-variant'
            )}
          >
            <item.icon className="w-4 h-4" />
            {item.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* ── Content Area ───────────────────────────────── */}
      <main className="flex-1 overflow-y-auto p-6 lg:p-8 no-scrollbar pb-24 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeSection}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            transition={{ duration: 0.2 }}
            className="max-w-2xl mx-auto space-y-6"
          >

            {/* ════════════════════════════════════════════
                ACCOUNT SETTINGS
            ════════════════════════════════════════════ */}
            {activeSection === 'account' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">Account Settings</h2>
                  <p className="text-sm text-on-surface-variant mt-1">Manage your profile, password and session.</p>
                </div>

                {/* Profile */}
                <SectionCard delay={0.05}>
                  <SectionHeader icon={User} title="Profile" subtitle="Your display information" />
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="settings-username" className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">
                        Username
                      </label>
                      <input
                        id="settings-username"
                        className="mt-1 w-full bg-surface-container-low rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 border-none"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                      />
                    </div>
                    <div>
                      <label htmlFor="settings-email" className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">
                        Email
                      </label>
                      <input
                        id="settings-email"
                        className="mt-1 w-full bg-surface-container-low rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 border-none"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                    <button className="px-6 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dim transition-all active:scale-95 shadow-md shadow-primary/20">
                      Save Profile
                    </button>
                  </div>
                </SectionCard>

                {/* Password */}
                <SectionCard delay={0.1}>
                  <SectionHeader icon={Lock} title="Change Password" subtitle="Update your login credentials" />
                  {!showPwForm ? (
                    <button
                      id="settings-change-password-btn"
                      onClick={() => setShowPwForm(true)}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border border-outline-variant/30 hover:bg-surface-container transition-colors"
                    >
                      <Lock className="w-4 h-4" /> Change Password
                    </button>
                  ) : (
                    <div className="space-y-4">
                      <div className="relative">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">Current Password</label>
                        <input
                          id="settings-current-password"
                          type={showCurrentPw ? 'text' : 'password'}
                          className="mt-1 w-full bg-surface-container-low rounded-xl py-3 px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/30 border-none"
                          value={currentPw}
                          onChange={(e) => setCurrentPw(e.target.value)}
                          placeholder="Enter current password"
                        />
                        <button className="absolute right-3 top-9 text-on-surface-variant" onClick={() => setShowCurrentPw(v => !v)}>
                          {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="relative">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-primary ml-1">New Password</label>
                        <input
                          id="settings-new-password"
                          type={showNewPw ? 'text' : 'password'}
                          className="mt-1 w-full bg-surface-container-low rounded-xl py-3 px-4 pr-10 text-sm outline-none focus:ring-2 focus:ring-primary/30 border-none"
                          value={newPw}
                          onChange={(e) => setNewPw(e.target.value)}
                          placeholder="Enter new password"
                        />
                        <button className="absolute right-3 top-9 text-on-surface-variant" onClick={() => setShowNewPw(v => !v)}>
                          {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex gap-3">
                        <button
                          id="settings-save-password-btn"
                          onClick={handleSavePw}
                          className={cn(
                            'flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all active:scale-95',
                            pwSaved
                              ? 'bg-green-500 text-white'
                              : 'bg-primary text-white hover:bg-primary-dim shadow-md shadow-primary/20'
                          )}
                        >
                          {pwSaved ? <><Check className="w-4 h-4" /> Saved!</> : 'Update Password'}
                        </button>
                        <button onClick={() => setShowPwForm(false)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-on-surface-variant hover:bg-surface-container transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </SectionCard>

                {/* Logout */}
                <SectionCard delay={0.15}>
                  <SectionHeader icon={LogOut} title="Session" subtitle="Manage your active session" />
                  <DangerButton id="settings-logout-btn" onClick={() => {}} icon={LogOut} label="Log Out of Account" />
                </SectionCard>
              </>
            )}

            {/* ════════════════════════════════════════════
                TRACKING SETTINGS
            ════════════════════════════════════════════ */}
            {activeSection === 'tracking' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">Tracking Settings</h2>
                  <p className="text-sm text-on-surface-variant mt-1">Configure how shipments are tracked and updated.</p>
                </div>

                <SectionCard delay={0.05}>
                  <SectionHeader icon={PackageSearch} title="Shipment ID" subtitle="Enter a shipment to track" />
                  <div className="flex gap-3">
                    <input
                      id="settings-shipment-id"
                      className="flex-1 bg-surface-container-low rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 border-none"
                      placeholder="e.g. TRK-8829"
                      value={shipmentId}
                      onChange={(e) => setShipmentId(e.target.value)}
                    />
                    <button
                      id="settings-track-btn"
                      className="px-5 py-2.5 rounded-xl text-sm font-bold bg-primary text-white hover:bg-primary-dim transition-all active:scale-95 shadow-md shadow-primary/20 flex items-center gap-2"
                    >
                      <Truck className="w-4 h-4" /> Track
                    </button>
                  </div>
                </SectionCard>

                <SectionCard delay={0.1}>
                  <SectionHeader icon={RefreshCw} title="Live Tracking" subtitle="Control real-time location updates" />
                  <ToggleRow
                    id="settings-tracking-toggle"
                    label="Tracking Enabled"
                    description="Receive live position updates for active shipments."
                    checked={trackingOn}
                    onChange={setTrackingOn}
                  />
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-on-surface mb-3">Auto-Refresh Interval</p>
                    <div className="flex gap-3">
                      {(['10', '30'] as const).map((val) => (
                        <button
                          key={val}
                          id={`settings-refresh-${val}s`}
                          onClick={() => setRefreshInterval(val)}
                          className={cn(
                            'flex-1 py-3 rounded-xl text-sm font-bold border-2 transition-all',
                            refreshInterval === val
                              ? 'border-primary bg-primary/8 text-primary'
                              : 'border-outline-variant/20 text-on-surface-variant hover:border-primary/40'
                          )}
                        >
                          Every {val}s
                        </button>
                      ))}
                    </div>
                  </div>
                </SectionCard>
              </>
            )}

            {/* ════════════════════════════════════════════
                NOTIFICATION SETTINGS
            ════════════════════════════════════════════ */}
            {activeSection === 'notifications' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">Notification Settings</h2>
                  <p className="text-sm text-on-surface-variant mt-1">Control what alerts you receive and how.</p>
                </div>

                <SectionCard delay={0.05}>
                  <SectionHeader icon={Bell} title="Alert Preferences" />
                  <ToggleRow
                    id="settings-notif-enabled"
                    label="Enable Notifications"
                    description="Master switch for all notifications."
                    checked={notifEnabled}
                    onChange={setNotifEnabled}
                  />
                  <ToggleRow
                    id="settings-delay-alerts"
                    label="Delay Alerts"
                    description="Get notified when a shipment is delayed."
                    checked={delayAlerts}
                    onChange={setDelayAlerts}
                  />
                  <ToggleRow
                    id="settings-delivery-alerts"
                    label="Delivery Alerts"
                    description="Get notified when a shipment is delivered."
                    checked={deliveryAlerts}
                    onChange={setDeliveryAlerts}
                  />
                </SectionCard>

                <SectionCard delay={0.1}>
                  <SectionHeader icon={Volume2} title="Sound" subtitle="Audio notification preferences" />
                  <ToggleRow
                    id="settings-sound-toggle"
                    label="Notification Sound"
                    description="Play a sound when an alert arrives."
                    checked={soundOn}
                    onChange={setSoundOn}
                  />
                  <div className="mt-4 flex items-center gap-3 py-2">
                    {soundOn ? (
                      <Volume2 className="w-5 h-5 text-primary" />
                    ) : (
                      <VolumeX className="w-5 h-5 text-on-surface-variant" />
                    )}
                    <span className="text-sm text-on-surface-variant">
                      Sound is currently <strong className={soundOn ? 'text-primary' : ''}>{soundOn ? 'ON' : 'OFF'}</strong>
                    </span>
                  </div>
                </SectionCard>
              </>
            )}

            {/* ════════════════════════════════════════════
                ROUTE SETTINGS
            ════════════════════════════════════════════ */}
            {activeSection === 'route' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">Route Settings</h2>
                  <p className="text-sm text-on-surface-variant mt-1">Choose how routes are planned and managed.</p>
                </div>

                <SectionCard delay={0.05}>
                  <SectionHeader icon={Route} title="Route Type" subtitle="Select your preferred routing strategy" />
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    {([
                      { value: 'fastest', label: 'Fastest Route', desc: 'Prioritise speed over distance.' },
                      { value: 'shortest', label: 'Shortest Route', desc: 'Prioritise distance over speed.' },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        id={`settings-route-${opt.value}`}
                        onClick={() => setRouteType(opt.value)}
                        className={cn(
                          'p-4 rounded-2xl border-2 text-left transition-all',
                          routeType === opt.value
                            ? 'border-primary bg-primary/8'
                            : 'border-outline-variant/20 hover:border-primary/40'
                        )}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={cn('text-sm font-bold', routeType === opt.value ? 'text-primary' : 'text-on-surface')}>
                            {opt.label}
                          </span>
                          {routeType === opt.value && <Check className="w-4 h-4 text-primary" />}
                        </div>
                        <p className="text-xs text-on-surface-variant">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard delay={0.1}>
                  <SectionHeader icon={Navigation} title="Auto Re-Route" subtitle="Automatically find a new route when blocked" />
                  <ToggleRow
                    id="settings-auto-reroute"
                    label="Enable Auto Re-Route"
                    description="The system will suggest a new route if the current one is blocked or delayed."
                    checked={autoReRoute}
                    onChange={setAutoReRoute}
                  />
                </SectionCard>
              </>
            )}

            {/* ════════════════════════════════════════════
                DISPLAY SETTINGS
            ════════════════════════════════════════════ */}
            {activeSection === 'display' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">Display Settings</h2>
                  <p className="text-sm text-on-surface-variant mt-1">Customise how the app looks and feels.</p>
                </div>

                <SectionCard delay={0.05}>
                  <SectionHeader icon={Monitor} title="Appearance" subtitle="Changes are applied immediately" />
                  <div className="grid grid-cols-2 gap-4">
                    {([
                      { value: false, label: 'Light Mode', icon: Sun },
                      { value: true, label: 'Dark Mode', icon: Moon },
                    ] as const).map((opt) => (
                      <button
                        key={opt.label}
                        id={`settings-theme-${opt.label.toLowerCase().replace(' ', '-')}`}
                        onClick={() => handleDarkModeChange(opt.value)}
                        className={cn(
                          'p-4 rounded-2xl border-2 flex items-center gap-3 transition-all',
                          darkMode === opt.value
                            ? 'border-primary bg-primary/8 ring-2 ring-primary/20'
                            : 'border-outline-variant/20 hover:border-primary/40'
                        )}
                      >
                        <opt.icon className={cn('w-5 h-5', darkMode === opt.value ? 'text-primary' : 'text-on-surface-variant')} />
                        <span className={cn('text-sm font-semibold', darkMode === opt.value ? 'text-primary' : 'text-on-surface')}>
                          {opt.label}
                        </span>
                        {darkMode === opt.value && <Check className="w-4 h-4 text-primary ml-auto" />}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-on-surface-variant mt-3">
                    Currently active: <strong className="text-primary">{darkMode ? 'Dark Mode' : 'Light Mode'}</strong>
                  </p>
                </SectionCard>

                <SectionCard delay={0.1}>
                  <SectionHeader icon={Map} title="Default View" subtitle="Choose how shipments are displayed" />
                  <div className="grid grid-cols-2 gap-4">
                    {([
                      { value: 'map', label: 'Map View', icon: Map },
                      { value: 'list', label: 'List View', icon: List },
                    ] as const).map((opt) => (
                      <button
                        key={opt.value}
                        id={`settings-view-${opt.value}`}
                        onClick={() => handleMapViewChange(opt.value)}
                        className={cn(
                          'p-4 rounded-2xl border-2 flex items-center gap-3 transition-all',
                          mapView === opt.value
                            ? 'border-primary bg-primary/8 ring-2 ring-primary/20'
                            : 'border-outline-variant/20 hover:border-primary/40'
                        )}
                      >
                        <opt.icon className={cn('w-5 h-5', mapView === opt.value ? 'text-primary' : 'text-on-surface-variant')} />
                        <span className={cn('text-sm font-semibold', mapView === opt.value ? 'text-primary' : 'text-on-surface')}>
                          {opt.label}
                        </span>
                        {mapView === opt.value && <Check className="w-4 h-4 text-primary ml-auto" />}
                      </button>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard delay={0.15}>
                  <SectionHeader icon={Globe} title="Language" subtitle="Choose your display language" />
                  <select
                    id="settings-language-select"
                    value={language}
                    onChange={(e) => handleLanguageChange(e.target.value)}
                    className="w-full bg-surface-container-low rounded-xl py-3 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/30 border-none appearance-none"
                  >
                    {['English', 'Hindi', 'Spanish', 'French', 'German', 'Arabic', 'Chinese'].map((l) => (
                      <option key={l}>{l}</option>
                    ))}
                  </select>
                </SectionCard>

                <SectionCard delay={0.2}>
                  <button
                    id="settings-display-save"
                    onClick={handleSaveDisplay}
                    className={cn(
                      'w-full py-3 rounded-xl text-sm font-bold transition-all active:scale-95 flex items-center justify-center gap-2',
                      displaySaved
                        ? 'bg-green-500 text-white'
                        : 'bg-primary text-white hover:bg-primary-dim shadow-md shadow-primary/20'
                    )}
                  >
                    {displaySaved ? <><Check className="w-4 h-4" /> Preferences Saved!</> : 'Save Display Preferences'}
                  </button>
                </SectionCard>
              </>
            )}

            {/* ════════════════════════════════════════════
                DATA SETTINGS
            ════════════════════════════════════════════ */}
            {activeSection === 'data' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">Data Settings</h2>
                  <p className="text-sm text-on-surface-variant mt-1">Manage your tracking history and reports.</p>
                </div>

                <SectionCard delay={0.05}>
                  <SectionHeader icon={Trash2} title="Clear Tracking History" subtitle="Remove all saved tracking records" />
                  <p className="text-sm text-on-surface-variant mb-4">
                    This will permanently delete all stored shipment history from your account. This action cannot be undone.
                  </p>
                  {historyCleared ? (
                    <div className="flex items-center gap-2 text-sm text-green-600 font-semibold">
                      <Check className="w-4 h-4" /> History cleared successfully.
                    </div>
                  ) : (
                    <DangerButton onClick={handleClearHistory} icon={Trash2} label="Clear History" />
                  )}
                </SectionCard>

                <SectionCard delay={0.1}>
                  <SectionHeader icon={Download} title="Download Report" subtitle="Export your tracking data" />
                  <p className="text-sm text-on-surface-variant mb-4">
                    Download a summary of your shipments and tracking activity.
                  </p>
                  <div className="flex gap-3 flex-wrap">
                    <button
                      id="settings-download-pdf"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Download PDF
                    </button>
                    <button
                      id="settings-download-excel"
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Download className="w-4 h-4" /> Download Excel
                    </button>
                  </div>
                </SectionCard>
              </>
            )}

            {/* ════════════════════════════════════════════
                HELP & SUPPORT
            ════════════════════════════════════════════ */}
            {activeSection === 'help' && (
              <>
                <div>
                  <h2 className="text-2xl font-bold text-on-surface">Help & Support</h2>
                  <p className="text-sm text-on-surface-variant mt-1">Find answers, contact us, or learn about the app.</p>
                </div>

                {/* FAQ */}
                <SectionCard delay={0.05}>
                  <SectionHeader icon={HelpCircle} title="Help Centre" subtitle="Common questions and guides" />
                  <div className="space-y-2">
                    {[
                      'How do I add a new shipment?',
                      'How does auto re-route work?',
                      'How to export tracking reports?',
                      'How to change notification preferences?',
                    ].map((q) => (
                      <button
                        key={q}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface-container hover:bg-surface-container-low text-sm font-medium text-on-surface transition-colors text-left"
                      >
                        {q}
                        <ChevronRight className="w-4 h-4 text-on-surface-variant shrink-0" />
                      </button>
                    ))}
                  </div>
                </SectionCard>

                {/* Contact */}
                <SectionCard delay={0.1}>
                  <SectionHeader icon={Mail} title="Contact Support" subtitle="Reach our team directly" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <a
                      id="settings-contact-email"
                      href="mailto:support@smartroute.ai"
                      className="flex items-center gap-3 p-4 rounded-2xl border border-outline-variant/20 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Mail className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">Email Us</p>
                        <p className="text-xs text-on-surface-variant">support@smartroute.ai</p>
                      </div>
                    </a>
                    <a
                      id="settings-contact-phone"
                      href="tel:+18001234567"
                      className="flex items-center gap-3 p-4 rounded-2xl border border-outline-variant/20 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                    >
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Phone className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">Call Us</p>
                        <p className="text-xs text-on-surface-variant">+1-800-123-4567</p>
                      </div>
                    </a>
                  </div>
                </SectionCard>

                {/* About */}
                <SectionCard delay={0.15}>
                  <SectionHeader icon={Info} title="About App" />
                  <div className="space-y-3">
                    {[
                      { label: 'App Name', value: 'SmartRoute Supply Tracker' },
                      { label: 'Version', value: '1.0.0' },
                      { label: 'Built with', value: 'React + Vite + TypeScript' },
                      { label: 'License', value: 'Apache-2.0' },
                    ].map(({ label, value }) => (
                      <div key={label} className="flex justify-between items-center py-2 border-b border-outline-variant/10 last:border-0">
                        <span className="text-sm text-on-surface-variant">{label}</span>
                        <span className="text-sm font-semibold text-on-surface">{value}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </>
            )}

          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
