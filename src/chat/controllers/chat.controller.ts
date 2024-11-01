import { 
  Controller, 
  Post, 
  Body,
  Get,
  Param,
  Sse,
  MessageEvent,
  Req,
  Query,
  Delete,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { ChatService } from '../services/chat.service';
import {
  ChatRequestDto,
  ChatHistoryRequestDto,
  ChatMessageDto,
} from '../dto/chat.dto';

@ApiTags('chat')
@Controller('chat')
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Post()
  @ApiOperation({ summary: 'Generate a chat response based on context' })
  @ApiResponse({ status: 200, description: 'Returns the generated response and session ID.' })
  async generateChatResponse(@Body() chatRequestDto: ChatRequestDto): Promise<{ response: string, sessionId: string }> {
    const { response, sessionId } = await this.chatService.generateResponse(chatRequestDto);
    return { response, sessionId };
  }

  @Get('history')
  @ApiOperation({ summary: 'Returns all chat history' })
  @ApiResponse({ status: 200, description: 'Returns the generated response and session ID.' })
  getAllChatHistory(): Promise<any> {
    return this.chatService.getAllChatHistory();
  }

  @Post('history')
  @ApiOperation({ summary: 'Generate a chat response based on chat history' })
  @ApiResponse({ status: 200, description: 'Returns the generated response and session ID.' })
  async generateChatHistoryResponse(@Body() chatHistoryRequestDto: ChatHistoryRequestDto): Promise<{ response: string, sessionId: string }> {
    const { response, sessionId } = await this.chatService.generateChatResponse(chatHistoryRequestDto);
    return { response, sessionId };
  }

  @Get('history/:sessionId')
  @ApiOperation({ summary: 'Get chat history for a session' })
  @ApiParam({ name: 'sessionId', type: 'string', description: 'The session ID' })
  @ApiResponse({ status: 200, description: 'Returns the chat history for the session.', type: [ChatMessageDto] })
  async getSessionHistory(@Param('sessionId') sessionId: string): Promise<ChatMessageDto[]> {
    return this.chatService.getSessionHistory(sessionId);
  }

  @Post('session/:sessionId')
  @ApiOperation({ summary: 'Continue an existing chat session' })
  @ApiParam({ name: 'sessionId', type: 'string', description: 'The session ID' })
  @ApiResponse({ status: 200, description: 'Returns the generated response.' })
  async continueSession(
    @Param('sessionId') sessionId: string,
    @Body() chatRequestDto: ChatRequestDto
  ): Promise<{ response: string }> {
    const response = await this.chatService.continueSession(sessionId, chatRequestDto.query, chatRequestDto.temperature);
    return { response };
  }

  @Delete('delete-history-by-session/:sessionId')
  deleteChatHistporyBySessionId(@Param('sessionId') sessionId: string) {
    return this.chatService.deleteChatHistporyBySessionId(sessionId);
  }

  @Sse('stream')
  streamChatResponse(@Query() chatRequestDto: ChatRequestDto): Observable<MessageEvent> {
    return this.chatService.generateStreamingResponse(chatRequestDto);
  }

  @Sse('stream/session/:sessionId')
  streamSessionResponse(
    @Param('sessionId') sessionId: string,
    @Body() chatRequestDto: ChatRequestDto
  ): Observable<MessageEvent> {
    return this.chatService.generateStreamingSessionResponse(sessionId, chatRequestDto);
  }
}