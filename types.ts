
export type UserRole = 'farmer' | 'buyer' | 'worker' | 'expert' | 'retailer';
export type Language = 'English' | 'Hindi' | 'Gujarati' | 'Tamil' | 'Malayalam' | 'Kannada' | 'Punjabi' | 'Bengali' | 'Marathi' | 'Telugu';

export type AlertSeverity = 'critical' | 'urgent' | 'standard';
export type AlertCategory = 'weather' | 'pest' | 'disease' | 'market' | 'disaster';

export interface MandiPrice {
  crop: string;
  mandi: string;
  price: number;
  trend: 'up' | 'down' | 'stable';
  change: number;
  lastUpdated: string;
}

export interface EquipmentRental {
  id: string;
  name: string;
  category: string;
  dailyRate: number;
  ownerName: string;
  rating: number;
  available: boolean;
  operatorIncluded: boolean;
  description?: string;
  condition?: string;
  images: string[];
}

export interface Expert {
  id: string;
  name: string;
  title: string;
  tier: number;
  specializations: string[];
  languages: string[];
  rating: number;
  reviewsCount: number;
  sessionsCompleted: number;
  hourlyRate: number;
  avatar: string;
  bio: string;
  online: boolean;
  verifications?: string[];
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorLocation: string;
  title: string;
  content: string;
  crop?: string;
  tags: string[];
  isUrgent: boolean;
  upvotes: number;
  repliesCount: number;
  timestamp: string;
  imageUrl?: string;
}

export interface Scheme {
  id: string;
  title: string;
  dept: string;
  benefit: string;
  desc: string;
  tags: string[];
  officialUrl: string;
  eligibilityCriteria: {
    minLandSize: number;
    states: string[];
    categories: string[];
  };
}

export interface CSCCentre {
  id: string;
  name: string;
  operator: string;
  address: string;
  phone: string;
  distance: string;
  rating: number;
}

export interface Retailer {
  id: string;
  name: string;
  owner: string;
  licenseNo: string;
  location: string;
  address: string;
  phone: string;
  rating: number;
  brands: string[];
  isVerified: boolean;
  distance: string;
  stockStatus: string;
}

export interface AgriOfficer {
  id: string;
  name: string;
  designation: string;
  district: string;
  phone: string;
  availability: string;
}

export interface BankManager {
  id: string;
  bank: string;
  branch: string;
  name: string;
  phone: string;
  specialization: string;
}

export interface CropListing {
  id: string;
  farmerId: string;
  cropName: string;
  variety: string;
  quantity: number;
  unit: string;
  pricePerUnit: number;
  location: string;
  images: string[];
  quality: string;
  status: 'active' | 'sold';
}

export interface Order {
  id: string;
  listingId: string;
  cropName: string;
  quantity: number;
  totalPrice: number;
  buyerId: string;
  buyerName: string;
  farmerId: string;
  status: 'pending' | 'delivered';
  date: string;
}

export interface AgriAlert {
  id: string;
  category: AlertCategory;
  severity: AlertSeverity;
  title: string;
  description: string;
  location: string;
  radius: number; // in km
  timestamp: string;
  expectedTime: string;
  isConfirmed: boolean; // Verified via official news/satellite
  impactAssessment: {
    crops: string[];
    potentialDamage: string;
    financialRisk: string;
  };
  actions: string[]; // Possible solutions
  isAcknowledged?: boolean;
  latitude?: number;
  longitude?: number;
}

export interface UserProfile {
  id: string;
  name: string;
  phone: string;
  role: UserRole;
  location: string;
  avatar?: string;
  verified: boolean;
  reputationPoints: number;
  badge: 'Seedling' | 'Helper' | 'Expert' | 'Champion' | 'Veteran';
  joinedDate: string;
  businessName?: string;
  alertPreferences?: {
    sirenEnabled: boolean;
    smsFallback: boolean;
    categories: AlertCategory[];
  };
}

export interface WorkerProfile {
  id: string;
  name: string;
  phone: string;
  avatar?: string;
  skills: string[];
  dailyRate: number;
  rating: number;
  location: string;
  distance: string;
  available: boolean;
  isVerified: boolean;
  isCertified: boolean;
  trustScore: number;
  gender: 'Male' | 'Female' | 'Other';
  languages: string[];
  toolsOwned: string[];
  tripsCompleted: number;
  mgnregaId?: string;
  workGallery?: string[];
  availableDates?: string[];
}
