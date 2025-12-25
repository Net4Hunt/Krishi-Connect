
import React, { useState } from 'react';
import { MOCK_POSTS } from '../constants';
// Added Language to imports
import { CommunityPost, Language } from '../types';

// Updated component signature to accept language prop
const Community: React.FC<{ language: Language }> = ({ language }) => {
  const [activeTab, setActiveTab] = useState<'feed' | 'library' | 'ranking'>('feed');
  const [isAsking, setIsAsking] = useState(false);
  const [filter, setFilter] = useState('All');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Reputation Header */}
      <div className="bg-slate-900 rounded-[2rem] p-6 mb-8 text-white flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 saffron-gradient rounded-2xl flex items-center justify-center text-xl font-bold">
            <i className="fas fa-award"></i>
          </div>
          <div>
            <div className="text-[10px] text-orange-400 font-bold uppercase tracking-widest">Community Rank</div>
            <div className="text-lg font-bold">Master Helper</div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-green-400">1,240</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">Agri Points</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
        <TabButton active={activeTab === 'feed'} label="Discussion Feed" onClick={() => setActiveTab('feed')} />
        <TabButton active={activeTab === 'library'} label="Knowledge Base" onClick={() => setActiveTab('library')} />
        <TabButton active={activeTab === 'ranking'} label="Leaderboard" onClick={() => setActiveTab('ranking')} />
      </div>

      {activeTab === 'feed' && (
        <div className="space-y-6">
          {/* Ask Button / Editor */}
          {!isAsking ? (
            <button 
              onClick={() => setIsAsking(true)}
              className="w-full p-6 bg-white border-2 border-dashed border-slate-200 rounded-3xl flex items-center justify-between hover:border-green-300 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 group-hover:text-green-500">
                  <i className="fas fa-comment-medical text-xl"></i>
                </div>
                <div className="text-left">
                  <div className="font-bold text-slate-700">Have a farming question?</div>
                  <div className="text-xs text-slate-400">Ask the community or experts</div>
                </div>
              </div>
              <i className="fas fa-plus text-slate-300"></i>
            </button>
          ) : (
            <div className="bg-white p-6 rounded-3xl shadow-xl border border-green-100 animate-in fade-in slide-in-from-top-4 duration-300">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-lg">Ask Community</h3>
                <button onClick={() => setIsAsking(false)}><i className="fas fa-times text-slate-400"></i></button>
              </div>
              <textarea 
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 mb-4 h-32"
                placeholder="Describe your problem (e.g. Tomato leaves turning yellow...)"
              ></textarea>
              <div className="flex gap-2 mb-6 flex-wrap">
                <ActionButton icon="fa-microphone" label="Voice" />
                <ActionButton icon="fa-camera" label="Photos" />
                <ActionButton icon="fa-tag" label="Tags" />
              </div>
              <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold active:scale-95 transition-all">
                Post Question
              </button>
            </div>
          )}

          {/* Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {['All', 'Urgent', 'Near Me', 'Wheat', 'Rice', 'Pest Control'].map(f => (
              <button 
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  filter === f ? 'bg-green-600 text-white shadow-lg' : 'bg-white text-slate-500 border border-slate-100'
                }`}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Feed List */}
          <div className="space-y-4">
            {MOCK_POSTS.map(post => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'library' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <LibraryCard title="Solved: Wheat Rust Control" count={1240} icon="fa-check-circle" color="text-green-500 bg-green-50" />
          <LibraryCard title="Best Irrigation Cycles" count={850} icon="fa-droplet" color="text-blue-500 bg-blue-50" />
          <LibraryCard title="Organic Pesticide Recipes" count={3400} icon="fa-leaf" color="text-emerald-500 bg-emerald-50" />
          <LibraryCard title="Govt Subsidy Eligibility" count={920} icon="fa-file-invoice" color="text-purple-500 bg-purple-50" />
        </div>
      )}
      
      {activeTab === 'ranking' && (
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-xl">
          <div className="p-6 brand-gradient">
            <h3 className="font-bold text-green-900">Top Contributors (This Month)</h3>
          </div>
          <div className="divide-y divide-slate-50">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="font-black text-slate-300 w-4">#{i}</div>
                  <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200"></div>
                  <div>
                    <div className="font-bold text-sm">Farmer Name {i}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Reputation: {5000 - i * 500}</div>
                  </div>
                </div>
                <div className="text-xs font-black text-green-600">+{200 - i * 10} pts</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const TabButton: React.FC<{ active: boolean, label: string, onClick: () => void }> = ({ active, label, onClick }) => (
  <button 
    onClick={onClick}
    className={`flex-1 py-3 rounded-xl text-xs font-bold transition-all ${
      active ? 'bg-white shadow-md text-slate-900' : 'text-slate-400'
    }`}
  >
    {label}
  </button>
);

const ActionButton: React.FC<{ icon: string, label: string }> = ({ icon, label }) => (
  <button className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 transition-colors">
    <i className={`fas ${icon}`}></i>
    {label}
  </button>
);

const PostCard: React.FC<{ post: CommunityPost }> = ({ post }) => (
  <div className={`bg-white p-6 rounded-3xl border-l-4 shadow-lg shadow-slate-200/50 hover:shadow-xl transition-all ${post.isUrgent ? 'border-red-500' : 'border-green-500'}`}>
    <div className="flex justify-between items-start mb-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center font-bold text-slate-400">
          {post.authorName[0]}
        </div>
        <div>
          <div className="text-sm font-bold text-slate-800">{post.authorName}</div>
          <div className="text-[10px] text-slate-400 font-bold uppercase">{post.authorLocation} • {post.timestamp}</div>
        </div>
      </div>
      {post.isUrgent && (
        <span className="px-2 py-1 bg-red-100 text-red-600 text-[10px] font-black rounded-lg uppercase animate-pulse">Urgent</span>
      )}
    </div>
    
    <h4 className="text-lg font-bold text-slate-900 mb-2">{post.title}</h4>
    <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-3">{post.content}</p>
    
    {post.imageUrl && (
      <div className="mb-4 rounded-2xl overflow-hidden h-32 md:h-48">
        <img src={post.imageUrl} alt="Issue" className="w-full h-full object-cover" />
      </div>
    )}

    <div className="flex items-center justify-between pt-4 border-t border-slate-50">
      <div className="flex gap-4">
        <button className="flex items-center gap-1.5 text-slate-400 hover:text-green-600 transition-colors">
          <i className="far fa-thumbs-up"></i>
          <span className="text-xs font-bold">{post.upvotes}</span>
        </button>
        <button className="flex items-center gap-1.5 text-slate-400 hover:text-blue-600 transition-colors">
          <i className="far fa-comment"></i>
          <span className="text-xs font-bold">{post.repliesCount}</span>
        </button>
      </div>
      <button className="text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-slate-900">View Thread</button>
    </div>
  </div>
);

const LibraryCard: React.FC<{ title: string, count: number, icon: string, color: string }> = ({ title, count, icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-md hover:shadow-lg transition-all cursor-pointer group">
    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-4 ${color}`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <h4 className="font-bold text-slate-800 mb-1 group-hover:text-green-600">{title}</h4>
    <p className="text-xs text-slate-400 font-bold uppercase">{count.toLocaleString()} cases solved</p>
  </div>
);

export default Community;
