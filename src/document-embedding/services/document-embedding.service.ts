import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DocumentEmbedding } from '../entities/document-embedding.entity';
import { EmbeddingService } from './embedding.service';
import { CreateEmbeddingDto, QueryEmbeddingDto } from '../dto';

@Injectable()
export class DocumentEmbeddingService {
  constructor(
    @InjectRepository(DocumentEmbedding)
    private embeddingRepository: Repository<DocumentEmbedding>,
    private embeddingService: EmbeddingService,
  ) {}

  async create(createEmbeddingDto: CreateEmbeddingDto): Promise<DocumentEmbedding> {
    const embedding = new DocumentEmbedding();
    embedding.content = createEmbeddingDto.content;
    embedding.embedding = createEmbeddingDto.embedding;
    embedding.metadata = createEmbeddingDto.metadata;
    
    return this.embeddingRepository.save(embedding);
  }

  async findAll(): Promise<DocumentEmbedding[]> {
    return this.embeddingRepository.find();
  }

  async findOne(id: string): Promise<DocumentEmbedding> {
    const embedding = await this.embeddingRepository.findOne({
      where: { id }
    });

    if (!embedding) {
      throw new NotFoundException(`Document embedding with ID "${id}" not found`);
    }

    return embedding;
  }

  async remove(id: string): Promise<void> {
    await this.embeddingRepository.delete(id);
  }

  async findSimilar(query: QueryEmbeddingDto): Promise<DocumentEmbedding[]> {
    const allDocuments = await this.embeddingRepository.find();
    
    const similarities = allDocuments.map(doc => ({
      ...doc,
      similarity: this.cosineSimilarity(query.embedding, doc.embedding),
    }));

    similarities.sort((a, b) => b.similarity - a.similarity);

    return similarities.slice(0, query.limit || 5);
  }

  async searchByText(text: string, limit: number = 5): Promise<DocumentEmbedding[]> {
    const queryEmbedding = await this.embeddingService.generateEmbedding(text);
    return this.findSimilar({ embedding: queryEmbedding, limit });
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    const dotProduct = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
    const magnitudeA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const magnitudeB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dotProduct / (magnitudeA * magnitudeB);
  }
}