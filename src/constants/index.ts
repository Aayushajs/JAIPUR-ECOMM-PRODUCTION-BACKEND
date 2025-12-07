export const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 1 day
};

export const ERROR_MESSAGES = {
  INTERNAL_SERVER_ERROR: 'Something went wrong. Please try again later.',
  INVALID_ID: 'Invalid ID format.',
  DUPLICATE_FIELD: 'Duplicate field value entered.',
  VALIDATION_ERROR: 'Input validation failed.',
  JWT_EXPIRED: 'Your token has expired! Please log in again.',
  JWT_INVALID: 'Invalid token. Please log in again.',
  NO_USER_FOUND: 'No user found with that ID.',
  UNAUTHORIZED: 'You are not logged in! Please log in to get access.',
  FORBIDDEN: 'You do not have permission to perform this action.',
};

export const SUCCESS_MESSAGES = {
  EMAIL_SENT: 'Token sent to email!',
};
