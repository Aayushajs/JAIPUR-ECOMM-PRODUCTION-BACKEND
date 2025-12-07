import { Document } from 'mongoose';

export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  category: string;
  stock: number;
  images: string[];
  ratings: {
    userId: string;
    rating: number;
    comment?: string;
  }[];
  averageRating: number;
  numOfReviews: number;
  createdAt: Date;
  updatedAt: Date;
}
