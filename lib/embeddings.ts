import OpenAI from 'openai';

let openaiClient: OpenAI | null = null;

/**
 * Get or create OpenAI client configured for OpenRouter
 */
const getOpenRouterClient = (): OpenAI => {
    if (openaiClient) {
        return openaiClient;
    }

    const apiKey = process.env.TEXT_EMBEDDING_API_KEY;

    if (!apiKey) {
        throw new Error('TEXT_EMBEDDING_API_KEY is not defined in environment variables');
    }

    openaiClient = new OpenAI({ 
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
    });
    return openaiClient;
};

/**
 * Generate embedding for a single text
 */
export const generateEmbedding = async (text: string): Promise<number[]> => {
    try {
        const client = getOpenRouterClient();

        const response = await client.embeddings.create({
            model: 'mistralai/mistral-embed-2312',  // Use full model ID for OpenRouter
            input: text,
            encoding_format: 'float',
        });

        return response.data[0].embedding;
    } catch (error) {
        console.error('Error generating embedding:', error);
        throw error;
    }
};

/**
 * Generate embeddings for multiple texts (batch processing)
 */
export const generateEmbeddings = async (texts: string[]): Promise<number[][]> => {
    try {
        const client = getOpenRouterClient();

        // OpenAI supports batch embedding generation
        const response = await client.embeddings.create({
            model: 'mistralai/mistral-embed-2312',  // Use full model ID for OpenRouter
            input: texts,
            encoding_format: 'float',
        });

        return response.data.map(item => item.embedding);
    } catch (error) {
        console.error('Error generating embeddings:', error);
        throw error;
    }
};

/**
 * Generate embedding with retry logic
 */
export const generateEmbeddingWithRetry = async (
    text: string,
    maxRetries = 3,
    delay = 1000
): Promise<number[]> => {
    let lastError: Error | null = null;

    for (let i = 0; i < maxRetries; i++) {
        try {
            return await generateEmbedding(text);
        } catch (error) {
            lastError = error as Error;
            console.warn(`Embedding generation failed (attempt ${i + 1}/${maxRetries}):`, error);

            if (i < maxRetries - 1) {
                await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
            }
        }
    }

    throw lastError || new Error('Failed to generate embedding after retries');
};