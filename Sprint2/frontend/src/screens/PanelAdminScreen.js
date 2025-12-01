import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors, spacing, radius } from '../theme/design';
import { getVideos } from '../api/videosApi';
import { deleteVideo, updateVideo } from '../api/videosApi';

export default function PanelAdminScreen() {
    const navigation = useNavigation();
    const [recentVideos, setRecentVideos] = useState([]);
    const [stats, setStats] = useState({ total: 0, views: '12.5K', active: 145 }); // MOCK DATA
    const [refreshing, setRefreshing] = useState(false);

    const loadData = async () => {
        try {
            // Cargamos videos reales para la lista de "Recientes"
            const res = await getVideos({ limit: 5, sort: 'created_at', order: 'DESC', all: true });
            const items = res.items || res || [];

            setRecentVideos(items);
            // Actualizamos el contador real de videos
            setStats(prev => ({ ...prev, total: items.length || 0 }));
        } catch (error) {
            console.error("Error cargando panel admin", error);
        }
    };
    const handleReactivate = (id) => {
        Alert.alert(
            "Reactivar Video",
            "¿Deseas reactivar este video? Volverá a ser visible para todos los alumnos.",
            [
                { text: "Cancelar", style: "cancel" },
                {
                    text: "Sí, Reactivar",
                    onPress: async () => {
                        try {
                            console.log("🔄 Intentando reactivar ID:", id);

                            // Usamos el endpoint PATCH
                            await updateVideo(id, { isActive: true });

                            // Recargamos la lista
                            await loadData();

                            console.log("✅ Video reactivado correctamente");
                        } catch (error) {
                            console.error("❌ ERROR AL REACTIVAR:");
                            console.error(error);

                            if (error.response) {
                                alert(`Error del servidor: ${error.response.status}`);
                            } else if (error.request) {
                                alert("Error de conexión. Revisa tu red.");
                            } else {
                                alert("Error desconocido al reactivar.");
                            }
                        }
                    }
                }
            ]
        );
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await loadData();
        setRefreshing(false);
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [])
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView
                contentContainerStyle={styles.scrollContent}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.purple} />}
            >
                {/* HEADER */}
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Admin Dashboard</Text>
                    <Text style={styles.headerSubtitle}>Resumen general y gestión</Text>
                </View>

                {/* SECCIÓN 1: ESTADÍSTICAS (MOCK) */}
                <View style={styles.statsRow}>
                    <StatCard icon="videocam" value={stats.total} label="Videos" color={colors.purple} />
                    <StatCard icon="eye" value={stats.views} label="Vistas Totales" color={colors.cyanLight} />
                    <StatCard icon="people" value={stats.active} label="Usuarios" color="#F59E0B" />
                </View>

                {/* SECCIÓN 2: ACCIONES RÁPIDAS (MENÚ) */}
                <Text style={styles.sectionTitle}>Acciones Rápidas</Text>
                <View style={styles.actionsGrid}>

                    {/* Botón: Crear Nuevo Item */}
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('CreateItem')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(124, 58, 237, 0.1)' }]}>
                            <Ionicons name="cloud-upload" size={28} color={colors.purple} />
                        </View>
                        <Text style={styles.actionText}>Subir Video</Text>
                    </TouchableOpacity>

                    {/* Botón: Gestionar (Ir a Home para editar) */}
                    <TouchableOpacity
                        style={styles.actionCard}
                        onPress={() => navigation.navigate('Home')}
                    >
                        <View style={[styles.iconCircle, { backgroundColor: 'rgba(6, 182, 212, 0.1)' }]}>
                            <Ionicons name="list" size={28} color={colors.cyanLight} />
                        </View>
                        <Text style={styles.actionText}>Gestionar Items</Text>
                    </TouchableOpacity>
                </View>

                {/* SECCIÓN 3: LISTA DE ÍTEMS RECIENTES */}
                <View style={styles.listHeader}>
                    <Text style={styles.sectionTitle}>Subidos Recientemente</Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Home')}>
                        <Text style={styles.seeAll}>Ver todos</Text>
                    </TouchableOpacity>
                </View>

                {recentVideos.map((video) => {
                    // Detectamos si está inactivo (si tu backend no devuelve isActive, asegúrate de que la entidad lo tenga)
                    const isInactive = video.isActive === false;

                    return (
                        <View
                            key={video.id}
                            style={[
                                styles.itemRow,
                                isInactive && styles.itemRowInactive // Estilo condicional
                            ]}
                        >
                            {/* Parte izquierda: Clic para ir al detalle */}
                            <TouchableOpacity
                                style={{ flex: 1, flexDirection: 'row', alignItems: 'center' }}
                                onPress={() => navigation.navigate('Detail', { id: video.id })}
                            >
                                <View style={styles.itemIcon}>
                                    <Ionicons
                                        name={isInactive ? "eye-off" : "play-circle"}
                                        size={24}
                                        color={isInactive ? colors.textSecondary : colors.purple}
                                    />
                                </View>
                                <View style={styles.itemInfo}>
                                    <Text
                                        style={[styles.itemTitle, isInactive && { color: colors.textSecondary }]}
                                        numberOfLines={1}
                                    >
                                        {video.title}
                                    </Text>

                                    {/* Etiqueta de estado */}
                                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                                        <Text style={styles.itemSub}>{video.subject || 'General'}</Text>
                                        {isInactive && (
                                            <View style={styles.inactiveBadge}>
                                                <Text style={styles.inactiveText}>INACTIVO</Text>
                                            </View>
                                        )}
                                    </View>
                                </View>
                            </TouchableOpacity>

                            {/* Parte derecha: ACCIONES */}
                            <View style={{ flexDirection: 'row', gap: 12 }}>

                                {/* Botón EDITAR (Siempre visible) */}
                                <TouchableOpacity onPress={() => navigation.navigate('EditItem', { id: video.id })}>
                                    <Ionicons name="pencil" size={20} color={colors.cyanLight} />
                                </TouchableOpacity>

                                {isInactive ? (
                                    // SI ESTÁ INACTIVO -> MOSTRAR BOTÓN "REACTIVAR"
                                    <TouchableOpacity onPress={() => handleReactivate(video.id)}>
                                        <Ionicons name="refresh-circle" size={22} color="#10B981" />
                                    </TouchableOpacity>
                                ) : (
                                    // SI ESTÁ ACTIVO -> MOSTRAR BOTÓN "BORRAR"
                                    <TouchableOpacity onPress={() => {
                                        Alert.alert("Desactivar", "¿Ocultar este video de la App?", [
                                            { text: "No" },
                                            {
                                                text: "Sí",
                                                onPress: async () => {
                                                    try {
                                                        console.log("Intentando desactivar ID:", video.id); // <--- Log 1
                                                        await deleteVideo(video.id);
                                                        await loadData(); // Es buena práctica esperar la recarga
                                                        console.log("Desactivado correctamente");
                                                    } catch (error) {
                                                        // <--- AQUÍ CAPTURAMOS EL ERROR
                                                        console.error("❌ ERROR AL DESACTIVAR:");
                                                        console.error(error);

                                                        if (error.response) {
                                                            // El servidor respondió con un código de error (404, 500, etc.)
                                                            console.error("Datos Servidor:", error.response.data);
                                                            console.error("Status:", error.response.status);
                                                            alert(`Error del servidor: ${error.response.status}`);
                                                        } else if (error.request) {
                                                            // La petición salió pero no hubo respuesta (Error de red/IP)
                                                            console.error("Error de red: No hubo respuesta del servidor.");
                                                            alert("Error de conexión. Revisa tu IP.");
                                                        } else {
                                                            alert("Error desconocido: " + error.message);
                                                        }
                                                    }
                                                }
                                            }
                                        ])
                                    }}>
                                        <Ionicons name="trash" size={20} color="#EF4444" />
                                    </TouchableOpacity>
                                )}
                            </View>
                        </View>
                    );
                })}

            </ScrollView>
        </SafeAreaView>
    );
}

