// src/screens/FavoritesScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { colors, spacing } from '../theme/design';
import { getFavorites, removeFavorite } from '../api/favoritesApi';
import VideoCard from '../components/VideoCard';

import { useAuth } from '../context/AuthContext';

export default function FavoritesScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [error, setError] = useState(null);

    const loadFavorites = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);
            const data = await getFavorites(user.id);
            const favVideos = data.items || data || [];
            setVideos(favVideos);
        } catch (err) {
            console.error('Error loading favorites', err);
            setError('No se pudieron cargar tus favoritos.');
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useFocusEffect(
        useCallback(() => {
            loadFavorites();
        }, [loadFavorites])
    );

    const handleRemoveFavorite = async (videoId) => {
        if (updating) return;
        try {
            setUpdating(true);
            await removeFavorite(videoId, user.id);
            await loadFavorites();
        } catch (err) {
            console.error('Error removing favorite', err);
        } finally {
            setUpdating(false);
        }
    };

    const renderItem = ({ item }) => (
        <VideoCard
            video={item}
            onPress={() => navigation.navigate('Detail', { id: item.id })}
            isFavorite={true}
            onToggleFavorite={() => handleRemoveFavorite(item.id)}
        />
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Favorites</Text>
                <Ionicons name="heart" size={20} color={colors.purple} />
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator color={colors.cyanLight} />
                    <Text style={styles.helperText}>Cargando favoritos...</Text>
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : videos.length === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.helperText}>
                        Todavía no tienes vídeos marcados como favoritos.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={videos}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: spacing.lg }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: spacing.md,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    center: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    helperText: {
        marginTop: 8,
        fontSize: 13,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    errorText: {
        fontSize: 14,
        color: '#F97373',
        textAlign: 'center',
    },
});
