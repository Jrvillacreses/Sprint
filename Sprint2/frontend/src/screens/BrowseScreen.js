import React, { useCallback, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';

import { colors, spacing, radius } from '../theme/design';
import { getVideos } from '../api/videosApi';
import VideoCard from '../components/VideoCard';

const CATEGORIES = ['All', 'Math', 'English', 'Programming', 'Physics', 'Chemistry'];

export default function BrowseScreen() {
    const navigation = useNavigation();
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [sortBy, setSortBy] = useState('date_desc'); // date_desc, date_asc, price_desc, price_asc

    const loadData = useCallback(async () => {
        try {
            setError(null);
            setLoading(true);

            // Mapping UI categories (English) to DB values (Spanish)
            const categoryMap = {
                'Math': 'Matemáticas',
                'English': 'Inglés',
                'Programming': 'Programación',
                'Physics': 'Física',
                'Chemistry': 'Química'
            };

            const dbCategory = categoryMap[selectedCategory] || selectedCategory;

            let sortField = 'createdAt';
            let sortOrder = 'DESC';

            if (sortBy === 'date_asc') {
                sortField = 'createdAt';
                sortOrder = 'ASC';
            } else if (sortBy === 'price_desc') {
                sortField = 'price';
                sortOrder = 'DESC';
            } else if (sortBy === 'price_asc') {
                sortField = 'price';
                sortOrder = 'ASC';
            }

            const params = {
                page: 1,
                limit: 50,
                q: searchQuery || undefined,
                category: selectedCategory !== 'All' ? dbCategory : undefined,
                sort: sortField,
                order: sortOrder,
            };

            const data = await getVideos(params);
            const vids = data.items || data || [];
            setVideos(vids);
        } catch (err) {
            console.error('Error loading browse data', err);
            setError('Could not load videos.');
        } finally {
            setLoading(false);
        }
    }, [searchQuery, selectedCategory, sortBy]);

    useFocusEffect(
        useCallback(() => {
            loadData();
        }, [loadData])
    );

    const renderItem = ({ item }) => (
        <VideoCard
            video={item}
            onPress={() => navigation.navigate('Detail', { id: item.id })}
        />
    );

    const ListHeader = () => (
        <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>Browse</Text>

            {/* Search Bar */}
            <View style={styles.searchBar}>
                <Ionicons name="search" size={20} color={colors.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search topics, teachers..."
                    placeholderTextColor={colors.textSecondary}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={loadData}
                />
            </View>

            {/* Sort Options */}
            <View style={styles.sortRow}>
                <TouchableOpacity
                    style={[styles.sortChip, sortBy.startsWith('date') && styles.sortChipSelected]}
                    onPress={() => setSortBy(sortBy === 'date_desc' ? 'date_asc' : 'date_desc')}
                >
                    <Ionicons
                        name={sortBy === 'date_asc' ? 'arrow-up' : 'arrow-down'}
                        size={14}
                        color={sortBy.startsWith('date') ? colors.textPrimary : colors.textSecondary}
                        style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.sortText, sortBy.startsWith('date') && styles.sortTextSelected]}>
                        Date
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.sortChip, sortBy.startsWith('price') && styles.sortChipSelected]}
                    onPress={() => setSortBy(sortBy === 'price_desc' ? 'price_asc' : 'price_desc')}
                >
                    <Ionicons
                        name={sortBy === 'price_asc' ? 'arrow-up' : 'arrow-down'}
                        size={14}
                        color={sortBy.startsWith('price') ? colors.textPrimary : colors.textSecondary}
                        style={{ marginRight: 4 }}
                    />
                    <Text style={[styles.sortText, sortBy.startsWith('price') && styles.sortTextSelected]}>
                        Price
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Categories */}
            <View style={styles.categoriesRow}>
                <FlatList
                    horizontal
                    data={CATEGORIES}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={item => item}
                    renderItem={({ item }) => {
                        const isSelected = selectedCategory === item;
                        return (
                            <TouchableOpacity
                                style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                                onPress={() => setSelectedCategory(item)}
                            >
                                <Text style={[styles.categoryText, isSelected && styles.categoryTextSelected]}>
                                    {item}
                                </Text>
                            </TouchableOpacity>
                        );
                    }}
                />
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.screen}>
            <FlatList
                data={videos}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                ListHeaderComponent={ListHeader}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.listContent}
                ListEmptyComponent={
                    !loading && (
                        <View style={styles.center}>
                            <Text style={styles.emptyText}>No videos found matching your criteria.</Text>
                        </View>
                    )
                }
            />
            {loading && (
                <View style={styles.loadingOverlay}>
                    <ActivityIndicator color={colors.cyanLight} />
                </View>
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
    headerContainer: {
        marginBottom: spacing.md,
        marginTop: spacing.md,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: '700',
        color: colors.textPrimary,
        marginBottom: spacing.md,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBg,
        borderRadius: radius.xl,
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
        marginBottom: spacing.md,
    },
    searchInput: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 15,
    },
    sortRow: {
        flexDirection: 'row',
        marginBottom: spacing.md,
    },
    sortChip: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        backgroundColor: colors.backgroundSecondary,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.backgroundSecondary,
    },
    sortChipSelected: {
        borderColor: colors.purple,
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
    },
    sortText: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    sortTextSelected: {
        color: colors.textPrimary,
    },
    categoriesRow: {
        marginBottom: spacing.xs,
    },
    categoryChip: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.xs,
        borderRadius: radius.full,
        backgroundColor: colors.backgroundSecondary,
        marginRight: spacing.sm,
        borderWidth: 1,
        borderColor: colors.backgroundSecondary,
    },
    categoryChipSelected: {
        backgroundColor: colors.purple,
        borderColor: colors.purple,
    },
    categoryText: {
        color: colors.textSecondary,
        fontSize: 13,
        fontWeight: '500',
    },
    categoryTextSelected: {
        color: colors.textPrimary,
    },
    center: {
        padding: spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: colors.textSecondary,
        fontSize: 14,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
});
