import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  Order,
  OrderStatus,
  MenuItem,
  DeliveryAddress,
  RestaurantHub,
  FranchiseBranch,
  DeliveryRider,
  DashboardNotification,
  AdminModuleTab
} from '../types';
import {
  INITIAL_ORDERS,
  INITIAL_MENU_ITEMS,
  INITIAL_HUBS,
  INITIAL_FRANCHISES,
  INITIAL_RIDERS,
  INITIAL_NOTIFICATIONS
} from '../data/mockData';
import { db, collection, doc, setDoc, onSnapshot, handleFirestoreError, OperationType } from '../services/firebase';

export const DEFAULT_SAVED_ADDRESSES: DeliveryAddress[] = [
  {
    id: 'addr-home-1',
    type: 'Home',
    name: 'Home Apartment',
    flatNo: 'Flat 402, 4th Floor',
    street: 'Sunshine Residency, 12th Main Road',
    landmark: 'Near Indiranagar Metro Station',
    area: 'HAL 2nd Stage, Indiranagar',
    city: 'Bengaluru',
    pincode: '560008',
    contactPhone: '+91 98200 44312',
    riderInstructions: 'Leave with security guard if not answering bell.',
    formattedAddress: 'Flat 402, Sunshine Residency, 12th Main Road, HAL 2nd Stage, Bengaluru - 560008',
  },
  {
    id: 'addr-work-2',
    type: 'Work',
    name: 'Office Campus',
    flatNo: 'Tower B, 3rd Floor',
    street: 'Green Glen Commercial Park, Outer Ring Road',
    landmark: 'Opposite EcoSpace Tech Park',
    area: 'Bellandur',
    city: 'Bengaluru',
    pincode: '560103',
    contactPhone: '+91 99401 23890',
    riderInstructions: 'Call upon arrival at reception gate.',
    formattedAddress: 'Tower B, 3rd Floor, Green Glen Park, Bellandur, Bengaluru - 560103',
  },
];

interface AdminContextType {
  orders: Order[];
  menuItems: MenuItem[];
  hubs: RestaurantHub[];
  franchises: FranchiseBranch[];
  riders: DeliveryRider[];
  notifications: DashboardNotification[];
  activeTab: AdminModuleTab;
  setActiveTab: (tab: AdminModuleTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  updateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  toggleStock: (itemId: string) => void;
  updateStockCount: (itemId: string, delta: number) => void;
  updateItemPrepTime: (itemId: string, minutes: number) => void;
  updateMenuItemPriceAndOffer: (
    itemId: string,
    updates: {
      price: number;
      offerPrice?: number;
      discountPercentage?: number;
      offerTag?: string;
      offerActive?: boolean;
    }
  ) => void;
  savedAddresses: DeliveryAddress[];
  saveCustomerAddress: (address: DeliveryAddress) => void;
  deleteCustomerAddress: (addressId: string) => void;
  assignRider: (orderId: string, riderId: string) => void;
  addNewOrder: (order: Order) => void;
  simulateIncomingOrder: () => void;
  toggleHubStatus: (hubId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  selectedOrderForDetail: Order | null;
  setSelectedOrderForDetail: (order: Order | null) => void;
  resetToDefaults: () => void;
  metrics: {
    totalOrders: number;
    totalRevenue: number;
    newOrders: number;
    cookingOrders: number;
    outForDeliveryOrders: number;
    deliveredOrders: number;
  };
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

const ORDERS_KEY = 'foodinside_orders_v2';
const MENU_KEY = 'foodinside_menu_v2';
const HUBS_KEY = 'foodinside_hubs_v2';
const RIDERS_KEY = 'foodinside_riders_v2';
const FRANCHISES_KEY = 'foodinside_franchises_v2';
const ADDRESSES_KEY = 'foodinside_saved_addresses_v2';

export const AdminDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem(ORDERS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_ORDERS;
    } catch {
      return INITIAL_ORDERS;
    }
  });

  const [menuItems, setMenuItems] = useState<MenuItem[]>(() => {
    try {
      const saved = localStorage.getItem(MENU_KEY);
      return saved ? JSON.parse(saved) : INITIAL_MENU_ITEMS;
    } catch {
      return INITIAL_MENU_ITEMS;
    }
  });

