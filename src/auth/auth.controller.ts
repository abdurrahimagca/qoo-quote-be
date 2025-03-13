import {
  Controller,
  Get,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
  Res,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { Request, Response } from 'express';
import { Public } from '../protector/public.decorator';


@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }
  @Public()
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Req() req: Request) {
    // The state will be handled by the guard
    return;
  }
  @Public()
  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      if (!req.user) {
        throw new UnauthorizedException({
          message: 'User not found',
          status: 401,
          details: req.body,
        });
      }

      const { tokens, callbackUri } = req.user as {
        tokens: {
          accessToken: string;
          refreshToken: string;
        };
        callbackUri: string;
      };

      // If there's a callback URI, redirect to it with the tokens
      if (callbackUri) {
        const redirectUrl = new URL(callbackUri);
        redirectUrl.searchParams.set('accessToken', tokens.accessToken);
        redirectUrl.searchParams.set('refreshToken', tokens.refreshToken);
        return res.redirect(redirectUrl.toString());
      }

      // If no callback URI, return tokens directly
      return res.json(tokens);
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
