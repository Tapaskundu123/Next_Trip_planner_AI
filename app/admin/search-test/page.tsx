import VectorSearch from '@/_components/VectorSearch';

export default function SearchTestPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12">
            <div className="max- mx-auto">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">
                        Vector Search Test
                    </h1>
                    <p className="text-gray-600">
                        Test the Pinecone vector search with your uploaded travel guides
                    </p>
                </div>

                <VectorSearch />
            </div>
        </div>
    );
}
