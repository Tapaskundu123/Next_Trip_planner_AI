import { NextRequest, NextResponse } from 'next/server';
import { processPDF, validatePDF } from '@/lib/pdfProcessor';
import { generateEmbeddings } from '@/lib/embeddings';
import { getPineconeIndex } from '@/lib/pinecone';
import { Document } from '@/models/DocumentModel';
import { connectDB } from '@/lib/mongodb';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        // Parse form data
        const formData = await req.formData();
        const file = formData.get('file') as File;
        const category = formData.get('category') as string || 'general';
        const tags = formData.get('tags') as string;

        if (!file) {
            return NextResponse.json(
                { error: 'No file provided' },
                { status: 400 }
            );
        }

        // Convert file to Uint8Array (required by unpdf)
        const arrayBuffer = await file.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // Validate PDF
        validatePDF(uint8Array);

        // Generate unique document ID
        const documentId = uuidv4();

        // Process PDF: extract text and split into chunks
        const chunks = await processPDF(uint8Array);

        if (chunks.length === 0) {
            return NextResponse.json(
                { error: 'No text could be extracted from PDF' },
                { status: 400 }
            );
        }

        // Generate embeddings for all chunks
        const texts = chunks.map(chunk => chunk.text);
        const embeddings = await generateEmbeddings(texts);

        // Prepare vectors for Pinecone
        const vectors = chunks.map((chunk, index) => ({
            id: `${documentId}-chunk-${index}`,
            values: embeddings[index],
            metadata: {
                documentId,
                filename: file.name,
                chunkIndex: chunk.metadata.chunkIndex,
                totalChunks: chunks.length,
                text: chunk.text,
                category,
                uploadDate: new Date().toISOString(),
            },
        }));

        // Upload to Pinecone
        const index = await getPineconeIndex();
        await index.upsert(vectors);

        // Save document metadata to MongoDB
        const totalCharacters = texts.join('').length;
        const doc = await Document.create({
            filename: documentId,
            originalName: file.name,
            fileSize: uint8Array.length,
            totalChunks: chunks.length,
            totalCharacters,
            category,
            tags: tags ? tags.split(',').map(t => t.trim()) : [],
            pineconeIds: vectors.map(v => v.id),
        });

        return NextResponse.json({
            success: true,
            documentId,
            filename: file.name,
            chunks: chunks.length,
            characters: totalCharacters,
            message: 'PDF uploaded and indexed successfully',
        });
    } catch (error: any) {
        console.error('PDF upload error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to upload PDF' },
            { status: 500 }
        );
    }
}