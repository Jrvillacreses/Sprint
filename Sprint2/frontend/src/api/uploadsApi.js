// src/api/uploadsApi.js
import { apiFetch } from './client';

export async function createPresignedUrl({ fileName, contentType }) {
    return apiFetch('/uploads/presign', {
        method: 'POST',
        body: JSON.stringify({ fileName, contentType }),
    });
}
