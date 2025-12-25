
import React, { useState, useMemo } from 'react';
import { MOCK_RETAILERS } from '../constants';
// Added Language to imports
import { Retailer, Language } from '../types';

const GOVT_RATES = [
  { name: 'Urea (45kg Bag)', rate: 242.00, brand: 'IFFCO/KRIBHCO', subsidy: 'High' },
  { name: 'DAP (50kg Bag)', rate: 1350.00, brand: 'Various', subsidy: 'Moderate' },
  { name: 'NPK (12:32:16)', rate: 1470.00, brand: 'IFFCO', subsidy: 'Moderate' },
  { name: 'MOP (50kg Bag)', rate: 1700.00, brand: 'IPL', subsidy: 'Variable' },
];

// Updated component signature to accept language prop
const Retailers: React.FC<{ language: Language }> = ({ language }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState<Retailer | null>(null);
  
  // Registration form states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [regStatus, setRegStatus] = useState<'form' | 'waiting'>('form');
  const [licensePreview, setLicensePreview] = useState<string | null>(null);
  const [shopPhotoPreview, setShopPhotoPreview] = useState<string | null>(null);

  const brands = ['All', 'IFFCO', 'KRIBHCO', 'TATA Paras', 'Chambal', 'IPL', 'GSFC', 'Coromandel'];
  const indianStates = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", 
    "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", 
    "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", 
    "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", 
    "Uttarakhand", "West Bengal", "Delhi"
  ];

  const filteredRetailers = useMemo(() => {
    return MOCK_RETAILERS.filter(shop => {
      const matchesSearch = shop.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          shop.location.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesBrand = selectedBrand === 'All' || shop.brands.includes(selectedBrand);
      return matchesSearch && matchesBrand;
    });
  }, [searchQuery, selectedBrand]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'license' | 'photo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (type === 'license') setLicensePreview(reader.result as string);
        else setShopPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API delay for processing
    setTimeout(() => {
      setIsSubmitting(false);
      setRegStatus('waiting');
    }, 1500);
  };

  const resetModal = () => {
    setShowRegisterModal(false);
    setRegStatus('form');
    setLicensePreview(null);
    setShopPhotoPreview(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Page Header */}
      <div className="bg-emerald-900 rounded-[2.5rem] p-8 md:p-12 mb-10 text-white relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur rounded-full text-[10px] font-black uppercase tracking-widest mb-6">
            <i className="fas fa-shield-halved text-emerald-400"></i>
            Pan-India Verified License Holders
          </div>
          <h1 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Fertilizer Retailers</h1>
          <p className="text-emerald-100/70 text-sm md:text-lg mb-8 leading-relaxed font-medium">
            Authorized shops under the Department of Fertilizers. Register your business today to join India's largest agri-network.
          </p>
          
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-grow relative">
              <i className="fas fa-shop absolute left-5 top-1/2 -translate-y-1/2 text-emerald-800"></i>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search shop by name, APMC, or State..."
                className="w-full pl-14 pr-6 py-4 bg-white rounded-2xl text-emerald-900 outline-none focus:ring-2 focus:ring-emerald-400 font-bold placeholder:text-emerald-800/30 shadow-xl"
              />
            </div>
            <button className="px-10 py-4 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all">
              Nearby Shops
            </button>
          </div>

          <button 
            onClick={() => setShowRegisterModal(true)}
            className="flex items-center gap-3 bg-white/10 px-6 py-3 rounded-xl text-emerald-200 font-black text-xs uppercase tracking-widest hover:bg-white/20 hover:text-white transition-all border border-white/10"
          >
            <i className="fas fa-file-signature"></i> New Retailer Registration (All India)
          </button>
        </div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-[100px] translate-x-1/3 -translate-y-1/3"></div>
      </div>

      {/* How It Works Section */}
      <section className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-black text-slate-800 mb-2 uppercase tracking-tight">Government Portal Workflow</h2>
          <div className="w-16 h-1 bg-emerald-500 mx-auto rounded-full"></div>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <WorkStep num="1" title="Submit Credentials" desc="Register with your State/Center license, GST, and shop owner details." icon="fa-address-card" />
          <WorkStep num="2" title="Verification Window" desc="Wait for automated & manual check of your license against government databases." icon="fa-hourglass-half" />
          <WorkStep num="3" title="Live Listing" desc="Once approved, your shop becomes visible to thousands of farmers in your region." icon="fa-globe" />
        </div>
      </section>

      {/* Main Content Area */}
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Sidebar Filters & Govt Rates */}
        <div className="w-full lg:w-72 space-y-10">
          <div>
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Manufacturer Filter</h4>
            <div className="flex flex-wrap lg:flex-col gap-2">
              {brands.map(brand => (
                <button 
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-4 py-2.5 rounded-xl text-xs font-bold text-left transition-all border ${
                    selectedBrand === brand 
                    ? 'bg-emerald-600 text-white border-transparent shadow-lg shadow-emerald-100' 
                    : 'bg-white text-slate-600 border-slate-100 hover:border-emerald-200'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-slate-900 rounded-[2rem] p-6 text-white shadow-xl">
            <h4 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <i className="fas fa-tag"></i> Subsidized Rates
            </h4>
            <div className="space-y-4">
              {GOVT_RATES.map((item, idx) => (
                <div key={idx} className="border-b border-white/5 pb-3 last:border-0">
                  <div className="text-[10px] font-bold text-slate-400 truncate">{item.name}</div>
                  <div className="flex justify-between items-end">
                    <div className="text-sm font-black text-white">₹{item.rate.toFixed(2)}</div>
                    <div className="text-[8px] font-black text-emerald-500 uppercase tracking-tighter">Verified</div>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-6 text-[8px] text-slate-500 italic leading-relaxed">
              *Reporting price gouging is mandatory under Fertilizer Control Order 1985.
            </p>
          </div>
        </div>

        {/* Retailer Grid */}
        <div className="flex-grow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-slate-800">{filteredRetailers.length} Active Verified Retailers</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {filteredRetailers.map(shop => (
              <div key={shop.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg hover:shadow-xl transition-all group relative overflow-hidden flex flex-col">
                {shop.isVerified && (
                  <div className="absolute top-0 right-0 px-4 py-1.5 bg-emerald-600 text-white text-[9px] font-black uppercase tracking-widest rounded-bl-2xl">
                    <i className="fas fa-check-circle mr-1"></i> Active LIC
                  </div>
                )}
                
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 text-2xl group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-500">
                    <i className="fas fa-shop"></i>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 text-orange-400 font-bold text-xs mb-1">
                      <i className="fas fa-star"></i> {shop.rating}
                    </div>
                    <div className={`text-[10px] font-black uppercase tracking-widest ${
                      shop.stockStatus === 'In Stock' ? 'text-green-500' : 'text-orange-500'
                    }`}>
                      {shop.stockStatus}
                    </div>
                  </div>
                </div>

                <h3 className="text-xl font-black text-slate-800 mb-1 leading-tight">{shop.name}</h3>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Owner: {shop.owner}</div>
                
                <div className="space-y-2 mb-6 text-xs text-slate-500 font-medium">
                  <div className="flex items-start gap-3">
                    <i className="fas fa-location-dot mt-0.5 text-emerald-400"></i>
                    <span>{shop.address}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <i className="fas fa-id-card text-emerald-400"></i>
                    <span className="text-[10px] font-black text-slate-400"># {shop.licenseNo}</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-1 mb-6 flex-grow">
                  {shop.brands.map(b => (
                    <span key={b} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[8px] font-black rounded-md uppercase border border-slate-100">{b}</span>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button 
                    onClick={() => setShowStockModal(shop)}
                    className="py-4 bg-slate-900 text-white rounded-2xl font-bold shadow-lg active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"
                  >
                    Inventory
                  </button>
                  <a href={`tel:${shop.phone}`} className="py-4 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-2xl font-bold active:scale-95 transition-all text-[10px] uppercase tracking-widest flex items-center justify-center gap-2">
                    <i className="fas fa-phone"></i> Call Shop
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Genuine Fertilizer Identification Section */}
      <section className="mt-24 bg-white rounded-[3rem] p-10 md:p-16 border border-slate-100 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-emerald-500"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-12 items-start">
          <div className="md:w-1/3">
            <h2 className="text-3xl font-black text-slate-800 mb-6 leading-tight">Farmer's Guide to <span className="text-green-600">Purity</span></h2>
            <p className="text-slate-500 text-sm mb-8 leading-relaxed">
              Don't be fooled by counterfeit products. Use these checks to ensure you get what you pay for.
            </p>
            <div className="p-6 bg-red-50 rounded-2xl border border-red-100">
              <div className="text-red-800 font-bold text-sm mb-2 flex items-center gap-2">
                <i className="fas fa-phone-volume"></i> Govt Helpline
              </div>
              <div className="text-2xl font-black text-red-600">1800-180-1551</div>
              <p className="text-[10px] text-red-500 mt-1 uppercase font-black">Complaint Against Adulteration</p>
            </div>
          </div>
          
          <div className="md:w-2/3 grid grid-cols-1 sm:grid-cols-2 gap-6">
            <IdentifyCard icon="fa-stamp" title="Check Govt Hologram" desc="Each bag must carry a 3D hologram from the manufacturing company & DBT seal." />
            <IdentifyCard icon="fa-indian-rupee-sign" title="MRP Compliance" desc="Verify if the price matches the national DBT portal rates. Ask for Bill." />
            <IdentifyCard icon="fa-vial" title="Vial Test" desc="Genuine DAP/Urea has specific water solubility. Consult local agri-expert." />
            <IdentifyCard icon="fa-receipt" title="POS Invoice" desc="Ensure the retailer uses the POS machine for a computer-generated GST bill." />
          </div>
        </div>
      </section>

      {/* MODAL: Register Shop */}
      {showRegisterModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto max-h-[90vh] no-scrollbar">
            
            {regStatus === 'form' ? (
              <>
                <div className="flex justify-between items-center mb-10">
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">Retailer Registration</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">All India Onboarding Portal</p>
                  </div>
                  <button onClick={resetModal} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors">
                    <i className="fas fa-times"></i>
                  </button>
                </div>

                <form onSubmit={handleRegisterSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Business/Shop Name</label>
                      <input type="text" required placeholder="e.g. Mahadev Agri Services" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Official Owner Name</label>
                      <input type="text" required placeholder="Name on Govt License" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                    </div>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Govt License Number</label>
                      <input type="text" required placeholder="LIC/XX/0000" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">State/Region</label>
                      <select required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-sm">
                        <option value="">Select State</option>
                        {indianStates.map(state => <option key={state} value={state}>{state}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Complete Address (Pan-India)</label>
                    <textarea required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-emerald-500 outline-none text-sm h-20" placeholder="Street, Village, Tehsil, Pincode..."></textarea>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <label className="flex-grow flex items-center gap-3 p-4 bg-emerald-50 border-2 border-dashed border-emerald-200 rounded-2xl cursor-pointer hover:bg-emerald-100 transition-all">
                      <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shrink-0">
                        <i className="fas fa-file-contract"></i>
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-emerald-900 text-[10px] uppercase truncate">Official Govt License</div>
                        <div className="text-[8px] text-emerald-600 uppercase font-black">{licensePreview ? 'Uploaded' : 'Click to Upload'}</div>
                      </div>
                      <input type="file" className="hidden" accept="image/*,application/pdf" onChange={(e) => handleFileUpload(e, 'license')} />
                    </label>

                    <label className="flex-grow flex items-center gap-3 p-4 bg-blue-50 border-2 border-dashed border-blue-200 rounded-2xl cursor-pointer hover:bg-blue-100 transition-all">
                      <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shrink-0">
                        <i className="fas fa-camera"></i>
                      </div>
                      <div className="overflow-hidden">
                        <div className="font-bold text-blue-900 text-[10px] uppercase truncate">Shop/Owner Photo</div>
                        <div className="text-[8px] text-blue-600 uppercase font-black">{shopPhotoPreview ? 'Uploaded' : 'Click to Upload'}</div>
                      </div>
                      <input type="file" className="hidden" accept="image/*" onChange={(e) => handleFileUpload(e, 'photo')} />
                    </label>
                  </div>

                  {isSubmitting ? (
                    <div className="w-full py-5 bg-slate-100 text-slate-400 rounded-2xl font-black text-center flex items-center justify-center gap-3">
                      <i className="fas fa-spinner fa-spin"></i> Processing...
                    </div>
                  ) : (
                    <button type="submit" className="w-full py-5 bg-emerald-900 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest mt-4">
                      Submit For Verification
                    </button>
                  )}
                </form>
              </>
            ) : (
              <div className="text-center py-10 animate-in zoom-in-95 duration-500">
                <div className="w-24 h-24 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-8 shadow-inner">
                  <i className="fas fa-hourglass-half animate-pulse"></i>
                </div>
                <h2 className="text-3xl font-black text-slate-800 mb-4 tracking-tight">Waiting For Approval</h2>
                <div className="px-6 py-2 bg-slate-100 rounded-full inline-block text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-8">
                  Status: Under Manual Review
                </div>
                
                <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100 text-left mb-8 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center text-[10px] shrink-0"><i className="fas fa-check"></i></div>
                    <div className="text-xs font-bold text-slate-600">Form Data Received successfully.</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-[10px] shrink-0"><i className="fas fa-search"></i></div>
                    <div className="text-xs font-bold text-slate-600">Validating License # with National DBT Portal.</div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-slate-200 text-slate-400 rounded-full flex items-center justify-center text-[10px] shrink-0">3</div>
                    <div className="text-xs font-bold text-slate-400">Final background check by local authority.</div>
                  </div>
                </div>

                <p className="text-sm text-slate-500 mb-10 leading-relaxed px-6 font-medium">
                  We have received your application for <strong>All India Retailer Onboarding</strong>. Verification typically takes 24-72 hours. You will receive an SMS alert once approved.
                </p>

                <button 
                  onClick={resetModal}
                  className="w-full py-5 bg-slate-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
                >
                  Return To Portal
                </button>
                
                <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-6">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" className="h-10 opacity-20" alt="Emblem" />
                  <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Ministry of Agriculture & Farmers Welfare</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: View Stock & Prices */}
      {showStockModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-xl font-black text-slate-800">{showStockModal.name}</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Inventory Snapshot</p>
              </div>
              <button onClick={() => setShowStockModal(null)} className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400"><i className="fas fa-times"></i></button>
            </div>

            <div className="space-y-4 mb-8">
              {GOVT_RATES.map((prod, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                      <i className="fas fa-wheat-awn"></i>
                    </div>
                    <div>
                      <div className="text-xs font-black text-slate-800">{prod.name}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">{prod.brand}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-black text-emerald-700">₹{prod.rate}</div>
                    <div className="text-[9px] font-black text-green-500 uppercase">In Stock</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-3">
              <button className="w-full py-4 brand-gradient text-white rounded-2xl font-black shadow-lg active:scale-95 transition-all text-xs uppercase tracking-widest">
                Initiate Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const WorkStep: React.FC<{ num: string, title: string, desc: string, icon: string }> = ({ num, title, desc, icon }) => (
  <div className="text-center p-8 bg-white rounded-[2rem] border border-slate-100 shadow-lg relative group hover:scale-105 transition-transform">
    <div className="absolute -top-4 -left-4 w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-black shadow-lg z-10">
      {num}
    </div>
    <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-3xl mx-auto mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
      <i className={`fas ${icon}`}></i>
    </div>
    <h4 className="text-lg font-black text-slate-800 mb-3 uppercase tracking-tight">{title}</h4>
    <p className="text-xs text-slate-500 leading-relaxed font-medium">{desc}</p>
  </div>
);

const IdentifyCard: React.FC<{ icon: string, title: string, desc: string }> = ({ icon, title, desc }) => (
  <div className="flex gap-4 p-6 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:border-emerald-200 transition-all hover:bg-white hover:shadow-xl group">
    <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-xl text-emerald-600 shrink-0 shadow-sm group-hover:bg-emerald-600 group-hover:text-white transition-colors">
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <h5 className="font-bold text-slate-800 text-sm mb-1 uppercase tracking-tight">{title}</h5>
      <p className="text-[11px] text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
  </div>
);

export default Retailers;
