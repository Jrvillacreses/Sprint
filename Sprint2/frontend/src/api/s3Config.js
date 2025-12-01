// src/api/s3Config.js
// 👇 Rellena con tus datos reales de AWS
export const S3_BUCKET = 'videos-thumbnails-black';
export const S3_REGION = 'us-east-1';

export function buildThumbnailUrl(thumbnailKey) {
    if (!thumbnailKey) return undefined;
    if (thumbnailKey.startsWith('http')) return thumbnailKey;
    return `https://${S3_BUCKET}.s3.${S3_REGION}.amazonaws.com/${thumbnailKey}`;
}
