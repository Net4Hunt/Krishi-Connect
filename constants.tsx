
import { MandiPrice, WorkerProfile, EquipmentRental, Expert, CommunityPost, Scheme, CSCCentre, Retailer, AgriOfficer, BankManager, AgriAlert } from './types';

export const COLORS = {
  leafGreen: '#2E7D32',
  freshGreen: '#43A047',
  indiaSaffron: '#FF9933',
  earthBrown: '#8B4513',
  waterBlue: '#1E88E5',
  harvestGold: '#FFA000',
  soilDark: '#5D4037',
};

export const MOCK_ALERTS: AgriAlert[] = [
  {
    id: 'alt1',
    category: 'pest',
    severity: 'critical',
    title: 'Locust Swarm Detected',
    description: 'A massive swarm of desert locusts has been spotted moving East-North-East. Expected arrival in Karnal district within 4 hours.',
    location: 'Karnal, Haryana',
    radius: 50,
    timestamp: '10:30 AM',
    expectedTime: 'Within 4 Hours',
    isConfirmed: true, // Fix: Added missing required property
    impactAssessment: {
      crops: ['Wheat', 'Mustard', 'Vegetables'],
      potentialDamage: '70-90%',
      financialRisk: 'High'
    },
    actions: [
      'Coordinate with neighbors for loud noise generation (drums/utensils)',
      'Prepare smoke fires around field borders',
      'Keep pesticide sprayers ready for evening deployment',
      'Move livestock to covered shelters'
    ]
  },
  {
    id: 'alt2',
    category: 'weather',
    severity: 'urgent',
    title: 'Severe Hailstorm Warning',
    description: 'IMD reports high-intensity convective clouds forming over Western UP. Significant chance of large hailstones.',
    location: 'Meerut Region',
    radius: 120,
    timestamp: '09:15 AM',
    expectedTime: 'Next 12-18 Hours',
    isConfirmed: true, // Fix: Added missing required property
    impactAssessment: {
      crops: ['Mango Orchards', 'Sugarcane'],
      potentialDamage: '40-60%',
      financialRisk: 'Moderate'
    },
    actions: [
      'Deploy anti-hail nets if available',
      'Harvest mature crops immediately',
      'Clear drainage channels to prevent waterlogging',
      'Secure loose farm structures'
    ]
  },
  {
    id: 'alt3',
    category: 'disease',
    severity: 'standard',
    title: 'Rice Blast Outbreak',
    description: 'Early signs of Rice Blast (Magnaporthe oryzae) detected in 3 neighboring blocks. Favorable humidity for spread.',
    location: 'Patiala District',
    radius: 30,
    timestamp: 'Yesterday',
    expectedTime: 'Next 3-5 Days',
    isConfirmed: true, // Fix: Added missing required property
    impactAssessment: {
      crops: ['Basmati Rice'],
      potentialDamage: '20-30%',
      financialRisk: 'Low (if treated early)'
    },
    actions: [
      'Inspect crop nodes and leaf collars for spindle-shaped lesions',
      'Avoid excessive nitrogen fertilizer application',
      'Maintain proper water levels in fields',
      'Consult Agri-Officer for recommended fungicide'
    ]
  }
];

export const MOCK_RETAILERS: Retailer[] = [
  { id: 'r1', name: 'Kisan Seva Kendra', owner: 'Vijay Sharma', licenseNo: 'FERT/2023/HR/442', location: 'Karnal', address: 'Near Old Bus Stand, Karnal, Haryana', phone: '98765 11223', rating: 4.7, brands: ['IFFCO', 'KRIBHCO', 'TATA Paras'], isVerified: true, distance: '1.2 km', stockStatus: 'In Stock' },
  { id: 'r2', name: 'Bharat Fertilizers & Seeds', owner: 'Ramesh Gupta', licenseNo: 'FERT/2022/PB/109', location: 'Patiala', address: 'Main Mandi Road, Patiala, Punjab', phone: '98123 44556', rating: 4.5, brands: ['IFFCO', 'Chambal', 'IPL'], isVerified: true, distance: '4.8 km', stockStatus: 'Limited' },
];

