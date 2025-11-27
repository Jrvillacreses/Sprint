import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Favorite } from '../favorites/favorite.entity';

@Entity({ name: 'videos' })
export class Video {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 150 })
    title: string;

    @Column({ type: 'text' })
    description: string;

    @Column({ length: 80 })
    subject: string; // asignatura

    @Column({ type: 'numeric', precision: 10, scale: 2, default: 0 })
    price: number;   // 0 = gratis

    @Column({ name: 'video_url' })
    videoUrl: string;

    @Column({ name: 'thumbnail_key' })
    thumbnailKey: string;

    @ManyToOne(() => User, (user) => user.videos, { eager: true })
    teacher: User;

    @OneToMany(() => Favorite, (fav) => fav.video)
    favorites: Favorite[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
