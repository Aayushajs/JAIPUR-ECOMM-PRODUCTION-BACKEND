import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import mongoose from 'mongoose';
import User from '../models/user.model';
import { IUser } from '../types/user.types';
import AppError from '../utils/AppError';

/**
 * Service for handling Authentication and Authorization logic.
 */
class AuthService {

    public static signToken(id: string): string {
        return jwt.sign({ id }, process.env.JWT_SECRET as string, {
            expiresIn: process.env.JWT_EXPIRES_IN,
        } as jwt.SignOptions);
    }


    public static signRefreshToken(id: string): string {
        return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET as string, {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN,
        } as jwt.SignOptions);
    }


    public static async registerUser(userData: any): Promise<IUser> {
        const existingUser = await User.findOne({ email: userData.email });
        if (existingUser) {
            throw new AppError('Email already in use', 400);
        }

        const user = await User.create(userData);
        return user as unknown as IUser;
    }


    public static async loginUser(email?: string, password?: string): Promise<IUser> {
        if (!email || !password) {
            throw new AppError('Please provide email and password', 400);
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.comparePassword(password))) {
            throw new AppError('Incorrect email or password', 401);
        }

        return user;
    }


    public static async refreshAuthToken(refreshToken: string): Promise<string> {
        const decoded: any = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string);

        const user = await User.findById(decoded.id);
        if (!user) {
            throw new AppError('User not found', 401);
        }

        return AuthService.signToken((user._id as mongoose.Types.ObjectId).toString());
    }


    public static async forgotPassword(email: string): Promise<IUser> {
        const user = await User.findOne({ email });
        if (!user) {
            throw new AppError('There is no user with email address.', 404);
        }

        const resetToken = user.createPasswordResetToken();
        await user.save({ validateBeforeSave: false });

        // Return user with reset token populated for controller to email
        (user as any)._resetToken = resetToken;

        return user;
    }


    public static async resetPassword(token: string, newPassword?: string): Promise<IUser> {
        const hashedToken = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        const user = await User.findOne({
            passwordResetToken: hashedToken,
            passwordResetExpires: { $gt: Date.now() },
        });

        if (!user) {
            throw new AppError('Token is invalid or has expired', 400);
        }

        user.password = newPassword as string;
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save();

        return user;
    }
}

export default AuthService;
