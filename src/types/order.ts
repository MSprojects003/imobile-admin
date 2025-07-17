export interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  discount: number;
  colors: string[];
  models: string[];
  image: string;
}

export interface OrderItem {
  id: string;
  price: number;
  quantity: number;
  total_amount: number;
  colors: string[];
  models: string[];
  products: Product;
}

export interface User {
  id: string;
  email: string;
  phone_number: string;
  address: string;
}

export interface Order {
  id: string;
  created_at: string;
  updated_at: string;
  total_amount: number;
  status: boolean;
  track_id: string;
  users: User;
  order_items?: OrderItem[];
} 