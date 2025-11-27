// src/api/usersApi.js
import { apiFetch } from './client';

// Devuelve un usuario por ID (lo usaremos para el perfil del profesor)
export async function getUserById(id) {
    return apiFetch(`/users/${id}`);
}
