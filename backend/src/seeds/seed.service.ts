// src/seeds/seed.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Video } from '../videos/video.entity';

@Injectable()
export class SeedService {
    private readonly logger = new Logger(SeedService.name);

    constructor(
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
        @InjectRepository(Video)
        private readonly videoRepo: Repository<Video>,
    ) { }

    async run() {
        const usersCount = await this.userRepo.count();
        const videosCount = await this.videoRepo.count();

        if (usersCount > 0 || videosCount > 0) {
            this.logger.log('Seed: ya hay datos, no se ejecuta.');
            return;
        }

        this.logger.log('Seed: creando usuarios y vídeos de ejemplo...');

        // 1. Crear profesores
        const teachers = this.userRepo.create([
            {
                name: 'Laura Matemáticas',
                email: 'laura.math@example.com',
                bio: 'Profesora de matemáticas de secundaria y bachillerato.',
            },
            {
                name: 'Carlos Inglés',
                email: 'carlos.english@example.com',
                bio: 'Profesor de inglés comunicativo para todos los niveles.',
            },
            {
                name: 'Ana Programación',
                email: 'ana.dev@example.com',
                bio: 'Desarrolladora y profesora de programación desde cero.',
            },
        ]);

        const savedTeachers = await this.userRepo.save(teachers);

        // 2. Crear vídeos de ejemplo
        const subjects = ['Matemáticas', 'Inglés', 'Programación', 'Física'];
        const sampleThumb = 'thumbnails/sample-thumbnail.png'; // luego subes una real
        const sampleVideoUrl = 'https://www.youtube.com/watch?v=dQw4w9WgXcQ';

        const videos: Partial<Video>[] = [];
        for (let i = 1; i <= 30; i++) {
            const teacher =
                savedTeachers[Math.floor(Math.random() * savedTeachers.length)];
            const subject =
                subjects[Math.floor(Math.random() * subjects.length)];
            const price = Math.random() < 0.6 ? 0 : parseFloat((5 + Math.random() * 20).toFixed(2));

            videos.push({
                title: `Clase #${i} de ${subject}`,
                description: `Contenido introductorio y práctico sobre ${subject}. Vídeo número ${i}.`,
                subject,
                price,
                videoUrl: sampleVideoUrl,
                thumbnailKey: sampleThumb,
                teacher,
            });
        }

        await this.videoRepo.save(videos);

        this.logger.log('Seed: datos creados correctamente.');
    }
}
