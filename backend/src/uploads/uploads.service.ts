import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

@Injectable()
export class UploadsService {
    private s3: S3Client;
    private bucket: string;
    private expiresIn: number;

    constructor(private readonly config: ConfigService) {
        const aws = this.config.get('aws');
        this.s3 = new S3Client({
            region: aws.region,
            credentials: {
                accessKeyId: aws.accessKeyId,
                secretAccessKey: aws.secretAccessKey,
            },
        });
        this.bucket = aws.s3Bucket;
        this.expiresIn = aws.presignExpires || 300;
    }

    async createPresignedUrl(fileName: string, contentType: string) {
        const key = `thumbnails/${Date.now()}-${fileName}`;

        const command = new PutObjectCommand({
            Bucket: this.bucket,
            Key: key,
            ContentType: contentType,
        });

        const url = await getSignedUrl(this.s3, command, {
            expiresIn: this.expiresIn,
        });

        return { url, key };
    }
}
