// src/api/favoritesApi.js
import { apiFetch } from './client';

export async function getFavorites(userId) {
    return apiFetch(`/users/${userId}/favorites`);
}

export async function addFavorite(videoId, userId) {
    return apiFetch(`/favorites/${videoId}`, {
        method: 'POST',
        body: JSON.stringify({ userId }),
    });
}

export async function removeFavorite(videoId, userId) {
    return apiFetch(`/favorites/${videoId}?userId=${userId}`, {
        method: 'DELETE',
    });
}
