import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';

export class MetadataDto {
  @ApiProperty({ 
    description: 'Document category',
    example: 'technical'
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ 
    description: 'Document language',
    example: 'en'
  })
  @IsString()
  @IsOptional()
  language?: string;
}

export class UploadDocumentDto {
  @ApiProperty({ 
    type: 'string', 
    format: 'binary',
    description: 'The file to upload'
  })
  file: any;

  @ApiProperty({ 
    type: MetadataDto,
    description: 'Additional metadata for the document'
  })
  @IsOptional()
  metadata?: MetadataDto;
}