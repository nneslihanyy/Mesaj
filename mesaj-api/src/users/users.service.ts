import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userModel.findOne({ email: createUserDto.email }).exec();
    if (existingUser) {
      throw new ConflictException('Email address already in use');
    }

    // Hash password
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);

    const newUser = new this.userModel({
      email: createUserDto.email,
      password: hashedPassword,
      name: createUserDto.name,
      createdAt: new Date()
    });

    return newUser.save();
  }

  async findById(id: string): Promise<User> {
    const user = await this.userModel.findById(id).exec();
    if (!user) {
      throw new NotFoundException('Kullanıcı bulunamadı');
    }
    return user;
  }

  async findByEmail(email: string): Promise<User> {
    return this.userModel.findOne({ email }).exec();
  }
  
  async searchUsers(query: string, currentUserId: string): Promise<User[]> {
    if (!query || query.length < 2) {
      return [];
    }
    
    // Email veya isim ile kullanıcı ara
    const searchRegex = new RegExp(query, 'i');
    
    return this.userModel.find({
      $and: [
        { _id: { $ne: currentUserId } }, // Mevcut kullanıcı hariç
        { $or: [
            { email: searchRegex },
            { name: searchRegex }
          ]
        }
      ]
    })
    .select('_id name email') // Sadece gerekli alanları döndür, şifre gibi hassas bilgileri gönderme
    .limit(10) // Sonuç sayısını sınırla
    .exec();
  }
}
