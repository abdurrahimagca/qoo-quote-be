import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ProtectorApiKeyGuard } from './api-key.guard';

@Module({
    providers: [
        {
            provide: APP_GUARD,
            useClass: ProtectorApiKeyGuard,
        },
    ],
})
export class ProtectorModule { } 