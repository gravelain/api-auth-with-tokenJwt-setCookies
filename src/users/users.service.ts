import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './userDto';

@Injectable()
export class UsersService {
    constructor(private readonly prismaService: PrismaService){}

    async createUser(data:UserDto): Promise<UserDto>{
        return this.prismaService.user.create({
            data:{
                username:data.username,
                email:data.email,
                password:data.password
            }
        }).catch((error) => {
            if (error instanceof PrismaClientKnownRequestError) {
              if (error.code === 'P2002') {
                throw new ForbiddenException('This Account is already in Game');
              }
            }
            throw error;
          });
    
    }
    async getAllUsers(): Promise<UserDto[]>{
        return await this.prismaService.user.findMany();
    }

    async findOne(email: string): Promise<UserDto>{
        return this.prismaService.user.findUnique({
            where : {
                email:email
            }
        })
    }
    async getUserById(identifiant: number): Promise<UserDto>{
        const user = await this.prismaService.user.findUnique({
            where:{
                id:identifiant
            }
        }); 
        if(!user){
            throw new ForbiddenException('user not found');
        }
        
        return user;
    }


    async getUserByEmail(email: string): Promise<number>{
        const user = await this.prismaService.user.findUnique({
            where:{
                email:email
            }
        }); 
        if(!user){
            throw new ForbiddenException('user not found');
        }
        const userId = user.id;
        return userId;
    }
}
