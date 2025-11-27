// src/favorites/favorites.controller.ts
import { Controller, Post, Delete, Param, Body, Query } from '@nestjs/common';
import { FavoritesService } from './favorites.service';

@Controller('favorites')
export class FavoritesController {
    constructor(private readonly favoritesService: FavoritesService) { }

    @Post(':videoId')
    addFavorite(
        @Param('videoId') videoId: string,
        @Body('userId') userId: string,
    ) {
        return this.favoritesService.addFavorite(videoId, userId);
    }

    @Delete(':videoId')
    removeFavorite(
        @Param('videoId') videoId: string,
        @Query('userId') userId: string,
    ) {
        return this.favoritesService.removeFavorite(videoId, userId);
    }
}
