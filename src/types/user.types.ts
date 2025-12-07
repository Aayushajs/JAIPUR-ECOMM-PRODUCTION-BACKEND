import { Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'admin';
  address: {
    street?: string;
    city?: string;
    zip?: string;
    country?: string;
  };
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  comparePassword: (enteredPassword: string) => Promise<boolean>;
  createPasswordResetToken: () => string;
}
