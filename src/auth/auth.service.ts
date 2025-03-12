import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { Auth } from './auth.entity';
import { User } from 'src/user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Auth)
    private readonly repository: Repository<Auth>,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    private readonly jwtService: JwtService,
  ) {}

  async validateOrCreateUser(
    providerId: string,
    email: string,
    provider: string,
  ): Promise<string> {
    let auth = await this.repository.findOne({
      where: { email, provider, providerId },
      relations: ['user'], // Ensure we fetch the related user
    });

    if (!auth) {
      const user = this.userRepository.create({
        username: email.split('@')[0],
      });

      await this.userRepository.save(user);

      auth = this.repository.create({
        email,
        provider,
        providerId,
        user,
      });

      await this.repository.save(auth);
    }

    return this.jwtService.sign({
      uid: auth.user.id,
      email: auth.email,
      username: auth.user.username,
    });
  }
}
