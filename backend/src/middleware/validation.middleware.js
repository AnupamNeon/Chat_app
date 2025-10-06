import { body, validationResult } from 'express-validator';
import validator from 'validator';

export const validateSignup = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .isLength({ min: 2, max: 50 })
    .withMessage('Full name must be between 2 and 50 characters')
    .trim()
    .escape(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: errors.array() 
      });
    }
    next();
  }
];

export const validateLogin = [
  body('email')
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: errors.array() 
      });
    }
    next();
  }
];

export const validateMessage = [
  body('text')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Message too long')
    .trim()
    .escape(),
  body('image')
    .optional()
    .custom((value) => {
      if (value) {
        if (!value.startsWith('data:image/')) {
          throw new Error('Image must be a valid base64 data URI (e.g., data:image/png;base64,...)');
        }
        const base64Part = value.split(',')[1];
        if (!validator.isBase64(base64Part)) {
          throw new Error('Invalid base64 image data');
        }
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        message: "Validation failed", 
        errors: errors.array() 
      });
    }
    
    // Ensure at least one field is provided
    if (!req.body.text && !req.body.image) {
      return res.status(400).json({ 
        message: "Either text or image is required" 
      });
    }
    
    next();
  }
];