// src/seeds/seed.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../users/user.entity';
import { Video } from '../videos/video.entity';

@Module({
    imports: [TypeOrmModule.forFeature([User, Video])],
    providers: [SeedService],
    exports: [SeedService],
})
export class SeedModule { }
