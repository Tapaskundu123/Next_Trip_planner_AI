'use client';

import { useState } from 'react';
import { Search, Loader2, FileText, X } from 'lucide-react';
import toast from 'react-hot-toast';

interface SearchResult {
    text: string;
    documentId: string;
    filename: string;
    score: number;
    chunkIndex: number;
    category: string;
}

export default function VectorSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchPerformed, setSearchPerformed] = useState(false);

    const handleSearch = async () => {
        if (!query.trim()) {
            toast.error('Please enter a search query');
            return;
        }

        setLoading(true);
        setSearchPerformed(true);

        try {
            const response = await fetch('/api/pdf/query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    query: query.trim(),
                    topK: 5,
                    minScore: 0.7,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                setResults(data.results);
                if (data.results.length === 0) {
                    toast('No relevant results found', { icon: '🔍' });
                } else {
                    toast.success(`Found ${data.results.length} relevant results`);
                }
            } else {
                toast.error(data.error || 'Search failed');
            }
        } catch (error) {
            console.error('Search error:', error);
            toast.error('Failed to perform search');
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const clearSearch = () => {
        setQuery('');
        setResults([]);
        setSearchPerformed(false);
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-6">
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <Search className="w-6 h-6" />
                    Search Travel Guides
                </h2>

                {/* Search Input */}
                <div className="flex gap-3 mb-6">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Ask about destinations, activities, hotels..."
                            className="w-full px-4 py-3 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {query && (
                            <button
                                onClick={clearSearch}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        )}
                    </div>
                    <button
                        onClick={handleSearch}
                        disabled={loading || !query.trim()}
                        className={`px-6 py-3 rounded-md font-medium text-white transition-colors flex items-center gap-2 ${loading || !query.trim()
                                ? 'bg-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700'
                            }`}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Searching...
                            </>
                        ) : (
                            <>
                                <Search className="w-5 h-5" />
                                Search
                            </>
                        )}
                    </button>
                </div>

                {/* Results */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    </div>
                )}

                {!loading && searchPerformed && results.length === 0 && (
                    <div className="text-center py-12 text-gray-500">
                        <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                        <p className="text-lg font-medium">No results found</p>
                        <p className="text-sm mt-2">Try different keywords or upload more travel guides</p>
                    </div>
                )}

                {!loading && results.length > 0 && (
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 font-medium">
                            Found {results.length} relevant {results.length === 1 ? 'result' : 'results'}
                        </p>
                        {results.map((result, idx) => (
                            <div
                                key={idx}
                                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                            >
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                        <h3 className="font-medium text-gray-800">{result.filename}</h3>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                            {result.category}
                                        </span>
                                        <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 rounded">
                                            {(result.score * 100).toFixed(1)}% match
                                        </span>
                                    </div>
                                </div>
                                <p className="text-sm text-gray-700 leading-relaxed">{result.text}</p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Chunk {result.chunkIndex + 1}
                                </p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
