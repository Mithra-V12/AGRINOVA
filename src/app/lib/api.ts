/**
 * AGRINOVA service layer — Upgraded for dynamic role accounts, carts, checkout, and notifications.
 */

const BASE = '/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  // Inject JWT from localStorage if available
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...options?.headers
    }
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface UserProfile {
  id: string;
  email: string;
  userType: 'farmer' | 'customer';
  name: string;
  phone: string;
  state: string;
  district: string;
  village?: string;
  pinCode: string;
  preferredLanguage: string;
  landSizeAcres?: number;
  primaryCrop?: string;
  cropTypes?: string[];
  address?: string;
  language?: string; // compatibility field
  registeredAt: string;
}

// Aliases for compatibility with existing pages
export type FarmerProfile = UserProfile;

export interface SoilReport {
  score: number;
  ph: number;
  nitrogen: 'Low' | 'Medium' | 'High';
  phosphorus: 'Low' | 'Medium' | 'High';
  potassium: 'Low' | 'Medium' | 'High';
  organicMatter: number;
  texture: string;
  lastUpdated: string;
  summary: string;
}

export interface CropRecommendation {
  id: string;
  name: string;
  suitability: number;
  reason: string;
  season: string;
}

export interface MarketplaceListing {
  id: string;
  title: string;
  crop: string;
  quantityKg: number;
  pricePerKg: number;
  location: string;
  farmerName: string;
  farmerId: string;
  image: string;
  description: string;
  organic: boolean;
  rating: number;
  createdAt: string;
}

export interface GovernmentScheme {
  id: string;
  name: string;
  description: string;
  eligibility: { maxLandSizeAcres: number | null; states: string[] | null };
  link: string;
  documents?: string[];
  benefits?: string;
  lastDate?: string;
  category?: 'Subsidy' | 'Loan' | 'Insurance' | 'Crop Related' | 'Other';
  scope?: 'Central' | 'State';
}

export interface WeatherResponse {
  live: boolean;
  location?: string;
  reason?: string;
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    precipitation: number;
    wind_speed_10m: number;
    weather_code: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    precipitation_probability_max: number[];
    weather_code: number[];
  };
}

export interface AdvisorChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface AdvisorChatResponse {
  reply: string;
  mode: 'gemini' | 'mock';
}

export interface CropHealthResult {
  disease: string;
  confidence: number;
  severity: 'None' | 'Mild' | 'Moderate' | 'Severe';
  treatment: string;
  mode: 'gemini' | 'mock';
}

export interface SoilAnalysisResult extends SoilReport {
  mode: 'gemini' | 'mock';
}

export interface CartItem {
  productId: string;
  quantity: number;
  product: MarketplaceListing;
}

