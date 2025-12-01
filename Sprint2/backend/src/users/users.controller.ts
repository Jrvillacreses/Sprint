import { Controller, Get, Post, Body, Param, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service';
import { FavoritesService } from '../favorites/favorites.service';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly favoritesService: FavoritesService,
    ) { }

    @Post('register')
    async register(@Body() body: any) {
        const { email, password, name } = body;
        if (!email || !password || !name) {
            throw new BadRequestException('Missing fields: email, password, name');
        }
        const existing = await this.usersService.findByEmail(email);
        if (existing) {
            throw new BadRequestException('Email already in use');
        }
        // In a real app, hash the password here!
        return this.usersService.create({ email, password, name });
    }

    @Post('login')
    async login(@Body() body: any) {
        const { email, password } = body;
        const user = await this.usersService.findByEmail(email);

        // In a real app, compare hash!
        if (!user || user.password !== password) {
            throw new UnauthorizedException('Invalid credentials');
        }

        const { password: _, ...result } = user;
        return result;
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.usersService.findOne(id);
    }

    @Get(':id/favorites')
    getUserFavorites(@Param('id') id: string) {
        return this.favoritesService.getFavoritesByUser(id);
    }
}
