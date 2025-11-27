import {
    Controller,
    Get,
    Post,
    Param,
    Body,
    Query,
    ParseUUIDPipe,
} from '@nestjs/common';
import { VideosService } from './videos.service';
import { CreateVideoDto } from './dto/create-video.dto';
import { FilterVideosDto } from './dto/filter-videos.dto';
import { ApiTags, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { Video } from './video.entity';

@ApiTags('items') // mantiene el nombre del enunciado
@Controller('items')
export class VideosController {
    constructor(private readonly videosService: VideosService) { }

    @Get()
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiQuery({ name: 'q', required: false })
    @ApiQuery({ name: 'category', required: false })
    @ApiQuery({ name: 'minPrice', required: false })
    @ApiQuery({ name: 'maxPrice', required: false })
    @ApiQuery({ name: 'sort', required: false })
    @ApiQuery({ name: 'order', required: false })
    async findAll(@Query() filters: FilterVideosDto) {
        return this.videosService.findAll(filters);
    }

    @Get(':id')
    @ApiResponse({ type: Video })
    async findOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.videosService.findOne(id);
    }

    @Post()
    @ApiResponse({ type: Video })
    async create(@Body() dto: CreateVideoDto) {
        return this.videosService.create(dto);
    }
}
