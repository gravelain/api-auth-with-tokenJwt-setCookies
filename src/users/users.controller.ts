import { BadRequestException, Body, Controller, Post, Res, Get, Req, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from './users.service';
import { Response, Request } from 'express';
import { UserDto } from './userDto';

@Controller('users')
export class UsersController {
    constructor(
        private readonly userService: UsersService,
        private readonly jwtService: JwtService,
    ){}
    
    @Get('/users')
    async getUsers(): Promise<UserDto[]>{
        return this.userService.getAllUsers();
    }

    @Post('register')
    async register(
        @Body('username') username:string,
        @Body('email') email:string,
        @Body('password') password:string){

        const hashedPassword = await bcrypt.hash(password, 12);

        const user = await this.userService.createUser({
            username,
            email,
            password: hashedPassword
        });

        delete user.password;

        return user;
    }

    @Post('login')
    async login(
        @Body('email') email: string,
        @Body('password') password: string,
        @Res({passthrough: true}) response: Response
    ) {
        const user = await this.userService.findOne(email);

        if (!user) {
            throw new BadRequestException("This Account does't exist, please Create an account...");
        }

        if (!await bcrypt.compare(password, user.password)) {
            throw new BadRequestException('invalid password');
        }

        const userId = await this.userService.getUserByEmail(email);
        const jwt = await this.jwtService.signAsync({id: userId});

        response.cookie('jwt', jwt, {httpOnly: true});

        return {
            message: 'success'
        };
    }

    @Get('user')
    async user(@Req() request: Request) {
        try {
            const cookie = request.cookies['jwt'];

            const data = await this.jwtService.verifyAsync(cookie);

            if (!data) {
                throw new UnauthorizedException();
            }

            
            const user = await this.userService.getUserById(data['id']);


            const {password, ...result} = user;

            return result;
        } catch (e) {
            throw new UnauthorizedException();
        }
    }

    @Post('logout')
    async logout(@Res({passthrough: true}) response: Response) {
        response.clearCookie('jwt');

        return {
            message: 'success'
        }
    }
}
