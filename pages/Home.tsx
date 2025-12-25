
import React from 'react';
import { Language } from '../types';

interface HomeProps {
  onNavigate: (page: string) => void;
  language: Language;
}

const HOME_TRANSLATIONS: Record<string, Record<string, string>> = {
  English: {
    heroTitle: "Empowering the Green Revolution with AI.",
    heroSubtitle: "Get real-time mandi prices, detect diseases using your camera, and sell directly to buyers.",
    startSelling: "Start Selling",
    checkHealth: "Check Crop Health",
    trustedBy: "50,000+ FARMERS TRUST US",
    mandiPrices: "Mandi Prices",
    retailers: "Retailers",
    equipment: "Equipment",
    experts: "Agri Experts",
    community: "Community",
    schemes: "Govt Schemes",
    aiAssistant: "AI Assistant",
    market: "Market",
    raksha: "Raksha Alerts"
  },
  Hindi: {
    heroTitle: "एआई के साथ हरित क्रांति को सशक्त बनाना।",
    heroSubtitle: "वास्तविक समय में मंडी कीमतें प्राप्त करें, अपने कैमरे का उपयोग करके रोगों का पता लगाएं, और सीधे खरीदारों को बेचें।",
    startSelling: "बेचना शुरू करें",
    checkHealth: "फसल स्वास्थ्य जांचें",
    trustedBy: "50,000+ किसान हम पर भरोसा करते हैं",
    mandiPrices: "मंडी दरें",
    retailers: "विक्रेता",
    equipment: "उपકરણ",
    experts: "कृषि विशेषज्ञ",
    community: "समुदाय",
    schemes: "सरकारी योजनाएं",
    aiAssistant: "एआई सहायक",
    market: "बाज़ार",
    raksha: "रक्षा अलर्ट"
  },
  Gujarati: {
    heroTitle: "AI દ્વારા હરિયાળી ક્રાંતિને સશક્ત બનાવવી.",
    heroSubtitle: "રીઅલ-ટાઇમ મંડી કિંમતો મેળવો, તમારા કેમેરાનો ઉપયોગ કરીને રોગો શોધો અને સીધા જ ખરીદદારોને વેચો.",
    startSelling: "વેચવાનું શરૂ કરો",
    checkHealth: "પાક આરોગ્ય તપાસો",
    trustedBy: "50,000+ ખેડૂતો અમારો વિશ્વાસ કરે છે",
    mandiPrices: "મંડી કિંમતો",
    retailers: "રિટેલર્સ",
    equipment: "સાધનો",
    experts: "કૃષિ નિષ્ણાતો",
    community: "સમુદાય",
    schemes: "સરકારી યોજનાઓ",
    aiAssistant: "AI મદદનીશ",
    market: "બજાર",
    raksha: "રક્ષા એલર્ટ"
  }
};

const Home: React.FC<HomeProps> = ({ onNavigate, language }) => {
  const t = (key: string) => {
    return HOME_TRANSLATIONS[language]?.[key] || HOME_TRANSLATIONS['English'][key];
  };

  return (
    <div className="pb-10">
      {/* Hero Section */}
      <section className="relative h-[60vh] md:h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=1200&q=80" 
            alt="Farming" 
            className="w-full h-full object-cover brightness-50"
          />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 text-white text-center md:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold mb-6 mx-auto md:mx-0">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            {t('trustedBy')}
          </div>
          <h1 className="text-3xl md:text-6xl font-bold leading-tight max-w-2xl mb-4">
            {t('heroTitle')}
          </h1>
          <p className="mt-4 text-lg md:text-xl opacity-90 max-w-xl mb-8">
            {t('heroSubtitle')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
            <button onClick={() => onNavigate('market')} className="px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-xl active:scale-95 transition-all">{t('startSelling')}</button>
            <button onClick={() => onNavigate('ai')} className="px-8 py-4 bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border border-white/30 rounded-xl font-bold active:scale-95 transition-all">{t('checkHealth')}</button>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          <ServiceCard icon="fa-shield-virus" title={t('raksha')} onClick={() => onNavigate('raksha')} color="border-red-100 text-red-600" pulse />
          <ServiceCard icon="fa-indian-rupee-sign" title={t('mandiPrices')} onClick={() => onNavigate('prices')} color="border-orange-100 text-orange-600" />
          <ServiceCard icon="fa-vial-circle-check" title={t('retailers')} onClick={() => onNavigate('retailers')} color="border-emerald-100 text-emerald-600" />
          <ServiceCard icon="fa-tractor" title={t('equipment')} onClick={() => onNavigate('equipment')} color="border-amber-100 text-amber-600" />
          <ServiceCard icon="fa-user-tie" title={t('experts')} onClick={() => onNavigate('experts')} color="border-rose-100 text-rose-600" />
          <ServiceCard icon="fa-comments" title={t('community')} onClick={() => onNavigate('community')} color="border-cyan-100 text-cyan-600" />
          <ServiceCard icon="fa-file-invoice" title={t('schemes')} onClick={() => onNavigate('schemes')} color="border-indigo-100 text-indigo-600" />
          <ServiceCard icon="fa-robot" title={t('aiAssistant')} onClick={() => onNavigate('ai')} color="border-red-100 text-red-600" />
        </div>
      </section>
    </div>
  );
};

const ServiceCard: React.FC<{ icon: string, title: string, onClick: () => void, color: string, pulse?: boolean }> = ({ icon, title, onClick, color, pulse }) => (
  <div onClick={onClick} className={`bg-white p-6 rounded-3xl border-2 ${color} shadow-sm hover:shadow-md transition-shadow cursor-pointer active:scale-95 group flex flex-col items-center text-center relative overflow-hidden`}>
    {pulse && <div className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>}
    <div className="text-2xl md:text-3xl mb-4 group-hover:scale-110 transition-transform"><i className={`fas ${icon}`}></i></div>
    <h3 className="font-bold text-slate-800 text-xs md:text-sm">{title}</h3>
  </div>
);

export default Home;
