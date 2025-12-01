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
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { colors, spacing, radius } from '../theme/design';
import { getVideos } from '../api/videosApi';
import VideoCard from '../components/VideoCard';
import { useAuth } from '../context/AuthContext';

export default function HomeScreen() {
    const navigation = useNavigation();
    const { user, can } = useAuth();

    const [videos, setVideos] = useState([]);
    const [favoriteIds, setFavoriteIds] = useState(new Set());
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const loadData = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);

            // 1. Cargar videos del backend REAL
            // Filtramos para ver solo activos, salvo que seas admin que ve todo en el panel
            const videosRes = await getVideos({ page: 1, limit: 30, sort: 'created_at', order: 'DESC' });

            // 2. Cargar favoritos LOCALES
            const localFavs = await AsyncStorage.getItem(`favorites_${user.id}`);
            const parsedFavs = localFavs ? JSON.parse(localFavs) : [];

            const vids = videosRes.items || videosRes || [];

            setVideos(vids);
            setFavoriteIds(new Set(parsedFavs));
        } catch (err) {
            console.error('Error loading home data', err);
            setError('No se pudieron cargar los datos.');
        } finally {
            setLoading(false);
        }
    }, [user.id]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData]),
    );

    // --- Toggle favorito LOCAL ---
    const handleToggleFavorite = async (video) => {
        const isFav = favoriteIds.has(video.id);

        const nextFavs = new Set(favoriteIds);
        if (isFav) nextFavs.delete(video.id);
        else nextFavs.add(video.id);

        setFavoriteIds(nextFavs);

        try {
            await AsyncStorage.setItem(
                `favorites_${user.id}`,
                JSON.stringify(Array.from(nextFavs))
            );
        } catch (e) {
            console.error("Error guardando favoritos", e);
        }
    };

    const renderItem = ({ item }) => (
        <VideoCard
            video={item}
            onPress={() => navigation.navigate('Detail', { id: item.id })}
            isFavorite={favoriteIds.has(item.id)}
            onToggleFavorite={() => handleToggleFavorite(item)}
        />
    );

    const ListHeader = () => {
        const featuredVideo = videos.length > 0 ? videos[0] : null;

        // DATOS MOCK DE PROFESORES CON PERFIL COMPLETO
        const topTeachers = [
            { id: 't1', name: 'Laura', role: 'TEACHER', bio: 'Experta en UX/UI y Diseño Móvil', email: 'laura@teacher.com' },
            { id: 't2', name: 'Carlos', role: 'TEACHER', bio: 'Desarrollador Senior React Native', email: 'carlos@teacher.com' },
            { id: 't3', name: 'Ana', role: 'TEACHER', bio: 'Arquitecta de Software Cloud', email: 'ana@teacher.com' },
            { id: 't4', name: 'Guest', role: 'TEACHER', bio: 'Profesor Invitado', email: 'guest@teacher.com' },
        ];

        return (
            <>
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.headerTitle}>{user?.name || 'Student'}</Text>
                    </View>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="notifications-outline" size={22} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>

                {/* Banner destacado */}
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

                <Text style={styles.sectionTitle}>Top Teachers</Text>

                {/* LISTA DE PROFESORES CLICKEABLE */}
                <View style={styles.avatarRow}>
                    {topTeachers.map((teacher) => (
                        <TouchableOpacity
                            key={teacher.id}
                            style={styles.avatarWrapper}
                            onPress={() => navigation.navigate('TeacherProfile', { user: teacher })}
                        >
                            <View style={styles.avatarOuter}>
                                <View style={styles.avatarInner}>
                                    <Text style={styles.avatarInitial}>{teacher.name.charAt(0)}</Text>
                                </View>
                            </View>
                            <Text style={styles.avatarLabel}>{teacher.name}</Text>
                        </TouchableOpacity>
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
                <>
                    <FlatList
                        data={videos}
                        keyExtractor={(item) => item.id}
                        renderItem={renderItem}
                        ListHeaderComponent={ListHeader}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.listContent}
                    />

                    {/* Botón FAB condicional (Solo ADMIN) */}
                    {can('ITEM_CREATE') && (
                        <TouchableOpacity
                            style={styles.fab}
                            onPress={() => navigation.navigate('CreateItem')}
                            activeOpacity={0.8}
                        >
                            <Ionicons name="add" size={32} color="#FFF" />
                        </TouchableOpacity>
                    )}
                </>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    listContent: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: spacing.md, marginBottom: spacing.lg },
    headerTitle: { fontSize: 24, fontWeight: '600', color: colors.textPrimary },
    iconButton: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
    avatarRow: { flexDirection: 'row', marginBottom: spacing.lg },
    avatarWrapper: { alignItems: 'center', marginRight: spacing.md },
    avatarOuter: { width: 56, height: 56, borderRadius: 28, padding: 2, backgroundColor: '#4C1D95', justifyContent: 'center', alignItems: 'center' },
    avatarInner: { width: 50, height: 50, borderRadius: 25, backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center' },
    avatarInitial: { fontSize: 20, fontWeight: '700', color: colors.textPrimary },
    avatarLabel: { marginTop: 6, fontSize: 12, color: colors.textSecondary },
    sectionTitle: { fontSize: 18, fontWeight: '500', color: colors.textPrimary, marginBottom: spacing.sm },
    center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorText: { color: '#F97373', fontSize: 14, textAlign: 'center' },
    greeting: { fontSize: 14, color: colors.textSecondary, marginBottom: 2 },
    featuredBanner: { height: 180, backgroundColor: colors.purple, borderRadius: radius['3xl'], marginBottom: spacing.lg, padding: spacing.lg, justifyContent: 'center', overflow: 'hidden', position: 'relative' },
    bannerIconBg: { position: 'absolute', right: -10, bottom: -10, transform: [{ rotate: '-15deg' }] },
    featuredContent: { zIndex: 1 },
    badge: { backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: spacing.sm, paddingVertical: 4, borderRadius: radius.full, alignSelf: 'flex-start', marginBottom: spacing.sm },
    badgeText: { fontSize: 10, fontWeight: '700', color: '#FFF' },
    featuredTitle: { fontSize: 24, fontWeight: '800', color: '#FFF', marginBottom: 4 },
    featuredSubtitle: { fontSize: 14, color: 'rgba(255,255,255,0.9)', marginBottom: spacing.md },
    bannerButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', paddingHorizontal: spacing.md, paddingVertical: 8, borderRadius: radius.full, alignSelf: 'flex-start' },
    bannerButtonText: { color: colors.purple, fontWeight: '700', fontSize: 12 },
    fab: { position: 'absolute', bottom: 24, right: 24, width: 56, height: 56, borderRadius: 28, backgroundColor: colors.purple, justifyContent: 'center', alignItems: 'center', elevation: 6, shadowColor: colors.purple, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, zIndex: 999 },
});