"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.validateRequest = void 0;
const express_validator_1 = require("express-validator");
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: errors.array()
        });
    }
    next();
};
exports.validateRequest = validateRequest;
const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation error',
            errors: Object.values(err.errors).map((e) => e.message)
        });
    }
    if (err.name === 'CastError') {
        return res.status(400).json({ message: 'Invalid ID format' });
    }
    if (err.code === 11000) {
        return res.status(400).json({ message: 'Duplicate field value' });
    }
    res.status(500).json({ message: 'Internal server error' });
};
exports.errorHandler = errorHandler;
//# sourceMappingURL=validation.js.map