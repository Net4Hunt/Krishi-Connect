
import React, { useState, useMemo, useRef } from 'react';
import { MOCK_EQUIPMENT } from '../constants';
import { EquipmentRental, Language } from '../types';
import VerificationModal from '../components/VerificationModal';

const Equipment: React.FC<{ language: Language }> = ({ language }) => {
  const [equipmentList, setEquipmentList] = useState<EquipmentRental[]>(MOCK_EQUIPMENT);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showListModal, setShowListModal] = useState(false);
  const [showBookModal, setShowBookModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EquipmentRental | null>(null);
  
  // Verification States
  const [verifyingPhone, setVerifyingPhone] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);

  // Listing / Editing form states
  const [listData, setListData] = useState({ 
    name: '', 
    category: 'Tractors', 
    price: '', 
    phone: '', 
    description: '',
    images: [] as string[] 
  });

  const categories = ['All', 'Tractors', 'Harvesters', 'Seeders', 'Tillers', 'Sprayers', 'Levelers'];

  const filteredEquipment = useMemo(() => {
    if (selectedCategory === 'All') return equipmentList;
    return equipmentList.filter(item => item.category === selectedCategory);
  }, [selectedCategory, equipmentList]);

  const handleMultipleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const readers = files.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(readers).then(newImages => {
      setListData(prev => ({
        ...prev,
        images: [...prev.images, ...newImages].slice(0, 5) // Limit to 5 images
      }));
    });
  };

  const removeImage = (index: number) => {
    setListData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const openDetails = (item: EquipmentRental) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const openBooking = (item: EquipmentRental) => {
    setSelectedItem(item);
    setShowBookModal(true);
  };

  const openEdit = (item: EquipmentRental) => {
    setSelectedItem(item);
    setListData({
      name: item.name,
      category: item.category,
      price: item.dailyRate.toString(),
      phone: '9876543210', // Placeholder
      description: item.description || '',
      images: item.images || []
    });
    setShowEditModal(true);
  };

  const handleBookingConfirm = () => {
    if (!selectedItem) return;
    setPendingAction(() => () => {
      alert(`Booking Confirmed! ${selectedItem.ownerName} will contact you shortly.`);
      setShowBookModal(false);
    });
    setVerifyingPhone('9876543210'); 
  };

  const handleListSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!listData.phone || listData.phone.length < 10) {
      alert("Invalid phone number.");
      return;
    }
    setPendingAction(() => () => {
      const newItem: EquipmentRental = {
        id: `e${Date.now()}`,
        name: listData.name,
        category: listData.category,
        dailyRate: Number(listData.price),
        ownerName: 'You',
        rating: 5.0,
        available: true,
        operatorIncluded: true,
        description: listData.description,
        images: listData.images.length > 0 ? listData.images : ['https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&w=800&q=80']
      };
      setEquipmentList([newItem, ...equipmentList]);
      setShowListModal(false);
      resetFormData();
      alert("Equipment Listed Successfully!");
    });
    setVerifyingPhone(listData.phone);
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;

    setPendingAction(() => () => {
      setEquipmentList(prev => prev.map(item => 
        item.id === selectedItem.id 
          ? { 
              ...item, 
              name: listData.name, 
              category: listData.category, 
              dailyRate: Number(listData.price), 
              description: listData.description,
              images: listData.images 
            } 
          : item
      ));
      setShowEditModal(false);
      resetFormData();
      alert("Listing Updated Successfully!");
    });
    setVerifyingPhone(listData.phone);
  };

  const resetFormData = () => {
    setListData({ name: '', category: 'Tractors', price: '', phone: '', description: '', images: [] });
    setSelectedItem(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
      {verifyingPhone && (
        <VerificationModal 
          phone={verifyingPhone} 
          onSuccess={() => { setVerifyingPhone(null); if (pendingAction) pendingAction(); }}
          onCancel={() => setVerifyingPhone(null)} 
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Agri-Rental Hub</h1>
          <p className="text-slate-500 font-medium">Rent high-tech machinery from verified owners</p>
        </div>
        <button 
          onClick={() => { resetFormData(); setShowListModal(true); }}
          className="px-8 py-4 brand-gradient text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest flex items-center gap-3"
        >
          <i className="fas fa-plus-circle"></i> List My Machine
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 space-y-6">
          <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Market Segments</h4>
          <div className="flex flex-row md:flex-col overflow-x-auto md:overflow-visible gap-2 pb-4 md:pb-0 no-scrollbar">
            {categories.map(cat => (
              <button 
                key={cat} onClick={() => setSelectedCategory(cat)}
                className={`flex items-center gap-3 px-5 py-4 rounded-2xl border-2 transition-all text-xs font-black uppercase tracking-widest min-w-fit md:min-w-0 ${selectedCategory === cat ? 'brand-gradient text-white border-transparent shadow-lg' : 'bg-white text-slate-500 border-slate-100 hover:border-green-200'}`}
              >
                <i className={`fas ${cat === 'Tractors' ? 'fa-tractor' : cat === 'Harvesters' ? 'fa-wheat-awn' : 'fa-cog'} opacity-60`}></i>
                {cat}
              </button>
            ))}
          </div>
        </aside>

        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-2 gap-6 md:gap-8">
          {filteredEquipment.length > 0 ? (
            filteredEquipment.map(item => (
              <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 shadow-lg hover:shadow-2xl transition-all group flex flex-col">
                <div className="relative h-48 sm:h-56 overflow-hidden">
                  <img src={item.images?.[0] || 'https://via.placeholder.com/400x300?text=No+Image'} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt="" />
                  <div className="absolute top-4 left-4 bg-white/95 rounded-full px-4 py-1.5 text-[10px] font-black border border-black/5 flex items-center gap-2 shadow-sm">
                    <span className={`w-2 h-2 rounded-full ${item.available ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                    {item.available ? 'READY FOR RENT' : 'OCCUPIED'}
                  </div>
                  {item.ownerName === 'You' && (
                    <button 
                      onClick={() => openEdit(item)}
                      className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur rounded-full flex items-center justify-center text-slate-700 shadow-lg hover:bg-white transition-colors"
                    >
                      <i className="fas fa-edit"></i>
                    </button>
                  )}
                </div>
                <div className="p-6 md:p-8 flex-grow flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold mb-1 text-slate-800 leading-tight group-hover:text-green-700 transition-colors">{item.name}</h3>
                      <div className="text-[10px] text-slate-400 uppercase font-black tracking-widest">{item.category}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-black text-slate-900 leading-none">₹{item.dailyRate}</div>
                      <div className="text-[8px] text-slate-400 font-bold mt-1">/DAY</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3 mt-auto">
                    <button onClick={() => openBooking(item)} disabled={!item.available} className={`py-4 rounded-xl font-black uppercase text-[10px] shadow-lg active:scale-95 transition-all ${item.available ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}>Book Now</button>
                    <button onClick={() => openDetails(item)} className="py-4 bg-slate-50 text-slate-700 rounded-xl font-black border active:scale-95 transition-all text-[10px] uppercase">Review Specs</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 py-20 bg-white rounded-[2.5rem] border border-dashed border-slate-200 flex flex-col items-center justify-center text-slate-400 text-center">
              <i className="fas fa-tractor text-5xl mb-4 opacity-20"></i>
              <p className="font-bold">No items found in this category.</p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL: List / Edit Equipment */}
      {(showListModal || showEditModal) && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] p-8 md:p-12 shadow-2xl animate-in zoom-in-95 duration-300 overflow-y-auto no-scrollbar max-h-[90vh]">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-2xl font-black text-slate-800">{showEditModal ? 'Edit Listing' : 'List Your Machinery'}</h2>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Direct Rental Submission</p>
              </div>
              <button onClick={() => { setShowListModal(false); setShowEditModal(false); resetFormData(); }} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-red-500 transition-colors"><i className="fas fa-times"></i></button>
            </div>
            <form onSubmit={showEditModal ? handleEditSubmit : handleListSubmit} className="space-y-6">
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Machine Name</label>
                <input type="text" required value={listData.name} onChange={e => setListData({...listData, name: e.target.value})} placeholder="e.g. Sonalika Tiger 50" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none text-sm" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category</label>
                  <select value={listData.category} onChange={e => setListData({...listData, category: e.target.value})} className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none text-sm">
                    {categories.slice(1).map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Rent / Day (₹)</label>
                  <input type="number" required value={listData.price} onChange={e => setListData({...listData, price: e.target.value})} placeholder="1200" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none text-sm" />
                </div>
              </div>
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Mobile Number (For Verification)</label>
                <input type="tel" required value={listData.phone} onChange={e => setListData({...listData, phone: e.target.value.replace(/\D/g, '')})} placeholder="9876543210" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none text-sm" />
              </div>
              
              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4 ml-1">Machine Photos (Up to 5)</label>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {listData.images.map((img, idx) => (
                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-slate-200 group">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                      <button 
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-[10px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <i className="fas fa-times"></i>
                      </button>
                    </div>
                  ))}
                  {listData.images.length < 5 && (
                    <label className="aspect-square bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-slate-100 transition-colors">
                      <i className="fas fa-camera text-slate-300"></i>
                      <span className="text-[8px] font-black text-slate-400 uppercase">Add</span>
                      <input type="file" multiple className="hidden" accept="image/*" onChange={handleMultipleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Description</label>
                <textarea 
                  value={listData.description} 
                  onChange={e => setListData({...listData, description: e.target.value})} 
                  placeholder="Tell farmers about machine condition, attachments included, etc."
                  className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl font-bold focus:ring-2 focus:ring-green-500 outline-none text-sm h-24"
                ></textarea>
              </div>

              <button type="submit" className="w-full py-5 saffron-gradient text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest">
                {showEditModal ? 'Update Listing & Verify' : 'Post & Verify Number'}
              </button>
            </form>
          </div>
        </div>
      )}

      {showBookModal && selectedItem && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl animate-in zoom-in-95 duration-300 text-center">
            <div className="w-20 h-20 brand-gradient text-white rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-xl">
              <i className="fas fa-calendar-check"></i>
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">Confirm Booking</h3>
            <p className="text-sm text-slate-500 mb-8">Renting <strong>{selectedItem.name}</strong> at ₹{selectedItem.dailyRate}/day.</p>
            <div className="flex flex-col gap-3">
              <button onClick={handleBookingConfirm} className="w-full py-5 brand-gradient text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest">Verify & Reserve</button>
              <button onClick={() => setShowBookModal(false)} className="w-full py-4 text-slate-400 font-bold uppercase text-[10px] tracking-widest">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showDetailsModal && selectedItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto no-scrollbar flex flex-col md:flex-row">
            <div className="md:w-1/2 bg-slate-100 flex flex-col">
              <div className="flex-grow">
                <img src={selectedItem.images?.[0] || 'https://via.placeholder.com/800x600'} className="w-full h-full object-cover" alt="" />
              </div>
              {selectedItem.images && selectedItem.images.length > 1 && (
                <div className="p-4 grid grid-cols-4 gap-2 bg-white/50 backdrop-blur">
                  {selectedItem.images.slice(1).map((img, i) => (
                    <div key={i} className="aspect-square rounded-lg overflow-hidden border border-black/10">
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="md:w-1/2 p-10 flex flex-col">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-black text-slate-800 mb-1">{selectedItem.name}</h2>
                  <div className="text-[10px] font-black text-green-600 uppercase">{selectedItem.category}</div>
                </div>
                <button onClick={() => setShowDetailsModal(false)} className="text-slate-300 hover:text-slate-800"><i className="fas fa-times text-xl"></i></button>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-6 mb-8 border border-slate-100">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Technical Details</h4>
                <p className="text-sm text-slate-600 leading-relaxed">{selectedItem.description || "Powerful and reliable machinery available for all farming needs."}</p>
              </div>

              <div className="space-y-4 mb-8">
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400 font-bold">Condition</span>
                   <span className="text-slate-800 font-black">{selectedItem.condition || 'Good'}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400 font-bold">Operator</span>
                   <span className="text-slate-800 font-black">{selectedItem.operatorIncluded ? 'Included' : 'Not Included'}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                   <span className="text-slate-400 font-bold">Owner</span>
                   <span className="text-slate-800 font-black">{selectedItem.ownerName}</span>
                 </div>
              </div>

              <div className="mt-auto flex items-center justify-between pt-6 border-t gap-4">
                <div className="text-2xl font-black text-slate-900">₹{selectedItem.dailyRate}<span className="text-[10px] text-slate-400 ml-1 uppercase">/Day</span></div>
                <button onClick={() => { setShowDetailsModal(false); openBooking(selectedItem); }} disabled={!selectedItem.available} className={`flex-grow py-4 rounded-2xl font-black text-white active:scale-95 transition-all text-xs uppercase tracking-widest ${selectedItem.available ? 'brand-gradient' : 'bg-slate-200 cursor-not-allowed'}`}>Rent Now</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipment;