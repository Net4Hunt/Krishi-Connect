
import React, { useState, useMemo, useRef } from 'react';
import { MOCK_WORKERS } from '../constants';
import { WorkerProfile, Language } from '../types';
import VerificationModal from '../components/VerificationModal';

interface LaborProps {
  language: Language;
}

const Labor: React.FC<LaborProps> = ({ language }) => {
  const [workers, setWorkers] = useState<WorkerProfile[]>(MOCK_WORKERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [skillFilter, setSkillFilter] = useState('All');
  const [selectedWorker, setSelectedWorker] = useState<WorkerProfile | null>(null);
  const [showBookingModal, setShowBookingModal] = useState<WorkerProfile | null>(null);
  const [activeTab, setActiveTab] = useState<'browse' | 'analytics' | 'emergency'>('browse');

  // Verification States
  const [verifyingPhone, setVerifyingPhone] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Registration States
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [regStep, setRegStep] = useState(1);
  const [regData, setRegData] = useState({
    name: '', skills: [] as string[], dailyRate: '', location: '', phone: '',
    idType: 'Aadhaar', idPhoto: null as string | null
  });

  const idInputRef = useRef<HTMLInputElement>(null);

  const skills = ['All', 'Harvesting', 'Plowing', 'Tractor Driver', 'Irrigation Expert', 'Organic Prep', 'Pruning', 'Sorting'];

  const filteredWorkers = useMemo(() => {
    return workers.filter(worker => {
      const matchesSearch = worker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            worker.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSkill = skillFilter === 'All' || worker.skills.includes(skillFilter);
      return matchesSearch && matchesSkill;
    });
  }, [searchQuery, skillFilter, workers]);

  const handleBooking = (worker: WorkerProfile) => {
    setPendingAction(() => () => {
      alert(`Booking confirmed for ${worker.name}! Worker notified and will call you shortly.`);
      setShowBookingModal(null);
    });
    setVerifyingPhone('9876543210'); 
  };

  const handleRegisterSubmit = () => {
    if (!regData.phone || regData.phone.length < 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }
    
    setPendingAction(() => () => {
      const newWorker: WorkerProfile = {
        id: `W-${Date.now()}`,
        name: regData.name,
        skills: regData.skills,
        dailyRate: Number(regData.dailyRate),
        location: regData.location,
        phone: regData.phone,
        rating: 5.0,
        distance: '0.5 km',
        available: true,
        isVerified: true,
        isCertified: false,
        trustScore: 100,
        gender: 'Male',
        languages: ['Hindi', 'English'],
        toolsOwned: [],
        tripsCompleted: 0
      };
      
      setWorkers(prev => [newWorker, ...prev]);
      setShowRegisterModal(false);
      setRegStep(1);
      setRegData({ name: '', skills: [], dailyRate: '', location: '', phone: '', idType: 'Aadhaar', idPhoto: null });
      alert("Registration Successful! You are now listed on Krishi Connect.");
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

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
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

      {/* Navigation Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Kisan Labor Connect</h1>
          <p className="text-slate-500 font-medium">Verified field hands and skilled machinery operators</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
          <div className="flex bg-slate-100 p-1.5 rounded-2xl shadow-inner">
            <button onClick={() => setActiveTab('browse')} className={`flex-1 md:px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'browse' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Browse</button>
            <button onClick={() => setActiveTab('analytics')} className={`flex-1 md:px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'analytics' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>Cost Calc</button>
            <button onClick={() => setActiveTab('emergency')} className={`flex-1 md:px-6 py-2.5 rounded-xl text-xs font-black uppercase transition-all ${activeTab === 'emergency' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>SOS Help</button>
          </div>
          <button onClick={() => setShowRegisterModal(true)} className="px-6 py-3 brand-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl active:scale-95 transition-all text-sm uppercase tracking-widest">
            <i className="fas fa-user-plus"></i> New Labor Registration
          </button>
        </div>
      </div>

      {activeTab === 'browse' && (
        <div className="grid md:grid-cols-4 gap-8">
          <aside className="space-y-8">
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Search</h4>
              <div className="relative mb-6">
                <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-300"></i>
                <input 
                  type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Worker or Village..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-green-500 text-sm"
                />
              </div>

              <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Skill Categories</h4>
              <div className="space-y-2">
                {skills.map(s => (
                  <button key={s} onClick={() => setSkillFilter(s)} className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${skillFilter === s ? 'bg-green-600 text-white shadow-lg' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>{s}</button>
                ))}
              </div>
            </div>
          </aside>

          <div className="md:col-span-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredWorkers.map(worker => (
                <div key={worker.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-2xl transition-all flex flex-col p-6 group">
                  <div className="flex justify-between items-start mb-6">
                    <div className="relative">
                      <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center border-4 border-white shadow-md text-slate-400">
                        <i className="fas fa-user-gear text-2xl"></i>
                      </div>
                      {worker.isVerified && <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white text-[8px]"><i className="fas fa-check"></i></div>}
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black text-slate-900 leading-none">₹{worker.dailyRate}</div>
                      <div className="text-[10px] text-slate-400 font-black uppercase mt-1">per 8 hrs</div>
                    </div>
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 leading-tight mb-2">{worker.name}</h3>
                  <div className="flex items-center gap-1.5 mb-4">
                    <i className="fas fa-location-dot text-orange-400 text-[10px]"></i>
                    <span className="text-[10px] font-bold text-slate-400">{worker.location} ({worker.distance})</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-6 flex-grow">
                    {worker.skills.map(s => <span key={s} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[8px] font-bold rounded-lg uppercase border border-slate-100">{s}</span>)}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-auto pt-4 border-t border-slate-50">
                    <button onClick={() => setShowBookingModal(worker)} disabled={!worker.available} className={`py-3.5 rounded-xl font-black text-[10px] uppercase shadow-md active:scale-95 transition-all ${worker.available ? 'bg-slate-900 text-white hover:bg-slate-800' : 'bg-slate-100 text-slate-300 cursor-not-allowed'}`}>Hire Now</button>
                    <button onClick={() => setSelectedWorker(worker)} className="py-3.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-[10px] uppercase hover:bg-slate-50 active:scale-95 transition-all">Profile</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'emergency' && (
        <div className="animate-in slide-in-from-top-4 duration-500 max-w-4xl mx-auto space-y-8">
          <div className="bg-red-50 rounded-[2.5rem] p-10 md:p-16 text-center border-2 border-dashed border-red-200 shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-24 h-24 saffron-gradient text-white rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-8 shadow-2xl animate-pulse">
                <i className="fas fa-tower-broadcast"></i>
              </div>
              <h2 className="text-3xl font-black text-red-900 mb-4 tracking-tight">Broadcast SOS Field Alert</h2>
              <p className="text-red-700/70 max-w-md mx-auto text-lg font-medium leading-relaxed mb-10">
                In case of injury, animal threat, or critical equipment failure, tap below to alert all verified community members within a 5KM radius.
              </p>
              <button 
                onClick={() => {
                  setPendingAction(() => () => alert("SOS BROADCASTED! High-priority alerts with your location have been sent to 12 nearby responders. Keep your phone line clear."));
                  setVerifyingPhone('9876543210');
                }} 
                className="px-12 py-6 bg-red-600 hover:bg-red-700 text-white rounded-[2rem] font-black shadow-[0_20px_50px_rgba(220,38,38,0.3)] active:scale-95 transition-all text-sm uppercase tracking-[0.2em] flex items-center justify-center gap-4 mx-auto"
              >
                <span className="w-3 h-3 bg-white rounded-full animate-ping"></span>
                Activate Emergency SOS
              </button>
            </div>
            <div className="absolute -bottom-10 -right-10 w-64 h-64 bg-red-100/50 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white rounded-[2.5rem] p-10 border border-slate-100 shadow-xl">
            <h3 className="text-xl font-black text-slate-800 mb-10 flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center"><i className="fas fa-shield-heart"></i></div>
              Emergency Response Protocol
            </h3>
            <div className="grid md:grid-cols-3 gap-10">
              <GuideStep icon="fa-map-location-dot" title="1. GPS Lock" desc="The system captures your exact field coordinates within 2 meters of accuracy to guide rescuers." />
              <GuideStep icon="fa-users-viewfinder" title="2. Peer Alert" desc="Every Krishi Connect user (Farmers, Workers, Officers) nearby receives a high-volume notification." />
              <GuideStep icon="fa-truck-medical" title="3. Live Help" desc="A direct calling line is established between you and the nearest available responder." />
            </div>
          </div>
        </div>
      )}

      {activeTab === 'analytics' && (
        <div className="animate-in fade-in duration-500 max-w-4xl mx-auto">
          <div className="bg-white rounded-[2.5rem] p-10 shadow-2xl border border-slate-100">
            <div className="flex items-center gap-5 mb-10">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-3xl">
                <i className="fas fa-calculator"></i>
              </div>
              <h2 className="text-2xl font-black text-slate-800">Labor Budget Calculator</h2>
            </div>
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Number of Workers</label>
                <input type="number" placeholder="e.g. 5" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block">Duration (Days)</label>
                <input type="number" placeholder="e.g. 3" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold" />
              </div>
            </div>
            <div className="bg-slate-900 p-10 rounded-[3rem] text-center shadow-xl">
              <div className="text-[10px] font-black text-blue-400 uppercase mb-2 tracking-[0.2em]">Estimated Outflow</div>
              <div className="text-5xl font-black text-white tracking-tighter">₹9,750</div>
              <p className="text-[10px] text-slate-500 mt-4 uppercase font-bold">Standardized for your district average</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Labor Registration */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Worker Onboarding</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized Profile Setup</p>
              </div>
              <button onClick={() => setShowRegisterModal(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><i className="fas fa-times"></i></button>
            </div>

            <div className="flex gap-2 mb-10">
              {[1, 2, 3].map(i => (
                <div key={i} className="flex-grow flex flex-col gap-2">
                  <div className={`h-1.5 rounded-full transition-all duration-500 ${regStep >= i ? 'brand-gradient' : 'bg-slate-100'}`}></div>
                  <span className={`text-[8px] font-black uppercase text-center ${regStep >= i ? 'text-green-600' : 'text-slate-300'}`}>Step {i}</span>
                </div>
              ))}
            </div>

            {regStep === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormInput label="Full Name" value={regData.name} onChange={v => setRegData({...regData, name: v})} placeholder="e.g. Balwinder Singh" />
                  <FormInput label="Mobile Number" value={regData.phone} onChange={v => setRegData({...regData, phone: v})} placeholder="9876543210" />
                </div>
                <FormInput label="Current Location (City/District)" value={regData.location} onChange={v => setRegData({...regData, location: v})} placeholder="e.g. Patiala, Punjab" />
                <div className="flex justify-end pt-6">
                  <button onClick={() => setRegStep(2)} className="px-10 py-5 brand-gradient text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Continue to Skills</button>
                </div>
              </div>
            )}

            {regStep === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <FormInput label="Daily Wage Rate (₹ / Day)" value={regData.dailyRate} onChange={v => setRegData({...regData, dailyRate: v})} placeholder="600" type="number" />
                
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-4 block ml-1">Select Your Specialties</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['Harvesting', 'Plowing', 'Organic Prep', 'Seed Sowing', 'Tractor Ops', 'Manual Lifting'].map(s => (
                      <button 
                        key={s} 
                        onClick={() => setRegData({...regData, skills: regData.skills.includes(s) ? regData.skills.filter(x => x !== s) : [...regData.skills, s]})} 
                        className={`p-4 rounded-xl text-[10px] font-bold uppercase border-2 transition-all text-left flex items-center justify-between ${
                          regData.skills.includes(s) ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-50 text-slate-400 bg-slate-50'
                        }`}
                      >
                        {s}
                        {regData.skills.includes(s) && <i className="fas fa-check-circle"></i>}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between pt-8 items-center">
                  <button onClick={() => setRegStep(1)} className="px-6 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-600">Back</button>
                  <button onClick={() => setRegStep(3)} className="px-10 py-5 brand-gradient text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Verify Documents</button>
                </div>
              </div>
            )}

            {regStep === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4">
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
                  <label className="text-[10px] font-black text-slate-400 uppercase mb-3 block">Document Type</label>
                  <select 
                    value={regData.idType} 
                    onChange={e => setRegData({...regData, idType: e.target.value})} 
                    className="w-full p-4 bg-white border border-slate-200 rounded-xl font-bold outline-none text-sm mb-6"
                  >
                    <option>Aadhaar Card</option>
                    <option>Driving License (HTV/LMV)</option>
                    <option>Voter ID</option>
                    <option>MGNREGA Job Card</option>
                  </select>
                  
                  <div 
                    onClick={() => idInputRef.current?.click()} 
                    className="p-10 border-2 border-dashed border-slate-200 rounded-[2rem] flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-slate-100 hover:border-blue-400 transition-all bg-white shadow-inner"
                  >
                    {regData.idPhoto ? (
                      <div className="text-center">
                        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
                          <i className="fas fa-file-shield"></i>
                        </div>
                        <div className="text-xs font-black text-slate-800 uppercase tracking-widest">Document Secured</div>
                        <div className="text-[9px] text-slate-400 font-bold mt-1">Tap to change file</div>
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-id-card text-4xl text-slate-200"></i>
                        <div className="text-center">
                          <div className="text-xs font-black text-slate-600 uppercase tracking-widest">Upload Front View</div>
                          <div className="text-[9px] text-slate-400 font-bold mt-1">Clear photo showing full name and number</div>
                        </div>
                      </>
                    )}
                  </div>
                  <input type="file" ref={idInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                </div>

                <div className="flex justify-between pt-8 items-center">
                  <button onClick={() => setRegStep(2)} className="px-6 py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest hover:text-slate-600">Back</button>
                  <button onClick={handleRegisterSubmit} className="px-10 py-5 saffron-gradient text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Submit & Verify OTP</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: Booking Confirmation */}
      {showBookingModal && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-20 h-20 brand-gradient text-white rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl">
              <i className="fas fa-calendar-check"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Confirm Hiring</h3>
            <p className="text-sm text-slate-500 mb-8">
              You are hiring <strong>{showBookingModal.name}</strong> for field work.
              The daily wage is ₹{showBookingModal.dailyRate}.
            </p>
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => handleBooking(showBookingModal)}
                className="w-full py-5 brand-gradient text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest"
              >
                Verify & Hire Worker
              </button>
              <button 
                onClick={() => setShowBookingModal(null)} 
                className="w-full py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Profile/Detail View Modal */}
      {selectedWorker && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-lg rounded-[3rem] overflow-hidden shadow-2xl relative">
              <button onClick={() => setSelectedWorker(null)} className="absolute top-6 right-6 w-10 h-10 bg-black/10 rounded-full text-white backdrop-blur-md flex items-center justify-center z-10"><i className="fas fa-times"></i></button>
              <div className="h-40 brand-gradient flex items-end justify-center pb-8">
                <div className="w-28 h-28 rounded-3xl border-4 border-white shadow-2xl bg-white overflow-hidden -mb-14 flex items-center justify-center text-slate-300">
                  <i className="fas fa-user-gear text-5xl"></i>
                </div>
              </div>
              <div className="pt-16 px-10 pb-10 text-center">
                <h3 className="text-2xl font-black text-slate-800 mb-1">{selectedWorker.name}</h3>
                <div className="text-[10px] font-black text-green-600 uppercase tracking-[0.2em] mb-6">{selectedWorker.location} • Verified Helper</div>
                
                <div className="grid grid-cols-3 gap-4 mb-8">
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Rating</div>
                     <div className="text-sm font-black text-slate-800">⭐ {selectedWorker.rating}</div>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Trips</div>
                     <div className="text-sm font-black text-slate-800">{selectedWorker.tripsCompleted || 0}+</div>
                   </div>
                   <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
                     <div className="text-[10px] font-black text-slate-400 uppercase mb-1">Wage</div>
                     <div className="text-sm font-black text-green-600">₹{selectedWorker.dailyRate}</div>
                   </div>
                </div>

                <div className="text-left mb-10">
                   <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Skillsets</h4>
                   <div className="flex flex-wrap gap-2">
                     {selectedWorker.skills.map(s => <span key={s} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold border border-slate-100">{s}</span>)}
                   </div>
                </div>

                <button onClick={() => { setSelectedWorker(null); setShowBookingModal(selectedWorker); }} className="w-full py-5 brand-gradient text-white rounded-2xl font-black shadow-xl uppercase text-xs active:scale-95 transition-all">Initiate Hiring</button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

const FormInput: React.FC<{ label: string, value: string, onChange: (v: string) => void, placeholder: string, type?: string }> = ({ label, value, onChange, placeholder, type = 'text' }) => (
  <div className="flex-grow">
    <label className="text-[10px] font-black text-slate-400 uppercase mb-2 block ml-1">{label}</label>
    <input type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none text-sm shadow-sm" />
  </div>
);

const GuideStep: React.FC<{ icon: string, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="text-center group">
    <div className="w-16 h-16 bg-slate-50 text-blue-500 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-sm border border-slate-100 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
      <i className={`fas ${icon}`}></i>
    </div>
    <h4 className="font-black text-slate-800 mb-3 uppercase text-sm tracking-tight">{title}</h4>
    <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
  </div>
);

export default Labor;
