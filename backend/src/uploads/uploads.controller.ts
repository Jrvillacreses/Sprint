import { Controller, Post, Body } from '@nestjs/common';
import { UploadsService } from './uploads.service';
import { CreatePresignDto } from './dto/create-presign.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('uploads')
@Controller('uploads')
export class UploadsController {
    constructor(private readonly uploadsService: UploadsService) { }

    @Post('presign')
    async createPresign(@Body() dto: CreatePresignDto) {
        return this.uploadsService.createPresignedUrl(dto.fileName, dto.contentType);
    }
}