// Componente auxiliar para tarjeta de estadística
function StatCard({ icon, value, label, color }) {
    return (
        <View style={styles.statCard}>
            <Ionicons name={icon} size={24} color={color} style={{ marginBottom: 8 }} />
            <Text style={styles.statValue}>{value}</Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: { padding: spacing.lg },
    header: { marginBottom: spacing.xl },
    headerTitle: { fontSize: 28, fontWeight: 'bold', color: colors.textPrimary },
    headerSubtitle: { fontSize: 16, color: colors.textSecondary, marginTop: 4 },

    // Stats
    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.xl },
    statCard: {
        flex: 1, backgroundColor: colors.backgroundSecondary, borderRadius: radius.xl,
        padding: spacing.md, alignItems: 'center', marginHorizontal: 4,
        borderWidth: 1, borderColor: colors.inputBg
    },
    statValue: { fontSize: 20, fontWeight: 'bold', color: colors.textPrimary },
    statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

    // Actions
    sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary, marginBottom: spacing.md },
    actionsGrid: { flexDirection: 'row', gap: spacing.md, marginBottom: spacing.xl },
    actionCard: {
        flex: 1, backgroundColor: colors.backgroundSecondary, borderRadius: radius.xl,
        padding: spacing.lg, alignItems: 'center', justifyContent: 'center',
        borderWidth: 1, borderColor: colors.inputBg
    },
    iconCircle: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
    actionText: { fontSize: 14, fontWeight: '600', color: colors.textPrimary },

    // List
    listHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.md },
    seeAll: { color: colors.purple, fontSize: 14, fontWeight: '600' },
    itemRow: {
        flexDirection: 'row', alignItems: 'center', padding: spacing.md,
        backgroundColor: colors.backgroundSecondary, borderRadius: radius.lg, marginBottom: spacing.sm
    },
    itemIcon: { marginRight: spacing.md },
    itemInfo: { flex: 1 },
    itemTitle: { fontSize: 15, fontWeight: '500', color: colors.textPrimary },
    itemSub: { fontSize: 12, color: colors.textSecondary },
    itemRowInactive: {
        opacity: 0.7,
        backgroundColor: 'rgba(0,0,0,0.2)', // Un fondo más oscuro
        borderLeftWidth: 3,
        borderLeftColor: colors.textSecondary,
    },
    inactiveBadge: {
        backgroundColor: colors.textSecondary,
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 4,
    },
    inactiveText: {
        color: '#000',
        fontSize: 10,
        fontWeight: 'bold',
    },
});