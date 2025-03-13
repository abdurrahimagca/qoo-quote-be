import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from './public.decorator';

@Injectable()
export class ProtectorApiKeyGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const req = context.getType() === 'http'
            ? context.switchToHttp().getRequest()
            : GqlExecutionContext.create(context).getContext().req;

        const apiKey = req.headers['qq-api-key'];
        if (!apiKey || apiKey !== process.env.API_KEY) {
            throw new UnauthorizedException('Invalid API key');
        }

        return true;
    }
} 