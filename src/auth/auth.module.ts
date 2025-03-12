import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Auth } from './auth.entity';
import { AuthService } from './auth.service';
import { GoogleStrategy } from './google.strategy';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { UserModule } from 'src/user/user.module';
import { User } from 'src/user/user.entity';

@Module({
  imports: [
    UserModule,
    TypeOrmModule.forFeature([Auth]),
    TypeOrmModule.forFeature([User]),
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '15m' },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy],
  exports: [JwtStrategy, PassportModule],
})
export class AuthModule {}
