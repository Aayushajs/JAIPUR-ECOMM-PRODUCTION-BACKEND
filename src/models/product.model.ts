import mongoose, { Document, Schema } from 'mongoose';
import { z } from 'zod';
import { IProduct } from '../types/product.types';

// Zod Schema
export const ProductZodSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be a positive number'),
  category: z.string().min(2, 'Category must be at least 2 characters'),
  stock: z.coerce.number().int().nonnegative('Stock must be a non-negative integer'),
  images: z.array(z.string().url()).optional(),
  ratings: z.array(z.object({
    userId: z.string(),
    rating: z.number().min(1).max(5),
    comment: z.string().optional()
  })).optional().default([]),
  averageRating: z.number().optional().default(4.5),
  numOfReviews: z.number().optional().default(0),
});

const ProductSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true
    },
    price: {
      type: Number,
      required: true
    },
    category: {
      type: String,
      required: true
    },
    stock: {
      type: Number,
      required: true,
      default: 0
    },
    images: [String],
    ratings: [
      {
        userId: {
          type: Schema.Types.ObjectId,
          ref: 'User'
        },
        rating: {
          type: Number,
          min: 1,
          max: 5
        },
        comment: String,
      },
    ],
    averageRating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: (val: number) => Math.round(val * 10) / 10, // 4.666666 -> 4.7
    },
    numOfReviews: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Index for search
ProductSchema.index({ name: 'text', description: 'text' });
// Indexes for filtering and sorting
ProductSchema.index({ price: 1 });
ProductSchema.index({ category: 1 });

export default mongoose.model<IProduct>('Product', ProductSchema);
