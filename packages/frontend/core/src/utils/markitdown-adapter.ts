import { MarkitdownClient } from './markitdown-client';

export class MarkitdownAdapter {
  private readonly client: MarkitdownClient;

  constructor() {
    this.client = new MarkitdownClient();
  }

  async convertDocument(uri: string): Promise<string> {
    try {
      return await this.client.convertToMarkdown(uri);
    } catch (error) {
      console.error('Error converting document:', error);
      throw error;
    }
  }

  async close() {
    this.client.close();
  }
}
