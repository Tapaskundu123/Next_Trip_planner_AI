import { NextRequest, NextResponse } from 'next/server';
import { generateEmbedding } from '@/lib/embeddings';
import { getPineconeIndex } from '@/lib/pinecone';

export interface QueryResult {
    text: string;
    documentId: string;
    filename: string;
    score: number;
    chunkIndex: number;
    category: string;
}

export async function POST(req: NextRequest) {
    try {
        const { query, topK = 5, category, minScore = 0.7 } = await req.json();

        if (!query || typeof query !== 'string') {
            return NextResponse.json(
                { error: 'Query is required and must be a string' },
                { status: 400 }
            );
        }

        // Generate embedding for the query
        const queryEmbedding = await generateEmbedding(query);

        // Search Pinecone
        const index = await getPineconeIndex();

        // Build filter if category is specified
        const filter = category ? { category: { $eq: category } } : undefined;

        const searchResults = await index.query({
            vector: queryEmbedding,
            topK,
            includeMetadata: true,
            filter,
        });

        // Filter by minimum score and format results
        const results: QueryResult[] = searchResults.matches
            .filter(match => match.score && match.score >= minScore)
            .map(match => ({
                text: match.metadata?.text as string || '',
                documentId: match.metadata?.documentId as string || '',
                filename: match.metadata?.filename as string || '',
                score: match.score || 0,
                chunkIndex: match.metadata?.chunkIndex as number || 0,
                category: match.metadata?.category as string || 'general',
            }));

        return NextResponse.json({
            success: true,
            query,
            results,
            count: results.length,
        });
    } catch (error: any) {
        console.error('Query error:', error);
        return NextResponse.json(
            { error: error.message || 'Failed to process query' },
            { status: 500 }
        );
    }
}