export interface OrderItem {
  productId: string;
  title: string;
  pricePerKg: number;
  quantity: number;
  farmerId: string;
  farmerName: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  totalPrice: number;
  deliveryCharges: number;
  deliveryAddress: string;
  status: 'Confirmed' | 'Packed' | 'Shipped' | 'Delivered' | 'Cancelled';
  estimatedDelivery: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  text: string;
  type: string;
  read: boolean;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Authentication & Profile APIs
// ---------------------------------------------------------------------------

export function registerUser(body: any): Promise<{ token: string; profile: UserProfile }> {
  return request('/auth/register', { method: 'POST', body: JSON.stringify(body) });
}

export function loginUser(body: any): Promise<{ token: string; profile: UserProfile }> {
  return request('/auth/login', { method: 'POST', body: JSON.stringify(body) });
}

export function getFarmerProfile(): Promise<UserProfile> {
  return request('/profile');
}

export function updateFarmerProfile(profile: Partial<UserProfile>): Promise<UserProfile> {
  return request('/profile', { method: 'POST', body: JSON.stringify(profile) });
}

// ---------------------------------------------------------------------------
// Soil & crop recommendations
// ---------------------------------------------------------------------------

export function getSoilReport(): Promise<SoilReport> {
  return request('/soil');
}

export function getCropRecommendations(): Promise<CropRecommendation[]> {
  return request('/crop-recommendations');
}

export function analyzeSoilReport(imageBase64: string, imageMimeType: string): Promise<SoilAnalysisResult> {
  return request('/soil/analyze', {
    method: 'POST',
    body: JSON.stringify({ imageBase64, imageMimeType }),
  });
}

// ---------------------------------------------------------------------------
// Crop health / disease diagnosis
// ---------------------------------------------------------------------------

export function analyzeCropHealth(imageBase64: string, imageMimeType: string): Promise<CropHealthResult> {
  return request('/crop-health/analyze', {
    method: 'POST',
    body: JSON.stringify({ imageBase64, imageMimeType }),
  });
}

// ---------------------------------------------------------------------------
// Weather
// ---------------------------------------------------------------------------

export function getWeather(village?: string): Promise<WeatherResponse> {
  const qs = village ? `?village=${encodeURIComponent(village)}` : '';
  return request(`/weather${qs}`);
}

// ---------------------------------------------------------------------------
// Marketplace
// ---------------------------------------------------------------------------

export function getMarketplaceProducts(): Promise<MarketplaceListing[]> {
  return request('/marketplace');
}

export function getMarketplaceProduct(id: string): Promise<MarketplaceListing> {
  return request(`/marketplace/${id}`);
}

export function createMarketplaceProduct(
  listing: Pick<MarketplaceListing, 'title' | 'crop' | 'quantityKg' | 'pricePerKg' | 'image' | 'description'>
): Promise<MarketplaceListing> {
  return request('/marketplace', { method: 'POST', body: JSON.stringify(listing) });
}

// ---------------------------------------------------------------------------
// Cart APIs
// ---------------------------------------------------------------------------

export function getCart(): Promise<CartItem[]> {
  return request('/cart');
}

export function addToCart(productId: string, quantity: number): Promise<CartItem[]> {
  return request('/cart/add', { method: 'POST', body: JSON.stringify({ productId, quantity }) });
}

export function removeFromCart(productId: string): Promise<CartItem[]> {
  return request('/cart/remove', { method: 'POST', body: JSON.stringify({ productId }) });
}

export function clearCart(): Promise<CartItem[]> {
  return request('/cart/clear', { method: 'POST' });
}

// ---------------------------------------------------------------------------
// Checkout / Orders
// ---------------------------------------------------------------------------

export function checkoutOrder(deliveryAddress: string, items: { productId: string; quantity: number }[]): Promise<Order> {
  return request('/orders/checkout', {
    method: 'POST',
    body: JSON.stringify({ deliveryAddress, items }),
  });
}

export function getOrders(): Promise<Order[]> {
  return request('/orders');
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export function getNotifications(): Promise<Notification[]> {
  return request('/notifications');
}

export function markNotificationRead(id: string): Promise<{ success: boolean }> {
  return request('/notifications/read', { method: 'POST', body: JSON.stringify({ id }) });
}

// ---------------------------------------------------------------------------
// Government schemes
// ---------------------------------------------------------------------------

export function getGovernmentSchemes(): Promise<{ all: GovernmentScheme[]; eligible: GovernmentScheme[] }> {
  return request('/schemes');
}

// ---------------------------------------------------------------------------
// AI Farm Advisor chat
// ---------------------------------------------------------------------------

export function sendAdvisorMessage(message: string, history: AdvisorChatMessage[] = []): Promise<AdvisorChatResponse> {
  return request('/advisor/chat', {
    method: 'POST',
    body: JSON.stringify({ message, history }),
  });
}

// ---------------------------------------------------------------------------
// Helper: convert a File to base64
// ---------------------------------------------------------------------------

export function fileToBase64(file: File): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1] || '';
      resolve({ base64, mimeType: file.type });
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}
