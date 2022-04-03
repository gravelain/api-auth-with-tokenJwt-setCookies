import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
    exports: [UsersService],
    controllers: [UsersController],
    imports: [
        JwtModule.register({
        secret: 'secret',
        signOptions: {expiresIn: '1d'}
    }), PrismaModule
    ],
    providers: [UsersService],
})
export class UsersModule {}
