import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    handleRequest(err, user, info, context) {
        const request = context.switchToHttp().getRequest();

        const isPublic = this.reflector.get<boolean>('isPublic', context.getHandler());

        if (user) {
            return user;
        }

        if (isPublic) {
            return false;
        }

        throw new UnauthorizedException();
    }
}
