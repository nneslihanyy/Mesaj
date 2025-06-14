import { Body, Controller, Get, Param, Post, Request, UseGuards } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('messages')
@UseGuards(JwtAuthGuard)
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Post()
  async create(@Request() req, @Body() createMessageDto: CreateMessageDto) {
    const message = await this.messagesService.create(
      req.user.userId,
      createMessageDto,
    );
    
    return {
      id: message._id,
      text: message.text,
      senderId: message.sender,
      receiverId: message.receiver,
      createdAt: message.createdAt,
    };
  }

  @Get('conversations')
  async getUserConversations(@Request() req) {
    return this.messagesService.findUserConversations(req.user.userId);
  }

  @Get('conversation/:userId')
  async getConversation(@Request() req, @Param('userId') partnerId: string) {
    const messages = await this.messagesService.findConversation(
      req.user.userId,
      partnerId,
    );
    
    // Mark messages as read
    await this.messagesService.markConversationAsRead(req.user.userId, partnerId);
    
    return messages;
  }

  @Post(':id/read')
  async markAsRead(@Param('id') id: string) {
    const message = await this.messagesService.markAsRead(id);
    return { success: true, id: message._id };
  }
}
