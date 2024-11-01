import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DocumentEmbedding } from './entities/document-embedding.entity';
import { DocumentEmbeddingService } from './services/document-embedding.service';
import { DocumentProcessorService } from './services/document-processor.service';
import { EmbeddingService } from './services/embedding.service';
import { DocumentEmbeddingController } from './controllers/document-embedding.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([DocumentEmbedding]),
  ],
  providers: [DocumentEmbeddingService, DocumentProcessorService, EmbeddingService],
  controllers: [DocumentEmbeddingController],
  exports: [DocumentEmbeddingService],
})
export class DocumentEmbeddingModule {}