export const MOCK_WORKERS: WorkerProfile[] = [
  { 
    id: 'w1', name: 'Ram Singh', phone: '98765 00001', avatar: 'https://i.pravatar.cc/150?u=ram', skills: ['Harvesting', 'Plowing', 'Rice Grafting'], dailyRate: 650, rating: 4.8, location: 'Karnal', distance: '3.2 km', available: true, 
    isVerified: true, isCertified: true, trustScore: 98, gender: 'Male', languages: ['Hindi', 'Punjabi'], toolsOwned: ['Sickle', 'Spade'], tripsCompleted: 142, mgnregaId: 'MGN-9981-KC'
  },
  { 
    id: 'w2', name: 'Sunita Mehra', phone: '98765 00002', avatar: 'https://i.pravatar.cc/150?u=sunita', skills: ['Pruning', 'Organic Prep', 'Sorting'], dailyRate: 550, rating: 4.9, location: 'Sonipat', distance: '5.1 km', available: true,
    isVerified: true, isCertified: false, trustScore: 92, gender: 'Female', languages: ['Hindi'], toolsOwned: ['Pruning Shears'], tripsCompleted: 85
  },
  { 
    id: 'w3', name: 'Mohan Lal', phone: '98765 00003', avatar: 'https://i.pravatar.cc/150?u=mohan', skills: ['Tractor Driver', 'Irrigation Expert'], dailyRate: 850, rating: 4.5, location: 'Panipat', distance: '1.5 km', available: false,
    isVerified: true, isCertified: true, trustScore: 88, gender: 'Male', languages: ['Hindi', 'Haryanvi'], toolsOwned: ['Tool Kit'], tripsCompleted: 210, mgnregaId: 'MGN-7721-KC'
  },
  { 
    id: 'w4', name: 'Gopal Dass', phone: '98765 00004', avatar: 'https://i.pravatar.cc/150?u=gopal', skills: ['Manual Labor', 'Loading'], dailyRate: 500, rating: 4.2, location: 'Karnal', distance: '2.1 km', available: true,
    isVerified: false, isCertified: false, trustScore: 75, gender: 'Male', languages: ['Hindi'], toolsOwned: [], tripsCompleted: 12
  }
];

export const MOCK_PRICES: MandiPrice[] = [
  { crop: 'Wheat (गेहूं)', mandi: 'Kota, Rajasthan', price: 2150, trend: 'up', change: 2.5, lastUpdated: '10:00 AM' },
  { crop: 'Rice (चावल)', mandi: 'Karnal, Haryana', price: 3400, trend: 'up', change: 1.8, lastUpdated: '10:15 AM' },
];

export const MOCK_EQUIPMENT: EquipmentRental[] = [
  { 
    id: 'e1', 
    name: 'Mahindra 575 DI Tractor', 
    category: 'Tractors', 
    dailyRate: 1500, 
    ownerName: 'Rajesh Farms', 
    rating: 4.9, 
    available: true, 
    operatorIncluded: true, 
    description: 'Powerful 45 HP tractor.', 
    condition: 'Excellent', 
    images: ['https://images.unsplash.com/photo-1595113316349-9fa4ee24f884?auto=format&fit=crop&w=800&q=80'] 
  },
];

export const MOCK_EXPERTS: Expert[] = [
  { 
    id: 'exp1', 
    name: 'Dr. Ramesh Singh', 
    title: 'Senior Agronomist', 
    tier: 4, 
    specializations: ['Paddy', 'Soil Science'], 
    languages: ['Hindi', 'English'], 
    rating: 4.9, 
    reviewsCount: 1240, 
    sessionsCompleted: 4500, 
    hourlyRate: 0, 
    avatar: 'https://i.pravatar.cc/150?u=ramesh', 
    bio: '20+ years experience in soil fertility and rice cultivation.', 
    online: true,
    verifications: ['Government Verified', 'PhD Certified', 'Farmer Peer Reviewed']
  },
  { 
    id: 'exp2', 
    name: 'Anand Verma', 
    title: 'Precision Irrigation Lead', 
    tier: 3, 
    specializations: ['Drip Irrigation', 'Automation'], 
    languages: ['Hindi', 'English'], 
    rating: 4.7, 
    reviewsCount: 850, 
    sessionsCompleted: 1200, 
    hourlyRate: 350, 
    avatar: 'https://i.pravatar.cc/150?u=anand', 
    bio: 'Specialist in automated irrigation systems.', 
    online: true,
    verifications: ['Farmer Peer Reviewed']
  },
  { 
    id: 'exp3', 
    name: 'Dr. Kavita Reddy', 
    title: 'Plant Pathologist', 
    tier: 4, 
    specializations: ['Pest Control', 'Cotton'], 
    languages: ['Telugu', 'English'], 
    rating: 4.9, 
    reviewsCount: 560, 
    sessionsCompleted: 980, 
    hourlyRate: 500, 
    avatar: 'https://i.pravatar.cc/150?u=kavita', 
    bio: 'PhD from IARI, specializing in cotton pest management.', 
    online: false,
    verifications: ['Government Verified', 'PhD Certified']
  }
];

