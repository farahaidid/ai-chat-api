import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsArray, IsObject } from 'class-validator';

export class CreateEmbeddingDto {
  @ApiProperty({
    description: 'The content associated with the embedding',
    example: 'This is a sample text content'
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'The vector embedding array',
    example: [0.1, 0.2, 0.3],
    type: [Number]
  })
  @IsArray()
  embedding: number[];

  @ApiProperty({
    description: 'Additional metadata for the embedding',
    example: {category:"technical", language:"en"}
  })
  @IsObject()
  metadata: Record<string, any>;;
}