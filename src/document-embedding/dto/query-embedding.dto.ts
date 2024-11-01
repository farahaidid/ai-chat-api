import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNumber, IsOptional } from "class-validator";

export class QueryEmbeddingDto {
  @ApiProperty({
    description: 'The query embedding vector',
    example: [0.1, 0.2, 0.3],
    type: [Number]
  })
  @IsArray()
  embedding: number[];

  @ApiProperty({
    description: 'Maximum number of similar results to return',
    example: 5,
    required: false,
    default: 5
  })
  @IsNumber()
  @IsOptional()
  limit?: number;
}