import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { LLMService } from './services/llm.service';

@Module({
  imports: [ConfigModule],
  providers: [LLMService],
  exports: [LLMService],
})
export class LLMModule {}