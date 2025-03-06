import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { User } from './user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly repository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async validateOrCreateUser(
    providerId: string,
    email: string,
    provider: string,
  ) {
    let user = await this.repository.findOne({
      where: { email, provider, providerId },
    });
    if (!user) {
      user = await this.repository.save({ email, provider, providerId });
    }
    return this.jwtService.sign({
      id: user.id,
      email: user.email,
    });
  }
}
