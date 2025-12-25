
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { MOCK_EXPERTS } from '../constants';
import { Expert, Language } from '../types';
import { askKrishiAssistant } from '../services/geminiService';
import VerificationModal from '../components/VerificationModal';

interface Appointment {
  id: string;
  expertName: string;
  mode: string;
  date: string;
  time: string;
  status: 'Confirmed' | 'Pending' | 'Completed';
}

const Experts: React.FC<{ language: Language }> = ({ language }) => {
  const [experts, setExperts] = useState<Expert[]>(MOCK_EXPERTS);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [activeChatExpert, setActiveChatExpert] = useState<Expert | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  
  // Verification States
  const [verifyingPhone, setVerifyingPhone] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Registration States
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [regData, setRegData] = useState({
    name: '', title: '', specializations: [] as string[], phone: '',
    idType: 'License', idPhoto: null as string | null
  });

  const idInputRef = useRef<HTMLInputElement>(null);

  // Booking Flow States
  const [bookingStep, setBookingStep] = useState<'options' | 'schedule' | 'success'>('options');
  const [selectedMode, setSelectedMode] = useState<'chat' | 'video' | 'visit'>('chat');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedTime, setSelectedTime] = useState('10:00 AM');
  
  // Filters
  const [filterCrop, setFilterCrop] = useState('All');
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [activeTiers, setActiveTiers] = useState<number[]>([4, 3, 2, 1]);

  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Record<string, { role: 'user' | 'model', text: string, timestamp: string }[]>>({});
  const [isExpertTyping, setIsExpertTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeChatExpert) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [chatHistory, activeChatExpert]);

  const toggleTier = (tier: number) => {
    setActiveTiers(prev => 
      prev.includes(tier) ? prev.filter(t => t !== tier) : [...prev, tier]
    );
  };

  const filteredExperts = useMemo(() => {
    return experts.filter(expert => {
      const cropMatch = filterCrop === 'All' || expert.specializations.includes(filterCrop);
      const onlineMatch = !showOnlineOnly || expert.online;
      const tierMatch = activeTiers.includes(expert.tier);
      return cropMatch && onlineMatch && tierMatch;
    });
  }, [filterCrop, showOnlineOnly, activeTiers, experts]);

  const handleBookingConfirm = () => {
    if (!selectedExpert) return;

    setPendingAction(() => () => {
      const newAppointment: Appointment = {
        id: `KC-BOOK-${Math.floor(1000 + Math.random() * 9000)}`,
        expertName: selectedExpert.name,
        mode: selectedMode.toUpperCase(),
        date: selectedDate,
        time: selectedTime,
        status: 'Confirmed'
      };
      setAppointments([newAppointment, ...appointments]);
      setBookingStep('success');
    });
    setVerifyingPhone('9876543210'); 
  };

  const handleRegisterSubmit = () => {
    if (!regData.phone || regData.phone.length < 10) {
      alert("Enter a valid phone number.");
      return;
    }
    setPendingAction(() => () => {
      const newExpert: Expert = {
        id: `E-${Date.now()}`,
        name: regData.name,
        title: regData.title,
        tier: 2,
        specializations: regData.specializations,
        languages: ['Hindi', 'English'],
        rating: 5.0,
        reviewsCount: 0,
        sessionsCompleted: 0,
        hourlyRate: 300,
        avatar: '',
        bio: 'Professional agricultural specialist.',
        online: true
      };
      
      setExperts(prev => [newExpert, ...prev]);
      setShowRegisterModal(false);
      setRegStep(1);
      setRegData({ name: '', title: '', specializations: [], phone: '', idType: 'License', idPhoto: null });
      alert("Expert Registration Successful! Your profile is now live and under verification.");
    });
    setVerifyingPhone(regData.phone);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegData(prev => ({ ...prev, idPhoto: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const resetBooking = () => {
    setSelectedExpert(null);
    setBookingStep('options');
    setSelectedMode('chat');
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !activeChatExpert) return;

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const userMsg = { role: 'user' as const, text: chatInput, timestamp };
    
    setChatHistory(prev => ({
      ...prev,
      [activeChatExpert.id]: [...(prev[activeChatExpert.id] || []), userMsg]
    }));
    
    const currentInput = chatInput;
    setChatInput('');
    setIsExpertTyping(true);

    try {
      const expertPersonaPrompt = `You are ${activeChatExpert.name}, a ${activeChatExpert.title} specializing in ${activeChatExpert.specializations.join(', ')}. Respond as an expert. Language: ${language}. Query: ${currentInput}`;
      const response = await askKrishiAssistant(expertPersonaPrompt, language);
      const botMsg = { 
        role: 'model' as const, 
        text: response || "I'll check and get back to you.", 
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
      };
      setChatHistory(prev => ({
        ...prev,
        [activeChatExpert.id]: [...(prev[activeChatExpert.id] || []), botMsg]
      }));
    } catch (error) {
      console.error("Chat error:", error);
    } finally {
      setIsExpertTyping(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
      {verifyingPhone && (
        <VerificationModal 
          phone={verifyingPhone} 
          onSuccess={() => { 
            if (pendingAction) pendingAction();
            setVerifyingPhone(null); 
          }}
          onCancel={() => setVerifyingPhone(null)} 
        />
      )}

      {/* Dynamic Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Agri Experts Network</h1>
          <p className="text-slate-500 font-medium">Professional advice from verified Indian specialists</p>
        </div>
        <button onClick={() => setShowRegisterModal(true)} className="px-8 py-4 saffron-gradient text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center gap-3">
          <i className="fas fa-user-graduate"></i> Join as Expert
        </button>
      </div>

      <div className="flex overflow-x-auto no-scrollbar gap-2 mb-8 -mx-4 px-4">
        {['All', 'Rice', 'Wheat', 'Sugarcane', 'Cotton', 'Soil', 'Pest'].map(c => (
          <button 
            key={c}
            onClick={() => setFilterCrop(c)}
            className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border ${
              filterCrop === c ? 'bg-slate-900 text-white border-transparent shadow-md' : 'bg-white text-slate-500 border-slate-100'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-64 space-y-6 shrink-0">
          <div className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm">
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Availability</h4>
            <label className="flex items-center justify-between p-3.5 rounded-xl border border-slate-50 bg-slate-50/50 cursor-pointer mb-6">
              <div className="flex items-center gap-3">
                <input 
                  type="checkbox" 
                  checked={showOnlineOnly}
                  onChange={(e) => setShowOnlineOnly(e.target.checked)}
                  className="w-5 h-5 rounded-lg border-slate-200 text-green-600 focus:ring-green-500" 
                />
                <span className="text-xs font-bold text-slate-600">Online Experts</span>
              </div>
            </label>

            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Expert Tiers</h4>
            <div className="grid grid-cols-1 gap-2">
              <TierFilter label="Government" tier={4} active={activeTiers.includes(4)} onChange={() => toggleTier(4)} />
              <TierFilter label="Professional" tier={3} active={activeTiers.includes(3)} onChange={() => toggleTier(3)} />
              <TierFilter label="Master" tier={2} active={activeTiers.includes(2)} onChange={() => toggleTier(2)} />
            </div>
          </div>
        </aside>

        <div className="flex-grow">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredExperts.map(expert => (
              <div key={expert.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-md hover:shadow-xl transition-all group flex flex-col p-4 h-[190px] justify-between">
                <div className="flex justify-between items-start">
                  <div className="flex gap-3">
                    <div className="relative shrink-0">
                      <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100">
                        <i className="fas fa-user-tie text-xl"></i>
                      </div>
                      {expert.online && <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>}
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-800 leading-tight group-hover:text-green-600 transition-colors truncate max-w-[150px]">{expert.name}</h3>
                      <div className="text-[9px] text-slate-400 font-bold uppercase mt-0.5">{expert.title}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center gap-1 text-orange-400">
                          <i className="fas fa-star text-[9px]"></i>
                          <span className="text-[10px] font-black text-slate-700">{expert.rating}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={`text-[8px] font-black px-2 py-1 rounded-md text-white uppercase shrink-0 ${expert.tier === 4 ? 'bg-blue-600' : expert.tier === 3 ? 'bg-purple-600' : 'bg-orange-600'}`}>T{expert.tier}</div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-auto">
                  <button onClick={() => setActiveChatExpert(expert)} className="h-12 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 flex items-center justify-center gap-2"><i className="fas fa-comments"></i> Chat</button>
                  <button onClick={() => { setSelectedExpert(expert); setBookingStep('options'); }} className="h-12 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase active:scale-95 flex items-center justify-center gap-2"><i className="fas fa-calendar-day"></i> Book</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* MODAL: Expert Registration */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Expert Onboarding</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized Profile Setup</p>
              </div>
              <button onClick={() => setShowRegisterModal(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><i className="fas fa-times"></i></button>
            </div>

            <div className="flex gap-2 mb-10">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex-grow flex flex-col gap-2">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${regStep >= i ? 'brand-gradient' : 'bg-slate-100'}`}></div>
                  <span className={`text-[8px] font-black uppercase text-center ${regStep >= i ? 'text-green-600' : 'text-slate-300'}`}>Phase {i}</span>
                </div>
              ))}
            </div>

            {regStep === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Full Name" value={regData.name} onChange={v => setRegData({...regData, name: v})} placeholder="Dr. Balwinder" />
                  <FormInput label="Mobile Number" value={regData.phone} onChange={v => setRegData({...regData, phone: v})} placeholder="9876543210" />
                </div>
                <FormInput label="Professional Title" value={regData.title} onChange={v => setRegData({...regData, title: v})} placeholder="Senior Agronomist / Soil Scientist" />
                <div className="flex justify-end pt-6">
                  <button onClick={() => setRegStep(2)} className="px-10 py-5 brand-gradient text-white rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Next: Experience</button>
                </div>
              </div>
            )}

            {regStep === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-4 block ml-1">Specializations</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Paddy Expert', 'Soil Health', 'Pest Control', 'Drip Irrigation', 'Organic Bio', 'Mandi Trends'].map(s => (
                      <button key={s} onClick={() => setRegData({...regData, specializations: regData.specializations.includes(s) ? regData.specializations.filter(x => x !== s) : [...regData.specializations, s]})} className={`p-4 rounded-xl text-[10px] font-bold uppercase border-2 transition-all text-left flex items-center justify-between ${regData.specializations.includes(s) ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-50 text-slate-400 bg-slate-50'}`}>
                        {s} {regData.specializations.includes(s) && <i className="fas fa-check-circle"></i>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex justify-between pt-8 items-center">
                  <button onClick={() => setRegStep(1)} className="px-6 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Back</button>
                  <button onClick={() => setRegStep(3)} className="px-10 py-5 brand-gradient text-white rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Next: Verification</button>
                </div>
              </div>
            )}

            {regStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Identity / Degree Proof</label>
                  <div onClick={() => idInputRef.current?.click()} className="p-10 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-100 bg-white shadow-inner">
                    {regData.idPhoto ? <i className="fas fa-file-shield text-green-500 text-3xl"></i> : <i className="fas fa-id-card text-4xl text-slate-200"></i>}
                    <div className="text-center">
                      <div className="text-xs font-black text-slate-600 uppercase tracking-widest">{regData.idPhoto ? 'Document Loaded' : 'Upload Proof'}</div>
                      <div className="text-[9px] text-slate-400 font-bold mt-1">Aadhar / Degree / Govt ID</div>
                    </div>
                  </div>
                  <input type="file" ref={idInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>
                <div className="flex justify-between pt-8 items-center">
                  <button onClick={() => setRegStep(2)} className="px-6 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Back</button>
                  <button onClick={handleRegisterSubmit} className="px-10 py-5 saffron-gradient text-white rounded-2xl font-black uppercase text-xs shadow-xl active:scale-95 transition-all">Verify & Join</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedExpert && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 relative overflow-hidden max-h-[90vh] overflow-y-auto no-scrollbar">
            <button onClick={resetBooking} className="absolute top-8 right-8 text-slate-300 hover:text-slate-800 p-2"><i className="fas fa-times text-xl"></i></button>

            {bookingStep === 'options' && (
              <>
                <div className="text-center mb-8">
                  <h3 className="text-xl font-black text-slate-800 mb-1">Select Consultation</h3>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Pricing for {selectedExpert.name}</p>
                </div>
                
                <div className="space-y-3 mb-8">
                  <ConsultModeOption 
                    icon="fa-comment-dots" title="Quick Chat" desc="15 min Text Chat" 
                    price={selectedExpert.hourlyRate > 0 ? `₹${Math.floor(selectedExpert.hourlyRate * 0.3)}` : 'Free'}
                    active={selectedMode === 'chat'} onClick={() => setSelectedMode('chat')} 
                  />
                  <ConsultModeOption 
                    icon="fa-video" title="Video Call" desc="30 min face-to-face" 
                    price={selectedExpert.hourlyRate > 0 ? `₹${selectedExpert.hourlyRate}` : 'Free'}
                    active={selectedMode === 'video'} onClick={() => setSelectedMode('video')} 
                  />
                </div>

                <button onClick={() => setBookingStep('schedule')} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black shadow-xl text-xs uppercase tracking-widest">Proceed to Schedule</button>
              </>
            )}

            {bookingStep === 'schedule' && (
              <>
                <div className="text-center mb-8">
                  <h3 className="text-xl font-black text-slate-800 mb-1">Schedule Session</h3>
                </div>
                <div className="space-y-6 mb-8">
                  <input type="date" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-sm h-14" />
                  <div className="grid grid-cols-2 gap-2">
                    {['10:00 AM', '03:00 PM'].map(time => (
                      <button key={time} onClick={() => setSelectedTime(time)} className={`h-12 rounded-xl font-black text-[10px] border-2 transition-all ${selectedTime === time ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-50 text-slate-400 bg-slate-50'}`}>{time}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setBookingStep('options')} className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center"><i className="fas fa-arrow-left"></i></button>
                  <button onClick={handleBookingConfirm} className="flex-grow h-14 saffron-gradient text-white rounded-2xl font-black shadow-xl text-xs uppercase tracking-widest">Confirm Booking</button>
                </div>
              </>
            )}

            {bookingStep === 'success' && (
              <div className="text-center py-6">
                <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl"><i className="fas fa-check"></i></div>
                <h3 className="text-2xl font-black text-slate-800 mb-8">Success!</h3>
                <button onClick={resetBooking} className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs">Return to Network</button>
              </div>
            )}
          </div>
        </div>
      )}

      {activeChatExpert && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] h-[85vh] flex flex-col shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden">
            <div className="p-6 border-b flex items-center justify-between bg-white sticky top-0 z-10 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                  <i className="fas fa-user-tie"></i>
                </div>
                <h4 className="font-black text-slate-800 leading-none text-sm">{activeChatExpert.name}</h4>
              </div>
              <button onClick={() => setActiveChatExpert(null)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><i className="fas fa-times"></i></button>
            </div>
            <div className="flex-grow p-5 overflow-y-auto space-y-4 custom-scrollbar bg-slate-50/30">
              <div className="text-center py-12 px-6">
                <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Verified consultation in {language}</p>
              </div>
            </div>
            <div className="p-4 border-t flex gap-3 bg-white">
              <input type="text" value={chatInput} onChange={(e) => setChatInput(e.target.value)} placeholder={`Type in ${language}...`} className="flex-grow h-14 px-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none text-sm" />
              <button onClick={sendChatMessage} className="w-14 h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center active:scale-95"><i className="fas fa-paper-plane text-lg"></i></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const TierFilter: React.FC<{ label: string, tier: number, active: boolean, onChange: () => void }> = ({ label, tier, active, onChange }) => (
  <label className="flex items-center justify-between p-3 rounded-xl border-2 border-slate-50 bg-white hover:border-slate-100 cursor-pointer group transition-all shadow-sm">
    <div className="flex items-center gap-3">
      <input type="checkbox" checked={active} onChange={onChange} className="w-5 h-5 rounded-lg border-slate-300 text-green-600 focus:ring-green-500" />
      <span className="text-xs font-bold text-slate-600 group-hover:text-slate-900 transition-colors">{label}</span>
    </div>
    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black shadow-sm ${tier === 4 ? 'bg-blue-50 text-blue-600' : tier === 3 ? 'bg-purple-50 text-purple-600' : 'bg-orange-50 text-orange-600'}`}>T{tier}</div>
  </label>
);

const ConsultModeOption: React.FC<{ icon: string, title: string, desc: string, price: string, active: boolean, onClick: () => void }> = ({ icon, title, desc, price, active, onClick }) => (
  <div onClick={onClick} className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between text-left group ${active ? 'border-green-500 bg-green-50' : 'border-slate-50 bg-slate-50'}`}>
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl ${active ? 'bg-green-200 text-green-600' : 'bg-white text-slate-300'}`}><i className={`fas ${icon}`}></i></div>
      <div>
        <div className={`font-black text-xs mb-0.5 ${active ? 'text-slate-900' : 'text-slate-600'}`}>{title}</div>
        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{desc}</div>
      </div>
    </div>
    <div className={`font-black text-xs shrink-0 px-3 py-1.5 rounded-xl ${active ? 'bg-white text-green-700 shadow-sm' : 'text-slate-400'}`}>{price}</div>
  </div>
);

const FormInput: React.FC<{ label: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string }> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="flex-grow">
    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none text-sm shadow-sm" />
  </div>
);

export default Experts;
