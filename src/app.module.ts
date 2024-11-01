import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmConfigService } from './database/typeorm-config.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DocumentEmbeddingModule } from './document-embedding/document-embedding.module';
import { ChatModule } from './chat/chat.module';
import { LLMModule } from './llm/llm.module';

@Module({
  imports: [
    MulterModule.register({
      dest: './uploads',
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmConfigService,
    }),
    ChatModule,
    DocumentEmbeddingModule,
    LLMModule,
  ],
})
export class AppModule {}