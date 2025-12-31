'use client';

import { useState } from 'react';
import { Upload, FileText, X, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadStatus {
    status: 'idle' | 'uploading' | 'success' | 'error';
    message?: string;
    fileName?: string;
    chunks?: number;
}

export default function PdfUpload() {
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<UploadStatus>({ status: 'idle' });
    const [category, setCategory] = useState('general');
    const [tags, setTags] = useState('');
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            handleFileSelect(files[0]);
        }
    };

    const handleFileSelect = (selectedFile: File) => {
        if (selectedFile.type !== 'application/pdf') {
            toast.error('Please select a PDF file');
            return;
        }

        if (selectedFile.size > 10 * 1024 * 1024) {
            toast.error('File size must be less than 10MB');
            return;
        }

        setFile(selectedFile);
        setUploadStatus({ status: 'idle' });
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            handleFileSelect(files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Please select a file to upload');
            return;
        }

        setUploadStatus({ status: 'uploading' });

        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('category', category);
            formData.append('tags', tags);

            const response = await fetch('/api/pdf/upload-pdf', {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Upload failed');
            }

            setUploadStatus({
                status: 'success',
                message: `Successfully uploaded! Processed ${data.chunks} chunks`,
                fileName: data.filename,
                chunks: data.chunks,
            });

            toast.success('PDF uploaded and indexed successfully!');

            // Reset form
            setTimeout(() => {
                setFile(null);
                setTags('');
                setUploadStatus({ status: 'idle' });
            }, 3000);
        } catch (error: any) {
            console.error('Upload error:', error);
            setUploadStatus({
                status: 'error',
                message: error.message || 'Failed to upload PDF',
            });
            toast.error(error.message || 'Failed to upload PDF');
        }
    };

    return (
        <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <FileText className="w-6 h-6" />
                Upload Travel Guide PDF
            </h2>

            {/* Drag and Drop Area */}
            <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${dragActive
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                    }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
            >
                <input
                    type="file"
                    id="file-upload"
                    accept="application/pdf"
                    onChange={handleFileInputChange}
                    className="hidden"
                />

                <label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-3"
                >
                    <Upload className="w-12 h-12 text-gray-400" />
                    <div>
                        <p className="text-lg font-medium text-gray-700">
                            Drop PDF here or click to browse
                        </p>
                        <p className="text-sm text-gray-500 mt-1">Maximum file size: 10MB</p>
                    </div>
                </label>

                {file && (
                    <div className="mt-4 flex items-center justify-center gap-2 p-3 bg-white rounded-md border border-gray-200">
                        <FileText className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium text-gray-700">{file.name}</span>
                        <button
                            onClick={() => setFile(null)}
                            className="ml-2 text-gray-400 hover:text-red-500"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            {/* Category and Tags */}
            <div className="mt-6 grid grid-cols-2 gap-4">
                <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                        Category
                    </label>
                    <select
                        id="category"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="general">General</option>
                        <option value="attractions">Attractions</option>
                        <option value="hotels">Hotels</option>
                        <option value="restaurants">Restaurants</option>
                        <option value="activities">Activities</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                        Tags (comma-separated)
                    </label>
                    <input
                        id="tags"
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        placeholder="e.g., paris, france, europe"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>

            {/* Upload Button */}
            <button
                onClick={handleUpload}
                disabled={!file || uploadStatus.status === 'uploading'}
                className={`mt-6 w-full py-3 px-4 rounded-md font-medium text-white transition-colors flex items-center justify-center gap-2 ${!file || uploadStatus.status === 'uploading'
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
            >
                {uploadStatus.status === 'uploading' ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Uploading & Indexing...
                    </>
                ) : (
                    <>
                        <Upload className="w-5 h-5" />
                        Upload and Index PDF
                    </>
                )}
            </button>

            {/* Status Messages */}
            {uploadStatus.status === 'success' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-green-800">Upload Successful!</p>
                        <p className="text-sm text-green-700 mt-1">{uploadStatus.message}</p>
                    </div>
                </div>
            )}

            {uploadStatus.status === 'error' && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                    <div>
                        <p className="text-sm font-medium text-red-800">Upload Failed</p>
                        <p className="text-sm text-red-700 mt-1">{uploadStatus.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
}
