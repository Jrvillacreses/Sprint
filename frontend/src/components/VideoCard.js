import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { buildThumbnailUrl } from '../api/s3Config';
import { colors, spacing, radius } from '../theme/design';

export default function VideoCard({
    video,
    onPress,
    isFavorite = false,
    onToggleFavorite,
}) {
    const { title, subject, price, teacher, thumbnailKey } = video;
    const thumbnailUrl = buildThumbnailUrl(thumbnailKey);

    return (
        <TouchableOpacity
            style={styles.card}
            onPress={onPress}
            activeOpacity={0.85}
        >
            {thumbnailUrl ? (
                <Image
                    source={{ uri: thumbnailUrl }}
                    style={styles.thumbnail}
                    onError={(e) => console.log('Image Load Error:', e.nativeEvent.error, thumbnailUrl)}
                    onLoad={() => console.log('Image Loaded:', thumbnailUrl)}
                />
            ) : (
                <View style={[styles.thumbnail, styles.thumbPlaceholder]}>
                    <Ionicons name="image-outline" size={24} color={colors.textSecondary} />
                    <Text style={styles.thumbPlaceholderText}>No image</Text>
                </View>
            )}

            <View style={styles.info}>
                <View style={styles.titleRow}>
                    <Text numberOfLines={2} style={styles.title}>
                        {title}
                    </Text>
                    {onToggleFavorite && (
                        <TouchableOpacity
                            onPress={(e) => {
                                e.stopPropagation(); // que no dispare el onPress de la card
                                onToggleFavorite();
                            }}
                            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                        >
                            <Ionicons
                                name={isFavorite ? 'heart' : 'heart-outline'}
                                size={18}
                                color={isFavorite ? colors.red : colors.textSecondary}
                            />
                        </TouchableOpacity>
                    )}
                </View>

                <Text style={styles.metaLine}>
                    {teacher?.name ? teacher.name : 'Unknown'} ·{' '}
                    <Text style={styles.metaLight}>{subject || 'General'}</Text>
                </Text>

                <View style={styles.footerRow}>
                    <View style={styles.priceBadge}>
                        <Text style={styles.priceText}>
                            {price === 0 ? 'Free' : `${price} €`}
                        </Text>
                    </View>
                </View>
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius['2xl'],
        padding: spacing.sm,
        marginBottom: spacing.md,
        alignItems: 'center',
        // Shadow for iOS
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        // Elevation for Android
        elevation: 4,
    },
    thumbnail: {
        width: 100,
        height: 70,
        borderRadius: radius.xl,
        backgroundColor: '#000',
    },
    thumbPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.inputBg,
    },
    thumbPlaceholderText: {
        fontSize: 10,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    info: {
        flex: 1,
        marginLeft: spacing.md,
        justifyContent: 'center',
    },
    titleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 4,
    },
    title: {
        flex: 1,
        marginRight: spacing.xs,
        fontSize: 15,
        fontWeight: '600',
        color: colors.textPrimary,
        lineHeight: 20,
    },
    metaLine: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    metaLight: {
        color: colors.textSecondary,
        fontWeight: '500',
    },
    footerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    priceBadge: {
        backgroundColor: 'rgba(139, 92, 246, 0.15)', // Purple tint
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: radius.sm,
    },
    priceText: {
        color: colors.purple,
        fontSize: 12,
        fontWeight: '700',
    },
});
