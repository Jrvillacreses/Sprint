import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, radius } from '../theme/design';
import { Ionicons } from '@expo/vector-icons';

export default function RoleSelectionScreen() {
    const { selectRole } = useAuth(); // Usamos la nueva función del contexto

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <View style={styles.header}>
                    <Ionicons name="people-circle-outline" size={80} color={colors.purple} />
                    <Text style={styles.title}>Sprint 2 RBAC</Text>
                    <Text style={styles.subtitle}>Selecciona un rol para simular el acceso</Text>
                </View>

                <View style={styles.cardsContainer}>
                    {/* Botón USER */}
                    <TouchableOpacity
                        style={[styles.card, styles.userCard]}
                        onPress={() => selectRole('USER')}
                        activeOpacity={0.8}
                    >
                        <View style={styles.iconBg}>
                            <Ionicons name="person" size={32} color={colors.cyanLight} />
                        </View>
                        <View style={styles.cardText}>
                            <Text style={styles.roleTitle}>Usuario Estándar</Text>
                            <Text style={styles.roleDesc}>Puede ver videos y añadir favoritos.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>

                    {/* Botón ADMIN */}
                    <TouchableOpacity
                        style={[styles.card, styles.adminCard]}
                        onPress={() => selectRole('ADMIN')}
                        activeOpacity={0.8}
                    >
                        <View style={[styles.iconBg, { backgroundColor: 'rgba(124, 58, 237, 0.2)' }]}>
                            <Ionicons name="shield-checkmark" size={32} color={colors.purple} />
                        </View>
                        <View style={styles.cardText}>
                            <Text style={styles.roleTitle}>Administrador</Text>
                            <Text style={styles.roleDesc}>Gestión total: crear, editar y panel.</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={24} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: spacing.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing['2xl'],
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginTop: spacing.md,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.xs,
    },
    cardsContainer: {
        gap: spacing.lg,
    },
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.lg,
        borderRadius: radius.xl,
        backgroundColor: colors.backgroundSecondary,
        borderWidth: 1,
        borderColor: colors.border || '#333',
    },
    userCard: {
        borderColor: colors.cyanLight, // Borde sutil para diferenciar
    },
    adminCard: {
        borderColor: colors.purple,
    },
    iconBg: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(6, 182, 212, 0.2)',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: spacing.md,
    },
    cardText: {
        flex: 1,
    },
    roleTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.textPrimary,
        marginBottom: 4,
    },
    roleDesc: {
        fontSize: 13,
        color: colors.textSecondary,
        lineHeight: 18,
    },
});