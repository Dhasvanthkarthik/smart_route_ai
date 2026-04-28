import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Info, Route } from 'lucide-react';
import { motion } from 'motion/react';
import { UserRole } from '@/types';
import { api } from '@/lib/api';

interface LoginProps {
  onLogin: (email: string, role: UserRole, accessToken: string) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.auth.login(formData);
      
      let role: UserRole = 'manager';
      const lowerEmail = email.toLowerCase();
      if (lowerEmail.includes('dispatcher')) role = 'dispatcher';
      if (lowerEmail.includes('admin')) role = 'admin';
      if (lowerEmail.includes('driver')) role = 'driver';
      
      onLogin(email, role, response.access_token);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-background text-on-background min-h-screen flex items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative Kinetic Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-container/20 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-secondary-container/20 rounded-full blur-[120px]"></div>
      
      <main className="w-full max-w-md relative z-10">
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-16 h-16 bg-primary-container rounded-2xl flex items-center justify-center mb-4 shadow-[0_12px_32px_-4px_rgba(92,74,180,0.15)]"
          >
            <Route className="text-primary w-10 h-10" />
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight text-primary">SmartRoute AI</h1>
          <p className="text-on-surface-variant font-medium mt-1">Kinetic Orchestrator</p>
        </div>

        {/* Login Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="bg-surface-container-lowest rounded-[2rem] p-10 shadow-[0_24px_48px_-12px_rgba(92,74,180,0.08)]"
        >
          <div className="mb-8">
            <h2 className="text-xl font-bold text-on-surface">Welcome back</h2>
            <p className="text-on-surface-variant text-sm mt-1">Please enter your details to sign in.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-error/10 border border-error/20 rounded-2xl text-error text-xs font-bold animate-shake">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-on-surface ml-1" htmlFor="email">Email address</label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="text-outline group-focus-within:text-primary transition-colors w-5 h-5" />
                </div>
                <input 
                  className="block w-full pl-12 pr-4 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" 
                  id="email" 
                  name="email" 
                  placeholder="name@company.com" 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <label className="block text-sm font-semibold text-on-surface" htmlFor="password">Password</label>
                <a className="text-xs font-bold text-primary hover:text-primary-dim transition-colors" href="#">Forgot password?</a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="text-outline group-focus-within:text-primary transition-colors w-5 h-5" />
                </div>
                <input 
                  className="block w-full pl-12 pr-12 py-4 bg-surface-container-low border-none rounded-2xl text-on-surface placeholder:text-outline focus:ring-2 focus:ring-primary/20 focus:bg-surface-container-lowest transition-all" 
                  id="password" 
                  name="password" 
                  placeholder="••••••••" 
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button 
                  className="absolute inset-y-0 right-0 pr-4 flex items-center" 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="text-outline w-5 h-5" /> : <Eye className="text-outline w-5 h-5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center px-1">
              <input 
                className="h-5 w-5 rounded-lg border-outline-variant text-primary focus:ring-primary/20 bg-surface-container-low" 
                id="remember-me" 
                name="remember-me" 
                type="checkbox" 
              />
              <label className="ml-3 block text-sm text-on-surface-variant font-medium" htmlFor="remember-me">Remember this device</label>
            </div>

            <button 
              className="w-full bg-primary text-white py-4 px-6 rounded-full font-bold text-lg shadow-lg shadow-primary/20 hover:bg-primary-dim hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed" 
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in to Dashboard'}
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </motion.div>


        <footer className="mt-12 text-center">
          <p className="text-on-surface-variant text-sm font-medium">
            New to the platform? 
            <a className="text-primary font-bold hover:underline ml-1" href="#">Contact System Administrator</a>
          </p>
        </footer>
      </main>

      {/* Side Image Ornament */}
      <div className="hidden lg:block fixed right-0 top-0 bottom-0 w-[30%] pointer-events-none">
        <div className="h-full w-full relative">
          <img 
            alt="Logistics background" 
            className="h-full w-full object-cover opacity-20 grayscale brightness-125" 
            src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=1000"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-l from-background via-background/40 to-transparent"></div>
        </div>
      </div>
    </div>
  );
}
