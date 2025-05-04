import {
  AnthropicProvider as AnthropicSDKProvider,
  AnthropicProviderOptions,
  createAnthropic,
} from '@ai-sdk/anthropic';
import { AISDKError, generateText, streamText } from 'ai';

import {
  CopilotPromptInvalid,
  CopilotProviderSideError,
  metrics,
  UserFriendlyError,
} from '../../../base';
import { createExaTool } from '../tools';
import { CopilotProvider } from './provider';
import {
  ChatMessageRole,
  CopilotCapability,
  CopilotChatOptions,
  CopilotProviderType,
  CopilotTextToTextProvider,
  PromptMessage,
} from './types';
import { chatToGPTMessage } from './utils';

export type AnthropicConfig = {
  apiKey: string;
  baseUrl?: string;
};

export class AnthropicProvider
  extends CopilotProvider<AnthropicConfig>
  implements CopilotTextToTextProvider
{
  override readonly type = CopilotProviderType.Anthropic;
  override readonly capabilities = [CopilotCapability.TextToText];
  override readonly models = ['claude-3-7-sonnet-20250219'];

  private readonly MAX_STEPS = 20;

  private toolResults: string[] = [];

  #instance!: AnthropicSDKProvider;

  override configured(): boolean {
    return !!this.config.apiKey;
  }

  protected override setup() {
    super.setup();
    this.#instance = createAnthropic({
      apiKey: this.config.apiKey,
      baseURL: this.config.baseUrl,
    });
  }

  protected async checkParams({
    messages,
    model,
  }: {
    messages?: PromptMessage[];
    model: string;
  }) {
    if (!(await this.isModelAvailable(model))) {
      throw new CopilotPromptInvalid(`Invalid model: ${model}`);
    }
    if (Array.isArray(messages) && messages.length > 0) {
      if (
        messages.some(
          m =>
            // check non-object
            typeof m !== 'object' ||
            !m ||
            // check content
            typeof m.content !== 'string' ||
            // content and attachments must exist at least one
            ((!m.content || !m.content.trim()) &&
              (!Array.isArray(m.attachments) || !m.attachments.length))
        )
      ) {
        throw new CopilotPromptInvalid('Empty message content');
      }
      if (
        messages.some(
          m =>
            typeof m.role !== 'string' ||
            !m.role ||
            !ChatMessageRole.includes(m.role)
        )
      ) {
        throw new CopilotPromptInvalid('Invalid message role');
      }
    }
  }

  private handleError(e: any) {
    if (e instanceof UserFriendlyError) {
      return e;
    } else if (e instanceof AISDKError) {
      this.logger.error('Throw error from ai sdk:', e);
      return new CopilotProviderSideError({
        provider: this.type,
        kind: e.name || 'unknown',
        message: e.message,
      });
    } else {
      return new CopilotProviderSideError({
        provider: this.type,
        kind: 'unexpected_response',
        message: e?.message || 'Unexpected anthropic response',
      });
    }
  }

  // ====== text to text ======
  async generateText(
    messages: PromptMessage[],
    model: string = 'claude-3-7-sonnet-20250219',
    options: CopilotChatOptions = {}
  ): Promise<string> {
    await this.checkParams({ messages, model });

    try {
      metrics.ai.counter('chat_text_calls').add(1, { model });

      const [system, msgs] = await chatToGPTMessage(messages);

      const modelInstance = this.#instance(model);
      const { text, reasoning } = await generateText({
        model: modelInstance,
        system,
        messages: msgs,
        abortSignal: options.signal,
        providerOptions: {
          anthropic: this.getAnthropicOptions(options),
        },
        tools: this.getTools(options),
        maxSteps: this.MAX_STEPS,
        experimental_continueSteps: true,
      });

      if (!text) throw new Error('Failed to generate text');

      return reasoning ? `${reasoning}\n${text}` : text;
    } catch (e: any) {
      metrics.ai.counter('chat_text_errors').add(1, { model });
      throw this.handleError(e);
    }
  }

  async *generateTextStream(
    messages: PromptMessage[],
    model: string = 'claude-3-7-sonnet-20250219',
    options: CopilotChatOptions = {}
  ): AsyncIterable<string> {
    await this.checkParams({ messages, model });

    try {
      metrics.ai.counter('chat_text_stream_calls').add(1, { model });
      const [system, msgs] = await chatToGPTMessage(messages);
      const { fullStream } = streamText({
        model: this.#instance(model),
        system,
        messages: msgs,
        abortSignal: options.signal,
        providerOptions: {
          anthropic: this.getAnthropicOptions(options),
        },
        tools: this.getTools(options),
        maxSteps: this.MAX_STEPS,
        experimental_continueSteps: true,
      });

      for await (const message of fullStream) {
        switch (message.type) {
          case 'reasoning': {
            yield message.textDelta;
            break;
          }
          case 'tool-result': {
            if (message.toolName === 'web_search') {
              this.toolResults.push(this.getWebSearchLinks(message.result));
            }
            break;
          }
          case 'step-finish': {
            if (message.finishReason === 'tool-calls') {
              yield this.toolResults.join('\n');
              this.toolResults = [];
            }
            break;
          }
          case 'text-delta': {
            yield message.textDelta;
            break;
          }
          case 'error': {
            const error = message.error as { type: string; message: string };
            throw new Error(error.message);
          }
        }
        if (options.signal?.aborted) {
          await fullStream.cancel();
          break;
        }
      }
    } catch (e: any) {
      metrics.ai.counter('chat_text_stream_errors').add(1, { model });
      throw this.handleError(e);
    }
  }

  private getTools(options: CopilotChatOptions) {
    if (options?.webSearch) {
      return {
        web_search: createExaTool(this.AFFiNEConfig),
      };
    }
    return undefined;
  }

  private getAnthropicOptions(
    options: CopilotChatOptions
  ): AnthropicProviderOptions {
    if (options?.reasoning) {
      return {
        thinking: {
          type: 'enabled',
          budgetTokens: 12000,
        },
      };
    }
    return {};
  }

  private getWebSearchLinks(
    list: {
      title: string | null;
      url: string;
    }[]
  ): string {
    const links = list.reduce((acc, result) => {
      return acc + `\n[${result.title ?? result.url}](${result.url})\n`;
    }, '\n');
    return links + '\n';
  }
}
