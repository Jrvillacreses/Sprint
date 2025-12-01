// src/api/videosApi.js
import { apiFetch } from './client';
import { client } from './client';

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
export async function createVideo(data) {
    return apiFetch('/items', {
        method: 'POST',
        body: JSON.stringify(data), // Importante: stringify para fetch
    });
}

export async function updateVideo(id, data) {
    return apiFetch(`/items/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
    });
}

export async function deleteVideo(id) {
    return apiFetch(`/items/${id}`, {
        method: 'DELETE',
    });
}
