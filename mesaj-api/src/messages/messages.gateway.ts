import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MessagesService } from './messages.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:5175'],
    credentials: true,
  },
})
export class MessagesGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private connectedUsers = new Map();

  constructor(
    private readonly messagesService: MessagesService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Token'ı socket'ten al
      const token = client.handshake.auth.token?.replace('Bearer ', '');
      
      if (!token) {
        throw new UnauthorizedException('Token bulunamadı');
      }
      
      // Token'ı doğrula
      const decoded = this.jwtService.verify(token);
      const userId = decoded.sub;
      
      // Kullanıcıyı bağlantı listesine ekle
      client.data.userId = userId;
      this.connectedUsers.set(userId, client.id);
      
      // Kullanıcı odalarına katıl
      client.join(userId);
      
      // Kullanıcı online durumunu diğer kullanıcılara bildir
      this.server.emit('userStatus', {
        userId: userId,
        status: 'online',
      });
      
      console.log(`Kullanıcı bağlandı: ${userId}`);
    } catch (error) {
      // Kimlik doğrulama hatası - bağlantıyı kapat
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    
    if (userId) {
      // Kullanıcıyı bağlantı listesinden çıkar
      this.connectedUsers.delete(userId);
      
      // Kullanıcının online durumunu güncelle
      this.server.emit('userStatus', {
        userId: userId,
        status: 'offline',
      });
      
      console.log(`Kullanıcı ayrıldı: ${userId}`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() createMessageDto: CreateMessageDto,
  ) {
    const userId = client.data.userId;
    
    try {
      // Mesajı kaydet
      const message = await this.messagesService.create(userId, createMessageDto);
      
      // Mesajı alıcıya gönder
      const receiverId = createMessageDto.receiverId;
      
      // Mesajı hem gönderen hem alıcı odalarına yayınla
      this.server.to(userId).to(receiverId).emit('newMessage', {
        id: message._id,
        text: message.text,
        senderId: message.sender,
        receiverId: message.receiver,
        read: message.read,
        createdAt: message.createdAt,
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { messageId: string },
  ) {
    try {
      const message = await this.messagesService.markAsRead(data.messageId);
      
      // Bildirim gönder
      this.server.to(message.sender.toString()).to(message.receiver.toString()).emit('messageRead', {
        messageId: message._id,
      });
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string, isTyping: boolean },
  ) {
    const userId = client.data.userId;
    
    this.server.to(data.receiverId).emit('userTyping', {
      userId: userId,
      isTyping: data.isTyping,
    });
    
    return { success: true };
  }
}
