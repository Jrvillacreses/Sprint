import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    OneToMany,
    CreateDateColumn,
    UpdateDateColumn,
} from 'typeorm';
import { Video } from '../videos/video.entity';
import { Favorite } from '../favorites/favorite.entity';

@Entity({ name: 'users' })
export class User {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column({ length: 120 })
    name: string;

    @Column({ unique: true })
    email: string;

    @Column({ select: false, nullable: true }) // Don't return password by default
    password: string;

    @Column({ type: 'text', nullable: true })
    bio?: string;

    @Column({ name: 'avatar_key', nullable: true })
    avatarKey?: string;

    @OneToMany(() => Video, (video) => video.teacher)
    videos: Video[];

    @OneToMany(() => Favorite, (fav) => fav.user)
    favorites: Favorite[];

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updated_at' })
    updatedAt: Date;
}
