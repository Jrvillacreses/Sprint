// src/favorites/favorites.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Favorite } from './favorite.entity';
import { User } from '../users/user.entity';
import { Video } from '../videos/video.entity';



@Injectable()
export class FavoritesService {
    constructor(
        @InjectRepository(Favorite)
        private readonly favoritesRepo: Repository<Favorite>,
        @InjectRepository(User)
        private readonly usersRepo: Repository<User>,
        @InjectRepository(Video)
        private readonly videosRepo: Repository<Video>,
    ) { }

    /**
     * Devuelve los vídeos favoritos de un usuario (array de Video)
     */
    async getFavoritesByUser(userId: string) {
        const user = await this.usersRepo.findOne({ where: { id: userId } });
        if (!user) {
            throw new NotFoundException(`User ${userId} not found`);
        }

        const favorites = await this.favoritesRepo.find({
            where: { user: { id: userId } },
            relations: ['video', 'video.teacher'], // quita 'video.teacher' si no tienes relación teacher
            order: { createdAt: 'DESC' },
        });

        // devolvemos solo los vídeos
        return favorites.map((fav) => fav.video);
    }

    /**
     * Marca un vídeo como favorito para el usuario
     */
    async addFavorite(videoId: string, userId: string) {
        const [user, video] = await Promise.all([
            this.usersRepo.findOne({ where: { id: userId } }),
            this.videosRepo.findOne({ where: { id: videoId } }),
        ]);

        if (!user) throw new NotFoundException(`User ${userId} not found`);
        if (!video) throw new NotFoundException(`Video ${videoId} not found`);

        // evitar duplicado
        const exists = await this.favoritesRepo.findOne({
            where: { user: { id: userId }, video: { id: videoId } },
        });
        if (exists) return exists;

        const favorite = this.favoritesRepo.create({ user, video });
        return this.favoritesRepo.save(favorite);
    }

    /**
     * Elimina un vídeo de favoritos para el usuario
     */
    async removeFavorite(videoId: string, userId: string) {
        const favorite = await this.favoritesRepo.findOne({
            where: { user: { id: userId }, video: { id: videoId } },
        });

        if (!favorite) {
            return { success: true };
        }

        await this.favoritesRepo.delete(favorite.id);
        return { success: true };
    }
}
