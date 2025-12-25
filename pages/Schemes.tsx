
import React, { useState } from 'react';
import { MOCK_SCHEMES } from '../constants';
import { Scheme, Language, CSCCentre, AgriOfficer, BankManager } from '../types';
import { searchAgriExperts } from '../services/geminiService';

const MOCK_TRACKING_DATA: Record<string, { scheme: string; status: string; date: string; stage: number; notes: string }> = {
  'KC-101': {
    scheme: 'PM-KISAN',
    status: 'Payment Disbursed',
    date: 'Oct 24, 2023',
    stage: 4,
    notes: 'Amount of ₹2000 credited to linked bank account ending in 4421.'
  },
  'KC-202': {
    scheme: 'Fasal Bima Yojana',
    status: 'Under Verification',
    date: 'Jan 12, 2024',
    stage: 2,
    notes: 'Local revenue officer is verifying the crop loss survey report.'
  },
  'KC-303': {
    scheme: 'Soil Health Card',
    status: 'Document Pending',
    date: 'Feb 05, 2024',
    stage: 1,
    notes: 'Please upload a clear photo of your land record (Jamabandi).'
  }
};

const Schemes: React.FC<{ language: Language }> = ({ language }) => {
  const [activeModal, setActiveModal] = useState<'eligibility' | 'csc' | 'tracking' | 'officer' | 'bank' | 'callback' | 'csc_register' | null>(null);
  const [selectedScheme, setSelectedScheme] = useState<Scheme | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<{ eligible: boolean; reason: string } | null>(null);
  
  // Tracking states
  const [trackIdInput, setTrackIdInput] = useState('');
  const [trackingResult, setTrackingResult] = useState<typeof MOCK_TRACKING_DATA[string] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  // Help Search states
  const [locationQuery, setLocationQuery] = useState('');
  const [isSearchingHelp, setIsSearchingHelp] = useState(false);
  const [cscResults, setCscResults] = useState<CSCCentre[]>([]);
  const [officerResults, setOfficerResults] = useState<AgriOfficer[]>([]);
  const [bankResults, setBankManagerResults] = useState<BankManager[]>([]);
  const [helpSources, setHelpSources] = useState<any[]>([]);

  // CSC Registration state
  const [isSubmittingReg, setIsSubmittingReg] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [certificatePreview, setCertificatePreview] = useState<string | null>(null);

  const handleHelpSearch = async (type: 'csc' | 'officer' | 'bank') => {
    if (!locationQuery.trim()) {
      alert("Please enter a location (e.g. Karnal, Haryana)");
      return;
    }
    setIsSearchingHelp(true);
    const { data, sources } = await searchAgriExperts(type, locationQuery);
    
    if (type === 'csc') setCscResults(data);
    else if (type === 'officer') setOfficerResults(data);
    else if (type === 'bank') setBankManagerResults(data);
    
    setHelpSources(sources);
    setIsSearchingHelp(false);
  };

  const openEligibilityChecker = (scheme: Scheme) => {
    setSelectedScheme(scheme);
    setEligibilityResult(null);
    setActiveModal('eligibility');
  };

  const handleTrackStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setTrackingResult(null);
    
    setTimeout(() => {
      const result = MOCK_TRACKING_DATA[trackIdInput.toUpperCase()];
      setTrackingResult(result || null);
      setIsSearching(false);
    }, 800);
  };

  const handleEligibilitySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const landSize = parseFloat(formData.get('landSize') as string);
    const state = formData.get('state') as string;
    
    if (selectedScheme) {
      const minLand = selectedScheme.eligibilityCriteria.minLandSize || 0;
      const allowedStates = selectedScheme.eligibilityCriteria.states || [];
      
      const isStateValid = allowedStates.includes('All States') || allowedStates.includes(state);
      const isLandValid = landSize >= minLand;

      if (isStateValid && isLandValid) {
        setEligibilityResult({ 
          eligible: true, 
          reason: `Verification Successful! Your location (${state}) and landholding (${landSize} acres) meet the official guidelines for ${selectedScheme.title}.` 
        });
      } else if (!isStateValid) {
        setEligibilityResult({ 
          eligible: false, 
          reason: `This scheme is currently not active in ${state}. It is primarily available in: ${allowedStates.join(', ')}.` 
        });
      } else {
        setEligibilityResult({ 
          eligible: false, 
          reason: `The minimum landholding required for this scheme is ${minLand} acres. You entered ${landSize} acres.` 
        });
      }
    }
  };

  const handleCSCRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReg(true);
    setTimeout(() => {
      setIsSubmittingReg(false);
      setRegSuccess(true);
    }, 1500);
  };

  const resetHelpData = () => {
    setLocationQuery('');
    setCscResults([]);
    setOfficerResults([]);
    setBankManagerResults([]);
    setHelpSources([]);
    setRegSuccess(false);
    setCertificatePreview(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 md:py-8 pb-24 md:pb-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 md:mb-12">
        <div className="max-w-xl">
          <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight">Govt Schemes & Subsidies</h1>
          <p className="text-slate-500 mt-1 md:mt-2 text-xs md:text-base font-medium">Direct official support and financial assistance for the Indian farming community.</p>
        </div>
        
        <div 
          onClick={() => setActiveModal('tracking')}
          className="bg-indigo-50 border border-indigo-100 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-4 md:gap-5 shadow-sm hover:shadow-md cursor-pointer transition-all active:scale-95 group w-full md:w-auto"
        >
          <div className="w-10 h-10 md:w-14 md:h-14 bg-indigo-600 rounded-xl md:rounded-2xl flex items-center justify-center text-white text-lg md:text-2xl shadow-lg shadow-indigo-200 group-hover:bg-indigo-700 transition-colors shrink-0">
            <i className="fas fa-file-invoice"></i>
          </div>
          <div className="flex-grow">
            <div className="text-[9px] md:text-[10px] font-black text-indigo-400 uppercase tracking-widest leading-none mb-1">Application Tracking</div>
            <div className="text-xs md:text-sm font-bold text-indigo-900 underline">Check Your Status Online →</div>
          </div>
        </div>
      </div>

      {/* Schemes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mb-16">
        {MOCK_SCHEMES.map(scheme => (
          <div key={scheme.id} className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] border border-slate-100 shadow-lg hover:shadow-xl transition-all flex flex-col h-full group">
            <div className="flex justify-between items-start mb-4 md:mb-6 gap-3">
              <div className="flex-grow">
                <div className="flex flex-wrap gap-1.5 mb-2 md:mb-3">
                  {scheme.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 bg-slate-50 text-slate-400 text-[8px] md:text-[9px] font-black rounded-md uppercase tracking-wider">{t}</span>
                  ))}
                </div>
                <h3 className="text-lg md:text-2xl font-black text-slate-800 mb-0.5 md:mb-1 leading-tight group-hover:text-green-600 transition-colors">{scheme.title}</h3>
                <span className="text-[9px] md:text-xs font-bold text-slate-400 uppercase tracking-widest">{scheme.dept}</span>
              </div>
              <div className="text-right shrink-0">
                <div className="text-green-600 font-black text-xs md:text-lg whitespace-nowrap">{scheme.benefit}</div>
              </div>
            </div>

            <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-6 md:mb-8 flex-grow">{scheme.desc}</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 mb-4 md:mb-6">
              <button 
                onClick={() => openEligibilityChecker(scheme)}
                className="py-3 px-4 bg-slate-900 text-white rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-slate-800"
              >
                <i className="fas fa-check-double"></i> Eligibility
              </button>
              <button 
                onClick={() => { setSelectedScheme(scheme); resetHelpData(); setActiveModal('csc'); }}
                className="py-3 px-4 border-2 border-indigo-100 text-indigo-600 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-bold uppercase tracking-widest active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-indigo-50"
              >
                <i className="fas fa-hands-helping"></i> Expert Help
              </button>
            </div>

            <a 
              href={scheme.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 md:py-4 saffron-gradient text-white rounded-xl md:rounded-2xl font-bold text-center shadow-lg active:scale-95 transition-all text-xs md:text-sm flex items-center justify-center gap-3"
            >
              Apply on Gov Website <i className="fas fa-external-link-alt text-[10px]"></i>
            </a>
          </div>
        ))}
      </div>

      {/* Application Guide Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-black text-slate-800 mb-8 text-center md:text-left uppercase tracking-tight">Step-by-Step Application Guide</h2>
        <div className="bg-white rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 shadow-xl border border-slate-100">
          <div className="space-y-12">
            <GuideStep num="1" title="Document Preparation" desc="Collect required documents: Aadhaar card, land records (7/12 extract), bank account details, and passport photos." />
            <GuideStep num="2" title="Scheme Selection" desc="Choose the appropriate scheme based on your needs (insurance, credit, or subsidy) and read criteria carefully." />
            <GuideStep num="3" title="Application Form" desc="Fill the application accurately. Double-check your bank details and Aadhaar number to ensure payment success." />
            <GuideStep num="4" title="Submission" desc="Submit at a designated office (CSC, Bank, or Agri Dept) or online. Always keep your acknowledgment receipt safe." />
            <GuideStep num="5" title="Follow-up" desc="Track your application status online using your ID. Promptly respond to any queries from verification officers." />
          </div>
        </div>
      </section>

      {/* Expert Connect Section */}
      <section className="mb-16">
        <h2 className="text-2xl font-black text-slate-800 mb-8 text-center md:text-left uppercase tracking-tight">Need Help? Connect with Experts</h2>
        <div className="bg-slate-900 rounded-[2rem] md:rounded-[3rem] p-8 md:p-12 text-white relative overflow-hidden shadow-2xl">
          <div className="relative z-10 grid md:grid-cols-3 gap-8">
            <ExpertHelpCard icon="fa-store" title="CSC Centers" desc="Find authorized Digital Seva Kendras for documentation and online submission in your tehsil." onClick={() => { resetHelpData(); setActiveModal('csc'); }} btnLabel="Search CSC Center" />
            <ExpertHelpCard icon="fa-user-tie" title="Agri Officers" desc="Locate Block or District Extension Officers for official verification and departmental advice." onClick={() => { resetHelpData(); setActiveModal('officer'); }} btnLabel="Find Agri Officer" />
            <ExpertHelpCard icon="fa-university" title="Bank Managers" desc="Connect with nodal officers for KCC, crop loans, and financial subsidies at your local bank." onClick={() => { resetHelpData(); setActiveModal('bank'); }} btnLabel="Find Bank Contact" />
          </div>
          
          <div className="relative z-10 mt-12 p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white text-xl">
                  <i className="fas fa-phone-volume"></i>
                </div>
                <div>
                  <div className="text-xs font-black text-green-400 uppercase tracking-widest">KrishiConnect Helpline</div>
                  <div className="text-2xl font-black">1800-123-4567</div>
                </div>
              </div>
              <button 
                onClick={() => { resetHelpData(); setActiveModal('csc_register'); }}
                className="px-6 py-3 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-500/30 transition-all flex items-center gap-2"
              >
                <i className="fas fa-id-badge"></i> Register Your CSC Centre
              </button>
            </div>
            <button onClick={() => setActiveModal('callback')} className="px-8 py-4 saffron-gradient text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl active:scale-95 transition-all">
              Request Callback
            </button>
          </div>

          <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
        </div>
      </section>

      {/* MODALS */}

      {/* CSC Registration Modal */}
      {activeModal === 'csc_register' && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-6 md:p-10 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            {!regSuccess ? (
              <>
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="font-black text-2xl text-slate-800">CSC Onboarding</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Authorized Network Registration</p>
                  </div>
                  <button onClick={() => setActiveModal(null)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400 hover:text-red-500 transition-colors"><i className="fas fa-times"></i></button>
                </div>

                <form onSubmit={handleCSCRegSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">CSC ID (VLE ID)</label>
                      <input type="text" required placeholder="e.g. 123456789012" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">VLE Name</label>
                      <input type="text" required placeholder="Name on Aadhaar" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Centre Name</label>
                      <input type="text" required placeholder="e.g. Digital Seva Kendra" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Phone Number</label>
                      <input type="tel" required placeholder="10-digit mobile" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">District</label>
                      <input type="text" required placeholder="Your District" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pincode</label>
                      <input type="text" required placeholder="e.g. 132001" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Full Centre Address</label>
                    <textarea required placeholder="House/Shop No, Street, Tehsil..." className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-sm h-24"></textarea>
                  </div>

                  <div className="p-6 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-3xl flex flex-col items-center justify-center gap-3 cursor-pointer hover:bg-indigo-100 transition-colors group relative">
                    <input type="file" required className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => setCertificatePreview(reader.result as string);
                        reader.readAsDataURL(file);
                      }
                    }} />
                    {certificatePreview ? (
                      <div className="text-center">
                        <i className="fas fa-file-check text-green-500 text-3xl mb-2"></i>
                        <div className="font-bold text-slate-700">Certificate Uploaded</div>
                      </div>
                    ) : (
                      <>
                        <i className="fas fa-cloud-upload-alt text-3xl text-indigo-300 group-hover:scale-110 transition-transform"></i>
                        <div className="text-center">
                          <div className="font-bold text-slate-700">Upload CSC Certificate</div>
                          <div className="text-[9px] text-slate-400 uppercase font-black tracking-widest mt-1">PDF or JPG (Max 5MB)</div>
                        </div>
                      </>
                    )}
                  </div>

                  <button 
                    type="submit" 
                    disabled={isSubmittingReg}
                    className="w-full py-5 saffron-gradient text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmittingReg ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check-circle"></i>}
                    Submit Registration
                  </button>
                </form>
              </>
            ) : (
              <div className="text-center py-12 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-8 shadow-xl shadow-green-50">
                  <i className="fas fa-check-circle"></i>
                </div>
                <h3 className="text-3xl font-black text-slate-800 mb-4">Application Sent!</h3>
                <p className="text-sm text-slate-500 font-medium mb-10 leading-relaxed px-6">
                  Thank you for joining the Krishi Connect expert network. We will verify your <strong>CSC ID</strong> against the central database. You will receive an approval notification within 24-48 hours.
                </p>
                <button 
                  onClick={() => { setActiveModal(null); setRegSuccess(false); }}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs active:scale-95 transition-all shadow-lg"
                >
                  Return to Portal
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CSC Search Help Modal */}
      {activeModal === 'csc' && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h3 className="font-black text-xl text-slate-800">Search CSC Centres</h3>
              <button onClick={() => setActiveModal(null)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400"><i className="fas fa-times"></i></button>
            </div>
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Enter Village / City / District..."
                className="flex-grow p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
              />
              <button 
                onClick={() => handleHelpSearch('csc')}
                disabled={isSearchingHelp}
                className="px-6 bg-slate-900 text-white rounded-2xl font-black shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isSearchingHelp ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {cscResults.length > 0 ? (
                cscResults.map(csc => (
                  <div key={csc.id} className="p-4 bg-slate-50 border border-slate-200 rounded-3xl hover:border-indigo-200 transition-all group">
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <div className="flex-grow">
                        <h4 className="font-black text-slate-800 group-hover:text-indigo-600 text-base leading-tight">{csc.name}</h4>
                        <div className="text-[10px] font-bold text-slate-400 uppercase">Operator: <span className="text-slate-600">{csc.operator}</span></div>
                      </div>
                      <span className="px-2 py-1 bg-white border border-slate-200 rounded-lg text-[10px] font-black text-slate-400 uppercase">{csc.distance || 'Near'}</span>
                    </div>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed"><i className="fas fa-map-marker-alt text-indigo-400 mr-2"></i>{csc.address}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-orange-400 text-xs font-bold"><i className="fas fa-star"></i> {csc.rating || '4.5'}</div>
                      <a href={`tel:${csc.phone}`} className="py-2.5 px-4 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95">Call Center</a>
                    </div>
                  </div>
                ))
              ) : !isSearchingHelp && (
                <div className="text-center py-12 text-slate-400">
                  <i className="fas fa-search-location text-4xl mb-4 opacity-20"></i>
                  <p className="font-bold">Search for real CSC details in any location.</p>
                </div>
              )}
              <HelpGroundingSources sources={helpSources} />
            </div>
          </div>
        </div>
      )}

      {/* Agri Officer Modal with Location Search */}
      {activeModal === 'officer' && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h3 className="font-black text-xl text-slate-800">Search Agri Officers</h3>
              <button onClick={() => setActiveModal(null)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400"><i className="fas fa-times"></i></button>
            </div>
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Enter Block / District / State..."
                className="flex-grow p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none text-sm"
              />
              <button 
                onClick={() => handleHelpSearch('officer')}
                disabled={isSearchingHelp}
                className="px-6 bg-slate-900 text-white rounded-2xl font-black shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isSearchingHelp ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {officerResults.length > 0 ? (
                officerResults.map(officer => (
                  <div key={officer.id} className="p-5 bg-slate-50 border border-slate-200 rounded-3xl hover:border-green-200 transition-all">
                    <h4 className="font-black text-slate-800 text-base leading-tight mb-1">{officer.name}</h4>
                    <div className="text-[10px] font-bold text-green-600 uppercase mb-2">{officer.designation}</div>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div><div className="text-[8px] font-black text-slate-400 uppercase mb-0.5">District</div><div className="text-xs font-bold text-slate-700">{officer.district}</div></div>
                      <div><div className="text-[8px] font-black text-slate-400 uppercase mb-0.5">Availability</div><div className="text-xs font-bold text-slate-700">{officer.availability}</div></div>
                    </div>
                    <a href={`tel:${officer.phone}`} className="w-full py-3 bg-green-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg active:scale-95">
                      <i className="fas fa-phone-alt"></i> Call Officer
                    </a>
                  </div>
                ))
              ) : !isSearchingHelp && (
                <div className="text-center py-12 text-slate-400">
                  <i className="fas fa-user-tie text-4xl mb-4 opacity-20"></i>
                  <p className="font-bold">Enter location to fetch govt officer contacts.</p>
                </div>
              )}
              <HelpGroundingSources sources={helpSources} />
            </div>
          </div>
        </div>
      )}

      {/* Bank Manager Modal with Location Search */}
      {activeModal === 'bank' && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6 flex-shrink-0">
              <h3 className="font-black text-xl text-slate-800">Agri-Bank Contacts</h3>
              <button onClick={() => setActiveModal(null)} className="w-10 h-10 rounded-full bg-slate-50 text-slate-400"><i className="fas fa-times"></i></button>
            </div>
            <div className="flex gap-2 mb-6">
              <input 
                type="text" 
                value={locationQuery}
                onChange={(e) => setLocationQuery(e.target.value)}
                placeholder="Enter City / Pincode / District..."
                className="flex-grow p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
              <button 
                onClick={() => handleHelpSearch('bank')}
                disabled={isSearchingHelp}
                className="px-6 bg-slate-900 text-white rounded-2xl font-black shadow-lg active:scale-95 disabled:opacity-50"
              >
                {isSearchingHelp ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-search"></i>}
              </button>
            </div>
            
            <div className="flex-grow overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {bankResults.length > 0 ? (
                bankResults.map(bm => (
                  <div key={bm.id} className="p-5 bg-slate-50 border border-slate-200 rounded-3xl hover:border-blue-200 transition-all flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 border border-slate-100 shrink-0 shadow-sm"><i className="fas fa-university text-xl"></i></div>
                    <div className="flex-grow min-w-0">
                      <h4 className="font-black text-slate-800 text-base leading-tight truncate">{bm.name}</h4>
                      <div className="text-[10px] font-bold text-blue-600 uppercase mb-0.5">{bm.bank}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase truncate">{bm.branch} • {bm.specialization}</div>
                      <div className="mt-2"><a href={`tel:${bm.phone}`} className="text-xs font-black text-slate-900 hover:text-blue-600"><i className="fas fa-phone-alt mr-1"></i> {bm.phone}</a></div>
                    </div>
                  </div>
                ))
              ) : !isSearchingHelp && (
                <div className="text-center py-12 text-slate-400">
                  <i className="fas fa-university text-4xl mb-4 opacity-20"></i>
                  <p className="font-bold">Find Nodal Agri-Loan Managers near you.</p>
                </div>
              )}
              <HelpGroundingSources sources={helpSources} />
            </div>
          </div>
        </div>
      )}

      {/* Callback Modal */}
      {activeModal === 'callback' && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-20 h-20 bg-green-50 text-green-600 rounded-[1.5rem] flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl shadow-green-50">
              <i className="fas fa-phone-volume"></i>
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">Request Callback</h3>
            <p className="text-xs text-slate-500 font-medium mb-8 leading-relaxed">Our verified agents will call you to provide free guidance on scheme applications within 2 hours.</p>
            
            <form className="space-y-4 text-left" onSubmit={e => { e.preventDefault(); alert("Request Received! Our experts will call you shortly."); setActiveModal(null); }}>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Phone Number</label>
                <input type="tel" required placeholder="9876543210" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none text-sm" />
              </div>
              <button type="submit" className="w-full py-4 saffron-gradient text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest mt-2">
                Submit Request
              </button>
              <button type="button" onClick={() => setActiveModal(null)} className="w-full text-[10px] font-black text-slate-300 uppercase tracking-widest py-2">Cancel</button>
            </form>
          </div>
        </div>
      )}

      {/* Tracking Modal */}
      {activeModal === 'tracking' && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6 md:mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 md:w-10 md:h-10 bg-indigo-100 text-indigo-600 rounded-lg md:rounded-xl flex items-center justify-center text-sm md:text-base">
                  <i className="fas fa-search-location"></i>
                </div>
                <h3 className="font-black text-lg md:text-xl text-slate-800">Track Application</h3>
              </div>
              <button onClick={() => { setActiveModal(null); setTrackingResult(null); setTrackIdInput(''); }} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-slate-900 transition-colors">
                <i className="fas fa-times"></i>
              </button>
            </div>

            <form onSubmit={handleTrackStatus} className="mb-6 md:mb-8">
              <label className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 md:mb-3">Application ID / Reference No.</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={trackIdInput}
                  onChange={(e) => setTrackIdInput(e.target.value)}
                  placeholder="e.g. KC-101"
                  className="flex-grow p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl font-bold focus:ring-2 focus:ring-indigo-500 outline-none uppercase text-xs md:text-sm"
                  required
                />
                <button 
                  type="submit" 
                  disabled={isSearching}
                  className="px-4 md:px-6 bg-slate-900 text-white rounded-xl md:rounded-2xl font-bold active:scale-95 transition-all disabled:opacity-50 text-xs md:text-sm"
                >
                  {isSearching ? <i className="fas fa-spinner fa-spin"></i> : 'Track'}
                </button>
              </div>
            </form>

            {trackingResult ? (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-slate-50 rounded-2xl md:rounded-3xl p-4 md:p-6 border border-slate-100 mb-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Scheme</div>
                      <div className="font-bold text-slate-800 text-xs md:text-base">{trackingResult.scheme}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</div>
                      <div className={`text-[9px] md:text-xs font-bold px-2 md:px-3 py-0.5 md:py-1 rounded-full ${
                        trackingResult.stage === 4 ? 'bg-green-100 text-green-700' : 
                        trackingResult.stage === 1 ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {trackingResult.status}
                      </div>
                    </div>
                  </div>
                  <div className="text-[9px] md:text-[10px] text-slate-500 font-medium leading-relaxed bg-white p-3 rounded-xl border border-slate-100">
                    <i className="fas fa-info-circle text-indigo-400 mr-2"></i>
                    {trackingResult.notes}
                  </div>
                </div>

                <div className="px-2 md:px-4">
                  <h4 className="text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 md:mb-6">Journey Timeline</h4>
                  <div className="space-y-0 relative">
                    <div className="absolute left-[15px] md:left-[17px] top-0 bottom-0 w-0.5 bg-slate-100"></div>
                    <TimelineStep icon="fa-file-signature" label="Applied" date={trackingResult.date} active={trackingResult.stage >= 1} current={trackingResult.stage === 1} />
                    <TimelineStep icon="fa-search" label="Verification" date="Process" active={trackingResult.stage >= 2} current={trackingResult.stage === 2} />
                    <TimelineStep icon="fa-check-circle" label="Approval" date="Pending" active={trackingResult.stage >= 3} current={trackingResult.stage === 3} />
                    <TimelineStep icon="fa-money-bill-wave" label="Payment" date="End" active={trackingResult.stage >= 4} current={trackingResult.stage === 4} last />
                  </div>
                </div>
              </div>
            ) : trackIdInput && !isSearching && (
              <div className="text-center py-8 md:py-12 bg-slate-50 rounded-2xl md:rounded-3xl border border-dashed border-slate-200">
                <i className="fas fa-search text-3xl text-slate-300 mb-4 opacity-50"></i>
                <h4 className="font-bold text-slate-600 text-sm md:text-base">No application found</h4>
                <p className="text-[10px] md:text-xs text-slate-400 mt-1">Check ID and try again.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Eligibility Modal */}
      {activeModal === 'eligibility' && selectedScheme && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2rem] p-6 md:p-8 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-black text-lg md:text-xl text-slate-800">Eligibility Wizard</h3>
              <button onClick={() => setActiveModal(null)} className="p-2"><i className="fas fa-times text-slate-400"></i></button>
            </div>
            
            {!eligibilityResult ? (
              <form onSubmit={handleEligibilitySubmit} className="space-y-4 md:space-y-5">
                <p className="text-[10px] md:text-xs text-slate-400 font-bold uppercase tracking-widest leading-tight">Scheme: {selectedScheme.title}</p>
                <div>
                  <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Select State</label>
                  <select name="state" className="w-full p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none text-xs md:text-sm">
                    <option value="Haryana">Haryana</option>
                    <option value="Punjab">Punjab</option>
                    <option value="Maharashtra">Maharashtra</option>
                    <option value="Rajasthan">Rajasthan</option>
                    <option value="Gujarat">Gujarat</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Land Area (Acres)</label>
                  <input name="landSize" type="number" step="0.1" required placeholder="e.g. 5.5" className="w-full p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none text-xs md:text-sm" />
                </div>
                <div>
                  <label className="block text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 md:mb-2">Category</label>
                  <select name="category" className="w-full p-3 md:p-4 bg-slate-50 border border-slate-200 rounded-xl md:rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none text-xs md:text-sm">
                    <option>Marginal (Below 1 Ha)</option>
                    <option>Small (1-2 Ha)</option>
                    <option>Large (Above 2 Ha)</option>
                  </select>
                </div>
                <button type="submit" className="w-full py-4 md:py-5 saffron-gradient text-white rounded-xl md:rounded-2xl font-bold shadow-xl active:scale-95 transition-all text-xs md:text-sm">
                  Run Check
                </button>
              </form>
            ) : (
              <div className="text-center animate-in fade-in duration-500">
                <div className={`w-12 h-12 md:w-16 md:h-16 mx-auto rounded-full flex items-center justify-center text-2xl md:text-3xl mb-4 md:mb-6 ${eligibilityResult.eligible ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                  <i className={`fas ${eligibilityResult.eligible ? 'fa-check-circle' : 'fa-times-circle'}`}></i>
                </div>
                <h4 className={`text-lg md:text-xl font-black mb-3 md:mb-4 ${eligibilityResult.eligible ? 'text-green-800' : 'text-red-800'}`}>
                  {eligibilityResult.eligible ? 'Eligible' : 'Not Eligible'}
                </h4>
                <p className="text-slate-600 text-xs md:text-sm leading-relaxed mb-6 md:mb-8">{eligibilityResult.reason}</p>
                <div className="flex flex-col gap-2 md:gap-3">
                  {eligibilityResult.eligible && (
                    <a href={selectedScheme?.officialUrl} target="_blank" className="w-full py-3 md:py-4 saffron-gradient text-white rounded-xl md:rounded-2xl font-bold text-xs md:text-sm">Apply Now</a>
                  )}
                  <button onClick={() => setEligibilityResult(null)} className="text-slate-400 font-bold uppercase text-[9px] md:text-xs hover:text-slate-600 p-2">Re-check</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const HelpGroundingSources: React.FC<{ sources: any[] }> = ({ sources }) => {
  if (sources.length === 0) return null;
  return (
    <div className="mt-8 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
      <h5 className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Sourced from Official Databases</h5>
      <div className="space-y-2">
        {sources.map((source, idx) => (
          source.web && (
            <a 
              key={idx} 
              href={source.web.uri} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 p-2 hover:bg-white rounded-lg transition-colors group"
            >
              <i className="fas fa-link text-[10px] text-indigo-400"></i>
              <span className="text-[10px] font-bold text-indigo-600 group-hover:underline truncate">
                {source.web.title || source.web.uri}
              </span>
            </a>
          )
        ))}
      </div>
    </div>
  );
};

const TimelineStep: React.FC<{ icon: string; label: string; date: string; active: boolean; current: boolean; last?: boolean }> = ({ icon, label, date, active, current, last }) => (
  <div className={`flex gap-3 md:gap-6 pb-4 md:pb-6 ${last ? 'pb-0' : ''}`}>
    <div className={`relative z-10 w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-[10px] md:text-xs transition-colors shadow-sm shrink-0 ${
      current ? 'bg-indigo-600 text-white scale-110 shadow-indigo-100' : 
      active ? 'bg-green-500 text-white' : 'bg-white text-slate-300 border border-slate-200'
    }`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="flex-grow pt-0.5">
      <div className={`font-bold text-[10px] md:text-sm leading-none mb-1 ${active ? 'text-slate-800' : 'text-slate-300'}`}>{label}</div>
      <div className={`text-[8px] md:text-[10px] font-medium leading-none ${current ? 'text-indigo-600' : 'text-slate-400'}`}>{date}</div>
    </div>
  </div>
);

const GuideStep: React.FC<{ num: string; title: string; desc: string }> = ({ num, title, desc }) => (
  <div className="flex gap-6 items-start relative group">
    <div className="w-10 h-10 md:w-14 md:h-14 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-lg md:text-2xl font-black shadow-lg shrink-0 group-hover:bg-green-600 transition-colors z-10">
      {num}
    </div>
    <div>
      <h3 className="text-base md:text-lg font-black text-slate-800 mb-1">{title}</h3>
      <p className="text-xs md:text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  </div>
);

const ExpertHelpCard: React.FC<{ icon: string; title: string; desc: string; onClick: () => void; btnLabel: string }> = ({ icon, title, desc, onClick, btnLabel }) => (
  <div className="p-6 bg-white/5 border border-white/10 rounded-3xl hover:bg-white/10 transition-colors flex flex-col h-full">
    <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-xl flex items-center justify-center text-xl mb-4">
      <i className={`fas ${icon}`}></i>
    </div>
    <h4 className="font-bold text-white mb-2">{title}</h4>
    <p className="text-xs text-slate-400 leading-relaxed font-medium mb-6 flex-grow">{desc}</p>
    <button 
      onClick={onClick}
      className="w-full py-3 bg-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/20 active:scale-95 transition-all border border-white/5"
    >
      {btnLabel}
    </button>
  </div>
);

const BenefitItem: React.FC<{ icon: string; title: string; desc: string }> = ({ icon, title, desc }) => (
  <div className="text-center group">
    <div className="w-12 h-12 md:w-16 md:h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center text-xl md:text-2xl mx-auto mb-4 group-hover:bg-green-50 group-hover:text-green-600 transition-all shadow-inner">
      <i className={`fas ${icon}`}></i>
    </div>
    <h4 className="font-bold text-slate-800 mb-2">{title}</h4>
    <p className="text-[10px] md:text-xs text-slate-500 leading-relaxed font-medium px-4">{desc}</p>
  </div>
);

export default Schemes;
