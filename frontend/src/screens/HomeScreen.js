// src/screens/HomeScreen.js
import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
    useNavigation,
    useFocusEffect,
} from '@react-navigation/native';

import { colors, spacing, radius } from '../theme/design';
import { getVideos } from '../api/videosApi';
import {
    getFavorites,
    addFavorite,
    removeFavorite,
} from '../api/favoritesApi';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
    const navigation = useNavigation();
    const { user } = useAuth();

    const [videos, setVideos] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // --- Cargar vídeos + favoritos ---
    const loadData = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);

            const [videosRes, favRes] = await Promise.all([
                // ajusta params si tu getVideos no los usa
                getVideos({ page: 1, limit: 30, sort: 'created_at', order: 'DESC' }),
                getFavorites(user.id),
            ]);

            const vids = videosRes.items || videosRes || [];
            const favs = favRes.items || favRes || [];

            setVideos(vids);
            setFavoriteIds(new Set(favs.map((v) => v.id)));
        } catch (err) {
            console.error('Error loading home data', err);
            setError('No se pudieron cargar los vídeos.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Recargar cada vez que volvemos a Home
    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData]),
    );

    // --- Toggle favorito (UI + backend) ---
    const handleToggleFavorite = async (video) => {
        const isFav = favoriteIds.has(video.id);

        // Actualización optimista en UI
        setFavoriteIds((prev) => {
            const next = new Set(prev);
            if (isFav) next.delete(video.id);
            else next.add(video.id);
            return next;
        });

        try {
            if (isFav) {
                await removeFavorite(video.id, user.id);
            } else {
                await addFavorite(video.id, user.id);
            }
        } catch (err) {
            console.error('Error toggling favorite', err);
            // rollback si falla
            setFavoriteIds((prev) => {
                const next = new Set(prev);
                if (isFav) next.add(video.id);
                else next.delete(video.id);
                return next;
            });
        }
    };

    // --- Render de cada card ---
    const renderItem = ({ item }) => (
        <VideoCard
            video={item}
            onPress={() => navigation.navigate('Detail', { id: item.id })}
            isFavorite={favoriteIds.has(item.id)}
            onToggleFavorite={() => handleToggleFavorite(item)}
        />
    );

    // --- Cabecera scrollable (barra superior + avatares + título sección) ---
    const ListHeader = () => {
        const featuredVideo = videos.length > 0 ? videos[0] : null;

        return (
            <>
                {/* Barra superior Home + icono notificaciones */}
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.headerTitle}>{user?.name || 'Student'}</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.iconButton}
                    >
                        <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Featured Section (Banner) */}
                {featuredVideo && (
                    <View style={styles.featuredBanner}>
                        <Ionicons name="sparkles" size={80} color="rgba(255,255,255,0.05)" style={styles.bannerIconBg} />
                        <View style={styles.featuredContent}>
                            <View style={styles.badge}>
                                <Text style={styles.badgeText}>NEW ARRIVAL</Text>
                            </View>
                            <Text numberOfLines={2} style={styles.featuredTitle}>
                                {featuredVideo.title}
                            </Text>
                            <Text numberOfLines={1} style={styles.featuredSubtitle}>
                                {featuredVideo.subject || 'General'} · {featuredVideo.teacher?.name || 'Unknown Teacher'}
                            </Text>
                            <TouchableOpacity
                                style={styles.bannerButton}
                                onPress={() => navigation.navigate('Detail', { id: featuredVideo.id })}
                            >
                                <Text style={styles.bannerButtonText}>Watch Now</Text>
                                <Ionicons name="play-circle" size={16} color={colors.purple} style={{ marginLeft: 4 }} />
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/* Avatares fake de profesores */}
                <Text style={styles.sectionTitle}>Top Teachers</Text>
                <View style={styles.avatarRow}>
                    {['Laura', 'Carlos', 'Ana', 'Guest'].map((name) => (
                        <View key={name} style={styles.avatarWrapper}>
                            <View style={styles.avatarOuter}>
                                <View style={styles.avatarInner}>
                                    <Text style={styles.avatarInitial}>{name.charAt(0)}</Text>
                                </View>
                            </View>
                            <Text style={styles.avatarLabel}>{name}</Text>
                        </View>
                    ))}
                </View>

                <Text style={styles.sectionTitle}>Recommended for you</Text>
            </>
        );
    };

    return (
        <SafeAreaView style={styles.screen}>
            {loading && videos.length === 0 ? (
                <View style={styles.center}>
                    <ActivityIndicator color={colors.cyanLight} />
                </View>
            ) : error ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                </View>
            ) : (
                <FlatList
                    data={videos}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    ListHeaderComponent={ListHeader}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={styles.listContent}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    listContent: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.xl,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.md,
        marginBottom: spacing.lg,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    iconButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarRow: {
        flexDirection: 'row',
        marginBottom: spacing.lg,
    },
    avatarWrapper: {
        alignItems: 'center',
        marginRight: spacing.md,
    },
    avatarOuter: {
        width: 56,
        height: 56,
        borderRadius: 28,
        padding: 2,
        backgroundColor: '#4C1D95',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInner: {
        width: 50,
        height: 50,
        borderRadius: 25,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarInitial: {
        fontSize: 20,
        fontWeight: '700',
        color: colors.textPrimary,
    },
    avatarLabel: {
        marginTop: 6,
        fontSize: 12,
        color: colors.textSecondary,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.textPrimary,
        marginBottom: spacing.sm,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#F97373',
        fontSize: 14,
        textAlign: 'center',
        paddingHorizontal: spacing.lg,
    },
    greeting: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    featuredBanner: {
        height: 180,
        backgroundColor: colors.purple,
        borderRadius: radius['3xl'],
        marginBottom: spacing.lg,
        padding: spacing.lg,
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    bannerIconBg: {
        position: 'absolute',
        right: -10,
        bottom: -10,
        transform: [{ rotate: '-15deg' }],
    },
    badge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: radius.full,
        alignSelf: 'flex-start',
        marginBottom: spacing.sm,
    },
    badgeText: {
        fontSize: 10,
        fontWeight: '700',
        color: '#FFF',
        letterSpacing: 0.5,
    },
    featuredTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: '#FFF',
        marginBottom: 4,
        lineHeight: 28,
    },
    featuredSubtitle: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: spacing.md,
    },
    bannerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFF',
        paddingHorizontal: spacing.md,
        paddingVertical: 8,
        borderRadius: radius.full,
        alignSelf: 'flex-start',
    },
    bannerButtonText: {
        color: colors.purple,
        fontWeight: '700',
        fontSize: 12,
    },
});
