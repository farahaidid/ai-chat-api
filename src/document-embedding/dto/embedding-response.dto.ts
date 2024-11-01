import { ApiProperty } from "@nestjs/swagger";
import { IsObject } from "class-validator";

export class EmbeddingResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the embedding',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'The content associated with the embedding',
    example: 'This is a sample text content'
  })
  content: string;

  @ApiProperty({
    description: 'The vector embedding array',
    example: [0.1, 0.2, 0.3]
  })
  embedding: number[];

  @ApiProperty({
    description: 'Additional metadata for the embedding',
    example: {category:"technical", language:"en"}
  })
  @IsObject()
  metadata: Record<string, any>;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-01-01T00:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Similarity score (only present in similarity queries)',
    example: 0.95,
    required: false
  })
  similarity?: number;
}