  const [hubs, setHubs] = useState<RestaurantHub[]>(() => {
    try {
      const saved = localStorage.getItem(HUBS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_HUBS;
    } catch {
      return INITIAL_HUBS;
    }
  });

  const [franchises, setFranchises] = useState<FranchiseBranch[]>(() => {
    try {
      const saved = localStorage.getItem(FRANCHISES_KEY);
      return saved ? JSON.parse(saved) : INITIAL_FRANCHISES;
    } catch {
      return INITIAL_FRANCHISES;
    }
  });

  const [riders, setRiders] = useState<DeliveryRider[]>(() => {
    try {
      const saved = localStorage.getItem(RIDERS_KEY);
      return saved ? JSON.parse(saved) : INITIAL_RIDERS;
    } catch {
      return INITIAL_RIDERS;
    }
  });

  const [notifications, setNotifications] = useState<DashboardNotification[]>(INITIAL_NOTIFICATIONS);
  const [activeTab, setActiveTab] = useState<AdminModuleTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<Order | null>(null);

  const [savedAddresses, setSavedAddresses] = useState<DeliveryAddress[]>(() => {
    try {
      const saved = localStorage.getItem(ADDRESSES_KEY);
      return saved ? JSON.parse(saved) : DEFAULT_SAVED_ADDRESSES;
    } catch {
      return DEFAULT_SAVED_ADDRESSES;
    }
  });

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem(ADDRESSES_KEY, JSON.stringify(savedAddresses));
    } catch (e) {
      console.warn('Failed to save savedAddresses to localStorage', e);
    }
  }, [savedAddresses]);
  useEffect(() => {
    try {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {
      console.warn('Failed to save orders to localStorage', e);
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem(MENU_KEY, JSON.stringify(menuItems));
    } catch (e) {
      console.warn('Failed to save menuItems to localStorage', e);
    }
  }, [menuItems]);

  useEffect(() => {
    try {
      localStorage.setItem(HUBS_KEY, JSON.stringify(hubs));
    } catch (e) {
      console.warn('Failed to save hubs to localStorage', e);
    }
  }, [hubs]);

  useEffect(() => {
    try {
      localStorage.setItem(RIDERS_KEY, JSON.stringify(riders));
    } catch (e) {
      console.warn('Failed to save riders to localStorage', e);
    }
  }, [riders]);

  // Real-time Firestore sync
  useEffect(() => {
    try {
      const ordersCol = collection(db, 'orders');
      const unsubscribe = onSnapshot(
        ordersCol,
        snapshot => {
          if (!snapshot.empty) {
            const firestoreOrders: Order[] = [];
            snapshot.forEach(docSnap => {
              const data = docSnap.data() as Order;
              firestoreOrders.push({
                ...data,
                id: data.id || `#FI-${docSnap.id}`,
              });
            });
            if (firestoreOrders.length > 0) {
              setOrders(prev => {
                const map = new Map<string, Order>();
                firestoreOrders.forEach(o => map.set(o.id, o));
                prev.forEach(o => {
                  if (!map.has(o.id)) map.set(o.id, o);
                });
                return Array.from(map.values());
              });
            }
          }
        },
        error => {
          handleFirestoreError(error, OperationType.LIST, 'orders');
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firestore onSnapshot listener error:', e);
    }
  }, []);

  const updateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          const updated: Order = { ...ord, status: newStatus };
          if (newStatus === 'delivered' && ord.assignedRider) {
            // Free up the rider
            setRiders(rPrev =>
              rPrev.map(r =>
                r.id === ord.assignedRider?.id
                  ? { ...r, status: 'available', currentOrderId: undefined, completedToday: r.completedToday + 1 }
                  : r
              )
            );
          }
          return updated;
        }
        return ord;
      })
    );

    // Sync to Firestore
    try {
      const docId = orderId.replace(/^#/, '').replace(/[^a-zA-Z0-9_-]/g, '');
      setDoc(doc(db, 'orders', docId), { status: newStatus }, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `orders/${docId}`);
      });
    } catch (e) {
      console.warn('Could not sync status to Firestore:', e);
    }

    // Add alert notification
    const order = orders.find(o => o.id === orderId);
    if (order) {
      const newNotif: DashboardNotification = {
        id: `notif-${Date.now()}`,
        title: `Order ${orderId} Status Updated`,
        message: `Order marked as ${newStatus.replace(/_/g, ' ')} for ${order.customerName}`,
        timeAgo: 'Just now',
        type: 'order',
        isRead: false,
        orderId,
      };
      setNotifications(prev => [newNotif, ...prev.slice(0, 9)]);
    }
  };

  const toggleStock = (itemId: string) => {
    setMenuItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const nextInStock = !item.inStock;
          const updated = {
            ...item,
            inStock: nextInStock,
            unitsRemaining: nextInStock ? (item.unitsRemaining > 0 ? item.unitsRemaining : 25) : 0,
          };
          // add notification if turned out of stock
          if (!nextInStock) {
            setNotifications(nPrev => [
              {
                id: `notif-stock-${Date.now()}`,
                title: `Dish Out of Stock: ${item.name}`,
                message: `${item.name} is now disabled on customer menu.`,
                timeAgo: 'Just now',
                type: 'stock',
                isRead: false,
              },
              ...nPrev.slice(0, 9),
            ]);
          }
          return updated;
        }
        return item;
      })
    );
  };

  const updateStockCount = (itemId: string, delta: number) => {
    setMenuItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          const newUnits = Math.max(0, item.unitsRemaining + delta);
          return {
            ...item,
            unitsRemaining: newUnits,
            inStock: newUnits > 0,
          };
        }
        return item;
      })
    );
  };

  const updateItemPrepTime = (itemId: string, minutes: number) => {
    setMenuItems(prev =>
      prev.map(item => (item.id === itemId ? { ...item, prepTimeMinutes: Math.max(2, minutes) } : item))
    );
  };

  const updateMenuItemPriceAndOffer = (
    itemId: string,
    updates: {
      price: number;
      offerPrice?: number;
      discountPercentage?: number;
      offerTag?: string;
      offerActive?: boolean;
    }
  ) => {
    setMenuItems(prev =>
      prev.map(item => {
        if (item.id === itemId) {
          return {
            ...item,
            ...updates,
          };
        }
        return item;
      })
    );

    // Sync to Firestore
    try {
      setDoc(doc(db, 'menu_items', itemId), updates, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.UPDATE, `menu_items/${itemId}`);
      });
    } catch (e) {
      console.warn('Could not sync menu item offer to Firestore:', e);
    }

    const item = menuItems.find(i => i.id === itemId);
    if (item) {
      const tag = updates.offerTag || (updates.discountPercentage ? `${updates.discountPercentage}% OFF` : 'Special Offer');
      setNotifications(prev => [
        {
          id: `notif-offer-${Date.now()}`,
          title: updates.offerActive ? `Special Offer Activated: ${item.name}` : `Price Updated: ${item.name}`,
          message: updates.offerActive
            ? `${item.name} offer updated to ₹${updates.offerPrice ?? updates.price} (${tag})`
            : `${item.name} price updated to ₹${updates.price}`,
          timeAgo: 'Just now',
          type: 'stock',
          isRead: false,
        },
        ...prev.slice(0, 9),
      ]);
    }
  };

  const saveCustomerAddress = (newAddr: DeliveryAddress) => {
    const addressToSave: DeliveryAddress = {
      ...newAddr,
      id: newAddr.id || `addr-${Date.now()}`,
      formattedAddress:
        newAddr.formattedAddress ||
        `${newAddr.flatNo}, ${newAddr.street}, ${newAddr.area}, ${newAddr.city} - ${newAddr.pincode}`,
    };
    setSavedAddresses(prev => {
      const existsIndex = prev.findIndex(a => a.id === addressToSave.id);
      if (existsIndex >= 0) {
        const copy = [...prev];
        copy[existsIndex] = addressToSave;
        return copy;
      }
      return [addressToSave, ...prev];
    });

    // Also persist to Firestore
    try {
      setDoc(doc(db, 'customer_addresses', addressToSave.id!), addressToSave, { merge: true }).catch(err => {
        handleFirestoreError(err, OperationType.UPSERT, `customer_addresses/${addressToSave.id}`);
      });
    } catch (e) {
      console.warn('Could not sync customer address to Firestore:', e);
    }
  };

  const deleteCustomerAddress = (addressId: string) => {
    setSavedAddresses(prev => prev.filter(a => a.id !== addressId));
  };

  const assignRider = (orderId: string, riderId: string) => {
    const rider = riders.find(r => r.id === riderId);
    if (!rider) return;

    setOrders(prev =>
      prev.map(ord => {
        if (ord.id === orderId) {
          return {
            ...ord,
            assignedRider: {
              id: rider.id,
              name: rider.name,
              phone: rider.phone,
              bikeNumber: rider.bikeNumber,
            },
            status: ord.status === 'new' || ord.status === 'cooking' ? 'out_for_delivery' : ord.status,
          };
        }
        return ord;
      })
    );

    setRiders(prev =>
      prev.map(r =>
        r.id === riderId
          ? { ...r, status: 'delivering', currentOrderId: orderId }
          : r
      )
    );

    setNotifications(prev => [
      {
        id: `notif-assign-${Date.now()}`,
        title: `Rider Assigned: ${rider.name}`,
        message: `Dispatched for order ${orderId} (${rider.bikeNumber})`,
        timeAgo: 'Just now',
        type: 'rider',
        isRead: false,
        orderId,
      },
      ...prev.slice(0, 9),
    ]);
  };

  const addNewOrder = (order: Order) => {
    setOrders(prev => [order, ...prev]);

    // Sync to Firestore
    try {
      const docId = order.id.replace(/^#/, '').replace(/[^a-zA-Z0-9_-]/g, '');
      setDoc(doc(db, 'orders', docId), order).catch(err => {
        handleFirestoreError(err, OperationType.CREATE, `orders/${docId}`);
      });
    } catch (e) {
      console.warn('Could not sync new order to Firestore:', e);
    }

    setNotifications(prev => [
      {
        id: `notif-new-${Date.now()}`,
        title: `New Order Placed ${order.id}`,
        message: `${order.customerName} ordered ${order.items.length} items (₹${order.total})`,
        timeAgo: 'Just now',
        type: 'order',
        isRead: false,
        orderId: order.id,
      },
      ...prev.slice(0, 9),
    ]);
  };

  const simulateIncomingOrder = () => {
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const orderId = `#FI-${randomNum}`;
    const sampleAddresses: { name: string; phone: string; address: DeliveryAddress }[] = [
      {
        name: 'Sameer Joshi',
        phone: '+91 98450 77123',
        address: {
          type: 'Home',
          flatNo: 'Flat 12, 3rd Floor',
          street: 'Sobha Iris, Outer Ring Road',
          landmark: 'Near Bellandur Flyover',
          area: 'Bellandur',
          city: 'Bengaluru',
          pincode: '560103',
          contactPhone: '+91 98450 77123',
          riderInstructions: 'Drop with tower security if unavailable.',
          formattedAddress: 'Flat 12, Sobha Iris, Outer Ring Road, Bellandur, Bengaluru - 560103',
        },
      },
      {
        name: 'Kavita Sundaram',
        phone: '+91 97112 33490',
        address: {
          type: 'Work',
          flatNo: 'Suite 204',
          street: 'Brigade Gateway, 26/1 Dr Rajkumar Road',
          landmark: 'Opposite Orion Mall',
          area: 'Malleshwaram',
          city: 'Bengaluru',
          pincode: '560055',
          contactPhone: '+91 97112 33490',
          riderInstructions: 'Ring reception bell on 2nd floor.',
          formattedAddress: 'Suite 204, Brigade Gateway, Malleshwaram, Bengaluru - 560055',
        },
      },
      {
        name: 'Arjun Nambiar',
        phone: '+91 99002 88124',
        address: {
          type: 'Home',
          flatNo: '14/B',
          street: '7th Cross Road',
          landmark: 'Near Wipro Park',
          area: 'Koramangala 4th Block',
          city: 'Bengaluru',
          pincode: '560034',
          contactPhone: '+91 99002 88124',
          riderInstructions: 'Please leave at the door.',
          formattedAddress: '14/B, 7th Cross Road, Koramangala 4th Block, Bengaluru - 560034',
        },
      },
    ];
    const customer = sampleAddresses[Math.floor(Math.random() * sampleAddresses.length)];

    const sampleDishes = [
      { id: 'item-1', name: 'Vada Pav', price: 30, originalPrice: 40, category: 'Snacks' },
      { id: 'item-2', name: 'Spicy Samosa Chaat', price: 40, originalPrice: 50, category: 'Snacks' },
      { id: 'item-3', name: 'Veg Burger', price: 60, originalPrice: 80, category: 'Burgers' },
      { id: 'item-4', name: 'Paneer Pizza', price: 120, originalPrice: 150, category: 'Pizza' },
      { id: 'item-8', name: 'Cold Coffee', price: 60, category: 'Beverages' },
    ];

    const pick1 = sampleDishes[Math.floor(Math.random() * sampleDishes.length)];
    const pick2 = sampleDishes[Math.floor(Math.random() * sampleDishes.length)];

    const items = [
      { ...pick1, quantity: 1 },
      ...(pick1.id !== pick2.id ? [{ ...pick2, quantity: 1 }] : []),
    ];

    const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const regularSubtotal = items.reduce((sum, item) => sum + (item.originalPrice || item.price) * item.quantity, 0);
    const savings = Math.max(0, regularSubtotal - subtotal);
    const delivery = 20;
    const total = subtotal + delivery;

    const newOrder: Order = {
      id: orderId,
      customerName: customer.name,
      customerPhone: customer.phone,
      address: customer.address.formattedAddress || `${customer.address.flatNo}, ${customer.address.street}, ${customer.address.area}`,
      deliveryAddress: customer.address,
      branch: 'Indiranagar Central Hub',
      items,
      subtotal,
      discountSavings: savings,
      deliveryCharge: delivery,
      tax: 0,
      total,
      status: 'new',
      createdAt: 'Just now',
      prepTimeMinutes: 14,
      elapsedMinutes: 1,
      paymentMethod: 'UPI / Online',
      isPaid: true,
      specialInstructions: customer.address.riderInstructions || 'Fast delivery requested.',
    };

    addNewOrder(newOrder);
  };

  const toggleHubStatus = (hubId: string) => {
    setHubs(prev =>
      prev.map(hub => {
        if (hub.id === hubId) {
          const nextStatus = hub.status === 'online' ? 'busy' : hub.status === 'busy' ? 'offline' : 'online';
          return { ...hub, status: nextStatus };
        }
        return hub;
      })
    );
  };

  const markNotificationRead = (id: string) => {
    setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const resetToDefaults = () => {
    setOrders(INITIAL_ORDERS);
    setMenuItems(INITIAL_MENU_ITEMS);
    setHubs(INITIAL_HUBS);
    setFranchises(INITIAL_FRANCHISES);
    setRiders(INITIAL_RIDERS);
    setNotifications(INITIAL_NOTIFICATIONS);
    localStorage.removeItem(ORDERS_KEY);
    localStorage.removeItem(MENU_KEY);
    localStorage.removeItem(HUBS_KEY);
    localStorage.removeItem(RIDERS_KEY);
    localStorage.removeItem(FRANCHISES_KEY);
  };

  // Metrics computation
  const metrics = useMemo(() => {
    const newOrders = orders.filter(o => o.status === 'new').length;
    const cookingOrders = orders.filter(o => o.status === 'cooking').length;
    const outForDeliveryOrders = orders.filter(o => o.status === 'out_for_delivery').length;
    const deliveredOrders = orders.filter(o => o.status === 'delivered').length;
    const liveRevenue = orders.reduce((sum, o) => sum + (o.status !== 'cancelled' ? o.total : 0), 0);

    return {
      totalOrders: 1420 + orders.length,
      totalRevenue: 184320 + liveRevenue,
      newOrders,
      cookingOrders,
      outForDeliveryOrders,
      deliveredOrders: 180 + deliveredOrders,
    };
  }, [orders]);

  return (
    <AdminContext.Provider
      value={{
        orders,
        menuItems,
        hubs,
        franchises,
        riders,
        notifications,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        updateOrderStatus,
        toggleStock,
        updateStockCount,
        updateItemPrepTime,
        updateMenuItemPriceAndOffer,
        savedAddresses,
        saveCustomerAddress,
        deleteCustomerAddress,
        assignRider,
        addNewOrder,
        simulateIncomingOrder,
        toggleHubStatus,
        markNotificationRead,
        markAllNotificationsRead,
        selectedOrderForDetail,
        setSelectedOrderForDetail,
        resetToDefaults,
        metrics,
      }}
    >
      {children}
    </AdminContext.Provider>
  );
};

export const useAdminData = () => {
  const context = useContext(AdminContext);
  if (!context) {
    throw new Error('useAdminData must be used within an AdminDataProvider');
  }
  return context;
};
