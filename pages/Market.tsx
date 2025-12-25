
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { UserProfile, CropListing, Language, Order } from '../types';

interface MarketProps {
  user: UserProfile | null;
  language: Language;
}

type MarketTab = 'overview' | 'farmer' | 'buyer' | 'auctions' | 'logistics';

interface Transporter {
  id: string;
  name: string;
  vehicleType: 'Tractor' | 'Small Tempo' | 'Medium Truck' | 'Large Truck';
  capacity: string;
  ratePerKm: number;
  rating: number;
  trips: number;
  phone: string;
  verified: boolean;
  location: string;
}

interface ChatMessage {
  id: string;
  senderId: string;
  text: string;
  timestamp: string;
}

const MOCK_TRANSPORTERS: Transporter[] = [
  { id: 't1', name: 'Ravi Logistics', vehicleType: 'Small Tempo', capacity: '1 Ton', ratePerKm: 12, rating: 4.8, trips: 156, phone: '98220 12345', verified: true, location: 'Karnal' },
  { id: 't2', name: 'Desi Transporters', vehicleType: 'Tractor', capacity: '2 Tons', ratePerKm: 15, rating: 4.5, trips: 89, phone: '94140 55667', verified: true, location: 'Panipat' },
  { id: 't3', name: 'National Agri-Freight', vehicleType: 'Medium Truck', capacity: '5 Tons', ratePerKm: 25, rating: 4.9, trips: 412, phone: '99887 77665', verified: true, location: 'Delhi' },
];

