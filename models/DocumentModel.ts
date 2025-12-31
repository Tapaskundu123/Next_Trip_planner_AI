import mongoose from 'mongoose';

export interface DocumentMetadata {
    filename: string;
    originalName: string;
    uploadDate: Date;
    fileSize: number;
    totalChunks: number;
    totalCharacters: number;
    uploadedBy?: string;
    category?: string;
    tags?: string[];
    pineconeIds: string[];
}

const DocumentSchema = new mongoose.Schema<DocumentMetadata>(
    {
        filename: {
            type: String,
            required: true,
            unique: true,
        },
        originalName: {
            type: String,
            required: true,
        },
        uploadDate: {
            type: Date,
            default: Date.now,
        },
        fileSize: {
            type: Number,
            required: true,
        },
        totalChunks: {
            type: Number,
            required: true,
        },
        totalCharacters: {
            type: Number,
            required: true,
        },
        uploadedBy: String,
        category: {
            type: String,
            default: 'general',
        },
        tags: [String],
        pineconeIds: [String],
    },
    { timestamps: true }
);

export const Document =
    mongoose.models.Document ||
    mongoose.model<DocumentMetadata>('Document', DocumentSchema);
