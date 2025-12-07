import Product from '../models/product.model';
import { IProduct } from '../types/product.types';
import AppError from '../utils/AppError';

/**
 * Service for handling Product-related business logic.
 */
class ProductService {

  public static async createProduct(productData: any, images?: string[]): Promise<IProduct> {
    if (images) {
      productData.images = images;
    }
    const product = await Product.create(productData);
    return product as unknown as IProduct;
  }


  public static async queryProducts(queryString: any): Promise<{ products: IProduct[]; count: number }> {
    // 1. Filtering
    const queryObj = { ...queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields', 'search'];
    excludedFields.forEach((el: string) => delete queryObj[el]);

    // Advanced Filtering (gte, gt, lte, lt)
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    
    let query = Product.find(JSON.parse(queryStr));

    // 2. Search
    if (queryString.search) {
        const searchRegex = new RegExp(queryString.search as string, 'i');
        query = query.find({
            $or: [
                { name: searchRegex },
                { description: searchRegex }
            ]
        });
    }

    // 3. Sorting
    if (queryString.sort) {
      const sortBy = (queryString.sort as string).split(',').join(' ');
      query = query.sort(sortBy);
    } else {
      query = query.sort('-createdAt');
    }

    // 4. Pagination
    const page = parseInt(queryString.page as string) || 1;
    const limit = parseInt(queryString.limit as string) || 10;
    const skip = (page - 1) * limit;

    query = query.skip(skip).limit(limit);

    const products = await query;
    const count = await Product.countDocuments(JSON.parse(queryStr));

    return { products: products as unknown as IProduct[], count };
  }


  public static async getProductById(id: string): Promise<IProduct> {
    const product = await Product.findById(id).populate('ratings.userId', 'name');
    if (!product) {
      throw new AppError('No product found with that ID', 404);
    }
    return product as unknown as IProduct;
  }


  public static async updateProduct(id: string, updateData: any, images?: string[]): Promise<IProduct> {
    if (images) {
      updateData.images = images;
    }
    
    const product = await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!product) {
      throw new AppError('No product found with that ID', 404);
    }
    return product as unknown as IProduct;
  }


  public static async deleteProduct(id: string): Promise<void> {
    const product = await Product.findByIdAndDelete(id);
    if (!product) {
      throw new AppError('No product found with that ID', 404);
    }
  }


  public static async addProductReview(productId: string, userId: string, rating: number, comment?: string): Promise<void> {
    const product = await Product.findById(productId);

    if (!product) {
        throw new AppError('Product not found', 404);
    }

    const alreadyReviewed = product.ratings.find(
        (r) => r.userId.toString() === userId.toString()
    );

    if (alreadyReviewed) {
        throw new AppError('Product already reviewed', 400);
    }

    const review = {
        userId,
        rating: Number(rating),
        comment,
    };

    product.ratings.push(review);

    // Calculate new average and count
    product.numOfReviews = product.ratings.length;
    product.averageRating =
        product.ratings.reduce((acc, item) => item.rating + acc, 0) /
        product.ratings.length;

    await product.save();
  }
}

export default ProductService;
