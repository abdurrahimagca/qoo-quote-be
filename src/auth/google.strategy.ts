import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
import { GoogleProfileSchema } from './auth.types';
import { Request } from 'express';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: process.env.GOOGLE_AUTH_CALLBACK_URL || '/auth/google/callback',
      scope: ['email', 'profile'],
      passReqToCallback: true,
    });
  }

  authenticate(req: Request, options?: any) {
    const callbackURL = req.query.callbackUri as string || (this._oauth2 as any).redirectUri;
    super.authenticate(req, { ...options, callbackURL });
  }

  async validate(
    req: Request,
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const result = GoogleProfileSchema.safeParse(profile);
    if (!result.success) {
      return done(result.error, false);
    }
    const { id, emails } = result.data;
    const email = emails[0].value;


    const callbackUri = req.query.state ? JSON.parse(req.query.state as string).callbackUri : null;
    
    const jwt = await this.authService.validateOrCreateUser(
      id,
      email,
      'google',
    );
    return done(null, {
      tokens: jwt,
      callbackUri,
    });
  }
}
