import { apiFetch } from './client';

export async function login(email, password) {
    return apiFetch('/users/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
    });
}

export async function register(name, email, password) {
    return apiFetch('/users/register', {
        method: 'POST',
        body: JSON.stringify({ name, email, password }),
    });
}
