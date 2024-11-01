import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsString, IsNumber, IsOptional, IsArray, ValidateNested } from 'class-validator';

export class ChatRequestDto {
  @ApiProperty({
    description: 'The user query or message',
    example: 'What can you tell me about machine learning?'
  })
  @IsString()
  query: string;

  @ApiProperty({
    description: 'Number of relevant documents to use for context',
    example: 3,
    required: false
  })
  @IsNumber()
  @IsOptional()
  contextSize?: number;

  @ApiProperty({
    description: 'Temperature for response generation (0-1)',
    example: 0.7,
    required: false
  })
  @IsNumber()
  @IsOptional()
  temperature?: number;

  @ApiProperty({
    description: 'Existing session id if have (optional)',
    example: '18e9203f-caa5-4541-9f38-cca47f7f15ac',
    required: false
  })
  @IsString()
  @IsOptional()
  sessionId?: string;
}

export class ChatMessageDto {
  @ApiProperty({
    description: 'Role of the message sender',
    example: 'user',
    enum: ['system', 'user', 'assistant']
  })
  @IsString()
  role: 'system' | 'user' | 'assistant';

  @ApiProperty({
    description: 'Content of the message',
    example: 'What is machine learning?'
  })
  @IsString()
  content: string;
}

export class ChatHistoryRequestDto {
  @ApiProperty({
    description: 'Array of chat messages',
    type: [ChatMessageDto]
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatMessageDto)
  messages: ChatMessageDto[];

  @ApiProperty({
    description: 'Temperature for response generation (0-1)',
    example: 0.7,
    required: false
  })
  @IsNumber()
  @IsOptional()
  temperature?: number;
}