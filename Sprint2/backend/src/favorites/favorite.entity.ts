import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
    Unique,
} from 'typeorm';
import { User } from '../users/user.entity';
import { Video } from '../videos/video.entity';

@Entity({ name: 'favorites' })
@Unique(['user', 'video'])
export class Favorite {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, (user) => user.favorites)
    user: User;

    @ManyToOne(() => Video, (video) => video.favorites)
    video: Video;

    @CreateDateColumn({ name: 'created_at' })
    createdAt: Date;
}
