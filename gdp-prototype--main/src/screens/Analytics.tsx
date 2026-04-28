import React, { useState, useMemo, useEffect } from 'react';
import { api } from '../lib/api';
import { 
  TrendingUp, 
  BarChart3, 
  Star, 
  ChevronRight,
  Plus,
  ArrowUpRight,
  Loader2,
  CheckCircle2
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { DriverStats } from '@/types';

const SUCCESS_RATE_DATA = [
  { name: 'Mon', value: 40 },
  { name: 'Tue', value: 60 },
  { name: 'Wed', value: 45 },
  { name: 'Thu', value: 80 },
  { name: 'Fri', value: 98.4 },
  { name: 'Sat', value: 70 },
  { name: 'Sun', value: 55 },
];

const TRENDS_DATA_MAP = {
  Monthly: [
    { name: 'Week 1', value: 1200 },
    { name: 'Week 2', value: 1420 },
    { name: 'Week 3', value: 1100 },
    { name: 'Week 4', value: 2840 },
    { name: 'Week 5', value: 1800 },
    { name: 'Week 6', value: 2400 },
    { name: 'Week 7', value: 1600 },
  ],
  Quarterly: [
    { name: 'Jan', value: 5400 },
    { name: 'Feb', value: 6200 },
    { name: 'Mar', value: 7800 },
  ],
  Annual: [
    { name: 'Q1', value: 18000 },
    { name: 'Q2', value: 24000 },
    { name: 'Q3', value: 21000 },
    { name: 'Q4', value: 31000 },
  ]
};

const RISK_DISTRIBUTION_DATA = [
  { name: 'Low Risk', value: 65, color: '#5c4ab4' },
  { name: 'Moderate', value: 20, color: '#9b3667' },
  { name: 'Critical', value: 15, color: '#f74b6d' },
];

const TOP_DRIVERS: DriverStats[] = [
  { id: 'd1', name: 'Alex Rivera', region: 'North-East Region', efficiency: 94, completion: 142, rating: 4.9, avatar: 'https://picsum.photos/seed/alex/100/100' },
  { id: 'd2', name: 'Sarah Chen', region: 'Metro Express', efficiency: 88, completion: 138, rating: 4.8, avatar: 'https://picsum.photos/seed/sarah/100/100' },
  { id: 'd3', name: 'Marcus Thorne', region: 'Industrial Core', efficiency: 82, completion: 121, rating: 4.7, avatar: 'https://picsum.photos/seed/marcus/100/100' },
];



export default function Analytics() {
  const [volumeFilter, setVolumeFilter] = useState<'Monthly' | 'Quarterly' | 'Annual'>('Monthly');
  const [optimizationState, setOptimizationState] = useState<'idle' | 'running' | 'success'>('idle');
  const [summary, setSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setIsLoading(true);
        const data = await api.analytics.getSummary();
        setSummary(data);
      } catch (error) {
        console.error('Failed to fetch analytics summary:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchSummary();
  }, []);

  const handleOptimize = () => {
    setOptimizationState('running');
    setTimeout(() => {
      setOptimizationState('success');
      setTimeout(() => setOptimizationState('idle'), 2000);
    }, 1500);
  };

  const RISK_COLORS: Record<string, string> = {
    'Low Risk': '#5c4ab4',
    'Moderate': '#9b3667',
    'Critical': '#f74b6d',
  };

  const safeSummary = summary ? {
    ...summary,
    risk_distribution: (summary.risk_distribution || RISK_DISTRIBUTION_DATA).map((item: any) => ({
      ...item,
      color: item.color || RISK_COLORS[item.name] || '#5c4ab4'
    }))
  } : {
    success_rate: 98.4,
    avg_delay: 4.12,
    risk_distribution: RISK_DISTRIBUTION_DATA
  };

  const volumeData = useMemo(() => TRENDS_DATA_MAP[volumeFilter] || [], [volumeFilter]);

  return (
    <div className="p-6 lg:p-10 space-y-10 max-w-[1600px] mx-auto overflow-y-auto h-[calc(100vh-64px)] no-scrollbar">
      {/* Hero Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main KPI Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="lg:col-span-8 bg-surface-container-lowest rounded-[2rem] p-8 shadow-[0_12px_32px_-4px_rgba(92,74,180,0.06)] relative overflow-hidden flex flex-col justify-between min-h-[320px]"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
          <div>
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-on-surface-variant font-bold text-sm uppercase tracking-widest mb-1">Delivery Success Rate</h3>
                <p className="text-4xl font-extrabold text-on-surface tracking-tight">{safeSummary.success_rate}<span className="text-primary">%</span></p>
              </div>
              <div className="flex items-center gap-2 bg-primary/10 text-primary px-3 py-1 rounded-full font-bold text-xs">
                <TrendingUp className="w-4 h-4" />
                +2.4% vs LY
              </div>
            </div>
            
            <div className="h-40 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={SUCCESS_RATE_DATA}>
                  <Bar 
                    dataKey="value" 
                    fill="#eff1f4" 
                    radius={[8, 8, 0, 0]}
                  >
                    {SUCCESS_RATE_DATA.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.value > 90 ? '#5c4ab4' : '#eff1f4'} />
                    ))}
                  </Bar>
                  <XAxis dataKey="name" hide />
                  <Tooltip 
                    cursor={{ fill: 'transparent' }}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs text-on-surface-variant font-medium mt-4">
            {SUCCESS_RATE_DATA.map(d => <span key={d.name}>{d.name}</span>)}
          </div>
        </motion.div>

        {/* Secondary KPI Card */}
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="lg:col-span-4 bg-primary rounded-[2rem] p-8 text-white flex flex-col justify-between shadow-xl shadow-primary/20 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-dim to-secondary opacity-50"></div>
          <div className="relative z-10">
            <h3 className="text-white/70 font-bold text-sm uppercase tracking-widest mb-1">Avg. Delay Percentage</h3>
            <p className="text-4xl font-extrabold tracking-tight">{safeSummary.avg_delay}<span className="text-white/60">%</span></p>
            <p className="mt-4 text-sm text-white/80 font-medium">Predicted decrease of 0.8% in next 24 hours based on AI traffic optimization.</p>
          </div>
          <div className="relative z-10 mt-6 flex justify-between items-end">
            <div className="w-24 h-12 flex gap-1 items-end">
              {[0.7, 0.5, 0.2, 0.4].map((h, i) => (
                <div key={i} className="w-2 bg-white/20 rounded-t-sm" style={{ height: `${h * 100}%` }}>
                  {i === 2 && <div className="w-full h-full bg-white rounded-t-sm" />}
                </div>
              ))}
            </div>
            <button 
              onClick={handleOptimize}
              disabled={optimizationState !== 'idle'}
              className={cn(
                "px-4 py-2 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2",
                optimizationState === 'idle' ? "bg-white text-primary hover:bg-surface-container-low" :
                optimizationState === 'running' ? "bg-white/20 text-white cursor-not-allowed" :
                "bg-green-400 text-white"
              )}
            >
              {optimizationState === 'idle' && "Optimize"}
              {optimizationState === 'running' && (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  Analyzing
                </>
              )}
              {optimizationState === 'success' && (
                <>
                  <CheckCircle2 className="w-3 h-3" />
                  Applied
                </>
              )}
            </button>
          </div>
        </motion.div>
      </section>

      {/* Bento Grid Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Operational Risk Distribution */}
        <div className="bg-surface-container-lowest rounded-[2rem] p-8 flex flex-col shadow-sm">
          <h4 className="text-on-surface font-bold text-lg mb-6">Operational Risk Distribution</h4>
          <div className="relative flex-1 flex items-center justify-center py-6 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={safeSummary.risk_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {safeSummary.risk_distribution.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={entry.color || RISK_DISTRIBUTION_DATA[index % 3]?.color || '#5c4ab4'} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-extrabold text-[#5c4ab4]">Stable</span>
              <span className="text-[10px] text-on-surface-variant uppercase font-black tracking-widest">Status</span>
            </div>
          </div>
          <div className="space-y-3 mt-4">
            {RISK_DISTRIBUTION_DATA.map((item) => (
              <div key={item.name} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-on-surface-variant">{item.name}</span>
                </div>
                <span className="font-bold">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Performing Drivers */}
        <div className="lg:col-span-2 bg-surface-container-lowest rounded-[2rem] p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h4 className="text-on-surface font-bold text-lg">Top Performing Drivers</h4>
            <button className="text-primary font-bold text-xs uppercase tracking-widest hover:underline transition-all">
              Full Driver Registry
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-on-surface-variant text-xs uppercase tracking-wider">
                  <th className="pb-4 font-bold">Driver</th>
                  <th className="pb-4 font-bold">Performance</th>
                  <th className="pb-4 font-bold text-right">Completion</th>
                  <th className="pb-4 font-bold text-right">Rating</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {TOP_DRIVERS.map((driver) => (
                  <tr key={driver.id} className="group hover:bg-surface-container-low transition-colors rounded-xl">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img alt={driver.name} className="w-10 h-10 rounded-full object-cover" src={driver.avatar} />
                        <div>
                          <div className="text-on-surface font-bold">{driver.name}</div>
                          <div className="text-xs text-on-surface-variant">{driver.region}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="w-24 h-2 bg-surface-container-low rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${driver.efficiency}%` }}></div>
                      </div>
                    </td>
                    <td className="py-4 text-right whitespace-nowrap">{driver.completion} Units</td>
                    <td className="py-4 text-right">
                      <div className="flex items-center justify-end gap-1 text-amber-400">
                        <Star className="w-3 h-3 fill-current" />
                        <span className="text-on-surface font-bold">{driver.rating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Shipment Volume Trends */}
      <section className="bg-surface-container-low rounded-[2rem] p-8 lg:p-12 relative overflow-hidden shadow-sm">
        <div className="relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
            <div>
              <h4 className="text-2xl font-extrabold text-on-surface tracking-tight mb-2">Shipment Volume Trends</h4>
              <p className="text-on-surface-variant text-sm max-w-md">Aggregated data visualizing kinetic flow across global logistics hubs over the past 30 days.</p>
            </div>
            <div className="flex gap-2 p-1 bg-surface-container-high rounded-full">
              {['Monthly', 'Quarterly', 'Annual'].map((filter) => (
                <button 
                  key={filter}
                  onClick={() => setVolumeFilter(filter as any)}
                  className={cn(
                    "px-6 py-2 rounded-full text-xs font-bold transition-all",
                    volumeFilter === filter 
                      ? "bg-white text-primary shadow-sm" 
                      : "text-on-surface-variant hover:text-on-surface"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
          
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={volumeData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5c4ab4" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#5c4ab4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#dadde1" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 10, fill: '#8e9196', fontWeight: 600 }}
                  dy={10}
                />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04)',
                    padding: '12px'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#5c4ab4" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                  animationDuration={1000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>
    </div>
  );
}
