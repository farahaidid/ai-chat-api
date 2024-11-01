import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { ChatHistory } from '../entities/chat-history.entity';
import { ChatMessageDto } from '../dto/chat.dto';

@Injectable()
export class ChatHistoryRepository extends Repository<ChatHistory> {
  constructor(dataSource: DataSource) {
    super(ChatHistory, dataSource.createEntityManager());
  }

  async saveChatMessage(sessionId: string, message: ChatMessageDto, metadata?: Record<string, any>): Promise<ChatHistory> {
    const chatHistory = this.create({
      sessionId,
      role: message.role,
      content: message.content,
      metadata,
    });
    return this.save(chatHistory);
  }

  async getSessionHistory(sessionId: string): Promise<ChatHistory[]> {
    return this.find({
      where: { sessionId },
      order: { createdAt: 'ASC' },
    });
  }
}