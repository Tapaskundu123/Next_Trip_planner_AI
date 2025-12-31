import { NextRequest, NextResponse } from 'next/server';
import { Document } from '@/models/DocumentModel';
import { connectDB } from '@/lib/mongodb';

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        // Get query parameters
        const { searchParams } = new URL(req.url);
        const category = searchParams.get('category');
        const limit = parseInt(searchParams.get('limit') || '50');
        const skip = parseInt(searchParams.get('skip') || '0');

        // Build filter
        const filter = category ? { category } : {};

        // Query documents
        const documents = await Document.find(filter)
            .sort({ uploadDate: -1 })
            .limit(limit)
            .skip(skip)
            .select('-pineconeIds'); // Exclude pineconeIds array to reduce payload size

        const total = await Document.countDocuments(filter);

        return NextResponse.json({
            success: true,
            documents,
            total,
            limit,
            skip,
        });
    } catch (error: any) {
        console.error('List documents error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to fetch documents' },
            { status: 500 }
        );
    }
}
