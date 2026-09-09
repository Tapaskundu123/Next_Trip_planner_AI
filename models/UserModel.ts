
import mongoose from "mongoose";

export interface IUser {
    name: string;
    email: string;
    password: string;
    _id?: mongoose.Types.ObjectId;
    isPurchased: boolean;
    purchasedAmount?: number;
    price?: number;
    paymentGateway?: string;
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    stripeSessionId?: string;
    purchasedAt?: Date;
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

    paymentGateway: {
        type: String,
        default: "razorpay",
    },

    razorpayOrderId: {
        type: String,
    },

    razorpayPaymentId: {
        type: String,
    },

    stripeSessionId: {
        type: String,
    },

    purchasedAt: {
        type: Date,
    },
}, { timestamps: true });

export const User = mongoose.models?.User || mongoose.model<IUser>('User', userSchema);
