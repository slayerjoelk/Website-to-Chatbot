import { useState, useEffect } from 'react';
import { Card } from '@tremor/react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { EmbedCode } from '@/components/chat/EmbedCode';
import { supabase } from '@/lib/supabase/client';
import toast from 'react-hot-toast';

export default function ChatbotSettingsPage({ params }: { params: { id: string } }) {
  const [settings, setSettings] = useState({
    name: '',
    description: '',
    slack_enabled: false,
    slack_token: '',
    slack_channel: '',
  });

  useEffect(() => {
    const loadChatbot = async () => {
      const { data: chatbot } = await supabase
        .from('chatbots')
        .select('*')
        .eq('id', params.id)
        .single();

      if (chatbot) {
        setSettings({
          name: chatbot.name,
          description: chatbot.description || '',
          slack_enabled: chatbot.slack_enabled || false,
          slack_token: chatbot.slack_token || '',
          slack_channel: chatbot.slack_channel || '',
        });
      }
    };

    loadChatbot();
  }, [params.id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const { error } = await supabase
        .from('chatbots')
        .update({
          name: settings.name,
          description: settings.description,
          slack_enabled: settings.slack_enabled,
          slack_token: settings.slack_token,
          slack_channel: settings.slack_channel,
        })
        .eq('id', params.id);

      if (error) throw error;
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to update settings');
    }
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-3xl">
        <h1 className="text-2xl font-semibold text-gray-900">Chatbot Settings</h1>

        <div className="mt-6 space-y-6">
          <Card>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Chatbot Name
                </label>
                <input
                  type="text"
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  required
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  value={settings.description}
                  onChange={(e) => setSettings({ ...settings, description: e.target.value })}
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                />
              </div>

              <div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="slack_enabled"
                    checked={settings.slack_enabled}
                    onChange={(e) => setSettings({ ...settings, slack_enabled: e.target.checked })}
                    className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <label htmlFor="slack_enabled" className="ml-2 block text-sm text-gray-700">
                    Enable Slack Integration
                  </label>
                </div>
              </div>

              {settings.slack_enabled && (
                <>
                  <div>
                    <label htmlFor="slack_token" className="block text-sm font-medium text-gray-700">
                      Slack Bot Token
                    </label>
                    <input
                      type="password"
                      id="slack_token"
                      value={settings.slack_token}
                      onChange={(e) => setSettings({ ...settings, slack_token: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="slack_channel" className="block text-sm font-medium text-gray-700">
                      Slack Channel
                    </label>
                    <input
                      type="text"
                      id="slack_channel"
                      value={settings.slack_channel}
                      onChange={(e) => setSettings({ ...settings, slack_channel: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
                    />
                  </div>
                </>
              )}

              <div className="flex justify-end">
                <button
                  type="submit"
                  className="rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  Save Settings
                </button>
              </div>
            </form>
          </Card>

          <Card>
            <h2 className="text-lg font-medium text-gray-900">Embed Your Chatbot</h2>
            <div className="mt-4">
              <EmbedCode chatbotId={params.id} />
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}