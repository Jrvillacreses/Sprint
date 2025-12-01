import React, { useEffect, useState, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
    TouchableOpacity,
    Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import YoutubePlayer from 'react-native-youtube-iframe';
import { getVideo, updateVideo, deleteVideo } from '../api/videosApi';
import { colors, spacing, radius } from '../theme/design';
// 1. IMPORTAR USEAUTH
import { useAuth } from '../context/AuthContext';

function extractYouTubeId(url = '') {
    try {
        if (url.includes('youtu.be/')) {
            return url.split('youtu.be/')[1].split(/[?&]/)[0];
        }
        const vParam = url.split('v=')[1];
        if (vParam) {
            return vParam.split('&')[0];
        }
        return '';
    } catch {
        return '';
    }
}

export default function DetailScreen({ route, navigation }) {
    const { id } = route.params;
    const { can } = useAuth(); // 2. OBTENER PERMISOS

    const [video, setVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [playing, setPlaying] = useState(false);

    const load = useCallback(async () => {
        try {
            const data = await getVideo(id);
            setVideo(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [id]);

    useEffect(() => {
        load();
    }, [load]);

    // Funciones Mock para botones administrativos
    const handleEdit = () => {
        // Navegar pasando el ID actual
        navigation.navigate('EditItem', { id: video.id });
    };

    const handleDelete = () => {
        Alert.alert(
            'Desactivar Ítem',
            '¿Estás seguro? El ítem dejará de estar visible.',
            [
                { text: 'Cancelar', style: 'cancel' },
                {
                    text: 'Desactivar',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await deleteVideo(id); // <--- Llamada real

                            // Navegar atrás (Home o Panel) indicando que se borró
                            // (Aunque el useFocusEffect de Home recargará solo)
                            navigation.goBack();
                            Alert.alert("Admin", "Ítem desactivado correctamente");
                        } catch (error) {
                            console.error(error);
                            setLoading(false);
                            Alert.alert("Error", "No se pudo desactivar el ítem");
                        }
                    }
                }
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator color={colors.cyanLight} />
            </View>
        );
    }

    if (!video) {
        return (
            <View style={styles.center}>
                <Text style={{ color: colors.textPrimary }}>Video not found</Text>
            </View>
        );
    }

    const youtubeId = extractYouTubeId(video.videoUrl);

    return (
        <View style={styles.page}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={{ paddingBottom: spacing.xl + 60 }}
            >
                <View style={styles.card}>
                    {/* PLAYER */}
                    <View style={styles.playerWrapper}>
                        {youtubeId ? (
                            <YoutubePlayer
                                height={220}
                                play={playing}
                                videoId={youtubeId}
                                onChangeState={(state) => setPlaying(state === 'playing')}
                            />
                        ) : (
                            <View style={styles.playerPlaceholder}>
                                <Text style={{ color: colors.textSecondary }}>No valid YouTube URL</Text>
                            </View>
                        )}
                    </View>

                    {/* INFO */}
                    <View style={styles.mainInfo}>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.videoTitle}>{video.title}</Text>
                            <Text style={styles.metaLine}>
                                {video.subject || 'General'} ·{' '}
                                <Text style={styles.metaDim}>{video.teacher?.name || 'Unknown'}</Text>
                            </Text>
                            <Text style={styles.metaDim}>
                                {video.price === 0 ? 'Free lesson' : `${video.price} €`}
                            </Text>
                        </View>
                        <View style={styles.actionButtons}>
                            <View style={styles.pillButton}>
                                <Text style={styles.pillText}>Subscribe</Text>
                            </View>
                        </View>
                    </View>

                    {/* ACTIONS ROW */}
                    <View style={styles.actionsRow}>
                        <ActionChip icon="thumbs-up-outline" label="15K" />
                        <ActionChip icon="chatbubble-outline" label="1.2K" />
                        <ActionChip icon="bookmark-outline" label="Save" />
                        <ActionChip icon="download-outline" label="Download" />
                    </View>

                    {/* ZONA ADMINISTRATIVA CONDICIONAL */}
                    {(can('ITEM_EDIT') || can('ITEM_DEACTIVATE')) && (
                        <View style={styles.adminSection}>
                            <Text style={styles.adminTitle}>Admin Controls</Text>
                            <View style={styles.adminButtonsRow}>
                                {can('ITEM_EDIT') && (
                                    <TouchableOpacity style={[styles.adminBtn, styles.editBtn]} onPress={handleEdit}>
                                        <Ionicons name="create-outline" size={18} color="#FFF" />
                                        <Text style={styles.adminBtnText}>Editar</Text>
                                    </TouchableOpacity>
                                )}
                                {can('ITEM_DEACTIVATE') && (
                                    <TouchableOpacity style={[styles.adminBtn, styles.deleteBtn]} onPress={handleDelete}>
                                        <Ionicons name="trash-outline" size={18} color="#FFF" />
                                        <Text style={styles.adminBtnText}>Desactivar</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    )}

                    <Text style={styles.sectionTitle}>Comments</Text>
                    <View style={styles.commentRow}>
                        <View style={styles.commentAvatar} />
                        <View style={{ flex: 1 }}>
                            <Text style={styles.commentName}>@student</Text>
                            <Text style={styles.commentText}>
                                Great explanation, it helped me understand the topic much better!
                            </Text>
                        </View>
                    </View>
                </View>
            </ScrollView>

            <TouchableOpacity
                style={styles.stickyBackButton}
                onPress={() => navigation.goBack()}
                activeOpacity={0.8}
            >
                <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
            </TouchableOpacity>
        </View>
    );

}

function ActionChip({ icon, label }) {
    return (
        <View style={styles.actionChip}>
            <Ionicons name={icon} size={16} color={colors.textSecondary} />
            <Text style={styles.actionChipText}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    page: { flex: 1, backgroundColor: colors.background },
    scroll: { flex: 1, paddingHorizontal: spacing.lg, paddingTop: spacing.lg },
    center: { flex: 1, backgroundColor: colors.background, alignItems: 'center', justifyContent: 'center' },
    card: { backgroundColor: colors.backgroundSecondary, borderRadius: radius['3xl'], padding: spacing.md },
    playerWrapper: { borderRadius: radius['2xl'], overflow: 'hidden', marginBottom: spacing.md, backgroundColor: '#000' },
    playerPlaceholder: { height: 220, alignItems: 'center', justifyContent: 'center' },
    mainInfo: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
    videoTitle: { fontSize: 18, fontWeight: '600', color: colors.textPrimary, marginBottom: 4 },
    metaLine: { fontSize: 13, color: colors.textSecondary },
    metaDim: { color: colors.textSecondary },
    actionButtons: { alignItems: 'flex-end' },
    pillButton: { backgroundColor: colors.purple, borderRadius: radius.full, paddingHorizontal: spacing.md, paddingVertical: spacing.xs },
    pillText: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
    actionsRow: { flexDirection: 'row', marginBottom: spacing.md, marginTop: spacing.sm },
    actionChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.inputBg, borderRadius: radius.full, paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, marginRight: spacing.xs },
    actionChipText: { fontSize: 12, color: colors.textSecondary, marginLeft: 4 },
    sectionTitle: { fontSize: 14, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.sm, marginTop: spacing.md },
    commentRow: { flexDirection: 'row', alignItems: 'flex-start' },
    commentAvatar: { width: 32, height: 32, borderRadius: 999, backgroundColor: colors.inputBg, marginRight: spacing.sm },
    commentName: { fontSize: 13, color: colors.textPrimary, fontWeight: '500' },
    commentText: { fontSize: 12, color: colors.textSecondary },
    stickyBackButton: { position: 'absolute', bottom: 30, right: 20, width: 50, height: 50, borderRadius: 25, backgroundColor: colors.purple, alignItems: 'center', justifyContent: 'center', elevation: 5, zIndex: 100 },

    // NUEVOS ESTILOS ADMIN
    adminSection: {
        marginTop: spacing.md,
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: colors.inputBg,
    },
    adminTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        textTransform: 'uppercase',
    },
    adminButtonsRow: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    adminBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
        borderRadius: radius.lg,
        gap: 6,
    },
    editBtn: { backgroundColor: colors.cyanLight }, // Puedes ajustar el color aquí
    deleteBtn: { backgroundColor: '#EF4444' },
    adminBtnText: { color: '#FFF', fontWeight: '600', fontSize: 14 },
});