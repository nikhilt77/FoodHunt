import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const authValidation: {
    register: import("express-validator").ValidationChain[];
    login: import("express-validator").ValidationChain[];
};
export declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
export declare const addBalance: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=authController.d.ts.map