export const MOCK_POSTS: CommunityPost[] = [
  { id: 'p1', authorId: 'u1', authorName: 'Rajesh Kumar', authorLocation: 'Karnal, Haryana', title: 'Yellow spots on wheat', content: 'Rust disease?', crop: 'Wheat', tags: ['Disease', 'Wheat'], isUrgent: true, upvotes: 42, repliesCount: 12, timestamp: '2 hours ago' },
];

export const MOCK_SCHEMES: Scheme[] = [
  { 
    id: 's1', 
    title: "PM-KISAN", 
    dept: "Ministry of Agriculture", 
    benefit: "₹6,000 per year", 
    desc: "Direct income support to all landholding farmer families across the country.", 
    tags: ['Income Support', 'Financial'], 
    officialUrl: "https://pmkisan.gov.in/", 
    eligibilityCriteria: { minLandSize: 0, states: ['All States'], categories: ['All Categories'] } 
  },
  { 
    id: 's2', 
    title: "PMFBY", 
    dept: "Insurance Companies", 
    benefit: "Crop Loss Coverage", 
    desc: "Pradhan Mantri Fasal Bima Yojana offers low premium insurance against crop failure.", 
    tags: ['Insurance', 'Security'], 
    officialUrl: "https://pmfby.gov.in/", 
    eligibilityCriteria: { minLandSize: 0, states: ['All States'], categories: ['All Categories'] } 
  },
  { 
    id: 's3', 
    title: "Soil Health Card", 
    dept: "Ministry of Agriculture", 
    benefit: "Free Soil Testing", 
    desc: "Get free nutrient analysis of your farm soil along with fertilizer recommendations.", 
    tags: ['Testing', 'Productivity'], 
    officialUrl: "https://soilhealth.dac.gov.in/", 
    eligibilityCriteria: { minLandSize: 0, states: ['All States'], categories: ['All Categories'] } 
  },
  { 
    id: 's4', 
    title: "Kisan Credit Card (KCC)", 
    dept: "Banks / NABARD", 
    benefit: "Low Interest Credit", 
    desc: "Easy access to short-term credit for cultivation, post-harvest, and maintenance needs.", 
    tags: ['Credit', 'Finance'], 
    officialUrl: "https://www.nabard.org/", 
    eligibilityCriteria: { minLandSize: 0, states: ['All States'], categories: ['All Categories'] } 
  },
  { 
    id: 's5', 
    title: "Farm Machinery Subsidy", 
    dept: "State Agriculture Dept", 
    benefit: "Up to 50% Subsidy", 
    desc: "Financial assistance for purchasing tractors, tillers, and other high-tech machinery.", 
    tags: ['Subsidy', 'Machinery'], 
    officialUrl: "https://agrimachinery.nic.in/index/index", 
    eligibilityCriteria: { minLandSize: 1, states: ['All States'], categories: ['Small & Marginal Farmers'] } 
  },
  { 
    id: 's6', 
    title: "National Bee Board", 
    dept: "Ministry of Agriculture", 
    benefit: "Training & Funding", 
    desc: "Support for beekeeping to double income through pollination and honey production.", 
    tags: ['Allied', 'Training'], 
    officialUrl: "https://nbb.gov.in/default.html", 
    eligibilityCriteria: { minLandSize: 0, states: ['All States'], categories: ['All Categories'] } 
  },
];

export const MOCK_CSC_CENTRES: CSCCentre[] = [
  { id: 'csc1', name: "Rampur Digital Seva Kendra", operator: "Amit Sharma", address: "Main Market, Rampur", phone: "98765 12345", distance: "1.2 km", rating: 4.8 },
  { id: 'csc2', name: "Kisan Mitra CSC", operator: "Suresh Gupta", address: "Opp. SBI Bank, Civil Lines", phone: "98123 44556", distance: "3.5 km", rating: 4.6 },
];

export const MOCK_AGRI_OFFICERS: AgriOfficer[] = [
  { id: 'ao1', name: "Sanjay Deshmukh", designation: "Block Development Officer (Agri)", district: "Karnal", phone: "98122 00112", availability: "Mon-Fri, 10 AM - 4 PM" },
  { id: 'ao2', name: "Vinita Kaur", designation: "District Agriculture Officer", district: "Patiala", phone: "94112 33445", availability: "Tue & Thu, 11 AM - 3 PM" },
];

export const MOCK_BANK_MANAGERS: BankManager[] = [
  { id: 'bm1', name: "Vikram Mehta", bank: "State Bank of India", branch: "Civil Lines, Karnal", phone: "98760 98760", specialization: "KCC & Gold Loans" },
  { id: 'bm2', name: "Anil Kapoor", bank: "Punjab National Bank", branch: "Main Mandi, Panipat", phone: "94123 55667", specialization: "Agri Machinery Finance" },
];
