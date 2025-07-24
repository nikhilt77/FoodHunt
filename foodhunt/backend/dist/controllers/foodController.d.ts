import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const foodValidation: {
    create: import("express-validator").ValidationChain[];
};
export declare const getAllFoodItems: (req: Request, res: Response) => Promise<void>;
export declare const getFoodItemById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createFoodItem: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateFoodItem: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const deleteFoodItem: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const migrateFoodItemsEndpoint: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=foodController.d.ts.map