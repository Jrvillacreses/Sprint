import {
    IsNotEmpty,
    IsString,
    MinLength,
    IsNumber,
    Min,
    IsUrl,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateVideoDto {
    @ApiProperty()
    @IsString()
    @MinLength(3)
    title: string;

    @ApiProperty()
    @IsString()
    @MinLength(10)
    description: string;

    @ApiProperty({ description: 'Asignatura' })
    @IsString()
    @IsNotEmpty()
    subject: string; // category en la query

    @ApiProperty({ default: 0 })
    @IsNumber()
    @Min(0)
    price: number;

    @ApiProperty({ description: 'URL de YouTube' })
    @IsUrl()
    videoUrl: string;

    @ApiProperty({ description: 'Clave S3 de la miniatura' })
    @IsString()
    @IsNotEmpty()
    thumbnailKey: string;

    @ApiProperty({ description: 'ID del profesor (user)' })
    @IsString()
    @IsNotEmpty()
    teacherId: string;
}
