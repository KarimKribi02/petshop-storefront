export type UnitType = 'unit' | 'kg' | 'g' | 'l' | 'ml';

export interface Category {
  id: number;
  name: string;
  slug?: string;
  description?: string | null;
  icon?: string | null;
  image?: string | null;
  products_count?: number;
}

export interface Brand {
  id: number;
  name: string;
  logo?: string | null;
  website?: string | null;
  description?: string | null;
}

export interface StoreStock {
  store_id: number;
  store_name: string;
  quantity: number;
}

export interface Product {
  id: number;
  category_id?: number;
  brand_id?: number | null;
  barcode: string;
  title: string;
  description?: string | null;
  price_buy?: number | string;
  price_sell: number | string;
  stock_quantity: number;
  total_stock?: number;
  quantity?: number;
  selected_store_id?: number;
  min_stock_alert?: number;
  image?: string | null;
  image_url?: string | null;
  unit_type?: UnitType | string;
  is_active: boolean | number;
  category?: Category;
  brand?: Brand;
  stores_stock?: StoreStock[];
  created_at?: string;
  updated_at?: string;
}

export interface Store {
  id: number;
  name: string;
  code: string;
  address?: string | null;
  phone?: string | null;
  is_active?: boolean;
}

export interface Faq {
  id: number;
  question: string;
  answer: string;
  category?: string | null;
  is_active?: boolean;
  order?: number;
}

export interface StoreSettings {
  id?: number;
  store_name: string;
  support_email?: string | null;
  phone_number: string;
  address?: string | null;
  store_description?: string | null;
  facebook_url?: string | null;
  instagram_url?: string | null;
  logo_url?: string | null;
}

export interface CartItem {
  product: Product;
  quantity: number;
  store_id?: number;
  store_name?: string;
  id?: number;
}

export interface OrderItemPayload {
  barcode?: string;
  product_id?: number;
  quantity: number;
}

export interface OrderPayload {
  customer_name: string;
  phone?: string;
  customer_phone?: string;
  city?: string;
  customer_city?: string;
  address?: string;
  customer_address?: string;
  store_id?: number;
  delivery_type?: 'LIVRAISON' | 'PICKUP_STORE';
  shipping_fee?: number;
  notes?: string;
  payment_method?: string;
  items: OrderItemPayload[];
}

export interface OrderResponse {
  status: string;
  message: string;
  data?: {
    order_id: number;
    order?: any;
  };
}
