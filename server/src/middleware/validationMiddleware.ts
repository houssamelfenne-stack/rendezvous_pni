import { Request, Response, NextFunction } from 'express';
import { body, validationResult } from 'express-validator';

const handleValidationResult = (req: Request, res: Response, next: NextFunction) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    next();
};

export const validateRegistration = [
    body('fullName').notEmpty().withMessage('Full name is required'),
    body('gender').isIn(['male', 'female', 'other']).withMessage('Gender must be male, female, or other'),
    body('dateOfBirth').isDate().withMessage('Date of birth must be a valid date'),
    body('nationalId').notEmpty().withMessage('National ID number is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('phoneNumber').isMobilePhone('any').withMessage('Phone number must be valid'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    handleValidationResult
];

export const validateLogin = [
    body('nationalId').notEmpty().withMessage('National ID number is required'),
    body('password').notEmpty().withMessage('Password is required'),
    handleValidationResult
];

export const validateChild = [
    body('fullName').notEmpty().withMessage('Child full name is required'),
    body('gender').notEmpty().withMessage('Gender is required'),
    body('dateOfBirth').isDate().withMessage('Date of birth must be a valid date'),
    body('nationalId').notEmpty().withMessage('National ID number is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('phoneNumber').notEmpty().withMessage('Phone number is required'),
    handleValidationResult
];

export const validateVaccine = [
    body('name').notEmpty().withMessage('Vaccine name is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('ageGroup').notEmpty().withMessage('Age group is required'),
    body('schedule').notEmpty().withMessage('Schedule is required'),
    handleValidationResult
];