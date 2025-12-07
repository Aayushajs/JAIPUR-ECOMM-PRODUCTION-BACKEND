import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import AuthService from '../services/auth.service';
import catchAsync from '../utils/catchAsync';
import { IUser } from '../types/user.types';
import EmailService from '../services/email.service';
import { UserZodSchema } from '../models/user.model';
import AppError from '../utils/AppError';
import { COOKIE_OPTIONS, SUCCESS_MESSAGES } from '../constants';

class AuthController {
  private static createSendToken = (user: IUser, statusCode: number, res: Response) => {
    const token = AuthService.signToken((user._id as mongoose.Types.ObjectId).toString());
    const refreshToken = AuthService.signRefreshToken((user._id as mongoose.Types.ObjectId).toString());

    res.cookie('jwt', token, COOKIE_OPTIONS);
    res.setHeader('Authorization', 'Bearer ' + token);

    user.password = undefined as any;

    res.status(statusCode).json({
      success: true,
      token,
      refreshToken,
      data: {
        user,
      },
    });
  };

  public static register = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Validation 
    const validationResult = UserZodSchema.safeParse(req.body);
    if (!validationResult.success) {
      return next(new AppError(validationResult.error.issues.map((e: any) => e.message).join(', '), 400));
    }

    const user = await AuthService.registerUser(req.body);
    AuthController.createSendToken(user, 201, res);
  });

  public static login = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const user = await AuthService.loginUser(email, password);
    AuthController.createSendToken(user, 200, res);
  });

  public static refreshToken = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return next(new AppError('Please provide refresh token', 400));
    }

    const token = await AuthService.refreshAuthToken(refreshToken);
    res.status(200).json({
      success: true,
      token
    });
  });

  public static forgotPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await AuthService.forgotPassword(req.body.email);
    const resetToken = (user as any)._resetToken; // Retrieved from transient property

    try {
      const resetURL = `${req.protocol}://${req.get('host')}/api/auth/resetPassword/${resetToken}`;

      await EmailService.sendPasswordReset(user.email, resetURL);

      res.status(200).json({
        success: true,
        message: SUCCESS_MESSAGES.EMAIL_SENT,
      });
    } catch (err) {
      // Rollback
      user.passwordResetToken = undefined;
      user.passwordResetExpires = undefined;
      await user.save({ validateBeforeSave: false });

      return next(new AppError('There was an error sending the email. Try again later!', 500));
    }
  });

  public static resetPassword = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const user = await AuthService.resetPassword(req.params.token, req.body.password);
    AuthController.createSendToken(user, 200, res);
  });
}

export default AuthController;
