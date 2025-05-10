import { Injectable } from '@nestjs/common';
import fetch from 'node-fetch';

@Injectable()
export class MarkitdownService {
  private readonly markitdownUrl = 'http://localhost:3001';

  async getSSEConnection() {
    const response = await fetch(`${this.markitdownUrl}/sse?transportType=sse`);
    if (!response.ok || !response.body) {
      throw new Error(`Upstream SSE failed: ${response.status}`);
    }
    return response;
  }

  async sendMessage(path: string, body: any) {
    const upstreamUrl = new URL(`${this.markitdownUrl}/${path}`);
    const response = await fetch(upstreamUrl.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: '*/*',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Markitdown server returned status ${response.status}: ${errorText}`
      );
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return null;
  }
}
