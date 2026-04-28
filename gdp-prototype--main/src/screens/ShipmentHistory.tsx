import React, { useState } from 'react';
import { 
  Search, 
  Bell, 
  HelpCircle, 
  ChevronDown, 
  Truck, 
  Clock, 
  Timer, 
  Zap, 
  Filter, 
  Calendar, 
  Download,
  MoreVertical,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Package,
  ArrowUpRight,
  Route,
  Activity,
  Box
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import { Shipment } from '@/types';

interface ShipmentHistoryProps {
  shipments: Shipment[];
  searchTerm?: string;
  onSearchChange?: (val: string) => void;
}

export default function ShipmentHistory({ shipments, searchTerm = '', onSearchChange }: ShipmentHistoryProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'IN TRANSIT' | 'DELAYED' | 'IDLE' | 'COMPLETED'>('ALL');
  const [timeRange, setTimeRange] = useState<'ALL' | '30D' | 'YTD'>('ALL');
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>(4); // Default to May
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const itemsPerPage = 10;

  // Dynamic Stats Calculation
  const totalCompleted = shipments.filter(s => s.status === 'COMPLETED').length;
  const delayedCount = shipments.filter(s => s.status === 'DELAYED').length;
  
  // Directly reflect the real-time data count
  const totalDeliveries = (shipments.length).toLocaleString();
  const onTimeRate = shipments.length > 0 
    ? (((shipments.length - delayedCount) / shipments.length) * 100).toFixed(1) + '%'
    : '100%';
  const avgTransitTime = (12.5 + (delayedCount * 1.2)).toFixed(1) + ' hrs';

  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const filteredShipments = shipments.filter(s => {
    // Search Filter
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = 
      s.truckId.toLowerCase().includes(searchLower) ||
      s.route.toLowerCase().includes(searchLower) ||
      s.status.toLowerCase().includes(searchLower) ||
      `SR-${s.id.padStart(5, '0')}`.toLowerCase().includes(searchLower);
    
    if (!matchesSearch) return false;

    // Status Filter
    if (statusFilter !== 'ALL' && s.status !== statusFilter) return false;
    
    // Time Range Filter (Mocked based on ID/Creation for demo purposes)
    if (timeRange === '30D' && parseInt(s.id) < 5) return false;
    if (timeRange === 'YTD' && parseInt(s.id) < 2) return false;

    // Month Filter (Mock logic: for demo, we'll just check if selectedMonth is May/4)
    // In a real app, this would check s.createdAt month
    if (selectedMonth !== 'ALL' && selectedMonth !== 4) {
      // Mocking that all dummy data is in May
      return false;
    }
    
    return true;
  });

  const totalPages = Math.ceil(filteredShipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedShipments = filteredShipments.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleExportCSV = () => {
    const headers = ['Shipment ID', 'Truck ID', 'Status', 'Route', 'ETA'];
    const rows = filteredShipments.map(s => [
      `SR-${s.id.padStart(5, '0')}`,
      s.truckId,
      s.status,
      s.route,
      s.eta
    ]);
    
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `shipments_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-8 space-y-8 bg-[#F8F9FD] min-h-full overflow-y-auto no-scrollbar">
      {/* Top Header Row */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold font-sans text-[#2D3142]">Shipment History</h1>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Deliveries', value: totalDeliveries, change: '+12.5%', color: 'text-green-500', icon: Truck },
          { label: 'On-Time Rate', value: onTimeRate, change: '+2.1%', color: 'text-green-500', icon: Clock },
          { label: 'Avg. Transit Time', value: avgTransitTime, change: '-0.4h', color: 'text-red-500', icon: Timer },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[24px] shadow-sm border border-[#E9EDF5] flex flex-col justify-between">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-[#F3F6FF] rounded-xl text-[#5C4AB4]">
                <stat.icon className="w-5 h-5" />
              </div>
              <span className={cn("text-xs font-bold px-2 py-1 bg-green-50 rounded-lg", stat.color)}>
                {stat.change}
              </span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wider">{stat.label}</p>
              <p className="text-2xl font-black text-[#1A1C1E] mt-1">{stat.value}</p>
            </div>
          </div>
        ))}
        
        <div className="bg-[#5C4AB4] p-6 rounded-[24px] shadow-xl text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:scale-110 transition-transform"></div>
          <div className="relative z-10 flex flex-col h-full justify-between">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-white/10 rounded-xl">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="text-[10px] font-bold bg-white/20 px-2 py-1 rounded-full border border-white/10">AI Optimal</span>
            </div>
            <div className="mt-4">
              <p className="text-xs font-medium opacity-80 uppercase tracking-wider">Efficiency Score</p>
              <p className="text-2xl font-black mt-1">94/100</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Historical Log Table */}
      <div className="bg-white rounded-[32px] border border-[#E9EDF5] shadow-sm overflow-hidden mb-8">
        <div className="p-6 flex flex-col md:flex-row justify-between items-center gap-4 border-b border-[#E9EDF5]">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-bold text-[#2D3142]">Historical Log</h2>
            <div className="flex bg-[#F3F6FF] p-1 rounded-xl">
              {[
                { id: 'ALL', label: 'All Time' },
                { id: '30D', label: 'Last 30 Days' },
                { id: 'YTD', label: 'YTD' }
              ].map((t) => (
                <button 
                  key={t.id}
                  onClick={() => {
                    setTimeRange(t.id as any);
                    setCurrentPage(1);
                  }}
                  className={cn(
                    "px-4 py-2 text-xs font-bold transition-all rounded-lg",
                    timeRange === t.id ? "bg-white text-[#5C4AB4] shadow-sm" : "text-on-surface-variant hover:text-[#5C4AB4]"
                  )}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative group">
              <span className="absolute inset-y-0 left-3 flex items-center text-on-surface-variant group-focus-within:text-[#5C4AB4] transition-colors">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  onSearchChange?.(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search shipments..."
                className="pl-10 pr-4 py-3 bg-[#F3F6FF] rounded-2xl text-xs font-bold w-64 focus:ring-2 focus:ring-[#5C4AB4]/20 outline-none transition-all placeholder:text-on-surface-variant/50"
              />
            </div>

            <div className="relative">
              <button 
                onClick={() => { setIsStatusDropdownOpen(!isStatusDropdownOpen); setIsCalendarOpen(false); }}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 bg-[#F3F6FF] text-on-surface-variant text-xs font-bold rounded-2xl hover:bg-[#E9EDF5] transition-colors border border-transparent",
                  statusFilter !== 'ALL' && "border-[#5C4AB4]/40 bg-white text-[#5C4AB4]"
                )}
              >
                <Filter className="w-4 h-4" />
                {statusFilter === 'ALL' ? 'Filter By Status' : statusFilter}
                <ChevronDown className={cn("w-3 h-3 transition-transform", isStatusDropdownOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isStatusDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsStatusDropdownOpen(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-[#E9EDF5] z-20 py-2 overflow-hidden"
                    >
                      {['ALL', 'IN TRANSIT', 'DELAYED', 'IDLE', 'COMPLETED'].map((opt) => (
                        <button
                          key={opt}
                          onClick={() => {
                            setStatusFilter(opt as any);
                            setIsStatusDropdownOpen(false);
                            setCurrentPage(1);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-xs font-bold transition-colors",
                            statusFilter === opt ? "bg-[#F3F6FF] text-[#5C4AB4]" : "text-on-surface-variant hover:bg-[#F3F6FF]"
                          )}
                        >
                          {opt}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            <div className="relative">
              <button 
                onClick={() => { setIsCalendarOpen(!isCalendarOpen); setIsStatusDropdownOpen(false); }}
                className={cn(
                  "flex items-center gap-2 px-4 py-3 bg-[#F3F6FF] text-on-surface-variant text-xs font-bold rounded-2xl hover:bg-[#E9EDF5] transition-colors border border-transparent",
                  selectedMonth !== 'ALL' && "border-[#5C4AB4]/40 bg-white text-[#5C4AB4]"
                )}
              >
                <Calendar className="w-4 h-4" />
                {selectedMonth === 'ALL' ? 'All Months' : months[selectedMonth as number]}
                <ChevronDown className={cn("w-3 h-3 transition-transform", isCalendarOpen && "rotate-180")} />
              </button>

              <AnimatePresence>
                {isCalendarOpen && (
                  <>
                    <div className="fixed inset-0 z-10" onClick={() => setIsCalendarOpen(false)}></div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-48 bg-white rounded-2xl shadow-2xl border border-[#E9EDF5] z-20 py-2 overflow-hidden max-h-64 overflow-y-auto no-scrollbar"
                    >
                      <button
                        onClick={() => {
                          setSelectedMonth('ALL');
                          setIsCalendarOpen(false);
                          setCurrentPage(1);
                        }}
                        className={cn(
                          "w-full text-left px-4 py-2 text-xs font-bold transition-colors",
                          selectedMonth === 'ALL' ? "bg-[#F3F6FF] text-[#5C4AB4]" : "text-on-surface-variant hover:bg-[#F3F6FF]"
                        )}
                      >
                        All Months
                      </button>
                      {months.map((m, idx) => (
                        <button
                          key={m}
                          onClick={() => {
                            setSelectedMonth(idx);
                            setIsCalendarOpen(false);
                            setCurrentPage(1);
                          }}
                          className={cn(
                            "w-full text-left px-4 py-2 text-xs font-bold transition-colors",
                            selectedMonth === idx ? "bg-[#F3F6FF] text-[#5C4AB4]" : "text-on-surface-variant hover:bg-[#F3F6FF]"
                          )}
                        >
                          {m}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              onClick={handleExportCSV}
              className="px-6 py-3 bg-[#5C4AB4] text-white text-xs font-black rounded-2xl shadow-lg shadow-[#5C4AB4]/20 hover:bg-[#4B3A9B] transition-all flex items-center gap-2 active:scale-95"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto min-h-[500px]">
          <table className="w-full">
            <thead>
              <tr className="text-[10px] text-on-surface-variant uppercase tracking-widest bg-[#F9FAFC]">
                <th className="px-6 py-4 text-left font-bold">Shipment ID Cargo</th>
                <th className="px-6 py-4 text-left font-bold">Source</th>
                <th className="px-6 py-4 text-left font-bold">Destination</th>
                <th className="px-6 py-4 text-left font-bold">Delivery Date Status</th>
                <th className="px-6 py-4 text-left font-bold">Risk Score</th>
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3F6FF]">
              <AnimatePresence mode="popLayout">
                {paginatedShipments.map((row) => (
                  <motion.tr 
                    key={row.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="group hover:bg-[#F9FAFC] transition-colors"
                  >
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-[#5C4AB4]">#SR-{row.id.padStart(5, '0')}</span>
                        <div className="w-8 h-8 bg-[#F3F6FF] rounded-lg flex items-center justify-center text-[#5C4AB4]">
                          <Box className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-bold text-on-surface">General Cargo ({row.truckId})</span>
                      </div>
                    </td>
                    <td className="px-6 py-6 text-xs font-medium text-on-surface-variant">
                      {row.route.split('→')[0].trim() || 'Origin Hub'}
                    </td>
                    <td className="px-6 py-6 text-xs font-medium text-on-surface-variant">
                      {row.route.split('→')[1]?.trim() || 'Dest Hub'}
                    </td>
                    <td className="px-6 py-6">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-on-surface-variant">May 24, 2024</span>
                        <span className={cn(
                          "text-[10px] font-black px-3 py-1 rounded-full border min-w-[90px] text-center",
                          row.status === 'COMPLETED' ? "bg-green-50 text-green-600 border-green-100" :
                          row.status === 'DELAYED' ? "bg-red-50 text-red-600 border-red-100" :
                          row.status === 'IDLE' ? "bg-gray-50 text-gray-600 border-gray-100" :
                          "bg-blue-50 text-blue-600 border-blue-100"
                        )}>
                          • {row.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-6 font-bold">
                      <span className={cn(
                        "text-[10px] px-3 py-1 rounded-lg uppercase tracking-wider",
                        row.status === 'DELAYED' ? "bg-red-100 text-red-700" :
                        row.status === 'COMPLETED' ? "bg-green-100 text-green-700" :
                        "bg-orange-100 text-orange-700"
                      )}>
                        {row.status === 'DELAYED' ? 'High' : row.status === 'COMPLETED' ? 'Low' : 'Med'}
                      </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                      <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {paginatedShipments.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-on-surface-variant">
              <Search className="w-12 h-12 mb-4 opacity-20" />
              <p className="text-sm font-bold opacity-50">No shipments found for this filter.</p>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-[#F3F6FF] flex justify-between items-center">
          <p className="text-xs font-medium text-on-surface-variant">
            Showing <span className="text-on-surface font-bold">{startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredShipments.length)}</span> of {filteredShipments.length} shipments
          </p>
          <div className="flex items-center gap-2">
            <button 
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
              className="p-2 text-on-surface-variant hover:text-primary transition-colors border border-transparent hover:border-[#E9EDF5] rounded-lg disabled:opacity-30"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button 
                  key={p} 
                  onClick={() => handlePageChange(p)}
                  className={cn(
                    "w-8 h-8 rounded-lg text-xs font-bold transition-all",
                    p === currentPage ? "bg-[#5C4AB4] text-white shadow-lg shadow-[#5C4AB4]/20" : "text-on-surface-variant hover:bg-surface-container-low"
                  )}
                >{p}</button>
              ))}
            </div>
            <button 
              disabled={currentPage === totalPages}
              onClick={() => handlePageChange(currentPage + 1)}
              className="p-2 text-on-surface-variant hover:text-primary transition-colors border border-transparent hover:border-[#E9EDF5] rounded-lg disabled:opacity-30"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Section: AI Prediction & Route Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10">
        {/* AI Prediction Card */}
        <div className="lg:col-span-8 bg-[#5C4AB4] rounded-[40px] p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center gap-10">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-white opacity-5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none"></div>
          
          <div className="relative z-10 flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border border-white/10">
              <Zap className="w-4 h-4 fill-current text-white" />
              <span className="text-[10px] font-black uppercase tracking-widest opacity-90">SmartRoute AI Prediction</span>
            </div>
            
            <h3 className="text-4xl font-black tracking-tight leading-tight">Optimization <br/>Potential Found</h3>
            
            <p className="text-sm font-medium opacity-70 leading-relaxed max-w-sm">
              Our model suggests that shifting 15% of European ground routes to intermodal transport could increase Efficiency Score by 4.2 points.
            </p>
            
            <button className="px-8 py-4 bg-white text-[#5C4AB4] font-black rounded-full shadow-2xl transition-all active:scale-95 hover:shadow-white/20">
              Generate Report
            </button>
          </div>

          <div className="relative z-10 w-64 h-64 shrink-0 flex items-center justify-center">
            {/* Simple Circular Graphic for visualization */}
            <div className="absolute inset-0 border-4 border-white/10 rounded-full"></div>
            <div className="absolute inset-4 border-4 border-white/20 rounded-full border-t-white animate-spin-slow"></div>
            <TrendingUp className="w-20 h-20 text-white opacity-90" />
          </div>
        </div>

        {/* Route Performance List */}
        <div className="lg:col-span-4 bg-white rounded-[40px] p-8 border border-[#E9EDF5] shadow-sm flex flex-col">
          <h4 className="text-lg font-bold text-[#2D3142] mb-8">Route Performance</h4>
          
          <div className="space-y-4 flex-1">
            {[
              { label: 'North America - East', value: '99.1%', level: 'bg-green-400' },
              { label: 'Western Europe', value: '97.4%', level: 'bg-green-400' },
              { label: 'Asia Pacific - Central', value: '91.8%', level: 'bg-green-300' },
            ].map((route, i) => (
              <div key={i} className="p-4 bg-[#F8F9FD] rounded-[24px] border border-transparent hover:border-[#5C4AB4]/10 transition-all flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-white rounded-xl text-[#5C4AB4] shadow-sm">
                    <Route className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-on-surface-variant font-sans">{route.label}</span>
                </div>
                <span className="text-xs font-black text-green-600">{route.value}</span>
              </div>
            ))}
          </div>

          <button className="mt-8 text-xs font-black text-[#5C4AB4] hover:underline uppercase tracking-widest text-center w-full">
            View Full Breakdown
          </button>
        </div>
      </div>
    </div>
  );
}
