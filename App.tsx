
import React, { useState, useEffect, useRef } from 'react';
import Home from './pages/Home';
import Market from './pages/Market';
import Prices from './pages/Prices';
import Labor from './pages/Labor';
import Equipment from './pages/Equipment';
import AIAssistant from './pages/AIAssistant';
import Schemes from './pages/Schemes';
import Community from './pages/Community';
import Experts from './pages/Experts';
import Retailers from './pages/Retailers';
import Profile from './pages/Profile';
import Auth from './pages/Auth';
import Raksha from './pages/Raksha';
import { UserProfile, Language, AgriAlert } from './types';
import { MOCK_ALERTS } from './constants';
import { fetchRealTimeThreats } from './services/geminiService';

export const LANGUAGES: { name: string, value: Language }[] = [
  { name: 'English', value: 'English' },
  { name: 'Hindi (हिंदी)', value: 'Hindi' },
  { name: 'Gujarati (ગુજરાતી)', value: 'Gujarati' },
];

const TRANSLATIONS: Record<string, Record<string, string>> = {
  English: { raksha: 'Raksha Alert', prices: 'Prices', market: 'Market', experts: 'Experts', community: 'Community', aiTools: 'AI Tools', signIn: 'Sign In', home: 'Home', labor: 'Labor', rentals: 'Rentals', shops: 'Shops', schemes: 'Schemes', profile: 'Profile', india: 'INDIA', you: 'You' },
  Hindi: { raksha: 'रक्षा अलर्ट', prices: 'कीमतें', market: 'बाज़ार', experts: 'विशेषज्ञ', community: 'समुदाय', aiTools: 'AI उपकरण', signIn: 'लॉग इन', home: 'होम', labor: 'मजदूर', rentals: 'किराया', shops: 'દુકુાનેં', schemes: 'योजनाएं', profile: 'प्रोफ़ाइल', india: 'भारत', you: 'आप' },
  Gujarati: { raksha: 'રક્ષા એલર્ટ', prices: 'કિંમતો', market: 'બજાર', experts: 'નિષ્ણાતો', community: 'સમુદાય', aiTools: 'AI સાધનો', signIn: 'લોગ ઇન', home: 'હોમ', labor: 'મજૂર', rentals: 'ભાડા', shops: 'દુકાનો', schemes: 'યોજનાઓ', profile: 'પ્રોફાઇલ', india: 'ભારત', you: 'તમે' }
};

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<string>('home');
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [showPermissions, setShowPermissions] = useState(false);
  const [language, setLanguage] = useState<Language>('Hindi');
  const [agreementAccepted, setAgreementAccepted] = useState(false);

  // KRAS Emergency States
  const [activeAlert, setActiveAlert] = useState<AgriAlert | null>(null);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const acknowledgedAlertIds = useRef<Set<string>>(new Set());
  const sirenAudioRef = useRef<HTMLAudioElement | null>(null);
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
      setShowPermissions(true);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  // Proximity monitor for area-specific alerts
  useEffect(() => {
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition((pos) => {
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      }, (err) => console.warn("Location error:", err), { enableHighAccuracy: true });
      return () => navigator.geolocation.clearWatch(watchId);
    }
  }, []);

  // Core Real-time Protection Logic
  useEffect(() => {
    if (!showSplash && !showPermissions && userCoords) {
      const checkThreats = async () => {
        const { data } = await fetchRealTimeThreats(userCoords.lat, userCoords.lng);
        const targetAlert = data.find(alert => {
          if (!alert.isConfirmed) return false;
          // IMPORTANT: Check if we already acknowledged this specific alert to avoid annoying the farmer
          if (acknowledgedAlertIds.current.has(alert.id)) return false;

          const R = 6371;
          const dLat = (alert.latitude! - userCoords.lat) * Math.PI / 180;
          const dLon = (alert.longitude! - userCoords.lng) * Math.PI / 180;
          const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                    Math.cos(userCoords.lat * Math.PI / 180) * Math.cos(alert.latitude! * Math.PI / 180) * 
                    Math.sin(dLon/2) * Math.sin(dLon/2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
          const distance = R * c;
          return distance <= (alert.radius || 100); 
        });

        if (targetAlert) {
          setActiveAlert(targetAlert);
          setIsSirenActive(true);
          if (targetAlert.category === 'disaster' || targetAlert.severity === 'critical') {
            if (sirenAudioRef.current) {
              sirenAudioRef.current.volume = 1.0;
              sirenAudioRef.current.play().catch(() => {});
            }
            if ("vibrate" in navigator) {
              navigator.vibrate([1000, 500, 1000, 500, 2000, 1000]);
            }
          }
        }
      };
      const interval = setInterval(checkThreats, 45000);
      checkThreats();
      return () => clearInterval(interval);
    }
  }, [showSplash, showPermissions, userCoords]);

  const handleAcknowledgeSiren = () => {
    if (activeAlert) {
      acknowledgedAlertIds.current.add(activeAlert.id);
    }
    setIsSirenActive(false);
    if (sirenAudioRef.current) {
      sirenAudioRef.current.pause();
      sirenAudioRef.current.currentTime = 0;
    }
  };

  const navigate = (page: string) => {
    setCurrentPage(page);
    setIsMenuOpen(false);
    window.scrollTo(0, 0);
  };

  // Dynamic alert color based on category
  const getAlertPopColor = (category: string) => {
    switch (category) {
      case 'disaster': return 'bg-red-600 shadow-red-500/50';
      case 'weather': return 'bg-blue-600 shadow-blue-500/50';
      case 'pest': return 'bg-purple-600 shadow-purple-500/50';
      case 'disease': return 'bg-amber-600 shadow-amber-500/50';
      case 'market': return 'bg-emerald-600 shadow-emerald-500/50';
      default: return 'bg-slate-800 shadow-slate-500/50';
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'market': return <Market user={user} language={language} />;
      case 'prices': return <Prices language={language} />;
      case 'labor': return <Labor language={language} />;
      case 'equipment': return <Equipment language={language} />;
      case 'ai': return <AIAssistant language={language} />;
      case 'schemes': return <Schemes language={language} />;
      case 'community': return <Community language={language} />;
      case 'experts': return <Experts language={language} />;
      case 'retailers': return <Retailers language={language} />;
      case 'profile': return <Profile user={user} onLogout={() => setUser(null)} language={language} />;
      case 'auth': return <Auth onAuthSuccess={(u) => { setUser(u); navigate('home'); }} />;
      default: return <Home onNavigate={navigate} language={language} />;
    }
  };

  if (showSplash) {
    return (
      <div className="fixed inset-0 brand-gradient flex flex-col items-center justify-center text-white z-[9999]">
        <div className="text-6xl mb-4 animate-bounce"><i className="fas fa-leaf text-green-300"></i></div>
        <h1 className="text-4xl font-bold tracking-tighter uppercase">Krishi Connect</h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <audio ref={sirenAudioRef} src="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3" loop />

      {/* Side Navigation Drawer */}
      <div className={`fixed inset-0 z-[100] transition-opacity duration-300 ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsMenuOpen(false)}></div>
        <div className={`absolute top-0 right-0 bottom-0 w-72 bg-white shadow-2xl transition-transform duration-300 ease-out flex flex-col ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="brand-gradient p-8 text-white">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center"><i className="fas fa-tractor"></i></div>
              <span className="text-xl font-black uppercase tracking-tighter">Krishi Connect</span>
            </div>
            {user ? (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full border-2 border-white/30 overflow-hidden">
                  {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : <i className="fas fa-user text-2xl flex items-center justify-center h-full"></i>}
                </div>
                <div>
                  <div className="font-bold">{user.name}</div>
                  <div className="text-[10px] uppercase font-black opacity-70 tracking-widest">{user.role}</div>
                </div>
              </div>
            ) : (
              <button onClick={() => navigate('auth')} className="w-full py-3 bg-white text-green-800 rounded-xl font-bold text-xs uppercase tracking-widest active:scale-95 transition-all">{TRANSLATIONS[language].signIn}</button>
            )}
          </div>
          
          <div className="flex-grow py-6 overflow-y-auto">
            <MenuLink icon="fa-home" label={TRANSLATIONS[language].home} active={currentPage === 'home'} onClick={() => navigate('home')} />
            <MenuLink icon="fa-shield-virus" label={TRANSLATIONS[language].raksha} active={currentPage === 'raksha'} onClick={() => navigate('raksha')} isCritical />
            <MenuLink icon="fa-indian-rupee-sign" label={TRANSLATIONS[language].prices} active={currentPage === 'prices'} onClick={() => navigate('prices')} />
            <MenuLink icon="fa-shopping-cart" label={TRANSLATIONS[language].market} active={currentPage === 'market'} onClick={() => navigate('market')} />
            <MenuLink icon="fa-robot" label={TRANSLATIONS[language].aiTools} active={currentPage === 'ai'} onClick={() => navigate('ai')} />
            <MenuLink icon="fa-users" label={TRANSLATIONS[language].community} active={currentPage === 'community'} onClick={() => navigate('community')} />
            <div className="px-6 my-4"><div className="h-px bg-slate-100"></div></div>
            <MenuLink icon="fa-tractor" label={TRANSLATIONS[language].rentals} active={currentPage === 'equipment'} onClick={() => navigate('equipment')} />
            <MenuLink icon="fa-user-tie" label={TRANSLATIONS[language].experts} active={currentPage === 'experts'} onClick={() => navigate('experts')} />
            <MenuLink icon="fa-person-digging" label={TRANSLATIONS[language].labor} active={currentPage === 'labor'} onClick={() => navigate('labor')} />
            <MenuLink icon="fa-file-invoice" label={TRANSLATIONS[language].schemes} active={currentPage === 'schemes'} onClick={() => navigate('schemes')} />
            <MenuLink icon="fa-store" label={TRANSLATIONS[language].shops} active={currentPage === 'retailers'} onClick={() => navigate('retailers')} />
          </div>

          <div className="p-6 border-t mt-auto">
            <div className="mb-4">
              <div className="flex items-center gap-2 text-slate-400 mb-3">
                <i className="fas fa-language"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">Select Language</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.value}
                    onClick={() => setLanguage(lang.value)}
                    className={`flex-1 py-2 px-1 rounded-xl text-[10px] font-black uppercase tracking-tighter border-2 transition-all ${language === lang.value ? 'bg-green-50 border-green-600 text-green-800 shadow-sm' : 'bg-white border-slate-100 text-slate-400 hover:border-slate-200'}`}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>
            {user && (
              <button onClick={() => setUser(null)} className="w-full py-4 text-red-500 font-bold text-xs uppercase tracking-widest text-left flex items-center gap-3 active:bg-red-50 rounded-xl px-2 transition-colors">
                <i className="fas fa-sign-out-alt"></i> Sign Out
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KRAS Emergency Overlay (Dynamically Colored) */}
      {isSirenActive && activeAlert && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className={`w-full max-w-lg ${getAlertPopColor(activeAlert.category)} rounded-[2.5rem] p-6 md:p-10 text-center text-white shadow-2xl border border-white/20 animate-pulse`}>
            <div className="w-24 h-24 bg-white/20 backdrop-blur-3xl rounded-[2.5rem] flex items-center justify-center text-5xl mx-auto mb-8 shadow-2xl border border-white/40">
               <i className={`fas ${activeAlert.category === 'disaster' ? 'fa-house-crack' : activeAlert.category === 'weather' ? 'fa-cloud-bolt' : activeAlert.category === 'pest' ? 'fa-bug' : 'fa-triangle-exclamation'}`}></i>
            </div>
            <h2 className="text-4xl font-black mb-2 tracking-tighter uppercase leading-none">
              {activeAlert.category === 'disaster' ? 'ખતરો! (Danger Alert)' : 'મહત્વપૂર્ણ સૂચના'}
            </h2>
            <p className="text-lg font-bold mb-6 bg-white text-slate-900 px-6 py-2 rounded-full inline-block uppercase border-2 border-black/5">
              {activeAlert.category.toUpperCase()} NEWS
            </p>
            <div className="bg-black/50 p-6 rounded-3xl border border-white/20 mb-8 max-h-[40vh] overflow-y-auto no-scrollbar text-left">
               <h3 className="text-2xl font-black mb-4">{activeAlert.title}</h3>
               <p className="text-base opacity-90 font-medium mb-6 leading-relaxed">{activeAlert.description}</p>
               <div className="bg-white/20 p-4 rounded-2xl border border-white/10">
                 <h4 className="text-[10px] font-black uppercase text-yellow-300 mb-3 flex items-center gap-2"><i className="fas fa-lightbulb"></i> સમાધાન (Solutions):</h4>
                 <ul className="space-y-2">
                   {activeAlert.actions.map((action, i) => (
                     <li key={i} className="text-sm font-bold flex gap-3"><span className="text-white/60">●</span> {action}</li>
                   ))}
                 </ul>
               </div>
            </div>
            <div className="flex flex-col gap-3">
               <button onClick={() => { handleAcknowledgeSiren(); navigate('raksha'); }} className="w-full py-5 bg-white text-slate-900 rounded-2xl font-black text-lg uppercase tracking-tight shadow-xl active:scale-95 transition-all">View Protective Plan</button>
               <button onClick={handleAcknowledgeSiren} className="py-2 text-white/50 font-black text-[10px] uppercase tracking-widest hover:text-white">Acknowledge & Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Screen */}
      {!isSirenActive && showPermissions && (
        <div className="fixed inset-0 bg-white flex flex-col items-center justify-center p-8 z-[99] animate-in fade-in">
          <div className="w-24 h-24 bg-blue-50 text-blue-600 rounded-[2.5rem] flex items-center justify-center text-4xl mb-8 shadow-xl"><i className="fas fa-shield-halved"></i></div>
          <h2 className="text-3xl font-black mb-4 text-slate-800">Krishi Raksha Security</h2>
          <p className="text-slate-500 mb-8 max-w-sm text-center">To send you <span className="text-red-600 font-bold">verified local alerts</span> for disasters and crop threats, we need your precise location.</p>
          <label className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100 cursor-pointer mb-10 max-w-sm">
            <input type="checkbox" checked={agreementAccepted} onChange={(e) => setAgreementAccepted(e.target.checked)} className="mt-1 w-5 h-5 text-green-600 rounded" />
            <span className="text-xs font-bold text-slate-600">I allow Krishi Connect to monitor confirmed news for my area.</span>
          </label>
          <button onClick={() => agreementAccepted && setShowPermissions(false)} className={`w-full max-w-sm py-5 text-white rounded-2xl font-black transition-all ${agreementAccepted ? 'brand-gradient shadow-xl active:scale-95' : 'bg-slate-300'}`}>Activate Protection</button>
        </div>
      )}

      {/* Header exactly like the screenshot */}
      <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-slate-100 h-20">
        <div className="max-w-7xl mx-auto px-6 h-full flex items-center justify-between">
           <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('home')}>
             <div className="w-12 h-12 bg-[#2E7D32] rounded-xl flex items-center justify-center text-white shadow-md">
               <i className="fas fa-tractor text-xl"></i>
             </div>
             <div>
               <h1 className="text-2xl font-bold text-[#1B5E20] leading-none tracking-tight">Krishi Connect</h1>
               <div className="text-[10px] font-black text-[#E65100] mt-1 tracking-[0.2em]">{TRANSLATIONS[language].india}</div>
             </div>
           </div>

           <div className="flex items-center gap-6">
             <div className="hidden lg:flex items-center gap-8 mr-4">
               <button onClick={() => navigate('raksha')} className="text-xs font-black text-red-600 uppercase tracking-widest hover:opacity-70 transition-all flex items-center gap-2">
                 <span className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></span> {TRANSLATIONS[language].raksha}
               </button>
               <button onClick={() => navigate('prices')} className="text-xs font-black text-slate-600 uppercase tracking-widest hover:text-green-600 transition-all">{TRANSLATIONS[language].prices}</button>
               <button onClick={() => navigate('market')} className="text-xs font-black text-slate-600 uppercase tracking-widest hover:text-green-600 transition-all">{TRANSLATIONS[language].market}</button>
               <button onClick={() => navigate('ai')} className="px-5 py-2 saffron-gradient text-white rounded-xl text-[10px] font-black shadow-md uppercase tracking-widest active:scale-95 transition-all">{TRANSLATIONS[language].aiTools}</button>
             </div>

             <button 
               onClick={() => setIsMenuOpen(true)} 
               className="w-10 h-10 flex flex-col items-center justify-center gap-[5px] active:scale-90 transition-all"
               aria-label="Open Menu"
             >
                <div className="w-7 h-[3px] bg-slate-800 rounded-full"></div>
                <div className="w-7 h-[3px] bg-slate-800 rounded-full"></div>
                <div className="w-7 h-[3px] bg-slate-800 rounded-full"></div>
             </button>
           </div>
        </div>
      </header>

      <main className="flex-grow">
        {!showSplash && !showPermissions && (
          currentPage === 'raksha' ? <Raksha language={language} /> : renderPage()
        )}
      </main>
      
      {/* Mobile Nav Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 flex justify-around items-center z-50 lg:hidden">
        <NavBtn icon="fa-home" active={currentPage === 'home'} onClick={() => navigate('home')} />
        <NavBtn icon="fa-shopping-cart" active={currentPage === 'market'} onClick={() => navigate('market')} />
        <NavBtn icon="fa-robot" active={currentPage === 'ai'} onClick={() => navigate('ai')} />
        <NavBtn icon="fa-vial-circle-check" active={currentPage === 'retailers'} onClick={() => navigate('retailers')} />
        <NavBtn icon="fa-user" active={currentPage === 'profile' || currentPage === 'auth'} onClick={() => user ? navigate('profile') : navigate('auth')} />
      </nav>
    </div>
  );
};

const MenuLink: React.FC<{ icon: string, label: string, active: boolean, onClick: () => void, isCritical?: boolean }> = ({ icon, label, active, onClick, isCritical }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 px-8 py-4 transition-all rounded-xl ${active ? 'bg-green-50 border-r-4 border-green-600 text-green-800' : 'text-slate-600 hover:bg-slate-50'}`}
  >
    <div className={`w-8 flex justify-center text-lg ${active ? 'text-green-600' : isCritical ? 'text-red-500' : 'text-slate-400'}`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <span className={`text-sm font-bold ${active ? 'font-black' : ''}`}>{label}</span>
    {isCritical && <span className="ml-auto w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
  </button>
);

const NavBtn: React.FC<{ icon: string, active: boolean, onClick: () => void }> = ({ icon, active, onClick }) => (
  <button onClick={onClick} className={`text-xl transition-all ${active ? 'text-green-600 scale-110' : 'text-slate-400'}`}>
    <i className={`fas ${icon}`}></i>
  </button>
);

export default App;
