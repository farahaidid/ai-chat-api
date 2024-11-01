import { Injectable, Logger } from '@nestjs/common';
import OpenAI from 'openai';
import { ChatCompletionMessageParam } from 'openai/resources/chat';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class LLMService {
  private readonly openai: OpenAI;
  private readonly logger = new Logger(LLMService.name);

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
  }

  async generateChatResponse(messages: ChatCompletionMessageParam[], temperature: number = 0.7): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        max_tokens: 500,
        temperature,
      });

      return completion.choices[0]?.message?.content || 'No response generated.';
    } catch (error) {
      this.logger.error(`Error generating chat response: ${error.message}`);
      throw new Error('Failed to generate response');
    }
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(`Error generating embedding: ${error.message}`);
      throw new Error('Failed to generate embedding');
    }
  }

  async generateCompletion(prompt: string, temperature: number = 0.7): Promise<string> {
    try {
      const completion = await this.openai.completions.create({
        model: 'text-davinci-003',
        prompt,
        max_tokens: 500,
        temperature,
      });

      return completion.choices[0]?.text?.trim() || 'No completion generated.';
    } catch (error) {
      this.logger.error(`Error generating completion: ${error.message}`);
      throw new Error('Failed to generate completion');
    }
  }

  async summarizeText(text: string): Promise<string> {
    const prompt = `Please summarize the following text:\n\n${text}`;
    return this.generateCompletion(prompt, 0.5);
  }

  async answerQuestion(context: string, question: string): Promise<string> {
    const messages: ChatCompletionMessageParam[] = [
      {
        role: 'system',
        content: 'You are a helpful assistant. Use the provided context to answer questions accurately.',
      },
      {
        role: 'user',
        content: `Context: ${context}\n\nQuestion: ${question}`,
      },
    ];

    return this.generateChatResponse(messages, 0.7);
  }
}