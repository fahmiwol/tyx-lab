// Connector Adapter - unified API for social platforms

class ConnectorAdapter {
  constructor(platform) {
    this.platform = platform;
    this.credentials = null;
  }

  setCredentials(creds) {
    this.credentials = creds;
  }

  async sendMessage({ chat_id, user_id, message, text, thread_id }) {
    if (!this.credentials) {
      throw new Error('Credentials not set');
    }

    const payload = { text: text || message };
    const endpoint = this.getEndpoint('message');
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${this.credentials.token}` },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`${this.platform} API error: ${response.statusText}`);
    }

    return { success: true, platform: this.platform, data: await response.json() };
  }

  getEndpoint(action) {
    const endpoints = {
      'telegram:message': 'https://api.telegram.org/bot/sendMessage',
      'discord:message': 'https://discord.com/api/channels',
      'twitter:message': 'https://api.twitter.com/2/tweets',
      'whatsapp:message': 'https://graph.instagram.com/v18.0/me/messages',
      'notion:message': 'https://api.notion.com/v1/blocks',
    };
    return endpoints[`${this.platform}:${action}`] || '';
  }
}

export { ConnectorAdapter };
