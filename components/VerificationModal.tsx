
import React, { useState, useEffect, useRef } from 'react';

interface VerificationModalProps {
  phone: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const VerificationModal: React.FC<VerificationModalProps> = ({ phone, onSuccess, onCancel }) => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(30);
  const [isVerifying, setIsVerifying] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const countdown = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const verify = () => {
    setIsVerifying(true);
    // Simulate API delay
    setTimeout(() => {
      setIsVerifying(false);
      onSuccess();
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
        <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6 shadow-sm">
          <i className="fas fa-shield-check"></i>
        </div>
        <h3 className="text-xl font-black text-slate-800 mb-1">Verify Phone</h3>
        <p className="text-xs text-slate-500 font-medium mb-8">Enter the 6-digit code sent to <br/><span className="text-slate-900 font-bold">+91 {phone}</span></p>
        
        <div className="flex justify-between gap-2 mb-8">
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
              className="w-full h-12 bg-slate-50 border border-slate-200 rounded-xl text-center text-lg font-black focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          ))}
        </div>

        <div className="mb-8">
          {timer > 0 ? (
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resend OTP in {timer}s</p>
          ) : (
            <button className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline">Resend SMS Now</button>
          )}
        </div>

        <div className="flex flex-col gap-3">
          <button 
            onClick={verify}
            disabled={otp.some(d => d === '') || isVerifying}
            className="w-full py-4 brand-gradient text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest disabled:opacity-50"
          >
            {isVerifying ? <i className="fas fa-spinner fa-spin mr-2"></i> : 'Verify & Proceed'}
          </button>
          <button onClick={onCancel} className="text-[10px] font-black text-slate-300 uppercase tracking-widest py-2">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default VerificationModal;
