import { NextRequest, NextResponse } from 'next/server';
import { Document } from '@/models/DocumentModel';
import { deleteDocumentVectors } from '@/lib/pinecone';
import { connectDB } from '@/lib/mongodb';

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();

        const documentId = params.id;

        if (!documentId) {
            return NextResponse.json(
                { error: 'Document ID is required' },
                { status: 400 }
            );
        }

        // Find document in MongoDB
        const doc = await Document.findOne({ filename: documentId });

        if (!doc) {
            return NextResponse.json(
                { error: 'Document not found' },
                { status: 404 }
            );
        }

        // Delete vectors from Pinecone
        await deleteDocumentVectors(documentId);

        // Delete document from MongoDB
        await Document.deleteOne({ filename: documentId });

        return NextResponse.json({
            success: true,
            message: 'Document deleted successfully',
            documentId,
        });
    } catch (error: any) {
        console.error('Delete document error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to delete document' },
            { status: 500 }
        );
    }
}
