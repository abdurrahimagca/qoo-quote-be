import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { User } from './user.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
  ) {}
  async findUserByUserName(username: string): Promise<User> {
    return this.repository.findOne({ where: { username } });
  }
  async checkUserNameAvailability(username: string): Promise<boolean> {
    const user = await this.findUserByUserName(username);
    return !user;
  }
  async createUser(user: User): Promise<void> {
    await this.repository.upsert(user, { conflictPaths: ['username'] });
  }
  async patchUser(user: User): Promise<void> {
    await this.repository.save(user);
  }
  async findUserById(id: string): Promise<User> {
    return this.repository.findOne({ where: { id } });
  }
}
