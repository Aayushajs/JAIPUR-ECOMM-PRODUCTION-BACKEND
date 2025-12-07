import { Request, Response, NextFunction } from 'express';
import { ProductZodSchema } from '../models/product.model';
import ProductService from '../services/product.service';
import catchAsync from '../utils/catchAsync';
import AppError from '../utils/AppError';

class ProductController {
    public static createProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        // Handling images extraction for Service
        const images = req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : undefined;

        const validation = ProductZodSchema.safeParse(req.body);
        if (!validation.success) {
            return next(new AppError(validation.error.issues.map((e: any) => e.message).join(', '), 400));
        }

        const product = await ProductService.createProduct(req.body, images);

        res.status(201).json({
            success: true,
            data: {
                product,
            },
        });
    });

    public static getAllProducts = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { products, count } = await ProductService.queryProducts(req.query);

        res.status(200).json({
            success: true,
            results: products.length,
            total: count,
            data: {
                products,
            },
        });
    });

    public static getProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const product = await ProductService.getProductById(req.params.id);
        res.status(200).json({
            success: true,
            data: {
                product,
            },
        });
    });

    public static updateProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const images = req.files ? (req.files as Express.Multer.File[]).map(file => file.path) : undefined;

        const product = await ProductService.updateProduct(req.params.id, req.body, images);

        res.status(200).json({
            success: true,
            data: {
                product,
            },
        });
    });

    public static deleteProduct = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        await ProductService.deleteProduct(req.params.id);
        res.status(204).json({
            success: true,
            data: null,
        });
    });

    public static createProductReview = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
        const { rating, comment } = req.body;
        await ProductService.addProductReview(req.params.id, (req.user as any)._id, rating, comment);

        res.status(201).json({
            success: true,
            message: 'Review added',
        });
    });
}

export default ProductController;
