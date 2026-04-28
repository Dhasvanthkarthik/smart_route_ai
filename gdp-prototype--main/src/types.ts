export type UserRole = 'manager' | 'dispatcher' | 'admin' | 'driver';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

export interface Shipment {
  id: string;
  truckId: string;
  status: 'IN TRANSIT' | 'DELAYED' | 'IDLE' | 'COMPLETED';
  route: string;
  eta: string;
  delay?: string;
}

export interface Alert {
  id: string;
  type: 'weather' | 'traffic' | 'system';
  title: string;
  description: string;
  recommendation?: string;
  severity: 'high' | 'medium' | 'low';
}

export interface DriverStats {
  id: string;
  name: string;
  region: string;
  efficiency: number;
  completion: number;
  rating: number;
  avatar: string;
}
