import { Request, Response } from 'express';
interface AuthRequest extends Request {
    user?: any;
}
export declare const createPayment: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserPayments: (req: AuthRequest, res: Response) => Promise<void>;
export declare const getAllPayments: (req: Request, res: Response) => Promise<void>;
export declare const getUserBalance: (req: AuthRequest, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getUserDues: (req: AuthRequest, res: Response) => Promise<void>;
export {};
//# sourceMappingURL=paymentController.d.ts.map