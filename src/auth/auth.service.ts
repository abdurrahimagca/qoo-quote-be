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

  async refresh(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const payload = this.jwtService.verify(refreshToken);

    const auth = await this.repository.findOne({
      where: {
        provider: payload.provider,
        providerId: payload.providerId,
      },
      relations: ['user'],
    });

    if (!auth) {
      throw new Error('Auth not found');
    }

    const accessToken = this.jwtService.sign(
      {
        uid: auth.user.id,
        email: auth.email,
        username: auth.user.username,
      },
      {
        secret: process.env.JWT_SECRET,
        expiresIn: '15m',
      },
    );

    return { accessToken, refreshToken };
  }

  async validateOrCreateUser(
    providerId: string,
    email: string,
    provider: string,
  ): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
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
    const accessToken = this.jwtService.sign(
      {
        uid: auth.user.id,
        email: auth.email,
        username: auth.user.username,
      },
      {
        expiresIn: '15m',
      },
    );
    const refreshToken = this.jwtService.sign(
      {
        uid: auth.user.id,
        email: auth.email,
        username: auth.user.username,
        providerId: auth.providerId,
        provider: auth.provider,
      },
      {
        expiresIn: '7d',
      },
    );

    return { accessToken, refreshToken };
  }
}
