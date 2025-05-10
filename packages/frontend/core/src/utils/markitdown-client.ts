export class MarkitdownClient {
  // eslint-disable-next-line no-unused-vars
  private readonly callbacks: Map<string, (response: any) => void>;
  private messageId: number = 0;
  private endpoint: string | null = null;
  private readonly backendUrl = 'http://localhost:8080';
  private eventSource: EventSource | null = null;

  constructor() {
    this.callbacks = new Map();
    this.setupEventSource();
  }

  private setupEventSource(): void {
    this.eventSource = new EventSource(`${this.backendUrl}/api/markitdown/sse`);

    this.eventSource.addEventListener('endpoint', (event: MessageEvent) => {
      const data = event.data;
      console.log('SSE Event: endpoint', data);
      this.endpoint = data;
      if (this.endpoint) {
        this.initializeSession().catch(error => {
          console.error('Initialize session error:', error);
        });
      }
    });

    this.eventSource.addEventListener('message', (event: MessageEvent) => {
      console.log('SSE Event: message', event.data);
      try {
        const jsonData = JSON.parse(event.data);
        const callback = this.callbacks.get(jsonData.id?.toString());
        if (callback) {
          callback(jsonData);
          this.callbacks.delete(jsonData.id?.toString());
        }
      } catch (error) {
        console.error('Error parsing message event:', error);
      }
    });

    this.eventSource.onerror = error => {
      console.error('SSE connection error:', error);
      // optional: add reconnection logic if needed
    };
  }

  async convertToMarkdown(uri: string): Promise<string> {
    if (!this.endpoint) {
      throw new Error(
        'No active session. Please wait for SSE connection to establish.'
      );
    }

    return new Promise((resolve, reject) => {
      const id = this.messageId++;

      this.callbacks.set(id.toString(), response => {
        if (response.error) {
          reject(new Error(response.error.message));
        } else {
          resolve(response.result);
        }
      });

      // Send request through backend
      fetch(`${this.backendUrl}/api/markitdown${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
        body: JSON.stringify({
          method: 'tools/call',
          params: {
            name: 'convert_to_markdown',
            arguments: {
              uri: uri,
            },
            _meta: {
              progressToken: id,
            },
          },
          jsonrpc: '2.0',
          id: id,
        }),
      }).catch(reject);
    });
  }

  close(): void {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    this.callbacks.clear();
    this.endpoint = null;
  }

  private async initializeSession(): Promise<void> {
    return new Promise((resolve, reject) => {
      const initId = this.messageId++;

      this.callbacks.set(initId.toString(), response => {
        if (response.error) {
          console.error('Initialize error:', response.error.message);
          reject(new Error(response.error.message));
        } else {
          console.log('Initialize succeeded');
          resolve(); // Only resolve after initialize succeeds
        }
      });

      console.log(
        'Sending initialize request to:',
        `${this.backendUrl}/api/markitdown${this.endpoint}`
      );
      // 1. Send initialize request
      fetch(`${this.backendUrl}/api/markitdown${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
        body: JSON.stringify({
          method: 'initialize',
          params: {
            protocolVersion: '2024-11-05',
            capabilities: { sampling: {}, roots: { listChanged: true } },
            clientInfo: { name: 'learnify', version: '1.0.0' },
          },
          jsonrpc: '2.0',
          id: initId,
        }),
      }).catch(error => {
        console.error('Fetch error during initialize:', error);
        reject(error);
      });

      // 2. Fire-and-forget notifications/initialized
      fetch(`${this.backendUrl}/api/markitdown${this.endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*',
        },
        body: JSON.stringify({
          method: 'notifications/initialized',
          jsonrpc: '2.0',
        }),
      }).catch(error => {
        console.warn(
          'Optional: notifications/initialized failed to send',
          error
        );
        // Don't reject, since it's not critical
      });
    });
  }
}
