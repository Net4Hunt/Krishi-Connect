import React, { useState, useRef, useEffect } from 'react';
import { askKrishiAssistant, detectCropDisease } from '../services/geminiService';
import { Language } from '../types';

interface Message {
  role: 'user' | 'model';
  parts: { text: string; inlineData?: { data: string; mimeType: string } }[];
}

const AIAssistant: React.FC<{ language: Language }> = ({ language }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [mode, setMode] = useState<'chat' | 'camera'>('chat');
  
  // Camera & Detection States
  const [cameraActive, setCameraActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Enhanced cleaner: Strips all standard markdown
  const cleanMarkdown = (text: string) => {
    return text
      .replace(/[*#`>_~|]/g, '') // Remove standard markdown chars
      .replace(/--/g, '')       // Remove common separators
      .replace(/\[Image Uploaded\]/g, '') // Strip internal tags
      .replace(/\s+/g, ' ')      // Collapse multiple spaces
      .replace(/\n\s*\n/g, '\n\n') // Normalize multiple newlines
      .trim();
  };

  // Camera logic
  useEffect(() => {
    let active = true;
    const enableCamera = async () => {
      if (cameraActive && active) {
        try {
          const constraints = { 
            video: { 
              facingMode: { ideal: 'environment' }, 
              width: { ideal: 1280 }, 
              height: { ideal: 720 } 
            } 
          };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          if (active && videoRef.current) {
            videoRef.current.srcObject = stream;
            streamRef.current = stream;
          }
        } catch (err: any) {
          console.error("Camera Access Error:", err);
          setCameraActive(false);
        }
      }
    };
    enableCamera();
    return () => {
      active = false;
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
    };
  }, [cameraActive]);

  const handleSend = async (imagePayload?: string) => {
    if (!inputValue.trim() && !imagePayload) return;
    
    const userMsg: Message = { 
      role: 'user', 
      parts: [
        { text: inputValue },
        ...(imagePayload ? [{ inlineData: { data: imagePayload.split(',')[1], mimeType: 'image/jpeg' }, text: "[Image Uploaded]" }] : [])
      ] 
    };

    setMessages(prev => [...prev, userMsg]);
    setInputValue('');
    setIsTyping(true);

    let response;
    if (imagePayload) {
      response = await detectCropDisease(imagePayload, language);
    } else {
      const chatHistory = messages.map(m => ({
        role: m.role,
        parts: m.parts.map(p => ({ text: p.text }))
      }));
      response = await askKrishiAssistant(inputValue, language, chatHistory);
    }

    const botMsg: Message = { role: 'model', parts: [{ text: cleanMarkdown(response || "") }] };
    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  const handleChatFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSend(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = reader.result as string;
        setSelectedImage(base64);
        analyzeImage(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (base64: string) => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    const result = await detectCropDisease(base64, language);
    setAnalysisResult(cleanMarkdown(result || "Analysis failed."));
    setIsAnalyzing(false);
  };

  const startCamera = () => { setCameraActive(true); setSelectedImage(null); setAnalysisResult(null); };
  const stopCamera = () => {
    if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    setCameraActive(false);
  };

  const captureImage = () => {
    if (!canvasRef.current || !videoRef.current) return;
    const context = canvasRef.current.getContext('2d');
    if (!context) return;
    canvasRef.current.width = videoRef.current.videoWidth;
    canvasRef.current.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0);
    const base64 = canvasRef.current.toDataURL('image/jpeg', 0.8);
    setSelectedImage(base64);
    stopCamera();
    analyzeImage(base64);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 h-full flex flex-col gap-6 pb-24 md:pb-8">
      {/* Navigation Toggle */}
      <div className="flex gap-2 p-1.5 bg-slate-100 rounded-[1.5rem] w-full md:w-fit shadow-inner print:hidden">
        <button 
          onClick={() => setMode('chat')}
          className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'chat' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Chat Expert
        </button>
        <button 
          onClick={() => setMode('camera')}
          className={`flex-1 md:flex-none px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${mode === 'camera' ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Disease Scan
        </button>
      </div>

      {mode === 'chat' ? (
        <div className="flex-grow bg-white rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden h-[70vh] print:hidden">
          <div className="bg-slate-50 px-8 py-5 border-b flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 saffron-gradient rounded-2xl flex items-center justify-center text-white shadow-lg text-xl">
                <i className="fas fa-robot"></i>
              </div>
              <div>
                <h3 className="font-black text-slate-800 tracking-tight">Krishi AI Assistant</h3>
                <div className="text-[10px] text-green-500 font-black uppercase tracking-widest">Active • {language}</div>
              </div>
            </div>
          </div>

          <div className="flex-grow p-6 overflow-y-auto space-y-6 custom-scrollbar">
            {messages.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 text-4xl mb-6"><i className="fas fa-leaf"></i></div>
                <h4 className="text-xl font-black text-slate-800 mb-2">How can I help you today?</h4>
                <p className="text-sm text-slate-400 font-medium">Ask in {language} about your crops.</p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2`}>
                <div className={`max-w-[85%] px-6 py-4 rounded-[1.5rem] text-sm md:text-base ${m.role === 'user' ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-slate-50 text-slate-800 rounded-tl-none border border-slate-100'}`}>
                  {m.parts[0].text}
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-slate-50 px-6 py-4 rounded-[1.5rem] rounded-tl-none border border-slate-100 flex gap-1">
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-75"></span>
                  <span className="w-1.5 h-1.5 bg-slate-300 rounded-full animate-bounce delay-150"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef}></div>
          </div>

          <div className="p-4 md:p-6 bg-white border-t flex gap-3 input-area">
            <input type="file" ref={chatFileInputRef} className="hidden" accept="image/*" onChange={handleChatFileUpload} />
            <button onClick={() => chatFileInputRef.current?.click()} className="w-12 h-12 bg-slate-50 text-slate-400 rounded-2xl hover:text-green-600 border border-slate-100 shadow-sm"><i className="fas fa-plus"></i></button>
            <input type="text" value={inputValue} onChange={(e) => setInputValue(e.target.value)} onKeyPress={(e) => e.key === 'Enter' && handleSend()} placeholder={`Ask in ${language}...`} className="flex-grow h-12 px-6 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-sm" />
            <button onClick={() => handleSend()} className="w-12 h-12 flex items-center justify-center brand-gradient text-white rounded-2xl shadow-lg active:scale-95"><i className="fas fa-paper-plane"></i></button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-slate-100 diagnosis-report">
          {/* Dashboard View (Hidden when printing) */}
          <div className="text-center mb-10 max-w-xl mx-auto print:hidden">
            <h3 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Crop Health Scan</h3>
            <p className="text-slate-400 text-sm font-medium">Precision AI Diagnosis • {language}</p>
          </div>

          {/* Camera/Image Viewport (Hidden when printing) */}
          <div className="relative aspect-square md:aspect-video max-w-3xl mx-auto bg-slate-900 rounded-[2.5rem] overflow-hidden mb-8 shadow-inner flex items-center justify-center group print:hidden">
            {cameraActive ? (
              <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
            ) : selectedImage ? (
              <img src={selectedImage} alt="Crop" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center text-white/20"><i className="fas fa-camera text-4xl mb-4"></i><div className="text-xs font-black">CHOOSE SOURCE BELOW</div></div>
            )}
            {isAnalyzing && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-20">
                <div className="w-12 h-12 border-4 border-white/10 border-t-green-400 rounded-full animate-spin mb-4"></div>
                <h4 className="font-black uppercase tracking-widest text-xs">AI Analyzing Tissue...</h4>
              </div>
            )}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div className="max-w-xl mx-auto flex flex-col gap-4">
            {!cameraActive && !selectedImage && (
              <div className="grid grid-cols-2 gap-4 print:hidden">
                <button onClick={startCamera} className="p-8 bg-slate-900 text-white rounded-[2rem] flex flex-col items-center gap-3 active:scale-95 transition-all"><i className="fas fa-camera text-2xl"></i><span className="text-[10px] font-black uppercase tracking-widest">Take Photo</span></button>
                <button onClick={() => fileInputRef.current?.click()} className="p-8 bg-white border-2 border-slate-100 text-slate-900 rounded-[2rem] flex flex-col items-center gap-3 active:scale-95 transition-all"><i className="fas fa-file-image text-2xl text-green-500"></i><span className="text-[10px] font-black uppercase tracking-widest">Upload</span></button>
                <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*" />
              </div>
            )}

            {cameraActive && (
              <div className="flex gap-4 print:hidden">
                <button onClick={captureImage} className="flex-grow py-5 bg-green-500 text-white rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-all">Capture & Analyze</button>
                <button onClick={stopCamera} className="w-16 py-5 bg-slate-100 text-slate-400 rounded-[2rem]"><i className="fas fa-times"></i></button>
              </div>
            )}

            {selectedImage && !isAnalyzing && (
              <div className="flex gap-3 print:hidden">
                <button onClick={() => { setSelectedImage(null); setAnalysisResult(null); }} className="flex-grow py-5 bg-slate-900 text-white rounded-[2rem] font-black uppercase text-[10px] active:scale-95 transition-all">Discard</button>
                <button onClick={() => analyzeImage(selectedImage!)} className="flex-grow py-5 bg-green-500 text-white rounded-[2rem] font-black uppercase text-[10px] active:scale-95 transition-all">Retry Analysis</button>
              </div>
            )}

            {analysisResult && (
              <div className="mt-8 bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-2xl animate-in fade-in duration-700 report-container">
                {/* PDF Specific Header */}
                <div className="hidden print:block mb-8">
                  <div className="flex justify-between items-start border-b-4 border-green-800 pb-6 mb-6">
                    <div>
                      <h1 className="text-4xl font-black text-green-800 tracking-tighter uppercase">Crop Health Report</h1>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="px-3 py-1 bg-green-100 text-green-800 text-[10px] font-black rounded uppercase">Krishi Connect AI Verified</span>
                        <span className="text-[10px] text-slate-400 font-bold uppercase">Report ID: KC-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-800">Krishi Connect</div>
                      <div className="text-[10px] text-slate-400 font-bold">Generated: {new Date().toLocaleDateString()}</div>
                    </div>
                  </div>
                  
                  {selectedImage && (
                    <div className="mb-8 p-4 bg-slate-50 border rounded-3xl text-center">
                      <p className="text-[10px] font-black text-slate-400 uppercase mb-2">Subject Tissue Image</p>
                      <img src={selectedImage} className="max-h-64 mx-auto rounded-xl shadow-md border-4 border-white" alt="Subject" />
                    </div>
                  )}
                </div>

                <div className="text-sm md:text-base text-slate-700 leading-relaxed space-y-6">
                   <div className="hidden print:block text-[10px] font-black text-green-700 uppercase tracking-widest border-l-4 border-green-700 pl-4 mb-4">Diagnosis & Expert Recommendations</div>
                   <div className="space-y-4">
                     {analysisResult.split('\n').map((l, i) => l.trim() ? <p key={i} className="font-medium text-slate-800">{l.trim()}</p> : <br key={i} />)}
                   </div>
                </div>

                {/* PDF Disclaimer */}
                <div className="hidden print:block mt-12 pt-6 border-t border-slate-100">
                  <div className="flex justify-between items-center">
                    <p className="text-[8px] text-slate-400 max-w-md italic">
                      Disclaimer: This report is generated by Artificial Intelligence. While high accuracy is maintained, please consult a local agricultural extension officer for final treatment confirmation.
                    </p>
                    <div className="text-right">
                      <img src="https://api.qrserver.com/v1/create-qr-code/?size=60x60&data=ReportKC" className="ml-auto w-12 h-12 opacity-30" alt="QR" />
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex gap-3 print:hidden">
                  <button 
                    onClick={() => {
                      // Small delay to allow layout to settle before printing
                      setTimeout(() => window.print(), 100);
                    }} 
                    className="flex-grow py-5 saffron-gradient text-white rounded-2xl text-[12px] font-black uppercase tracking-widest shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3"
                  >
                    <i className="fas fa-file-pdf"></i> Download Report / Save PDF
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIAssistant;