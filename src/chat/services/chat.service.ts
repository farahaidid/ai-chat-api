import { Injectable, Logger, MessageEvent } from '@nestjs/common';
import OpenAIApi from 'openai';
import { DocumentEmbeddingService } from 'src/document-embedding/services/document-embedding.service';
import { ChatHistoryRequestDto, ChatMessageDto, ChatRequestDto } from '../dto/chat.dto';
import { ChatCompletionMessageParam } from 'openai/resources';
import { ChatHistoryRepository } from '../repositories/chat-history.repository';
import { v4 as uuidv4 } from 'uuid';
import { Observable } from 'rxjs';

@Injectable()
export class ChatService {
  private readonly openai: OpenAIApi;
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly documentEmbeddingService: DocumentEmbeddingService,
    private readonly chatHistoryRepository: ChatHistoryRepository,
  ) {
    this.openai = new OpenAIApi({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generateResponse(chatRequestDto: ChatRequestDto): Promise<Record<string, any>> {
    const { query, contextSize = 3, temperature = 0.7 } = chatRequestDto;
    const sessionId = uuidv4();

    try {
      // Store user message
      await this.chatHistoryRepository.saveChatMessage(
        sessionId,
        { role: 'user', content: query },
        { temperature, contextSize }
      );

      // Find relevant documents
      const relevantDocs = await this.documentEmbeddingService.searchByText(query, contextSize);
      
      const context = relevantDocs
        .map(doc => doc.content)
        .join('\n\n');

      // Store system message with context
      await this.chatHistoryRepository.saveChatMessage(
        sessionId,
        {
          role: 'system',
          content: `You are a helpful assistant. Answer questions based on the following context:\n\n${context}`
        },
        { contextDocs: relevantDocs.map(doc => doc.id) }
      );

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant. Answer questions based on the following context:\n\n${context}`
          },
          { role: 'user', content: query }
        ],
        max_tokens: 500,
        temperature: temperature,
      });

      const response = completion.choices[0]?.message?.content || 'No response generated.';

      // Store assistant response
      await this.chatHistoryRepository.saveChatMessage(
        sessionId,
        { role: 'assistant', content: response }
      );

      return { sessionId, response};

    } catch (error) {
      this.logger.error(`Error generating chat response: ${error.message}`);
      throw new Error('Failed to generate response');
    }
  }

  async generateChatResponse(chatHistoryRequestDto: ChatHistoryRequestDto): Promise<Record<string, any>> {
    const { messages, temperature = 0.7 } = chatHistoryRequestDto;
    const sessionId = uuidv4();
  
    try {
      // Store all messages from history
      for (const message of messages) {
        await this.chatHistoryRepository.saveChatMessage(
          sessionId,
          message,
          { temperature }
        );
      }

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: messages as ChatCompletionMessageParam[],
        max_tokens: 500,
        temperature: temperature,
      });
  
      const response = completion.choices[0]?.message?.content || 'No response generated.';

      // Store assistant response
      await this.chatHistoryRepository.saveChatMessage(
        sessionId,
        { role: 'assistant', content: response }
      );

      return { sessionId, response};
  
    } catch (error) {
      this.logger.error(`Error generating chat response: ${error.message}`);
      throw new Error('Failed to generate response');
    }
  }

  async getSessionHistory(sessionId: string): Promise<ChatMessageDto[]> {
    return this.chatHistoryRepository.getSessionHistory(sessionId);
  }

  // async generateStreamingResponse(chatRequestDto: ChatRequestDto): Promise<ReadableStream> {
  //   const { query, contextSize = 3, temperature = 0.7 } = chatRequestDto;

  //   try {
  //     // Find relevant documents
  //     const relevantDocs = await this.documentEmbeddingService.searchByText(query, contextSize);
      
  //     // Prepare context from relevant documents
  //     const context = relevantDocs
  //       .map(doc => doc.content)
  //       .join('\n\n');

  //     const stream = await this.openai.chat.completions.create({
  //       model: 'gpt-3.5-turbo',
  //       messages: [
  //         {
  //           role: 'system',
  //           content: `You are a helpful assistant. Answer questions based on the following context:\n\n${context}`
  //         },
  //         { role: 'user', content: query }
  //       ],
  //       max_tokens: 500,
  //       temperature: temperature,
  //       stream: true,
  //     });

  //     return stream as unknown as ReadableStream;

  //   } catch (error) {
  //     this.logger.error(`Error generating streaming response: ${error.message}`);
  //     throw new Error('Failed to generate streaming response');
  //   }
  // }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      const response = await this.openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
      });

      return response.data[0].embedding;
    } catch (error) {
      this.logger.error(`Error generating embedding: ${error.message}`);
      throw new Error('Failed to generate embedding');
    }
  }

  async generateFunctionResponse(
    chatRequestDto: ChatRequestDto,
    functions: any[],
  ): Promise<any> {
    const { query, contextSize = 3, temperature = 0.7 } = chatRequestDto;

    try {
      // Find relevant documents
      const relevantDocs = await this.documentEmbeddingService.searchByText(query, contextSize);
      
      // Prepare context from relevant documents
      const context = relevantDocs
        .map(doc => doc.content)
        .join('\n\n');

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant. Answer questions based on the following context:\n\n${context}`
          },
          { role: 'user', content: query }
        ],
        max_tokens: 500,
        temperature: temperature,
        functions: functions,
        function_call: 'auto',
      });

      const response = completion.choices[0];

      if (response.finish_reason === 'function_call' && response.message?.function_call) {
        return {
          type: 'function_call',
          function: response.message.function_call.name,
          arguments: JSON.parse(response.message.function_call.arguments),
        };
      }

      return {
        type: 'message',
        content: response.message?.content,
      };

    } catch (error) {
      this.logger.error(`Error generating function response: ${error.message}`);
      throw new Error('Failed to generate function response');
    }
  }

  async continueSession(sessionId: string, query: string, temperature = 0.7): Promise<string> {
    try {
      // Get previous messages
      const history = await this.getSessionHistory(sessionId);
      
      // Add new user message
      await this.chatHistoryRepository.saveChatMessage(
        sessionId,
        { role: 'user', content: query },
        { temperature }
      );

      const completion = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [...history, { role: 'user', content: query }] as ChatCompletionMessageParam[],
        max_tokens: 500,
        temperature: temperature,
      });

      const response = completion.choices[0]?.message?.content || 'No response generated.';

      // Store assistant response
      await this.chatHistoryRepository.saveChatMessage(
        sessionId,
        { role: 'assistant', content: response }
      );

      return response;

    } catch (error) {
      this.logger.error(`Error continuing chat session: ${error.message}`);
      throw new Error('Failed to continue chat session');
    }
  }

  generateStreamingResponse(chatRequestDto: ChatRequestDto): Observable<MessageEvent> {
    const { query, contextSize = 3, temperature = 0.7, sessionId: _sessionId } = chatRequestDto;
    const sessionId = _sessionId || uuidv4();

    return new Observable<MessageEvent>(observer => {
      (async () => {
        try {
          // Store user message
          await this.chatHistoryRepository.saveChatMessage(
            sessionId,
            { role: 'user', content: query },
            { temperature, contextSize }
          );

          // Find relevant documents
          const relevantDocs = await this.documentEmbeddingService.searchByText(query, contextSize);
          const context = relevantDocs.map(doc => doc.content).join('\n\n');

          // Store system message
          await this.chatHistoryRepository.saveChatMessage(
            sessionId,
            {
              role: 'system',
              content: `You are a helpful assistant. Answer questions based on the following context:\n\n${context}`
            },
            { contextDocs: relevantDocs.map(doc => doc.id) }
          );

          const stream = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [
              {
                role: 'system',
                content: `You are a helpful assistant. Answer questions based on the following context:\n\n${context}`
              },
              { role: 'user', content: query }
            ],
            max_tokens: 500,
            temperature,
            stream: true,
          });

          let fullResponse = '';

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;
            if (content) {
              observer.next({ data: content });
            }
          }

          await this.chatHistoryRepository.saveChatMessage(
            sessionId,
            { role: 'assistant', content: fullResponse }
          );

          observer.next({ data: '[DONE]' });
          observer.complete();
        } catch (error) {
          this.logger.error(`Error generating streaming response: ${error.message}`);
          observer.error(error);
        }
      })();
    });
  }

  generateStreamingSessionResponse(
    sessionId: string,
    chatRequestDto: ChatRequestDto
  ): Observable<MessageEvent> {
    const { query, temperature = 0.7 } = chatRequestDto;

    return new Observable<MessageEvent>(observer => {
      (async () => {
        try {
          // Get previous messages
          const history = await this.getSessionHistory(sessionId);
          
          // Add new user message
          await this.chatHistoryRepository.saveChatMessage(
            sessionId,
            { role: 'user', content: query },
            { temperature }
          );

          const stream = await this.openai.chat.completions.create({
            model: 'gpt-3.5-turbo',
            messages: [...history, { role: 'user', content: query }] as ChatCompletionMessageParam[],
            max_tokens: 500,
            temperature,
            stream: true,
          });

          let fullResponse = '';

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content || '';
            fullResponse += content;
            if (content) {
              observer.next({ data: content });
            }
          }

          await this.chatHistoryRepository.saveChatMessage(
            sessionId,
            { role: 'assistant', content: fullResponse }
          );

          observer.next({ data: '[DONE]' });
          observer.complete();
        } catch (error) {
          this.logger.error(`Error generating streaming session response: ${error.message}`);
          observer.error(error);
        }
      })();
    });
  }

  getAllChatHistory(){
    return this.chatHistoryRepository.find()
  }

  deleteChatHistporyBySessionId(sessionId: string){
    return this.chatHistoryRepository.delete({ sessionId })
  }
}