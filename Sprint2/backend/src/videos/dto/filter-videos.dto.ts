import { IsInt, Min, IsOptional, IsString, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';


export class FilterVideosDto {
    @ApiPropertyOptional({ default: 1 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    page?: number = 1;

    @ApiPropertyOptional({ default: 10 })
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @IsOptional()
    limit?: number = 10;

    @ApiPropertyOptional({ description: 'Texto de búsqueda' })
    @IsString()
    @IsOptional()
    q?: string;

    @ApiPropertyOptional({ description: 'Asignatura/categoría' })
    @IsString()
    @IsOptional()
    category?: string;

    @ApiPropertyOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    minPrice?: number;

    @ApiPropertyOptional()
    @Type(() => Number)
    @IsNumber()
    @Min(0)
    @IsOptional()
    maxPrice?: number;

    @ApiPropertyOptional({ description: 'Campo de orden: price, createdAt' })
    @IsString()
    @IsOptional()
    sort?: string;

    @ApiPropertyOptional({ enum: ['ASC', 'DESC'] })
    @IsString()
    @IsOptional()
    order?: 'ASC' | 'DESC';

    @IsOptional()
    @IsBoolean() // O @IsBoolean() con transform
    all?: boolean;
}
