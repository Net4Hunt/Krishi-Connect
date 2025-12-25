
import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';

interface AuthProps {
  onAuthSuccess: (user: UserProfile) => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [step, setStep] = useState(1);
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('farmer');
  const [location, setLocation] = useState('');
  const [avatar, setAvatar] = useState<string | null>(null);
  const [businessName, setBusinessName] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const triggerOtpSend = () => {
    setIsSending(true);
    // Simulate live SMS gateway delay
    setTimeout(() => {
      setIsSending(false);
      setStep(2);
    }, 1500);
  };

  const handleNext = () => {
    if (step === 1 && phone.length >= 10) {
      triggerOtpSend();
    } else if (step === 2) {
      // Simulate verification logic
      setStep(3);
    } else if (step === 3) {
      onAuthSuccess({
        id: Math.random().toString(36).substr(2, 9),
        name,
        phone,
        role,
        location,
        avatar: avatar || undefined,
        verified: true,
        reputationPoints: 100,
        badge: 'Seedling',
        joinedDate: new Date().toLocaleDateString(),
        businessName: role === 'buyer' ? businessName : undefined
      });
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
    if (newOtp.every(digit => digit !== '') && index === 5) {
      setTimeout(() => handleNext(), 300);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setAvatar(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 p-8 md:p-10 border border-slate-100">
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 brand-gradient rounded-2xl flex items-center justify-center text-white text-2xl mb-6 shadow-lg shadow-green-100">
              <i className="fas fa-tractor"></i>
            </div>
            <h2 className="text-3xl font-black mb-2 tracking-tight text-slate-800">Krishi Connect</h2>
            <p className="text-slate-500 mb-8 font-medium">India's verified agricultural network</p>
            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Phone Number</label>
                <div className="flex">
                  <div className="px-4 py-4 bg-slate-50 border border-slate-200 rounded-l-2xl border-r-0 text-slate-400 font-bold">+91</div>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="9876543210" 
                    className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-r-2xl focus:outline-none focus:ring-2 focus:ring-green-500 font-bold"
                  />
                </div>
              </div>
              <button 
                onClick={handleNext}
                disabled={phone.length < 10 || isSending}
                className={`w-full py-5 text-white rounded-2xl font-black shadow-xl transition-all active:scale-95 flex items-center justify-center gap-3 ${phone.length >= 10 ? 'saffron-gradient shadow-orange-100' : 'bg-slate-300 cursor-not-allowed shadow-none'}`}
              >
                {isSending ? (
                  <>
                    <i className="fas fa-spinner fa-spin"></i>
                    Sending OTP...
                  </>
                ) : 'Secure Login'}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 text-2xl mb-6">
              <i className="fas fa-shield-check"></i>
            </div>
            <h2 className="text-3xl font-black mb-2 tracking-tight text-slate-800">Verify Identity</h2>
            <p className="text-slate-500 mb-8 font-medium">OTP sent to <span className="text-blue-600 font-bold">+91 {phone}</span></p>
            
            <div className="space-y-8">
              <div className="flex justify-between gap-2">
                {otp.map((digit, i) => (
                  <input 
                    key={i} 
                    type="text" 
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    ref={(el) => { inputRefs.current[i] = el; }}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(i, e)}
                    className="w-full h-14 bg-slate-50 border border-slate-200 rounded-xl text-center text-xl font-black focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                ))}
              </div>
              <div className="text-center">
                <button onClick={() => setStep(1)} className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">Wrong Number? Change</button>
              </div>
              <button 
                onClick={handleNext}
                disabled={otp.some(d => d === '')}
                className={`w-full py-5 text-white rounded-2xl font-black shadow-xl transition-all active:scale-95 ${!otp.some(d => d === '') ? 'bg-slate-900 shadow-slate-200' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                Verify & Continue
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-500">
            <h2 className="text-2xl font-black mb-6 tracking-tight text-slate-800">Complete Profile</h2>
            
            <div className="space-y-6">
              <div className="flex flex-col items-center gap-4 mb-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-24 h-24 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center cursor-pointer overflow-hidden group relative"
                >
                  {avatar ? (
                    <img src={avatar} alt="Avatar" className="w-full h-full object-cover" />
                  ) : (
                    <i className="fas fa-camera text-slate-300 text-2xl group-hover:text-green-500 transition-colors"></i>
                  )}
                  <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <span className="text-[10px] text-white font-bold uppercase tracking-widest">Upload</span>
                  </div>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Profile Photo</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setRole('farmer')}
                  className={`py-4 rounded-2xl font-bold border-2 transition-all flex flex-col items-center gap-2 ${role === 'farmer' ? 'border-green-500 bg-green-50 text-green-700 shadow-lg shadow-green-100' : 'border-slate-100 text-slate-400 bg-slate-50'}`}
                >
                  <i className="fas fa-tractor text-xl"></i>
                  <span className="text-xs uppercase tracking-widest">Farmer</span>
                </button>
                <button 
                  onClick={() => setRole('buyer')}
                  className={`py-4 rounded-2xl font-bold border-2 transition-all flex flex-col items-center gap-2 ${role === 'buyer' ? 'border-orange-500 bg-orange-50 text-orange-700 shadow-lg shadow-orange-100' : 'border-slate-100 text-slate-400 bg-slate-50'}`}
                >
                  <i className="fas fa-shopping-cart text-xl"></i>
                  <span className="text-xs uppercase tracking-widest">Buyer</span>
                </button>
              </div>

              <FormGroup label="Full Name" value={name} onChange={setName} placeholder="Enter your name" />
              {role === 'buyer' && <FormGroup label="Business Name" value={businessName} onChange={setBusinessName} placeholder="Agro Corp Pvt Ltd" />}
              <FormGroup label="Your Location" value={location} onChange={setLocation} placeholder="City, State" icon="fa-location-dot" />

              <button 
                onClick={handleNext}
                disabled={!name || !location}
                className={`w-full py-5 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all mt-4 ${name && location ? 'brand-gradient shadow-green-100' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
              >
                Create Account
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const FormGroup: React.FC<{ label: string, value: string, onChange: (v: string) => void, placeholder: string, icon?: string }> = ({ label, value, onChange, placeholder, icon }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{label}</label>
    <div className="relative">
      {icon && <i className={`fas ${icon} absolute left-5 top-1/2 -translate-y-1/2 text-slate-300`}></i>}
      <input 
        type="text" 
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} 
        className={`w-full ${icon ? 'pl-12' : 'px-5'} py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-sm`}
      />
    </div>
  </div>
);

export default Auth;
