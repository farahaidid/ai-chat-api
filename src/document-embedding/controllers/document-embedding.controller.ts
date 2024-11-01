import { Controller, Get, Post, Body, Param, Delete, Query, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiConsumes } from '@nestjs/swagger';
import { DocumentEmbeddingService } from '../services/document-embedding.service';
import { DocumentProcessorService } from '../services/document-processor.service';
import { EmbeddingService } from '../services/embedding.service';
import { CreateEmbeddingDto, EmbeddingResponseDto, QueryEmbeddingDto, UploadDocumentDto, SearchQueryDto } from '../dto';

@ApiTags('document-embedding')
@Controller('document-embedding')
export class DocumentEmbeddingController {
  constructor(
    private readonly documentEmbeddingService: DocumentEmbeddingService,
    private readonly documentProcessorService: DocumentProcessorService,
    private readonly embeddingService: EmbeddingService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new embedding' })
  @ApiResponse({ status: 201, description: 'The embedding has been successfully created.', type: EmbeddingResponseDto })
  async create(@Body() createEmbeddingDto: CreateEmbeddingDto): Promise<EmbeddingResponseDto> {
    return this.documentEmbeddingService.create(createEmbeddingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all embeddings' })
  @ApiResponse({ status: 200, description: 'Return all embeddings.', type: [EmbeddingResponseDto] })
  async findAll(): Promise<EmbeddingResponseDto[]> {
    return this.documentEmbeddingService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single embedding' })
  @ApiResponse({ status: 200, description: 'Return the embedding.', type: EmbeddingResponseDto })
  async findOne(@Param('id') id: string): Promise<EmbeddingResponseDto> {
    return this.documentEmbeddingService.findOne(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an embedding' })
  @ApiResponse({ status: 204, description: 'The embedding has been successfully deleted.' })
  async remove(@Param('id') id: string): Promise<void> {
    return this.documentEmbeddingService.remove(id);
  }

  @Post('query')
  @ApiOperation({ summary: 'Find similar embeddings' })
  @ApiResponse({ status: 200, description: 'Return similar embeddings.', type: [EmbeddingResponseDto] })
  async findSimilar(@Body() queryEmbeddingDto: QueryEmbeddingDto): Promise <EmbeddingResponseDto[]> {
    return this.documentEmbeddingService.findSimilar(queryEmbeddingDto);
  }

  @Post('search')
  @ApiOperation({ summary: 'Search for embeddings by text' })
  @ApiResponse({ status: 200, description: 'Return similar embeddings.', type: [EmbeddingResponseDto] })
  async searchByText(@Body() searchQueryDto: SearchQueryDto): Promise<EmbeddingResponseDto[]> {
    return this.documentEmbeddingService.searchByText(searchQueryDto.text, searchQueryDto.limit);
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload a document and generate an embedding' })
  @ApiResponse({ status: 201, description: 'The embedding has been successfully created.', type: EmbeddingResponseDto })
  @ApiConsumes('multipart/form-data')
  async upload(@UploadedFile() file: Express.Multer.File, @Body() uploadDocumentDto: UploadDocumentDto): Promise<EmbeddingResponseDto> {
    console.log('mmm', uploadDocumentDto, typeof uploadDocumentDto.metadata)
    const text = await this.documentProcessorService.extractText(file);
    const embedding = await this.embeddingService.generateEmbedding(text);
    const createEmbeddingDto = new CreateEmbeddingDto();
    createEmbeddingDto.content = text;
    createEmbeddingDto.embedding = embedding;
    createEmbeddingDto.metadata = uploadDocumentDto.metadata;
    
    return this.documentEmbeddingService.create(createEmbeddingDto);
  }
}