import {
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { Public } from '../protector/public.decorator';
import { randomBytes } from 'crypto';

// Store auth_codes temporarily (Use Redis in production)
const authCodeStore = new Map<
  string,
  { accessToken: string; refreshToken: string }
>();

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {}

  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Req() req: Request, @Res() res: Response) {
    try {
      if (!req.user) {
        throw new UnauthorizedException({
          message: 'User not found',
          status: 401,
          details: req.body,
        });
      }

      const { tokens, callbackUri } = req.user as {
        tokens: { accessToken: string; refreshToken: string };
        callbackUri: string;
      };

      // Generate a short-lived auth_code
      const authCode = randomBytes(16).toString('hex');
      authCodeStore.set(authCode, tokens);

      // Set expiration (short-lived, e.g., 5 minutes)
      setTimeout(() => authCodeStore.delete(authCode), 5 * 60 * 1000);

      if (callbackUri) {
        const redirectUrl = new URL(callbackUri);
        redirectUrl.searchParams.set('auth_code', authCode);
        return res.redirect(redirectUrl.toString());
      }

      return res.json({ auth_code: authCode });
    } catch (error) {
      throw new UnauthorizedException({
        message: 'User not found',
        status: 401,
        details: error,
      });
    }
  }

  @Post('token')
  async exchangeAuthCode(@Req() req: Request) {
    try {
      const { auth_code } = req.body;

      if (!auth_code || !authCodeStore.has(auth_code)) {
        throw new UnauthorizedException({
          message: 'Invalid or expired auth code',
          status: 401,
        });
      }

      const tokens = authCodeStore.get(auth_code);
      authCodeStore.delete(auth_code);

      return tokens;
    } catch (error) {
      throw new UnauthorizedException({
        message: 'Invalid auth code',
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
