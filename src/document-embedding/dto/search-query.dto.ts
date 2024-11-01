import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional } from 'class-validator';

export class SearchQueryDto {
  @ApiProperty({
    description: 'The text to search for',
    example: 'machine learning concepts'
  })
  @IsString()
  text: string;

  @ApiProperty({
    description: 'Maximum number of results to return',
    example: 5,
    required: false
  })
  @IsNumber()
  @IsOptional()
  limit?: number;
}