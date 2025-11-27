// src/config/configuration.ts
export default () => ({
    app: {
        port: parseInt(process.env.APP_PORT || '3000', 10),
        env: process.env.NODE_ENV || 'development',
    },
    database: {
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT || '5432', 10),
        user: process.env.DB_USER,
        pass: process.env.DB_PASS,
        name: process.env.DB_NAME,
    },
    aws: {
        region: process.env.AWS_REGION,
        s3Bucket: process.env.AWS_S3_BUCKET,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        presignExpires: parseInt(process.env.AWS_S3_PRESIGN_EXPIRES || '300', 10),
    },
});
