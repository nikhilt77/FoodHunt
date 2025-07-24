import mongoose from 'mongoose';
import { ITransaction } from '../types';
export declare const Transaction: mongoose.Model<ITransaction, {}, {}, {}, mongoose.Document<unknown, {}, ITransaction, {}> & ITransaction & Required<{
    _id: string;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Transaction.d.ts.map