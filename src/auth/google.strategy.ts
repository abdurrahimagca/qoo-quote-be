import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { AuthService } from './auth.service';
import { GoogleProfileSchema } from './auth.types';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_AUTH_CLIENT_ID,
      clientSecret: process.env.GOOGLE_AUTH_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      scope: ['email', 'profile'],
    });
  }

  async validate(
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
    const jwt = await this.authService.validateOrCreateUser(
      id,
      email,
      'google',
    );
    return done(null, {
      accessToken: jwt,
    });
  }
}
