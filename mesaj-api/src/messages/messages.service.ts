import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message, MessageDocument } from './schemas/message.schema';
import { CreateMessageDto } from './dto/create-message.dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class MessagesService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<MessageDocument>,
    private usersService: UsersService,
  ) {}

  async create(senderId: string, createMessageDto: CreateMessageDto): Promise<MessageDocument> {
    // Check if sender exists
    await this.usersService.findById(senderId);
    
    // Check if receiver exists
    await this.usersService.findById(createMessageDto.receiverId);
    
    const newMessage = new this.messageModel({
      sender: senderId,
      receiver: createMessageDto.receiverId,
      text: createMessageDto.text,
      read: false,
    });
    
    return newMessage.save();
  }

  async findConversation(userId1: string, userId2: string): Promise<MessageDocument[]> {
    return this.messageModel.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
      ],
    })
    .sort({ createdAt: 1 })
    .exec();
  }

  async findUserConversations(userId: string): Promise<any[]> {
    const messages = await this.messageModel.find({
      $or: [
        { sender: userId },
        { receiver: userId },
      ],
    })
    .sort({ createdAt: -1 })
    .populate('sender', 'name email')
    .populate('receiver', 'name email')
    .exec();
    
    // Get unique conversation partners
    const conversationPartners = new Map();
    
    messages.forEach(message => {
      const partnerId = message.sender._id.toString() === userId 
        ? message.receiver._id.toString() 
        : message.sender._id.toString();
        
      if (!conversationPartners.has(partnerId)) {
        const partner = message.sender._id.toString() === userId 
          ? message.receiver 
          : message.sender;
          
        conversationPartners.set(partnerId, {
          userId: partnerId,
          name: partner.name,
          email: partner.email,
          lastMessage: message.text,
          lastMessageDate: message.createdAt,
          unread: message.receiver._id.toString() === userId && !message.read ? 1 : 0
        });
      } else if (message.receiver._id.toString() === userId && !message.read) {
        const current = conversationPartners.get(partnerId);
        conversationPartners.set(partnerId, {
          ...current,
          unread: current.unread + 1
        });
      }
    });
    
    return Array.from(conversationPartners.values());
  }

  async markAsRead(messageId: string): Promise<MessageDocument> {
    const message = await this.messageModel.findById(messageId).exec();
    
    if (!message) {
      throw new NotFoundException('Mesaj bulunamadı');
    }
    
    message.read = true;
    return message.save();
  }

  async markConversationAsRead(userId: string, partnerId: string): Promise<void> {
    await this.messageModel.updateMany(
      { sender: partnerId, receiver: userId, read: false },
      { read: true }
    ).exec();
  }
}
