import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { Chatbot } from '@/lib/langchain/chatbot';
import { SlackIntegration } from '@/lib/integrations/slack';

export async function POST(request: Request) {
  try {
    const { message, chatbotId } = await request.json();

    // Get chatbot configuration and training data
    const { data: chatbot } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', chatbotId)
      .single();

    if (!chatbot) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    // Initialize chatbot with OpenAI API key
    const bot = new Chatbot(process.env.OPENAI_API_KEY!);
    await bot.initialize(chatbotId);

    // Get response from chatbot
    const response = await bot.query(message);

    // Store chat history
    await supabase.from('chat_history').insert({
      chatbot_id: chatbotId,
      user_message: message,
      bot_response: response,
      metadata: { timestamp: new Date().toISOString() }
    });

    // If Slack integration is enabled, send message to Slack
    if (chatbot.slack_enabled && chatbot.slack_token) {
      const slack = new SlackIntegration(chatbot.slack_token);
      await slack.sendMessage(chatbot.slack_channel, 
        `New chat message:\nUser: ${message}\nBot: ${response}`);
    }

    return NextResponse.json({ response });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}