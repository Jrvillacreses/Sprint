// src/database/database.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/user.entity';
import { Video } from '../videos/video.entity';
import { Favorite } from '../favorites/favorite.entity';

@Module({
    imports: [
        ConfigModule,
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (config: ConfigService) => {
                const db = config.get('database');

                return {
                    type: 'postgres',
                    host: db.host,
                    port: db.port,
                    username: db.user,
                    password: db.pass,
                    database: db.name,
                    entities: [User, Video, Favorite],
                    synchronize: true,
                    logging: true,

                    // 👇 ESTA PARTE ES LA IMPORTANTE
                    ssl: {
                        rejectUnauthorized: false, // para RDS en desarrollo
                    },
                };
            },
        }),
    ],
})
export class DatabaseModule { }
