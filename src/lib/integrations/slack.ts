import { WebClient } from '@slack/web-api';

export class SlackIntegration {
  private client: WebClient;

  constructor(token: string) {
    this.client = new WebClient(token);
  }

  async sendMessage(channel: string, message: string) {
    try {
      await this.client.chat.postMessage({
        channel,
        text: message,
      });
      return true;
    } catch (error) {
      console.error('Error sending Slack message:', error);
      return false;
    }
  }

  async createThread(channel: string, message: string) {
    try {
      const result = await this.client.chat.postMessage({
        channel,
        text: message,
      });
      return result.ts;
    } catch (error) {
      console.error('Error creating Slack thread:', error);
      return null;
    }
  }

  async replyToThread(channel: string, threadTs: string, message: string) {
    try {
      await this.client.chat.postMessage({
        channel,
        thread_ts: threadTs,
        text: message,
      });
      return true;
    } catch (error) {
      console.error('Error replying to Slack thread:', error);
      return false;
    }
  }
}