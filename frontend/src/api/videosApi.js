// src/api/videosApi.js
import { apiFetch } from './client';

/**
 * Lista de items (vídeos de profesores)
 * GET /items?page&limit&q&subject&minPrice&maxPrice&sort&order
 */
export async function getVideos(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
            query.append(key, String(value));
        }
    });

    const qs = query.toString();
    const url = qs ? `/items?${qs}` : '/items';

    return apiFetch(url);
}

/**
 * Detalle de un item
 * GET /items/:id
 */
export async function getVideo(id) {
    if (!id) {
        throw new Error('getVideo: id is required');
    }
    return apiFetch(`/items/${id}`);
}
