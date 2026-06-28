/**
 * Shared code between client and server
 * Useful to share types between client and server
 * and/or small pure JS functions that can be used on both client and server
 */

/**
 * Example response type for /api/demo
 */
export interface DemoResponse {
  message: string;
}

/**
 * Wish data structure
 */
export interface Wish {
  id: string;
  content: string;
  author: string;
  createdAt: string;
  likes: number;
}

export interface CreateWishRequest {
  content: string;
  author: string;
}

export interface CreateWishResponse {
  success: boolean;
  wish?: Wish;
  error?: string;
}

export interface GetWishesResponse {
  wishes: Wish[];
  total: number;
}

export interface ProcessPaymentRequest {
  amount: number;
  currency: string;
  description: string;
}

export interface ProcessPaymentResponse {
  success: boolean;
  transactionId?: string;
  error?: string;
}
