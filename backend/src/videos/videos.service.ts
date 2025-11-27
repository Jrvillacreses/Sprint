import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Video } from './video.entity';
import { CreateVideoDto } from './dto/create-video.dto';
import { FilterVideosDto } from './dto/filter-videos.dto';
import { User } from '../users/user.entity';

@Injectable()
export class VideosService {
    constructor(
        @InjectRepository(Video)
        private readonly videoRepo: Repository<Video>,
        @InjectRepository(User)
        private readonly userRepo: Repository<User>,
    ) { }

    async create(dto: CreateVideoDto): Promise<Video> {
        const teacher = await this.userRepo.findOne({
            where: { id: dto.teacherId },
        });
        if (!teacher) {
            throw new NotFoundException('Teacher not found');
        }

        const video = this.videoRepo.create({
            title: dto.title,
            description: dto.description,
            subject: dto.subject,
            price: dto.price,
            videoUrl: dto.videoUrl,
            thumbnailKey: dto.thumbnailKey,
            teacher,
        });

        return this.videoRepo.save(video);
    }

    async findAll(filters: FilterVideosDto) {
        const {
            page = 1,
            limit = 10,
            q,
            category,
            minPrice,
            maxPrice,
            sort = 'createdAt',
            order = 'DESC',
        } = filters;

        const qb = this.videoRepo
            .createQueryBuilder('video')
            .leftJoinAndSelect('video.teacher', 'teacher');

        if (q) {
            qb.andWhere(
                '(video.title ILIKE :q OR video.description ILIKE :q OR teacher.name ILIKE :q)',
                { q: `%${q}%` },
            );
        }

        if (category) {
            qb.andWhere('video.subject = :category', { category });
        }

        if (minPrice !== undefined) {
            qb.andWhere('video.price >= :minPrice', { minPrice });
        }

        if (maxPrice !== undefined) {
            qb.andWhere('video.price <= :maxPrice', { maxPrice });
        }

        const sortField =
            sort === 'price' || sort === 'createdAt' ? `video.${sort}` : 'video.createdAt';

        qb.orderBy(sortField, order === 'ASC' ? 'ASC' : 'DESC');

        qb.skip((page - 1) * limit).take(limit);

        const [items, total] = await qb.getManyAndCount();

        return {
            items,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };
    }

    async findOne(id: string): Promise<Video> {
        const video = await this.videoRepo.findOne({
            where: { id },
            relations: ['teacher'],
        });

        if (!video) {
            throw new NotFoundException('Video not found');
        }

        return video;
    }
}
