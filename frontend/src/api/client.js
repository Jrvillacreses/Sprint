import { Platform } from 'react-native';

const API_BASE_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export async function apiFetch(path, options = {}) {
    const url = `${API_BASE_URL}${path}`;

    const res = await fetch(url, {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
    });

    if (!res.ok) {
        let message = `HTTP ${res.status}`;
        try {
            const text = await res.text();
            message = text || message;
        } catch (_) { }
        throw new Error(message);
    }

    return res.json();
}
