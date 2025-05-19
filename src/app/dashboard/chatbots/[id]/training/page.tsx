import { useState } from 'react';
import { Card } from '@tremor/react';
import { DocumentTextIcon, GlobeAltIcon } from '@heroicons/react/24/outline';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { supabase } from '@/lib/supabase/client';
import { Chatbot } from '@/lib/langchain/chatbot';
import toast from 'react-hot-toast';

export default function ChatbotTrainingPage({ params }: { params: { id: string } }) {
  const [loading, setLoading] = useState(false);
  const [url, setUrl] = useState('');
  const [document, setDocument] = useState<File | null>(null);

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch(url);
      const content = await response.text();
      
      const chatbot = new Chatbot(process.env.NEXT_PUBLIC_OPENAI_API_KEY!);
      await chatbot.initialize(params.id);
      await chatbot.addDocument(content, { source: url, type: 'url' });

      await supabase.from('training_sources').insert({
        chatbot_id: params.id,
        source_type: 'url',
        source_url: url,
        status: 'completed'
      });

      toast.success('URL content added successfully');
      setUrl('');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add URL content');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocument(file);
    }
  };

  const handleDocumentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!document) return;

    setLoading(true);
    try {
      const content = await document.text();
      
      const chatbot = new Chatbot(process.env.NEXT_PUBLIC_OPENAI_API_KEY!);
      await chatbot.initialize(params.id);
      await chatbot.addDocument(content, { 
        source: document.name,
        type: 'document',
        fileType: document.type
      });

      await supabase.from('training_sources').insert({
        chatbot_id: params.id,
        source_type: 'document',
        source_url: document.name,
        status: 'completed'
      });

      toast.success('Document added successfully');
      setDocument(null);
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to add document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-gray-900">Train Your Chatbot</h1>

        <div className="mt-6 space-y-6">
          <Card>
            <h2 className="flex items-center text-lg font-medium text-gray-900">
              <GlobeAltIcon className="mr-2 h-5 w-5 text-gray-500" />
              Add Website Content
            </h2>
            <form onSubmit={handleUrlSubmit} className="mt-4">
              <div className="flex space-x-4">
                <input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="Enter website URL"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  {loading ? 'Adding...' : 'Add URL'}
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <h2 className="flex items-center text-lg font-medium text-gray-900">
              <DocumentTextIcon className="mr-2 h-5 w-5 text-gray-500" />
              Upload Documents
            </h2>
            <form onSubmit={handleDocumentSubmit} className="mt-4">
              <div className="flex space-x-4">
                <input
                  type="file"
                  onChange={handleFileUpload}
                  accept=".txt,.md,.pdf"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={!document || loading}
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  {loading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}