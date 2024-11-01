import { forwardRef, Module } from '@nestjs/common';
import { ChatController } from './controllers/chat.controller';
import { ChatService } from './services/chat.service';
import { LLMModule } from '../llm/llm.module';
import { DocumentEmbeddingModule } from 'src/document-embedding/document-embedding.module';
import { ChatHistoryRepository } from './repositories/chat-history.repository';

@Module({
  imports: [
    DocumentEmbeddingModule,
    forwardRef(() => LLMModule),
  ],
  controllers: [ChatController],
  providers: [ChatService, ChatHistoryRepository],
  exports: [ChatService],
})
export class ChatModule {}
