import { extractText, getDocumentProxy } from 'unpdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';

export interface PDFChunk {
    text: string;
    metadata: {
        chunkIndex: number;
        totalChunks?: number;
        startChar: number;
        endChar: number;
    };
}

export const extractTextFromPDF = async (buffer: Uint8Array): Promise<string> => {
    const pdf = await getDocumentProxy(buffer);
    const { text } = await extractText(pdf, { mergePages: true });
    return text;
};

export const splitTextIntoChunks = async (
    text: string,
    chunkSize = 1000,
    chunkOverlap = 200
): Promise<PDFChunk[]> => {
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize,
        chunkOverlap,
        separators: ['\n\n', '\n', '. ', ' ', ''],
    });

    const docs = await splitter.createDocuments([text]);

    return docs.map((doc, index) => {
        const startChar = text.indexOf(doc.pageContent);
        const endChar = startChar + doc.pageContent.length;

        return {
            text: doc.pageContent,
            metadata: {
                chunkIndex: index,
                totalChunks: docs.length,
                startChar,
                endChar,
            },
        };
    });
};

export const cleanText = (text: string): string =>
    text
        .replace(/\r\n/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .replace(/\s{2,}/g, ' ')
        .trim();

export const processPDF = async (
    buffer: Uint8Array,
    chunkSize = 1000,
    chunkOverlap = 200
): Promise<PDFChunk[]> => {
    const rawText = await extractTextFromPDF(buffer);
    const cleanedText = cleanText(rawText);

    if (!cleanedText || cleanedText.length < 10) {
        throw new Error('PDF contains no readable text');
    }

    return splitTextIntoChunks(cleanedText, chunkSize, chunkOverlap);
};

export const validatePDF = (
    buffer: Uint8Array,
    maxSizeBytes = 10 * 1024 * 1024
): void => {
    if (!buffer?.length) throw new Error('PDF file is empty');
    if (buffer.length > maxSizeBytes)
        throw new Error('PDF file too large');

    // Check PDF magic number using TextDecoder (compatible with Uint8Array)
    const header = new TextDecoder('utf-8').decode(buffer.slice(0, 4));
    if (!header.startsWith('%PDF'))
        throw new Error('Invalid PDF file');
};
