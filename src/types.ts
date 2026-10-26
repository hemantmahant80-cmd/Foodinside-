export type OrderStatus = 'new' | 'cooking' | 'out_for_delivery' | 'delivered' | 'cancelled';

export interface DeliveryAddress {
  id?: string;
  type: 'Home' | 'Work' | 'Other';
  name?: string;
  flatNo: string;
  street: string;
  landmark?: string;
  area: string;
  city: string;
  pincode: string;
  contactPhone: string;
  riderInstructions?: string;
  formattedAddress?: string;
}

export interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  price: number;
  originalPrice?: number;
  category: string;
  notes?: string;
}

export interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  deliveryAddress?: DeliveryAddress;
  branch: string;
  items: OrderItem[];
  total: number;
  subtotal: number;
  discountSavings?: number;
  deliveryCharge: number;
  tax: number;
  status: OrderStatus;
  createdAt: string;
  prepTimeMinutes: number;
  elapsedMinutes: number;
  assignedRider?: {
    id: string;
    name: string;
    phone: string;
    bikeNumber: string;
  };
  paymentMethod: 'UPI / Online' | 'Cash on Delivery' | 'Credit Card';
  isPaid: boolean;
  specialInstructions?: string;
}

export interface MenuItem {
  id: string;
  name: string;
  category: 'Burgers' | 'Pizza' | 'Snacks' | 'Indian' | 'Chinese' | 'South Indian' | 'Beverages' | 'Desserts';
  price: number;
  offerPrice?: number;
  discountPercentage?: number;
  offerTag?: string;
  offerActive?: boolean;
  inStock: boolean;
  unitsRemaining: number;
  prepTimeMinutes: number;
  rating: number;
  dailySold: number;
  image: string;
  description: string;
  isPopular?: boolean;
}

export interface RestaurantHub {
  id: string;
  name: string;
  type: 'Central Cloud Kitchen' | 'Partner Express' | 'Flagship Hub';
  zone: string;
  address: string;
  manager: string;
  phone: string;
  rating: number;
  activeOrders: number;
  capacityPercent: number;
  status: 'online' | 'busy' | 'offline';
  avgPrepTime: number; // in mins
}

export interface FranchiseBranch {
  id: string;
  code: string;
  franchiseName: string;
  ownerName: string;
  cityZone: string;
  address: string;
  contact: string;
  dailyRevenue: number;
  monthRevenue: number;
  fulfillmentRate: number; // 99.2%
  activeOrders: number;
  complianceStatus: 'Active & Verified' | 'Audit Due' | 'Notice Issued';
  openedDate: string;
}

export interface DeliveryRider {
  id: string;
  name: string;
  phone: string;
  bikeNumber: string;
  status: 'delivering' | 'available' | 'on_break' | 'offline';
  currentOrderId?: string;
  completedToday: number;
  rating: number;
  batteryLevel: number;
  currentLocation: string;
  avatar: string;
  speedKmH: number;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  timeAgo: string;
  type: 'order' | 'rider' | 'stock' | 'system';
  isRead: boolean;
  orderId?: string;
}

export type AdminModuleTab = 
  | 'overview'
  | 'live_orders'
  | 'analytics'
  | 'menu_stock'
  | 'restaurants_hub'
  | 'franchise_branches'
  | 'rider_app'
  | 'store'
  | 'ai_assistant'
  | 'video_studio'
  | 'image_studio'
  | 'logout';
