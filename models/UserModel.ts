
import mongoose from "mongoose";

export interface IUser {
    name: string;
    email: string;
    password: string;
    price:number;
    _id?: mongoose.Types.ObjectId;
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
    price:{
        type: Number,
        default:0
    }
}, { timestamps: true });

export const User = mongoose.models?.User || mongoose.model<IUser>('User', userSchema);
