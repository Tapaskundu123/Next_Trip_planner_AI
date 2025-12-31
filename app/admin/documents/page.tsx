import PdfUpload from '@/_components/PdfUpload';
import DocumentManager from '@/_components/DocumentManager';

export default function DocumentsPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Travel Guide Management
                    </h1>
                    <p className="text-lg text-gray-600">
                        Upload and manage PDF travel guides for AI-powered trip recommendations
                    </p>
                </div>

                <div className="space-y-12">
                    {/* Upload Section */}
                    <section>
                        <PdfUpload />
                    </section>

                    {/* Document Library Section */}
                    <section>
                        <DocumentManager />
                    </section>
                </div>
            </div>
        </div>
    );
}
