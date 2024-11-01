import { Injectable } from '@nestjs/common';
import OpenAIApi from 'openai';

@Injectable()
export class EmbeddingService {
  private openai: OpenAIApi;

  constructor() {
    this.openai = new OpenAIApi({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const response = await this.openai.embeddings.create({
      model: "text-embedding-3-small",
      input: text,
    });
    
    return response.data[0].embedding;
  }
}