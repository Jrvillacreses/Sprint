import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. MOCKS CON DATOS DE CERTIFICADOS
const MOCK_USERS = {
    ADMIN: {
        id: "11111111-1111-1111-1111-111111111111",
        name: "Admin Demo",
        role: "ADMIN",
        email: "admin@bootcamp.com",
        bio: "Administrador del sistema",
        permissions: ["ITEM_LIST", "ITEM_DETAIL", "ITEM_CREATE", "ITEM_EDIT", "ITEM_DEACTIVATE", "ADMIN_PANEL_VIEW", "PROFILE_VIEW", "PROFILE_EDIT", "FAVORITES_USE"],
        completedVideos: [] // Admin no tiene cursos
    },
    USER: {
        id: "22222222-2222-2222-2222-222222222222",
        name: "User Standard",
        role: "USER",
        email: "student@bootcamp.com",
        bio: "Estudiante apasionado",
        permissions: ["ITEM_LIST", "ITEM_DETAIL", "FAVORITES_USE", "PROFILE_VIEW", "PROFILE_EDIT"],
        // Array de certificados para el perfil
        completedVideos: [
            { id: '101', title: 'Introducción a React Native', date: '15 Oct 2023' },
            { id: '102', title: 'Gestión de Estados Avanzada', date: '22 Nov 2023' },
            { id: '103', title: 'Diseño UI/UX Móvil', date: '05 Dic 2023' }
        ]
    }
};

const AuthContext = createContext({});

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = async () => {
        try {
            // 1. Recuperar rol guardado
            const storedRole = await AsyncStorage.getItem('userRole');

            if (storedRole && MOCK_USERS[storedRole]) {
                let finalUser = { ...MOCK_USERS[storedRole] };

                // 2. Recuperar cambios de perfil (nombre/bio)
                try {
                    const storedUpdates = await AsyncStorage.getItem(`user_updates_${finalUser.id}`);
                    if (storedUpdates) {
                        finalUser = { ...finalUser, ...JSON.parse(storedUpdates) };
                    }
                } catch (jsonError) {
                    console.log("Error parseando actualizaciones de usuario, se usarán datos por defecto.");
                }

                setUser(finalUser);
            }
        } catch (e) {
            console.error("Error cargando usuario:", e);
        } finally {
            setLoading(false);
        }
    };

    const selectRole = async (roleKey) => {
        try {
            const baseUser = MOCK_USERS[roleKey];
            if (!baseUser) return; // Protección contra roles inválidos

            let finalUser = { ...baseUser };

            // Intentar cargar actualizaciones previas si existen
            const storedUpdates = await AsyncStorage.getItem(`user_updates_${baseUser.id}`);
            if (storedUpdates) {
                finalUser = { ...finalUser, ...JSON.parse(storedUpdates) };
            }

            setUser(finalUser);
            await AsyncStorage.setItem('userRole', roleKey);
        } catch (error) {
            console.error("Error al seleccionar rol:", error);
        }
    };

    const logout = async () => {
        setUser(null);
        await AsyncStorage.removeItem('userRole');
    };

    const updateProfile = async (newData) => {
        if (!user) return;

        const updatedUser = { ...user, ...newData };
        setUser(updatedUser);

        // Guardar persistencia
        try {
            await AsyncStorage.setItem(
                `user_updates_${user.id}`,
                JSON.stringify({ name: updatedUser.name, bio: updatedUser.bio })
            );
        } catch (e) {
            console.error("Error guardando perfil:", e);
        }
    };

    const can = (permissionCode) => {
        return user?.permissions?.includes(permissionCode) || false;
    };

    return (
        <AuthContext.Provider value={{ user, selectRole, logout, updateProfile, loading, can }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);