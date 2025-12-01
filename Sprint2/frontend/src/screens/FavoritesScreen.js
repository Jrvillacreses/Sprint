import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage'; // <--- IMPORTANTE

import { colors, spacing } from '../theme/design';
import VideoCard from '../components/VideoCard';
import { getVideos } from '../api/videosApi';
import { useAuth } from '../context/AuthContext';

export default function FavoritesScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();

    const [favorites, setFavorites] = useState([]);
    const [loading, setLoading] = useState(true);

    // Usamos useFocusEffect para recargar la lista cada vez que entras a la pantalla
    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [])
    );

    const loadFavorites = async () => {
        try {
            setLoading(true);

            // 1. Obtener todos los videos (para tener los datos completos: titulo, imagen, etc.)
            // Nota: En una app real optimizada, guardarías el objeto completo en favoritos para no recargar todo.
            const allVideosRes = await getVideos({ limit: 100 });
            const allVideos = allVideosRes.items || allVideosRes || [];

            // 2. Obtener los IDs de favoritos guardados en el móvil
            const storedFavs = await AsyncStorage.getItem(`favorites_${user.id}`);
            const favIds = storedFavs ? JSON.parse(storedFavs) : [];
            const favSet = new Set(favIds);

            // 3. Filtrar: Solo nos quedamos con los videos cuyo ID está en la lista de favoritos
            const myFavorites = allVideos.filter(video => favSet.has(video.id));

            setFavorites(myFavorites);
        } catch (error) {
            console.error("Error cargando favoritos locales", error);
        } finally {
            setLoading(false);
        }
    };

    const handleVideoPress = (id) => {
        navigation.navigate('Detail', { id });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.headerTitle}>My Favorites</Text>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color={colors.purple} />
                </View>
            ) : favorites.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.emptyText}>No tienes favoritos guardados aún.</Text>
                    <Text style={styles.emptySubText}>Ve al inicio y dale ❤️ a algunos videos.</Text>
                </View>
            ) : (
                <FlatList
                    data={favorites}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={({ item }) => (
                        <VideoCard
                            video={item}
                            onPress={() => handleVideoPress(item.id)}
                            // En esta pantalla siempre son favoritos, así que true
                            isFavorite={true}
                            // Opcional: Si quieres permitir quitar favorito desde aquí, requeriría más lógica
                            onToggleFavorite={() => { }}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.textPrimary,
        margin: spacing.lg,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 50,
    },
    emptyText: {
        color: colors.textPrimary,
        fontSize: 18,
        fontWeight: '600',
        marginTop: spacing.md,
    },
    emptySubText: {
        color: colors.textSecondary,
        marginTop: spacing.sm,
    }
});