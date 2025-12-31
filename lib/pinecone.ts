import { Pinecone } from '@pinecone-database/pinecone';

let pineconeClient: Pinecone | null = null;

/**
 * Get or create a Pinecone client instance
 */
export const getPineconeClient = async (): Promise<Pinecone> => {
    if (pineconeClient) {
        return pineconeClient;
    }

    const apiKey = process.env.PINECONE_API_KEY;

    if (!apiKey) {
        throw new Error('PINECONE_API_KEY is not defined in environment variables');
    }

    pineconeClient = new Pinecone({
        apiKey,
    });

    return pineconeClient;
};

/**
 * Get or create a Pinecone index
 */
export const getPineconeIndex = async (indexName?: string) => {
    const client = await getPineconeClient();
    const name = indexName || process.env.PINECONE_INDEX_NAME || 'trip-planner-itineraries';

    return client.index(name);
};

/**
 * Initialize Pinecone index if it doesn't exist
 * Note: Index creation is typically done via Pinecone dashboard or CLI
 * This function checks if the index exists
 */
export const initializePineconeIndex = async (indexName?: string) => {
    try {
        const client = await getPineconeClient();
        const name = indexName || process.env.PINECONE_INDEX_NAME || 'trip-planner-itineraries';

        // List all indexes to check if ours exists
        const indexes = await client.listIndexes();
        const indexExists = indexes.indexes?.some(idx => idx.name === name);

        if (!indexExists) {
            console.warn(`Index "${name}" does not exist. Please create it via Pinecone dashboard with dimension 1536 and cosine metric.`);
            return false;
        }

        console.log(`Connected to Pinecone index: ${name}`);
        return true;
    } catch (error) {
        console.error('Error initializing Pinecone:', error);
        throw error;
    }
};

/**
 * Delete vectors by document ID
 */
export const deleteDocumentVectors = async (documentId: string) => {
    try {
        const index = await getPineconeIndex();

        // Delete all vectors with matching documentId in metadata
        await index.deleteMany({
            filter: { documentId: { $eq: documentId } }
        });

        console.log(`Deleted vectors for document: ${documentId}`);
        return true;
    } catch (error) {
        console.error('Error deleting document vectors:', error);
        throw error;
    }
};
