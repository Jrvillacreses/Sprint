import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, Alert,
    TextInput, ScrollView, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../theme/design';
// Importamos useRoute para recibir parámetros
import { useRoute, useNavigation } from '@react-navigation/native';

export default function ProfileScreen() {
    const { user: loggedUser, logout, updateProfile, can } = useAuth(); // Renombramos a loggedUser
    const route = useRoute();
    const navigation = useNavigation();

    // Si viene un usuario por parámetros (Teacher), lo usamos. Si no, usamos el logueado.
    const paramUser = route.params?.user;
    const isOwnProfile = !paramUser; // Es mi perfil si no hay parámetros
    const user = isOwnProfile ? loggedUser : paramUser;

    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState(user?.name || '');
    const [editBio, setEditBio] = useState(user?.bio || '');

    // Actualizamos el estado si cambia el usuario (ej: navegación rápida)
    useEffect(() => {
        setEditName(user?.name || '');
        setEditBio(user?.bio || '');
    }, [user]);

    const completedCount = user?.completedVideos?.length || 0;

    const startEditing = () => {
        setEditName(user?.name);
        setEditBio(user?.bio || '');
        setIsEditing(true);
    };

    const handleSave = async () => {
        await updateProfile({ name: editName, bio: editBio });
        setIsEditing(false);
        Alert.alert("Perfil Actualizado", "Tus datos se han guardado localmente.");
    };

    const handleLogout = () => {
        Alert.alert("Cerrar Sesión", "¿Estás seguro?", [
            { text: "Cancelar", style: "cancel" },
            { text: "Salir", style: "destructive", onPress: () => logout() }
        ]);
    };

    const handleDownloadCertificate = (courseTitle) => {
        Alert.alert("Descargando Certificado 🎓", `Generando PDF para:\n"${courseTitle}"`, [{ text: "Genial" }]);
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={{ flexGrow: 1, paddingBottom: 40 }}>

                    {/* HEADER (Botón volver si es TeacherProfile) */}
                    {!isOwnProfile && (
                        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                            <Text style={styles.backText}>Volver</Text>
                        </TouchableOpacity>
                    )}

                    <View style={styles.header}>
                        <View style={styles.avatarContainer}>
                            <Text style={styles.avatarText}>{user?.name?.charAt(0) || "U"}</Text>
                            <View style={styles.roleBadgeIcon}>
                                <Ionicons
                                    name={user?.role === 'ADMIN' ? "shield-checkmark" : (user?.role === 'TEACHER' ? "school" : "person")}
                                    size={16} color="#FFF"
                                />
                            </View>
                        </View>

                        {!isEditing ? (
                            <>
                                <Text style={styles.name}>{user?.name || "Usuario"}</Text>
                                <Text style={styles.bio}>{user?.bio || "Sin biografía"}</Text>
                                <View style={styles.roleTag}>
                                    <Text style={styles.roleText}>{user?.role || "GUEST"}</Text>
                                </View>
                            </>
                        ) : (
                            <View style={styles.editForm}>
                                <Text style={styles.label}>Nombre</Text>
                                <TextInput style={styles.input} value={editName} onChangeText={setEditName} />
                                <Text style={styles.label}>Biografía</Text>
                                <TextInput style={styles.input} value={editBio} onChangeText={setEditBio} />
                            </View>
                        )}
                    </View>

                    {/* ESTADÍSTICAS (Visible para todos) */}
                    {!isEditing && (
                        <View style={styles.statsCard}>
                            <View style={styles.statItem}>
                                {/* Si es profesor mostramos "Cursos Impartidos", si es alumno "Finalizados" */}
                                <Text style={styles.statNumber}>{user?.role === 'TEACHER' ? '12' : completedCount}</Text>
                                <Text style={styles.statLabel}>{user?.role === 'TEACHER' ? 'Cursos' : 'Finalizados'}</Text>
                            </View>
                            <View style={styles.verticalDivider} />
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{user?.permissions?.length || 0}</Text>
                                <Text style={styles.statLabel}>Permisos</Text>
                            </View>
                        </View>
                    )}

                    {/* INFO DE CONTACTO */}
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Información</Text>
                        <View style={styles.infoRow}>
                            <Ionicons name="mail-outline" size={20} color={colors.textSecondary} />
                            <Text style={styles.infoText}>{user?.email || "email@bootcamp.com"}</Text>
                        </View>
                    </View>

                    {/* CERTIFICADOS (Solo si es MI perfil y soy ALUMNO/USER) */}
                    {isOwnProfile && completedCount > 0 && !isEditing && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Mis Certificados</Text>
                            {user.completedVideos.map((video) => (
                                <View key={video.id} style={styles.certRow}>
                                    <Ionicons name="ribbon" size={24} color="#F59E0B" />
                                    <View style={{ flex: 1 }}>
                                        <Text style={styles.certTitle}>{video.title}</Text>
                                        <Text style={styles.certDate}>{video.date}</Text>
                                    </View>
                                    <TouchableOpacity onPress={() => handleDownloadCertificate(video.title)}>
                                        <Ionicons name="download-outline" size={20} color={colors.purple} />
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}

                    {/* BOTONES DE ACCIÓN (Solo si es MI perfil) */}
                    {isOwnProfile && (
                        <View style={styles.footer}>
                            {can('PROFILE_EDIT') && !isEditing && (
                                <TouchableOpacity style={styles.btnPrimary} onPress={startEditing}>
                                    <Ionicons name="create-outline" size={20} color="#FFF" />
                                    <Text style={styles.btnText}>Editar Perfil</Text>
                                </TouchableOpacity>
                            )}

                            {isEditing && (
                                <View style={styles.editButtonsRow}>
                                    <TouchableOpacity style={[styles.btnPrimary, { flex: 1, backgroundColor: colors.textSecondary }]} onPress={() => setIsEditing(false)}>
                                        <Text style={styles.btnText}>Cancelar</Text>
                                    </TouchableOpacity>
                                    <View style={{ width: 10 }} />
                                    <TouchableOpacity style={[styles.btnPrimary, { flex: 1 }]} onPress={handleSave}>
                                        <Text style={styles.btnText}>Guardar</Text>
                                    </TouchableOpacity>
                                </View>
                            )}

                            {!isEditing && (
                                <TouchableOpacity style={styles.btnLogout} onPress={handleLogout}>
                                    <Ionicons name="log-out-outline" size={20} color="#EF4444" />
                                    <Text style={[styles.btnText, { color: '#EF4444' }]}>Cerrar Sesión</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    )}

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

// Añade estos estilos a tu StyleSheet
const styles = StyleSheet.create({
    // ... (tus estilos anteriores) ...
    backButton: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
    backText: { color: colors.textPrimary, marginLeft: 5, fontSize: 16 },
    // ...
    // Asegúrate de tener definidos todos los que usas (container, header, etc.)
    // Copia los estilos del paso anterior si te faltan.
    container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg },
    header: { alignItems: 'center', marginBottom: spacing.lg, marginTop: spacing.md },
    avatarContainer: {
        width: 100, height: 100, borderRadius: 50, backgroundColor: colors.purple,
        justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md,
        borderWidth: 4, borderColor: colors.backgroundSecondary
    },
    avatarText: { fontSize: 40, fontWeight: 'bold', color: '#FFF' },
    roleBadgeIcon: {
        position: 'absolute', bottom: 0, right: 0, backgroundColor: colors.cyanLight,
        width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: colors.background
    },
    name: { fontSize: 24, fontWeight: 'bold', color: colors.textPrimary, marginBottom: 4 },
    bio: { fontSize: 14, color: colors.textSecondary, marginBottom: 12, textAlign: 'center' },
    roleTag: { backgroundColor: 'rgba(124, 58, 237, 0.2)', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
    roleText: { color: colors.purple, fontWeight: 'bold', fontSize: 12 },

    editForm: { width: '100%', paddingHorizontal: spacing.lg },
    label: { color: colors.textSecondary, fontSize: 12, marginBottom: 4, marginTop: 8 },
    input: {
        backgroundColor: colors.inputBg, color: colors.textPrimary, padding: 12, borderRadius: 8, fontSize: 16,
        borderWidth: 1, borderColor: colors.border || '#333'
    },
    statsCard: {
        flexDirection: 'row', backgroundColor: colors.backgroundSecondary,
        borderRadius: radius.xl, padding: spacing.lg, marginBottom: spacing.lg,
        justifyContent: 'space-around', alignItems: 'center'
    },
    statItem: { alignItems: 'center' },
    statNumber: { fontSize: 24, fontWeight: 'bold', color: colors.purple },
    statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 4 },
    verticalDivider: { width: 1, height: 40, backgroundColor: colors.inputBg },

    section: { backgroundColor: colors.backgroundSecondary, padding: spacing.lg, borderRadius: radius.xl, marginBottom: spacing.lg },
    sectionTitle: { fontSize: 16, fontWeight: '600', color: colors.textPrimary, marginBottom: spacing.md },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 12 },
    infoText: { color: colors.textSecondary, fontSize: 15 },

    certRow: {
        flexDirection: 'row', alignItems: 'center', paddingVertical: 12,
        borderBottomWidth: 1, borderBottomColor: colors.inputBg, gap: 12
    },
    certTitle: { color: colors.textPrimary, fontWeight: '600', fontSize: 14 },
    certDate: { color: colors.textSecondary, fontSize: 12, marginTop: 2 },

    footer: { marginTop: 10, gap: 12 },
    btnPrimary: { flexDirection: 'row', backgroundColor: colors.purple, padding: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8 },
    btnLogout: { flexDirection: 'row', backgroundColor: 'transparent', padding: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: '#EF4444' },
    btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
    editButtonsRow: { flexDirection: 'row' }
});