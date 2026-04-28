/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, UserRole, Shipment } from './types';
import Login from './screens/Login';
import Dashboard from './screens/Dashboard';
import Analytics from './screens/Analytics';
import ShipmentHistory from './screens/ShipmentHistory';
import CreateShipment from './screens/CreateShipment';
import Settings from './screens/Settings';
import Alerts from './screens/Alerts';
import LiveTracking from './screens/LiveTracking';
import DriverView from './screens/DriverView';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import { motion, AnimatePresence } from 'motion/react';
import { api } from './lib/api';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [activeTab, setActiveTab] = useState('dashboard');
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      fetchShipments();
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  const fetchShipments = async () => {
    try {
      setIsLoading(true);
      const data = await api.shipments.getAll();
      // Map backend TripResponse to frontend Shipment type
      const mappedShipments: Shipment[] = data.map((trip: any) => ({
        id: trip.id.toString(),
        truckId: `TRK-${trip.truck_id}`,
        status: trip.risk_score > 70 ? 'DELAYED' : 'IN TRANSIT',
        route: `${trip.source} → ${trip.destination}`,
        eta: trip.predicted_delay ? `+${Math.round(trip.predicted_delay)}m` : 'On Time',
        delay: trip.predicted_delay ? `${Math.round(trip.predicted_delay)}m` : undefined
      }));
      setShipments(mappedShipments);
    } catch (error) {
      console.error('Failed to fetch shipments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateShipment = async (newShipment: Omit<Shipment, 'id'>) => {
    try {
      // For simplicity, assuming truck_id is 1 for new shipments
      await api.shipments.create({
        truck_id: 1,
        source: newShipment.route.split(' → ')[0],
        destination: newShipment.route.split(' → ')[1],
        cargo_type: 'General',
        cargo_value: 1000,
        weight: 500
      });
      await fetchShipments();
      setActiveTab('dashboard');
    } catch (error) {
      console.error('Failed to create shipment:', error);
    }
  };

  const handleLogin = (email: string, role: UserRole, accessToken: string) => {
    setToken(accessToken);
    setUser({
      id: Math.random().toString(36).substr(2, 9),
      name: email.split('@')[0].split('.').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join(' '),
      email,
      role,
      avatar: `https://picsum.photos/seed/${email}/100/100`
    });
    // Respect the Default View preference from Settings
    const savedView = localStorage.getItem('display_mapView') || 'map';
    if (role === 'driver') {
      setActiveTab('track');
    } else if (savedView === 'list') {
      setActiveTab('shipments');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleSignOut = () => {
    setToken(null);
    setUser(null);
    setActiveTab('dashboard');
  };

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  // Driver View is special (mobile-centric)
  if (user.role === 'driver') {
    return <DriverView user={user} />;
  }

  return (
    <div className="flex min-h-screen bg-background text-on-background">
      <Sidebar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        onNewShipment={() => setActiveTab('create-shipment')}
        onSignOut={handleSignOut} 
      />
      
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen">
        <TopNav 
          user={user} 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          onSignOut={handleSignOut}
          searchTerm={globalSearchTerm}
          onSearchChange={setGlobalSearchTerm}
        />
        
        <div className="flex-1 relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="h-full"
            >
              {activeTab === 'dashboard' && (
                <Dashboard shipments={shipments} onTabChange={setActiveTab} />
              )}
              {activeTab === 'analytics' && <Analytics />}
              {activeTab === 'shipments' && (
                <ShipmentHistory shipments={shipments} searchTerm={globalSearchTerm} onSearchChange={setGlobalSearchTerm} />
              )}
              {activeTab === 'create-shipment' && (
                <CreateShipment onCreate={handleCreateShipment} />
              )}
              {activeTab === 'settings' && <Settings onViewChange={setActiveTab} />}
              {activeTab === 'alerts' && <Alerts />}
              {activeTab === 'tracking' && <LiveTracking />}
              {/* Other tabs can be added here */}
              {activeTab !== 'dashboard' && activeTab !== 'analytics' && activeTab !== 'shipments' && activeTab !== 'create-shipment' && activeTab !== 'settings' && activeTab !== 'alerts' && activeTab !== 'tracking' && (
                <div className="flex items-center justify-center h-full text-on-surface-variant font-medium">
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} section is under development.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
