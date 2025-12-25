
import React, { useState, useEffect } from 'react';
import { MOCK_PRICES } from '../constants';
// Added Language to imports
import { MandiPrice, Language } from '../types';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { fetchLiveMandiData, predictMandiPrices } from '../services/geminiService';

// Updated component signature to accept language prop
const Prices: React.FC<{ language: Language }> = ({ language }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [mandiResults, setMandiResults] = useState<MandiPrice[]>(MOCK_PRICES);
  const [selectedCrop, setSelectedCrop] = useState<MandiPrice>(MOCK_PRICES[0]);
  const [prediction, setPrediction] = useState<any>(null);
  const [groundingSources, setGroundingSources] = useState<any[]>([]);
  const [loadingPrediction, setLoadingPrediction] = useState(false);

  // Initial load
  useEffect(() => {
    handlePrediction(MOCK_PRICES[0]);
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    const { data, sources } = await fetchLiveMandiData(searchQuery);
    if (data && data.length > 0) {
      setMandiResults(data);
      setGroundingSources(sources);
      setSelectedCrop(data[0]);
      handlePrediction(data[0]);
    } else {
      alert("No live data found for this search. Showing approximate results.");
    }
    setIsSearching(false);
  };

  const handlePrediction = async (cropData: MandiPrice) => {
    setLoadingPrediction(true);
    const { data, sources } = await predictMandiPrices(cropData.crop, cropData.mandi);
    setPrediction(data);
    // Accumulate unique sources if needed, or replace
    setGroundingSources(prev => {
      const all = [...prev, ...sources];
      return Array.from(new Set(all.map(s => s.web?.uri))).map(uri => all.find(s => s.web?.uri === uri));
    });
    setLoadingPrediction(false);
  };

  const onCropSelect = (crop: MandiPrice) => {
    setSelectedCrop(crop);
    handlePrediction(crop);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const defaultChartData = [
    { day: 'Mon', price: selectedCrop.price - 40 },
    { day: 'Tue', price: selectedCrop.price - 10 },
    { day: 'Wed', price: selectedCrop.price - 30 },
    { day: 'Thu', price: selectedCrop.price + 20 },
    { day: 'Fri', price: selectedCrop.price + 50 },
    { day: 'Sat', price: selectedCrop.price + 30 },
    { day: 'Sun', price: selectedCrop.price + 70 },
  ];

  const chartData = prediction?.chartData?.length > 0 
    ? prediction.chartData.map((d: any) => ({ day: d.day, price: d.predictedPrice || d.price }))
    : defaultChartData;

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-24">
      {/* Top Search Bar */}
      <div className="bg-slate-900 rounded-[2rem] p-6 md:p-10 mb-8 relative overflow-hidden">
        <div className="relative z-10">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Live Mandi Analytics</h1>
          <p className="text-slate-400 text-sm md:text-base mb-8 max-w-2xl font-medium">
            Access real-time APMC data from across India. Search by <span className="text-green-400">Crop Name</span> or <span className="text-orange-400">Mandi (APMC) Location</span>.
          </p>
          
          <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
            <div className="flex-grow relative">
              <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400"></i>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search e.g. 'Wheat prices in Punjab' or 'Azadpur Mandi'..."
                className="w-full pl-14 pr-6 py-4 md:py-5 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-white outline-none focus:ring-2 focus:ring-green-500 font-bold placeholder:text-slate-500 text-sm md:text-base"
              />
            </div>
            <button 
              type="submit"
              disabled={isSearching}
              className="px-10 py-4 md:py-5 saffron-gradient text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
            >
              {isSearching ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-bolt"></i>}
              {isSearching ? 'Fetching Data...' : 'Get Live Prices'}
            </button>
          </form>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Mandi List Sidebar */}
        <div className="w-full lg:w-1/3 xl:w-1/4 order-2 lg:order-1">
          <div className="flex items-center justify-between mb-6 px-1">
            <h2 className="text-xl font-black text-slate-800 uppercase tracking-tight">Market Pulse</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black text-green-600 uppercase tracking-widest">Live Now</span>
            </div>
          </div>
          
          <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 no-scrollbar">
            {mandiResults.map((p, i) => (
              <div 
                key={i}
                onClick={() => onCropSelect(p)}
                className={`p-5 rounded-[1.5rem] cursor-pointer border-2 transition-all group ${
                  selectedCrop.crop === p.crop && selectedCrop.mandi === p.mandi
                  ? 'border-green-500 bg-green-50 shadow-xl shadow-green-100 scale-[1.02]' 
                  : 'border-slate-100 bg-white hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="font-black text-slate-800 group-hover:text-green-700 transition-colors leading-tight">
                    {p.crop}
                  </div>
                  <span className={`text-[9px] font-black px-2 py-1 rounded-lg ${
                    p.trend === 'up' ? 'bg-green-100 text-green-700' : p.trend === 'down' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {p.trend === 'up' ? '▲' : p.trend === 'down' ? '▼' : '•'} {p.change}%
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-medium mb-4 flex items-center gap-1.5">
                  <i className="fas fa-map-marker-alt text-slate-300"></i> {p.mandi}
                </div>
                <div className="flex items-end justify-between">
                  <div className="text-2xl font-black text-slate-900 tracking-tighter">₹{p.price}</div>
                  <div className="text-[8px] text-slate-400 font-bold uppercase tracking-widest text-right">
                    Per Quintal<br/>{p.lastUpdated}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Added Grounding Sources Display as per guidelines */}
          {groundingSources.length > 0 && (
            <div className="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm animate-in fade-in duration-500">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Market Data Sources</h3>
              <div className="space-y-3">
                {groundingSources.map((source, idx) => (
                  source.web && (
                    <a 
                      key={idx} 
                      href={source.web.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2 hover:bg-white rounded-lg transition-colors group"
                    >
                      <div className="w-6 h-6 rounded bg-green-100 flex items-center justify-center text-green-600 shrink-0">
                        <i className="fas fa-link text-[10px]"></i>
                      </div>
                      <span className="text-[10px] font-bold text-slate-600 group-hover:text-green-700 truncate">
                        {source.web.title || source.web.uri}
                      </span>
                    </a>
                  )
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Analysis Area */}
        <div className="flex-grow order-1 lg:order-2">
          {/* Main Price Card & Chart */}
          <div className="bg-white p-6 md:p-10 rounded-[2.5rem] shadow-2xl border border-slate-100 mb-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="text-2xl md:text-3xl font-black text-slate-900">{selectedCrop.crop}</h3>
                  <span className="px-3 py-1 bg-slate-100 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    {selectedCrop.mandi}
                  </span>
                </div>
                <p className="text-slate-500 text-xs md:text-sm font-medium">Historical Price Performance (Last 7 Days)</p>
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <button className="flex-grow md:flex-none px-6 py-3 saffron-gradient text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                  <i className="fas fa-bell mr-2"></i> Price Alert
                </button>
                <button className="px-4 py-3 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
                  <i className="fas fa-share-alt"></i>
                </button>
              </div>
            </div>

            <div className="h-[300px] md:h-[400px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    {/* Fixed duplicate x1 attribute: the second x1 was changed to y1 to form a standard gradient coordinate pair */}
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2E7D32" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#2E7D32" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="day" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} 
                    dy={15} 
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#94a3b8'}} 
                    dx={-10}
                    domain={['auto', 'auto']}
                  />
                  <Tooltip 
                    contentStyle={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', padding: '15px'}}
                    labelStyle={{fontWeight: '900', color: '#1e293b', marginBottom: '5px'}}
                    itemStyle={{fontSize: '14px', fontWeight: 'bold', color: '#2E7D32'}}
                    formatter={(value: any) => [`₹${value}`, 'Price']}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#2E7D32" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI Insights & Predictions */}
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main Prediction Card */}
            <div className="md:col-span-2 bg-slate-900 text-white p-8 md:p-10 rounded-[2.5rem] relative overflow-hidden flex flex-col justify-between shadow-2xl">
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 saffron-gradient rounded-xl flex items-center justify-center text-white text-lg shadow-lg">
                    <i className="fas fa-brain"></i>
                  </div>
                  <div>
                    <div className="text-[10px] font-black text-orange-400 uppercase tracking-[0.2em]">Krishi AI Prediction</div>
                    <div className="text-sm font-bold opacity-80">Next 7-30 Days Analysis</div>
                  </div>
                </div>

                {loadingPrediction ? (
                  <div className="py-10 flex flex-col items-center justify-center space-y-4">
                    <div className="w-12 h-12 border-4 border-white/10 border-t-orange-400 rounded-full animate-spin"></div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Analyzing Market Forces...</p>
                  </div>
                ) : prediction ? (
                  <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-4 mb-6">
                      <div className={`text-4xl font-black ${prediction.shortTermTrend === 'Rising' ? 'text-green-400' : prediction.shortTermTrend === 'Falling' ? 'text-red-400' : 'text-orange-400'}`}>
                        {prediction.shortTermTrend === 'Rising' ? '▲' : prediction.shortTermTrend === 'Falling' ? '▼' : '≈'} 
                        {prediction.shortTermTrend}
                      </div>
                      <div className="px-4 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                        {prediction.confidence * 100}% Confidence
                      </div>
                    </div>
                    
                    <p className="text-sm md:text-base text-slate-300 leading-relaxed mb-8 font-medium">
                      {prediction.forecastText}
                    </p>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Potential Peak</div>
                        <div className="text-2xl font-black">₹{prediction.predictedMax || Math.floor(selectedCrop.price * 1.05)}</div>
                      </div>
                      <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Key Drivers</div>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {prediction.factors?.slice(0, 2).map((f: string, i: number) => (
                            <span key={i} className="text-[9px] font-bold text-orange-200">{f}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-slate-500 italic">Select a crop to see AI-driven forecasting.</p>
                )}
              </div>
              <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[80px]"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-green-500/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[60px]"></div>
            </div>

            {/* Quick Actions / Comparison */}
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-xl flex flex-col justify-center gap-6">
              <div className="text-center">
                <h4 className="text-lg font-black text-slate-800 mb-2">Multi-Mandi Comparison</h4>
                <p className="text-xs text-slate-500 font-medium">Compare {selectedCrop.crop} rates across 5 nearest Mandis</p>
              </div>
              
              <div className="space-y-3">
                <CompareMiniItem name="Azadpur, DL" price={selectedCrop.price + 40} diff="+ ₹40" isPlus />
                <CompareMiniItem name="Khanna, PB" price={selectedCrop.price - 20} diff="- ₹20" />
                <CompareMiniItem name="Kota, RJ" price={selectedCrop.price + 15} diff="+ ₹15" isPlus />
              </div>

              <button className="w-full py-4 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95">
                Full Comparison Tool
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CompareMiniItem: React.FC<{ name: string, price: number, diff: string, isPlus?: boolean }> = ({ name, price, diff, isPlus }) => (
  <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
    <div>
      <div className="text-[10px] font-black text-slate-800">{name}</div>
      <div className="text-xs font-bold text-slate-400">₹{price}</div>
    </div>
    <div className={`text-[10px] font-black ${isPlus ? 'text-green-600' : 'text-red-500'}`}>
      {diff}
    </div>
  </div>
);

export default Prices;
