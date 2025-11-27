// src/screens/ProfileScreen.js
import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';

import { colors, spacing, radius } from '../theme/design';
import { getVideos } from '../api/videosApi';
import VideoCard from '../components/VideoCard';

import { useAuth } from '../context/AuthContext';

const TEACHER_SUBJECT_FALLBACK = 'General';

export default function ProfileScreen() {
    const navigation = useNavigation();
    const { user, logout } = useAuth();
    const [videos, setVideos] = useState([]);
    const [loadingVideos, setLoadingVideos] = useState(true);
    const [errorVideos, setErrorVideos] = useState(null);

    const loadVideos = useCallback(async () => {
        try {
            setErrorVideos(null);
            setLoadingVideos(true);
            const data = await getVideos({ teacherId: user.id, limit: 50 });
            // adapta esto a cómo responde tu backend (/items devuelve array o {items: []})
            setVideos(data.items || data || []);
        } catch (err) {
            console.error('Error loading teacher videos', err);
            setErrorVideos('No se pudieron cargar las clases del profesor.');
        } finally {
            setLoadingVideos(false);
        }
    }, [user.id]);

    useEffect(() => {
        loadVideos();
    }, [loadVideos]);

    const onPressCreate = () => {
        navigation.navigate('CreateItem');
    };

    const renderVideoItem = ({ item }) => (
        <VideoCard
            video={item}
            onPress={() => navigation.navigate('Detail', { id: item.id })}
        />
    );

    const totalVideos = videos.length;
    const freeVideos = videos.filter((v) => Number(v.price || 0) === 0).length;
    const paidVideos = totalVideos - freeVideos;

    // Si algún vídeo trae subject (category) lo usamos para subtítulo
    const mainSubject =
        (videos[0]?.subject || videos[0]?.category || TEACHER_SUBJECT_FALLBACK);

    return (
        <SafeAreaView style={styles.container}>
            {/* HEADER */}
            <View style={styles.headerRow}>
                <Text style={styles.headerTitle}>Profile</Text>
                <Ionicons name="ellipsis-vertical" size={20} color={colors.textSecondary} />
            </View>

            {/* PROFILE CARD */}
            <LinearGradient
                colors={['#1F2933', '#111827']}
                style={styles.profileCard}
            >
                <View style={styles.profileTopRow}>
                    {/* Avatar circular con iniciales */}
                    <View style={styles.avatarWrapper}>
                        <LinearGradient
                            colors={['#A855F7', '#EC4899']}
                            style={styles.avatarOuter}
                        >
                            <View style={styles.avatarInner}>
                                <Text style={styles.avatarInitial}>
                                    {user.name ? user.name.charAt(0) : '?'}
                                </Text>
                            </View>
                        </LinearGradient>
                    </View>

                    <View style={styles.profileText}>
                        <Text style={styles.teacherName}>{user.name}</Text>
                        <Text style={styles.teacherSubtitle}>
                            {user.email}
                        </Text>
                    </View>
                </View>

                {/* Stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{totalVideos}</Text>
                        <Text style={styles.statLabel}>Clases</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{freeVideos}</Text>
                        <Text style={styles.statLabel}>Gratis</Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statNumber}>{paidVideos}</Text>
                        <Text style={styles.statLabel}>Premium</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actionsRow}>
                    <TouchableOpacity style={styles.primaryButton} onPress={onPressCreate}>
                        <Text style={styles.primaryButtonText}>Subir nueva clase</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.secondaryButton} onPress={logout}>
                        <Ionicons name="log-out-outline" size={18} color={colors.textPrimary} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            {/* TITLE LISTA */}
            <View style={styles.listHeaderRow}>
                <Text style={styles.listTitle}>Clases del profesor</Text>
                <Text style={styles.listSubtitle}>{totalVideos} vídeos</Text>
            </View>

            {/* LISTA DE VÍDEOS */}
            {loadingVideos ? (
                <View style={styles.center}>
                    <ActivityIndicator color={colors.cyanLight} />
                    <Text style={styles.helperText}>Cargando clases...</Text>
                </View>
            ) : errorVideos ? (
                <View style={styles.center}>
                    <Text style={styles.errorText}>{errorVideos}</Text>
                </View>
            ) : totalVideos === 0 ? (
                <View style={styles.center}>
                    <Text style={styles.helperText}>
                        Este profesor aún no tiene clases publicadas.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={videos}
                    keyExtractor={(item) => item.id}
                    renderItem={renderVideoItem}
                    showsVerticalScrollIndicator={false}
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
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.md,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    profileCard: {
        borderRadius: radius['3xl'],
        padding: spacing.lg,
        marginBottom: spacing.lg,
    },
    profileTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    avatarWrapper: {
        marginRight: spacing.md,
    },
    avatarOuter: {
        width: 72,
        height: 72,
        borderRadius: 999,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInner: {
        width: 66,
        height: 66,
        borderRadius: 999,
        backgroundColor: colors.background,
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarInitial: {
        fontSize: 26,
        color: colors.textPrimary,
        fontWeight: '700',
    },
    profileText: {
        flex: 1,
    },
    teacherName: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    teacherSubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    statsRow: {
        flexDirection: 'row',
        marginTop: spacing.lg,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statNumber: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    statLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    actionsRow: {
        flexDirection: 'row',
        marginTop: spacing.lg,
        alignItems: 'center',
    },
    primaryButton: {
        flex: 1,
        backgroundColor: colors.purple,
        paddingVertical: spacing.sm,
        borderRadius: radius.xl,
        alignItems: 'center',
        justifyContent: 'center',
    },
    primaryButtonText: {
        color: colors.textPrimary,
        fontWeight: '600',
        fontSize: 14,
    },
    secondaryButton: {
        width: 40,
        height: 40,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#4B5563',
        alignItems: 'center',
        justifyContent: 'center',
        marginLeft: spacing.sm,
    },
    listHeaderRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    listTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: colors.textPrimary,
    },
    listSubtitle: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    listContent: {
        paddingBottom: spacing.lg,
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
