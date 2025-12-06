export interface UserProfile {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
  collegeYear: string;
  address: string;
  phoneNumber: string; // WhatsApp number
  roleIntent: 'buy' | 'sell' | 'both' | 'undecided';
  agreedToTerms: boolean;
  createdAt: number;
  isAdmin?: boolean;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName: string;
  sellerWhatsapp: string;
  title: string;
  description: string;
  category: string;
  condition: 'new' | 'used';
  price: number; // Selling price
  originalPrice?: number; // Bought price (for used items)
  isFree: boolean;
  imageUrl: string;
  createdAt: number;
}

export interface Order {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  productPrice: number;
  buyerId: string;
  buyerName: string;
  sellerId: string;
  sellerName: string;
  sellerWhatsapp: string;
  status: 'pending' | 'accepted' | 'completed' | 'rejected';
  createdAt: number;
  completedAt?: number;
}

export enum COLLECTIONS {
  USERS = 'users',
  PRODUCTS = 'products',
  ORDERS = 'orders'
}