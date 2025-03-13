import {
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request) {
    try {
      if (!req.user) {
        throw new UnauthorizedException({
          message: 'User not found',
          status: 401,
          details: req.body,
        });
      }

      const { tokens } = req.user as {
        tokens: {
          accessToken: string;
          refreshToken: string;
        };
      };

      return tokens;
    } catch (error) {
      throw new UnauthorizedException({
        message: 'User not found',
        status: 401,
        details: error,
      });
    }
  }
  @Post('refresh')
  async refresh(@Req() req: Request) {
    try {
      const token = req.headers.authorization;
      const refreshToken = token?.split(' ')[1];

      if (!refreshToken) {
        throw new UnauthorizedException({
          message: 'Refresh token not found',
          status: 401,
        });
      }

      const tokens = await this.authService.refresh(refreshToken);
      return tokens;
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Refresh token did not satisfy requirements',

        status: 401,
        details: error,
      });
    }
  }
}
