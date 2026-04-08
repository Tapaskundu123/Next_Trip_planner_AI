
import mongoose from "mongoose";

export interface IUser {
    name: string;
    email: string;
    password: string;
    _id?: mongoose.Types.ObjectId;
    isPurchased: boolean;
    purchasedAmount: number;
    stripeSessionId: string;
    purchasedAt: Date;
    createdAt?: Date;
    updatedAt?: Date;
}

const userSchema = new mongoose.Schema<IUser>({
    name: {
        type: String,
        required: [true, 'Name is required']
    },
    email: {
        type: String,
        required: [true, 'Email is required']
    },
    password: {
        type: String,
        required: [true, 'Password is required']
    },
    isPurchased: {
        type: Boolean,
        default: false,
    },

    purchasedAmount: {
        type: Number,
    },

    stripeSessionId: {
        type: String,
    },

    purchasedAt: {
        type: Date,
    },
}, { timestamps: true });

export const User = mongoose.models?.User || mongoose.model<IUser>('User', userSchema);