const Market: React.FC<MarketProps> = ({ user, language }) => {
  const [activeTab, setActiveTab] = useState<MarketTab>(user?.role === 'buyer' ? 'buyer' : user?.role === 'farmer' ? 'farmer' : 'overview');
  const [showAddListing, setShowAddListing] = useState(false);
  const [listings, setListings] = useState<CropListing[]>([
    { id: 'l1', farmerId: 'f1', cropName: 'Premium Basmati Rice', variety: '1121 Export Quality', quantity: 500, unit: 'Quintal', pricePerUnit: 3400, location: 'Karnal, Haryana', images: ['https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80'], quality: 'A+', status: 'active' },
    { id: 'l2', farmerId: 'f2', cropName: 'Sharbati Gold Wheat', variety: 'Sharbati-C306', quantity: 200, unit: 'Quintal', pricePerUnit: 2200, location: 'Ujjain, MP', images: ['https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=800&q=80'], quality: 'A', status: 'active' },
    { id: 'l3', farmerId: 'f3', cropName: 'Sweet Juicing Sugarcane', variety: 'Co-86032', quantity: 1000, unit: 'Ton', pricePerUnit: 3200, location: 'Saharanpur, UP', images: ['https://images.unsplash.com/photo-1594488651083-023b8a721101?auto=format&fit=crop&w=800&q=80'], quality: 'B+', status: 'active' }
  ]);

  const [orders, setOrders] = useState<Order[]>([
    { id: 'o1', listingId: 'l1', cropName: 'Premium Basmati Rice', quantity: 50, totalPrice: 170000, buyerId: 'b1', buyerName: 'AgroExports Ltd', farmerId: 'f1', status: 'pending', date: '2023-10-25' },
    { id: 'o2', listingId: 'l2', cropName: 'Sharbati Gold Wheat', quantity: 10, totalPrice: 22000, buyerId: 'b1', buyerName: 'AgroExports Ltd', farmerId: 'f2', status: 'delivered', date: '2023-10-20' }
  ]);

  const [newListing, setNewListing] = useState({ crop: '', variety: '', quantity: '', price: '', location: '', quality: 'A' });
  const [searchQuery, setSearchQuery] = useState('');
  const [showBidModal, setShowBidModal] = useState<CropListing | null>(null);
  const [activeChat, setActiveChat] = useState<CropListing | null>(null);
  const [bidValue, setBidValue] = useState('');

  const filteredListings = useMemo(() => {
    return listings.filter(l => 
      l.cropName.toLowerCase().includes(searchQuery.toLowerCase()) || 
      l.location.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [listings, searchQuery]);

  const handleAddListing = (e: React.FormEvent) => {
    e.preventDefault();
    const listing: CropListing = {
      id: Math.random().toString(36).substr(2, 9),
      farmerId: user?.id || 'f1',
      cropName: newListing.crop,
      variety: newListing.variety,
      quantity: Number(newListing.quantity),
      unit: 'Quintal',
      pricePerUnit: Number(newListing.price),
      location: newListing.location || user?.location || 'India',
      images: ['https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=800&q=80'],
      quality: newListing.quality,
      status: 'active'
    };
    setListings([listing, ...listings]);
    setShowAddListing(false);
    setNewListing({ crop: '', variety: '', quantity: '', price: '', location: '', quality: 'A' });
  };

  const renderComingSoon = (type: 'Auctions' | 'Logistics') => {
    const icon = type === 'Auctions' ? 'fa-gavel' : 'fa-truck-fast';
    const description = type === 'Auctions' 
      ? 'Secure live bidding for your farm produce. Get the best market value through transparent real-time competition.' 
      : 'Connect with verified transporters. GPS-enabled harvest pickups and temperature-controlled logistics for your perishables.';
    
    return (
      <div className="flex flex-col items-center justify-center py-20 px-6 text-center animate-in fade-in zoom-in duration-700">
        <div className="relative mb-12">
          <div className={`w-32 h-32 rounded-[2.5rem] ${type === 'Auctions' ? 'saffron-gradient shadow-orange-200' : 'brand-gradient shadow-green-200'} flex items-center justify-center text-white text-5xl shadow-2xl relative z-10`}>
            <i className={`fas ${icon} ${type === 'Logistics' ? 'animate-bounce' : 'animate-[spin_4s_linear_infinite]'}`}></i>
          </div>
          <div className={`absolute inset-0 rounded-[2.5rem] ${type === 'Auctions' ? 'bg-orange-400' : 'bg-green-400'} opacity-20 blur-3xl animate-pulse scale-150`}></div>
        </div>
        
        <h2 className="text-4xl font-black text-slate-800 mb-4 tracking-tight">
          {type} Portal <span className={`${type === 'Auctions' ? 'text-orange-500' : 'text-green-600'}`}>is coming soon!</span>
        </h2>
        <p className="text-slate-500 max-w-lg mx-auto text-lg font-medium leading-relaxed mb-10">
          {description}
        </p>
        
        <div className="flex flex-wrap justify-center gap-4">
          <button className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-slate-800 active:scale-95 transition-all">
            Notify Me on Launch
          </button>
          <button onClick={() => setActiveTab('overview')} className="px-8 py-4 bg-white border border-slate-200 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] active:scale-95 transition-all">
            Back to Home
          </button>
        </div>

        <div className="mt-20 flex items-center gap-6 opacity-30 grayscale pointer-events-none">
          <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
          <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
          <div className="h-8 w-24 bg-slate-200 rounded-lg"></div>
        </div>
      </div>
    );
  };

  const renderFarmerDashboard = () => {
    const myListings = listings.filter(l => l.farmerId === user?.id);
    const myOrders = orders.filter(o => o.farmerId === user?.id);
    const totalEarnings = myOrders.filter(o => o.status === 'delivered').reduce((acc, o) => acc + o.totalPrice, 0);

    return (
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-xl">
              <img src={user?.avatar || `https://i.pravatar.cc/150?u=${user?.id}`} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Farmer Dashboard</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-green-600 font-black uppercase tracking-widest px-2 py-0.5 bg-green-50 rounded-lg border border-green-100">Verified Seller</span>
                <span className="text-[10px] text-slate-400 font-bold">{user?.location}</span>
              </div>
            </div>
          </div>
          <button onClick={() => setShowAddListing(true)} className="w-full md:w-auto px-8 py-4 brand-gradient text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl active:scale-95 transition-all">
            <i className="fas fa-plus-circle"></i> Create New Listing
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <DashboardMetric label="Active Stock" value={`${myListings.length} Items`} icon="fa-boxes-stacked" color="bg-green-50 text-green-600" />
          <DashboardMetric label="Net Earnings" value={`₹${totalEarnings.toLocaleString()}`} icon="fa-indian-rupee-sign" color="bg-orange-50 text-orange-600" />
          <DashboardMetric label="Orders Pending" value={myOrders.filter(o => o.status === 'pending').length} icon="fa-clock-rotate-left" color="bg-blue-50 text-blue-600" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><i className="fas fa-list text-green-500"></i> Your Current Listings</h3>
            {myListings.length === 0 ? (
              <div className="bg-white p-12 rounded-[2rem] border border-dashed border-slate-200 text-center text-slate-400">
                <i className="fas fa-seedling text-4xl mb-4 opacity-20"></i>
                <p className="font-bold">No active crop listings yet.</p>
              </div>
            ) : (
              myListings.map(listing => (
                <div key={listing.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-6">
                    <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-inner shrink-0 border border-slate-50"><img src={listing.images[0]} className="w-full h-full object-cover" alt="" /></div>
                    <div>
                      <h4 className="font-bold text-lg text-slate-800">{listing.cropName}</h4>
                      <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">{listing.variety} • {listing.quantity} {listing.unit}s</div>
                      <div className="mt-2 flex gap-2"><span className="px-2 py-1 bg-green-50 text-green-600 text-[10px] font-black rounded-lg uppercase">Grade {listing.quality}</span></div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end gap-2">
                    <div className="text-2xl font-black text-slate-900">₹{listing.pricePerUnit}/{listing.unit[0]}</div>
                    <div className="flex gap-2">
                      <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-blue-600 transition-colors"><i className="fas fa-edit"></i></button>
                      <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:text-red-500 transition-colors"><i className="fas fa-trash"></i></button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><i className="fas fa-receipt text-orange-500"></i> Recent Orders</h3>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
              {myOrders.length === 0 ? (
                <div className="p-10 text-center text-slate-300 text-xs font-bold uppercase tracking-widest">No orders found</div>
              ) : (
                myOrders.map(order => (
                  <div key={order.id} className="p-5 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{order.cropName}</div>
                        <div className="text-[9px] text-slate-400 font-black uppercase">By {order.buyerName}</div>
                      </div>
                      <span className={`text-[8px] font-black px-2 py-1 rounded-md uppercase ${order.status === 'pending' ? 'bg-orange-100 text-orange-600' : 'bg-green-100 text-green-600'}`}>
                        {order.status}
                      </span>
                    </div>
                    <div className="flex justify-between items-center mt-3">
                      <div className="text-xs font-black text-slate-900">₹{order.totalPrice.toLocaleString()}</div>
                      <button className="text-[9px] font-black text-blue-600 uppercase tracking-widest hover:underline">View Details</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderBuyerDashboard = () => {
    const myPurchases = orders.filter(o => o.buyerId === user?.id);
    const totalSpent = myPurchases.reduce((acc, o) => acc + o.totalPrice, 0);

    return (
      <div className="animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="flex items-center gap-5">
             <div className="w-16 h-16 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-slate-100">
              <img src={user?.avatar || `https://i.pravatar.cc/150?u=${user?.id}`} className="w-full h-full object-cover" alt="" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-800">Buyer Dashboard</h2>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-[10px] text-orange-600 font-black uppercase tracking-widest px-2 py-0.5 bg-orange-50 rounded-lg border border-orange-100">Verified Buyer</span>
                <span className="text-[10px] text-slate-400 font-bold">{user?.businessName || user?.name}</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-80 relative">
            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-300"></i>
            <input 
              type="text" 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search farm produce..." 
              className="w-full pl-12 pr-5 py-4 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500 font-bold text-sm shadow-sm" 
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <DashboardMetric label="Active Purchases" value={myPurchases.filter(p => p.status !== 'delivered').length} icon="fa-bag-shopping" color="bg-orange-50 text-orange-600" />
          <DashboardMetric label="Total Investment" value={`₹${totalSpent.toLocaleString()}`} icon="fa-chart-pie" color="bg-blue-50 text-blue-600" />
          <DashboardMetric label="Saved Farmers" value="12" icon="fa-heart" color="bg-red-50 text-red-600" />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center justify-between">
              <span><i className="fas fa-store text-green-500 mr-2"></i> Verified Farm Listings</span>
              <span className="text-[10px] font-bold text-slate-400">{filteredListings.length} found</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {filteredListings.map(listing => (
                <div key={listing.id} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all group flex flex-col">
                  <div className="relative h-44 overflow-hidden">
                    <img src={listing.images[0]} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" />
                    <div className="absolute top-3 right-3 px-3 py-1 bg-white/95 backdrop-blur-md rounded-full text-[9px] font-black shadow-sm border border-black/5">
                      GRADE {listing.quality}
                    </div>
                  </div>
                  <div className="p-6 flex-grow flex flex-col">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-base font-black text-slate-800 leading-tight">{listing.cropName}</h3>
                        <div className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{listing.variety}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-black text-green-700 leading-none">₹{listing.pricePerUnit}</div>
                        <div className="text-[8px] text-slate-400 font-bold uppercase mt-1">per {listing.unit[0]}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-4">
                      <i className="fas fa-map-marker-alt text-orange-500 text-[10px]"></i>
                      <span className="text-[10px] font-bold text-slate-500">{listing.location}</span>
                    </div>
                    <div className="mt-auto grid grid-cols-2 gap-2 pt-4 border-t border-slate-50">
                      <button onClick={() => setActiveChat(listing)} className="py-2.5 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest shadow-md active:scale-95 transition-all">Chat</button>
                      <button onClick={() => setShowBidModal(listing)} className="py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl font-black text-[9px] uppercase tracking-widest active:scale-95 transition-all">Bid</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight flex items-center gap-2"><i className="fas fa-truck-moving text-blue-500"></i> Track Deliveries</h3>
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6">
              {myPurchases.length === 0 ? (
                <p className="text-center py-10 text-slate-300 text-xs font-bold uppercase tracking-widest">No shipments found</p>
              ) : (
                <div className="space-y-6">
                  {myPurchases.slice(0, 3).map(order => (
                    <div key={order.id} className="relative pl-6 pb-6 last:pb-0">
                      <div className={`absolute left-0 top-0 bottom-0 w-0.5 ${order.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500'}`}></div>
                      <div className={`absolute left-[-4px] top-0 w-2.5 h-2.5 rounded-full ${order.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500 animate-pulse'}`}></div>
                      <div className="text-[10px] font-black text-slate-800 leading-none mb-1">{order.cropName}</div>
                      <div className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter mb-2">Order ID: {order.id}</div>
                      <div className={`inline-block px-2 py-0.5 rounded-md text-[8px] font-black uppercase ${order.status === 'delivered' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}>
                        {order.status}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {/* Navigation Tabs */}
      <div className="flex overflow-x-auto no-scrollbar gap-2 p-1.5 bg-slate-100 rounded-[1.5rem] w-full md:w-fit mb-10 shadow-inner">
        <TabBtn label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
        <TabBtn label="Farmer Dashboard" active={activeTab === 'farmer'} onClick={() => setActiveTab('farmer')} />
        <TabBtn label="Buyer Portal" active={activeTab === 'buyer'} onClick={() => setActiveTab('buyer')} />
        <TabBtn label="Auctions" active={activeTab === 'auctions'} onClick={() => setActiveTab('auctions')} />
        <TabBtn label="Logistics" active={activeTab === 'logistics'} onClick={() => setActiveTab('logistics')} />
      </div>

      {activeTab === 'overview' && (
        <div className="animate-in fade-in duration-500">
           <div className="grid md:grid-cols-4 gap-6 mb-12">
            <StatCard icon="fa-users" label="Active Farmers" value="12,500+" color="text-green-600" />
            <StatCard icon="fa-user-tie" label="Verified Buyers" value="8,400+" color="text-orange-500" />
            <StatCard icon="fa-indian-rupee-sign" label="Monthly Trade" value="₹4.2 Cr" color="text-blue-600" />
            <StatCard icon="fa-thumbs-up" label="Success Rate" value="98.4%" color="text-emerald-500" />
          </div>

          <div className="bg-slate-900 rounded-[3rem] p-10 md:p-16 text-white relative overflow-hidden mb-12 shadow-2xl">
            <div className="relative z-10 max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Direct from Farm. <span className="text-green-400">Verified.</span></h2>
              <p className="text-slate-400 text-lg mb-10 leading-relaxed font-medium">Connect with verified buyers and sellers across India. No hidden commissions, secure logistics, and expert support.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setActiveTab('farmer')} className="px-10 py-5 saffron-gradient text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest">Start Selling Today</button>
                <button onClick={() => setActiveTab('buyer')} className="px-10 py-5 bg-white/10 text-white border border-white/10 hover:bg-white/20 rounded-2xl font-black active:scale-95 transition-all text-xs uppercase tracking-widest">Browse Market</button>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-[100px] translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 right-20 hidden md:block opacity-20">
               <i className="fas fa-tractor text-[12rem]"></i>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'farmer' && renderFarmerDashboard()}
      {activeTab === 'buyer' && renderBuyerDashboard()}
      {activeTab === 'auctions' && renderComingSoon('Auctions')}
      {activeTab === 'logistics' && renderComingSoon('Logistics')}
      
      {/* Modal: Add Listing */}
      {showAddListing && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800">Add New Listing</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Direct Market Submission</p>
              </div>
              <button onClick={() => setShowAddListing(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={handleAddListing} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <InputGroup label="Crop Name" value={newListing.crop} onChange={e => setNewListing({...newListing, crop: e.target.value})} placeholder="e.g. Wheat" required />
                <InputGroup label="Variety" value={newListing.variety} onChange={e => setNewListing({...newListing, variety: e.target.value})} placeholder="e.g. Sharbati" required />
                <InputGroup label="Quantity (Quintals)" type="number" value={newListing.quantity} onChange={e => setNewListing({...newListing, quantity: e.target.value})} placeholder="100" required />
                <InputGroup label="Price / Quintal (₹)" type="number" value={newListing.price} onChange={e => setNewListing({...newListing, price: e.target.value})} placeholder="2200" required />
              </div>
              <InputGroup label="Location" value={newListing.location} onChange={e => setNewListing({...newListing, location: e.target.value})} placeholder="Your Village, District" required />
              <div><label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Quality Grade</label><div className="grid grid-cols-3 gap-3">{['A+', 'A', 'B+'].map(q => (<button key={q} type="button" onClick={() => setNewListing({...newListing, quality: q})} className={`py-3 rounded-xl font-bold border-2 transition-all ${newListing.quality === q ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-100 text-slate-400'}`}>{q}</button>))}</div></div>
              <div className="pt-4"><button type="submit" className="w-full py-5 brand-gradient text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest">Post Verified Listing</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const TabBtn: React.FC<{ label: string, active: boolean, onClick: () => void }> = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${active ? 'bg-white text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
  >
    {label}
  </button>
);

const StatCard: React.FC<{ icon: string, label: string, value: string, color: string }> = ({ icon, label, value, color }) => (
  <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-slate-50 flex flex-col items-center text-center">
    <div className={`w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-xl mb-4 ${color}`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div className="text-2xl font-black text-slate-800 leading-none mb-1">{value}</div>
    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</div>
  </div>
);

const DashboardMetric: React.FC<{ label: string, value: string | number, icon: string, color: string }> = ({ label, value, icon, color }) => (
  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${color}`}>
      <i className={`fas ${icon}`}></i>
    </div>
    <div>
      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">{label}</div>
      <div className="text-xl font-black text-slate-800">{value}</div>
    </div>
  </div>
);

const InputGroup: React.FC<{ label: string, value: string, onChange: (e: any) => void, placeholder: string, type?: string, required?: boolean }> = ({ label, value, onChange, placeholder, type = 'text', required }) => (
  <div>
    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{label}</label>
    <input 
      type={type} value={value} onChange={onChange} placeholder={placeholder} required={required}
      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none text-sm"
    />
  </div>
);

export default Market;
