'use client';

import { useState, useEffect } from 'react';
import { FileText, Trash2, Search, Loader2, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Document {
    _id: string;
    filename: string;
    originalName: string;
    uploadDate: string;
    fileSize: number;
    totalChunks: number;
    totalCharacters: number;
    category: string;
    tags: string[];
    createdAt: string;
}

export default function DocumentManager() {
    const [documents, setDocuments] = useState<Document[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [deleting, setDeleting] = useState<string | null>(null);

    const fetchDocuments = async () => {
        setLoading(true);
        try {
            const url = categoryFilter === 'all'
                ? '/api/pdf/list-documents'
                : `/api/pdf/list-documents?category=${categoryFilter}`;

            const response = await fetch(url);
            const data = await response.json();

            if (response.ok) {
                setDocuments(data.documents);
            } else {
                toast.error('Failed to load documents');
            }
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast.error('Failed to load documents');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDocuments();
    }, [categoryFilter]);

    const handleDelete = async (documentId: string, documentName: string) => {
        if (!confirm(`Are you sure you want to delete "${documentName}"?`)) {
            return;
        }

        setDeleting(documentId);
        try {
            const response = await fetch(`/api/pdf/delete/${documentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                toast.success('Document deleted successfully');
                setDocuments(docs => docs.filter(doc => doc.filename !== documentId));
            } else {
                const data = await response.json();
                toast.error(data.error || 'Failed to delete document');
            }
        } catch (error) {
            console.error('Error deleting document:', error);
            toast.error('Failed to delete document');
        } finally {
            setDeleting(null);
        }
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        const kb = bytes / 1024;
        if (kb < 1024) return kb.toFixed(1) + ' KB';
        const mb = kb / 1024;
        return mb.toFixed(1) + ' MB';
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const filteredDocuments = documents.filter(doc =>
        doc.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="w-full max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FileText className="w-6 h-6" />
                    Document Library
                </h2>
                <button
                    onClick={fetchDocuments}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
                >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search documents or tags..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                    <option value="all">All Categories</option>
                    <option value="general">General</option>
                    <option value="attractions">Attractions</option>
                    <option value="hotels">Hotels</option>
                    <option value="restaurants">Restaurants</option>
                    <option value="activities">Activities</option>
                </select>
            </div>

            {/* Documents List */}
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                </div>
            ) : filteredDocuments.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p className="text-lg font-medium">No documents found</p>
                    <p className="text-sm mt-2">Upload a PDF to get started</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {filteredDocuments.map((doc) => (
                        <div
                            key={doc._id}
                            className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <FileText className="w-5 h-5 text-blue-600 flex-shrink-0" />
                                        <h3 className="font-medium text-gray-800">{doc.originalName}</h3>
                                        <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded">
                                            {doc.category}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                                        <div>
                                            <span className="font-medium">Size:</span> {formatFileSize(doc.fileSize)}
                                        </div>
                                        <div>
                                            <span className="font-medium">Chunks:</span> {doc.totalChunks}
                                        </div>
                                        <div>
                                            <span className="font-medium">Characters:</span> {doc.totalCharacters.toLocaleString()}
                                        </div>
                                        <div>
                                            <span className="font-medium">Uploaded:</span> {formatDate(doc.createdAt)}
                                        </div>
                                    </div>

                                    {doc.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-2">
                                            {doc.tags.map((tag, idx) => (
                                                <span
                                                    key={idx}
                                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                                                >
                                                    #{tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <button
                                    onClick={() => handleDelete(doc.filename, doc.originalName)}
                                    disabled={deleting === doc.filename}
                                    className="ml-4 p-2 text-red-600 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50"
                                    title="Delete document"
                                >
                                    {deleting === doc.filename ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Summary */}
            {!loading && filteredDocuments.length > 0 && (
                <div className="mt-6 pt-4 border-t border-gray-200 text-sm text-gray-600">
                    Showing {filteredDocuments.length} of {documents.length} documents
                </div>
            )}
        </div>
    );
}
