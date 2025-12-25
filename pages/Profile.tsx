
import React from 'react';
import { UserProfile, Language } from '../types';

interface ProfileProps {
  user: UserProfile | null;
  onLogout: () => void;
  language: Language;
}

const Profile: React.FC<ProfileProps> = ({ user, onLogout, language }) => {
  if (!user) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10 pb-24 md:pb-10">
      <div className="bg-white rounded-[2.5rem] shadow-xl border border-slate-100 overflow-hidden mb-8">
        <div className="h-32 brand-gradient"></div>
        <div className="px-10 pb-10">
          <div className="relative -mt-12 mb-6 inline-block">
            <div className="w-24 h-24 bg-white rounded-3xl overflow-hidden flex items-center justify-center text-3xl font-black text-green-600 border-4 border-white shadow-xl shadow-slate-200">
              {user.avatar ? (
                <img src={user.avatar} className="w-full h-full object-cover" alt={user.name} />
              ) : (
                user.name.charAt(0)
              )}
            </div>
            {user.verified && (
              <div className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center border-2 border-white text-xs" title="Verified Member">
                <i className="fas fa-check"></i>
              </div>
            )}
          </div>
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">{user.name}</h2>
                <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest text-white ${user.role === 'farmer' ? 'bg-green-600' : 'bg-orange-600'}`}>
                  {user.role}
                </span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 font-bold uppercase tracking-widest text-[10px] mt-2">
                <span><i className="fas fa-phone mr-1"></i> +91 {user.phone}</span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                <span><i className="fas fa-location-dot mr-1"></i> {user.location}</span>
                <span className="w-1.5 h-1.5 bg-slate-300 rounded-full"></span>
                <span>Member Since {user.joinedDate}</span>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="flex-1 md:flex-none px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-bold uppercase tracking-widest active:scale-95 transition-all">
                Settings
              </button>
              <button 
                onClick={onLogout}
                className="flex-1 md:flex-none px-6 py-3 border border-red-200 text-red-500 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-50 active:scale-95 transition-all"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg text-center">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Reputation</div>
          <div className="text-3xl font-black text-slate-800">{user.reputationPoints}</div>
          <div className="text-[10px] font-bold text-green-600 mt-2">Top 5% in Region</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg text-center">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Expert Badge</div>
          <div className="text-lg font-black text-orange-600 uppercase tracking-tight">{user.badge}</div>
          <div className="text-[10px] font-bold text-slate-400 mt-2">Next: Helper (500 pts)</div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-lg text-center">
          <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Transactions</div>
          <div className="text-3xl font-black text-slate-800">24</div>
          <div className="text-[10px] font-bold text-blue-600 mt-2">100% Success Rate</div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><i className="fas fa-chart-line text-green-600"></i> Market Summary</h3>
          <div className="space-y-6">
            <ActivityItem icon="fa-shopping-bag" label="Active Listings" count={3} />
            <ActivityItem icon="fa-clock" label="Pending Orders" count={1} />
            <ActivityItem icon="fa-star" label="Buyer Reviews" count={12} />
          </div>
        </div>
        <div className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-lg">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><i className="fas fa-gear text-slate-400"></i> Account Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <QuickLink icon="fa-heart" label="Wishlist" />
            <QuickLink icon="fa-bell" label="Alerts" />
            <QuickLink icon="fa-wallet" label="AgriWallet" />
            <QuickLink icon="fa-shield-halved" label="Verify Aadhaar" />
          </div>
        </div>
      </div>
    </div>
  );
};

const ActivityItem: React.FC<{ icon: string, label: string, count: number }> = ({ icon, label, count }) => (
  <div className="flex items-center justify-between">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl flex items-center justify-center">
        <i className={`fas ${icon}`}></i>
      </div>
      <span className="text-sm font-bold text-slate-600">{label}</span>
    </div>
    <span className="text-lg font-black text-slate-800">{count}</span>
  </div>
);

const QuickLink: React.FC<{ icon: string, label: string }> = ({ icon, label }) => (
  <button className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex flex-col items-center gap-2 hover:bg-slate-100 transition-colors active:scale-95">
    <i className={`fas ${icon} text-slate-400 text-lg`}></i>
    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{label}</span>
  </button>
);

export default Profile;
