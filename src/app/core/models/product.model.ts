import { IUser } from './auth.state.model';
import { IShop } from './seller.model';

export interface IProductImage {
  id: number; // Unique identifier for the product image
  product_id: number; // Foreign key referencing the product
  image_url: string; // URL of the product image
  width?: number; // Width of the image (optional)
  height?: number; // Height of the image (optional)
  thumbnail_url?: string; // URL of the thumbnail (optional)
  created_at?: string; // Timestamp for when the image was created (optional)
  updated_at?: string; // Timestamp for when the image was last updated (optional)
}

export interface IProduct {
  id: number; // Unique identifier for the product
  shop_id: number; // Foreign key referencing the shop
  name: string; // Name of the product
  brand?: string; // Brand name (optional)
  slug: string; // Unique slug for the product
  category: string; // Category of the product
  subcategory?: string; // Subcategory (optional)
  description?: string; // Description of the product (optional)
  currency: string; // Currency code (3 characters)
  price: number; // Price of the product
  rating: number; // Rating of the product
  visit: number; // Visit count for the product
  stock_quantity: number; // Quantity available in stock
  installment_count: number; // Number of installments
  min_installment_price?: number; // Minimum installment price (optional)
  is_active: boolean; // Indicates if the product is active
  created_at?: string; // Timestamp for when the product was created (optional)
  updated_at?: string; // Timestamp for when the product was last updated (optional)
  shop: IShop;
  images: IProductImage[];
}

export interface IProductReview {
  id: number;
  product_id: number;
  user_id: number;
  rating: number;
  review: string;
  created_at: string;
  updated_at: string;
  user: IUser;
}

export interface IShopReview {
  id: number;
  shop_id: number;
  user_id: number;
  rating: number;
  review: string;
  created_at: string;
  updated_at: string;
  user: IUser;
}
