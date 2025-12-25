
import React, { useState, useMemo, useEffect } from 'react';
import { MOCK_ALERTS } from '../constants';
import { AgriAlert, AlertSeverity, Language } from '../types';
import { fetchRealTimeThreats, getCropWeatherAdvisory } from '../services/geminiService';

const Raksha: React.FC<{ language: Language }> = ({ language }) => {
  const [activeAlerts, setActiveAlerts] = useState<AgriAlert[]>(MOCK_ALERTS);
  const [filter, setFilter] = useState<'all' | 'critical' | 'weather' | 'pest' | 'disaster'>('all');
  const [selectedAlert, setSelectedAlert] = useState<AgriAlert | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [weatherAdvisory, setWeatherAdvisory] = useState<string | null>(null);
  const [isLoadingAdvisory, setIsLoadingAdvisory] = useState(false);

  // Helper to clean AI text of special markdown characters
  const cleanAIText = (text: string) => {
    return text
      .replace(/[*#`>_~|]/g, '') 
      .replace(/--/g, '')       
      .replace(/\s+/g, ' ')      
      .trim();
  };

  useEffect(() => {
    fetchAdvisory();
  }, []);

  const fetchAdvisory = async () => {
    setIsLoadingAdvisory(true);
    // In a real app, location and crops would come from the user profile
    const advisory = await getCropWeatherAdvisory("Karnal, Haryana", ["Rice", "Wheat", "Mustard"], language);
    setWeatherAdvisory(cleanAIText(advisory || ""));
    setIsLoadingAdvisory(false);
  };

  const handleInternetSync = async () => {
    setIsSyncing(true);
    const { data } = await fetchRealTimeThreats();
    if (data && data.length > 0) {
      setActiveAlerts(prev => {
        // Prevent duplicate news by filtering existing IDs
        const existingIds = new Set(prev.map(a => a.id));
        const uniqueNewData = data.filter((a: any) => !existingIds.has(a.id));
        return [...uniqueNewData, ...prev];
      });
    }
    await fetchAdvisory();
    setIsSyncing(false);
  };

  const filteredAlerts = useMemo(() => {
    return activeAlerts.filter(a => {
      if (filter === 'all') return true;
      if (filter === 'critical') return a.severity === 'critical';
      return a.category === filter;
    });
  }, [activeAlerts, filter]);

  const hasCritical = activeAlerts.some(a => a.severity === 'critical');

  // Map categories to specific brand colors
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'disaster': return 'bg-red-600';
      case 'weather': return 'bg-blue-600';
      case 'pest': return 'bg-purple-600';
      case 'disease': return 'bg-amber-600';
      case 'market': return 'bg-emerald-600';
      default: return 'bg-slate-800';
    }
  };

  const getAlertIcon = (category: string) => {
    switch (category) {
      case 'disaster': return 'fa-house-crack';
      case 'weather': return 'fa-cloud-bolt';
      case 'pest': return 'fa-bug';
      case 'disease': return 'fa-vial';
      case 'market': return 'fa-chart-line';
      default: return 'fa-triangle-exclamation';
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
      {/* Mobile App Style Status Header */}
      <div className={`pt-6 pb-12 px-6 rounded-b-[3rem] transition-colors duration-500 shadow-2xl ${hasCritical ? 'bg-red-600' : 'bg-green-600'}`}>
        <div className="flex justify-between items-center text-white mb-8">
          <div>
            <h1 className="text-2xl font-black tracking-tighter uppercase">Krishi Raksha</h1>
            <p className="text-[10px] font-bold opacity-80 uppercase tracking-[0.2em]">Verified Threat Shield</p>
          </div>
          <button 
            onClick={handleInternetSync}
            disabled={isSyncing}
            className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/20 active:scale-95 transition-all"
          >
            <i className={`fas fa-satellite-dish ${isSyncing ? 'animate-pulse text-yellow-300' : ''}`}></i>
          </button>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-6 text-white flex items-center gap-6">
          <div className="relative shrink-0">
            <div className={`w-16 h-16 rounded-full border-4 border-white/30 flex items-center justify-center text-2xl ${hasCritical ? 'animate-pulse' : ''}`}>
              <i className={`fas ${hasCritical ? 'fa-triangle-exclamation' : 'fa-shield-check'}`}></i>
            </div>
            {hasCritical && <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-30"></div>}
          </div>
          <div>
            <div className="text-[10px] font-black uppercase tracking-widest opacity-70">Current Status</div>
            <div className="text-xl font-black">{hasCritical ? 'Regional Emergency' : 'Area Secured'}</div>
            <div className="text-[10px] font-bold mt-1 opacity-90">{activeAlerts.length} Confirmed Monitoring Nodes</div>
          </div>
        </div>
      </div>

      {/* Main Container - Adjusted for overlap effect */}
      <div className="px-5 -mt-6">
        {/* Visual Radar Animation */}
        <div className="bg-white rounded-[2.5rem] p-6 shadow-xl border border-slate-100 mb-8 overflow-hidden relative">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest">Local Scanning</h3>
            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></span>
              Live Satellite
            </span>
          </div>
          
          <div className="flex items-center gap-6">
             <div className="w-24 h-24 rounded-full border-2 border-slate-100 flex items-center justify-center relative bg-slate-50 shrink-0">
                <div className="absolute inset-0 border-2 border-green-500/20 rounded-full animate-[ping_3s_infinite]"></div>
                <div className="w-2 h-2 bg-green-500 rounded-full z-10 shadow-[0_0_10px_#22c55e]"></div>
                <div className="absolute w-12 h-0.5 bg-gradient-to-r from-transparent to-green-500 origin-left animate-[spin_4s_linear_infinite]"></div>
             </div>
             <div>
               <div className="text-xs font-black text-slate-700 leading-tight">Monitoring 50km Radius</div>
               <div className="text-[10px] text-slate-400 font-medium mt-1">Cross-referencing IMD, NDMA & Ground Reports.</div>
             </div>
          </div>
        </div>

        {/* AI Weather Advisory Section */}
        <div className="bg-indigo-900 rounded-[2.5rem] p-6 shadow-xl border border-indigo-800 mb-8 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 saffron-gradient rounded-xl flex items-center justify-center text-white shadow-lg">
                <i className="fas fa-robot"></i>
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">AI Crop Advisory</h3>
                <p className="text-[9px] text-indigo-300 font-bold uppercase">Based on local forecast</p>
              </div>
            </div>
            {isLoadingAdvisory ? (
              <div className="flex flex-col items-center py-6">
                <div className="w-8 h-8 border-2 border-white/20 border-t-orange-400 rounded-full animate-spin mb-2"></div>
                <p className="text-[10px] font-black text-white/50 uppercase">Analyzing Atmosphere...</p>
              </div>
            ) : weatherAdvisory ? (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-700">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 text-white text-xs leading-relaxed font-medium">
                  {weatherAdvisory}
                </div>
                <button 
                  onClick={fetchAdvisory}
                  className="mt-4 text-[9px] font-black text-orange-400 uppercase tracking-widest flex items-center gap-2"
                >
                  <i className="fas fa-rotate-right"></i> Refresh Advisory
                </button>
              </div>
            ) : (
              <p className="text-xs text-white/50 italic">Advisory data currently unavailable.</p>
            )}
          </div>
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        </div>

        {/* Categories Bar */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-6">
          {['all', 'critical', 'weather', 'pest', 'disaster'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shrink-0 ${filter === f ? 'bg-slate-900 text-white border-transparent shadow-lg' : 'bg-white text-slate-400 border-slate-100'}`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* Mobile Alert Feed */}
        <div className="space-y-4">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map(alert => (
              <div 
                key={alert.id}
                onClick={() => setSelectedAlert(alert)}
                className="bg-white rounded-[2rem] p-5 shadow-lg border border-slate-100 flex gap-4 active:scale-[0.98] transition-all group"
              >
                <div className={`w-14 h-14 rounded-2xl shrink-0 flex items-center justify-center text-white shadow-lg ${getCategoryColor(alert.category)}`}>
                  <i className={`fas ${getAlertIcon(alert.category)} text-xl`}></i>
                </div>
                <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-black text-slate-800 text-sm truncate pr-2 leading-none">{alert.title}</h3>
                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest shrink-0">{alert.timestamp}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed mb-3">
                    {alert.description}
                  </p>
                  <div className="flex items-center justify-between border-t border-slate-50 pt-3">
                    <div className="flex items-center gap-1.5">
                      <i className={`fas fa-location-dot ${alert.severity === 'critical' ? 'text-red-500' : 'text-slate-400'} text-[10px]`}></i>
                      <span className="text-[9px] font-black text-slate-400 truncate max-w-[100px] uppercase">{alert.location}</span>
                    </div>
                    <div className="text-[9px] font-black text-green-600 uppercase flex items-center gap-1">
                      <i className="fas fa-lightbulb"></i> View Solution
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="py-20 text-center text-slate-300">
               <i className="fas fa-ghost text-4xl mb-4 opacity-20"></i>
               <p className="text-xs font-black uppercase tracking-widest">No matching threats</p>
            </div>
          )}
        </div>
      </div>

      {/* Modern Bottom Sheet Overlay for Details */}
      {selectedAlert && (
        <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-md rounded-[3rem] p-8 shadow-2xl relative animate-in slide-in-from-bottom-10 duration-500 max-h-[85vh] overflow-y-auto no-scrollbar">
              <div className="w-12 h-1.5 bg-slate-100 rounded-full mx-auto mb-8"></div>
              
              <div className="flex items-center gap-4 mb-8">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${getCategoryColor(selectedAlert.category)}`}>
                  <i className={`fas ${getAlertIcon(selectedAlert.category)} text-xl`}></i>
                </div>
                <div>
                  <h2 className="text-xl font-black text-slate-900 leading-tight">{selectedAlert.title}</h2>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${selectedAlert.severity === 'critical' ? 'bg-red-50 text-red-500' : 'bg-blue-50 text-blue-500'}`}>Verified Hazard</span>
                  </div>
                </div>
              </div>

              <div className="space-y-6 mb-10">
                <div>
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Description</h4>
                  <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedAlert.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Impact Radius</div>
                    <div className="text-xs font-black text-slate-800">{selectedAlert.radius} KM Zone</div>
                  </div>
                  <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-[8px] font-black text-slate-400 uppercase mb-1">Timeframe</div>
                    <div className="text-xs font-black text-slate-800">{selectedAlert.expectedTime}</div>
                  </div>
                </div>

                <div className="bg-green-50 p-6 rounded-[2rem] border border-green-100">
                   <h4 className="text-[10px] font-black text-green-700 uppercase tracking-widest mb-4 flex items-center gap-2">
                     <i className="fas fa-check-shield"></i> Recommended Solutions
                   </h4>
                   <ul className="space-y-3">
                     {selectedAlert.actions.map((a, i) => (
                       <li key={i} className="text-xs font-bold text-slate-700 flex gap-3">
                         <span className="text-green-500 shrink-0">✓</span> 
                         {a}
                       </li>
                     ))}
                   </ul>
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => setSelectedAlert(null)} className="flex-grow py-5 bg-slate-900 text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl active:scale-95 transition-all">Acknowledge & Save</button>
                <button className="w-16 h-16 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center active:scale-95 transition-all">
                  <i className="fas fa-share-nodes"></i>
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Raksha;
