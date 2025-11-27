// src/screens/FiltersScreen.js
import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/design';

// Chips de ejemplo para asignaturas (category)
const SUBJECT_CHIPS = ['Math', 'English', 'Programming', 'Physics'];

const SORT_OPTIONS = [
    { id: 'trending', label: 'Trending', sort: 'createdAt', order: 'DESC' },
    { id: 'newest', label: 'Newest', sort: 'createdAt', order: 'DESC' },
    { id: 'cheap', label: 'Cheapest', sort: 'price', order: 'ASC' },
];

export default function FiltersScreen({ route, navigation }) {
    const initial = route.params?.filters || {};
    const onApply = route.params?.onApply;

    const [q, setQ] = useState(initial.q || '');
    const [category, setCategory] = useState(initial.category || '');
    const [minPrice, setMinPrice] = useState(
        initial.minPrice !== undefined ? String(initial.minPrice) : ''
    );
    const [maxPrice, setMaxPrice] = useState(
        initial.maxPrice !== undefined ? String(initial.maxPrice) : ''
    );

    const initialSortOpt =
        SORT_OPTIONS.find(
            (opt) => opt.sort === initial.sort && opt.order === initial.order
        ) || SORT_OPTIONS[0];
    const [sortOpt, setSortOpt] = useState(initialSortOpt);

    const handleReset = () => {
        setQ('');
        setCategory('');
        setMinPrice('');
        setMaxPrice('');
        setSortOpt(SORT_OPTIONS[0]);
    };

    const handleApply = () => {
        const filters = {
            q,
            category,
            minPrice: minPrice !== '' ? Number(minPrice) : undefined,
            maxPrice: maxPrice !== '' ? Number(maxPrice) : undefined,
            sort: sortOpt.sort,
            order: sortOpt.order,
        };
        if (onApply) onApply(filters);
        navigation.goBack();
    };

    return (
        <KeyboardAvoidingView
            style={styles.page}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.container}>
                {/* HEADER */}
                <View style={styles.headerRow}>
                    <Text style={styles.headerTitle}>Filter videos</Text>
                    <TouchableOpacity onPress={handleReset}>
                        <Text style={styles.resetText}>Reset</Text>
                    </TouchableOpacity>
                </View>

                {/* SEARCH BAR */}
                <View style={styles.searchBar}>
                    <Ionicons
                        name="search"
                        size={18}
                        color={colors.textSecondary}
                        style={{ marginHorizontal: spacing.xs }}
                    />
                    <TextInput
                        value={q}
                        onChangeText={setQ}
                        placeholder="Search teachers, subjects..."
                        placeholderTextColor={colors.textSecondary}
                        style={styles.searchInput}
                    />
                </View>

                {/* SORT BY */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Sort by</Text>
                    <View style={styles.chipsRow}>
                        {SORT_OPTIONS.map((opt) => {
                            const active = opt.id === sortOpt.id;
                            return (
                                <TouchableOpacity
                                    key={opt.id}
                                    style={[styles.chip, active && styles.chipActive]}
                                    onPress={() => setSortOpt(opt)}
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            active && styles.chipTextActive,
                                        ]}
                                    >
                                        {opt.label}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                </View>

                {/* SUBJECT */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Subject</Text>

                    <View style={styles.chipsRowWrap}>
                        {SUBJECT_CHIPS.map((subj) => {
                            const active = category === subj;
                            return (
                                <TouchableOpacity
                                    key={subj}
                                    style={[
                                        styles.chip,
                                        styles.chipPill,
                                        active && styles.chipActive,
                                    ]}
                                    onPress={() =>
                                        setCategory((prev) => (prev === subj ? '' : subj))
                                    }
                                >
                                    <Text
                                        style={[
                                            styles.chipText,
                                            active && styles.chipTextActive,
                                        ]}
                                    >
                                        {subj}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                    </View>

                    <TextInput
                        value={category}
                        onChangeText={setCategory}
                        placeholder="Or type a custom subject"
                        placeholderTextColor={colors.textSecondary}
                        style={styles.input}
                    />
                </View>

                {/* PRICE RANGE */}
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>Price</Text>
                    <View style={styles.priceRow}>
                        <View style={styles.priceCol}>
                            <Text style={styles.priceLabel}>Min</Text>
                            <TextInput
                                value={minPrice}
                                onChangeText={setMinPrice}
                                keyboardType="numeric"
                                placeholder="0"
                                placeholderTextColor={colors.textSecondary}
                                style={styles.input}
                            />
                        </View>
                        <View style={styles.priceCol}>
                            <Text style={styles.priceLabel}>Max</Text>
                            <TextInput
                                value={maxPrice}
                                onChangeText={setMaxPrice}
                                keyboardType="numeric"
                                placeholder="50"
                                placeholderTextColor={colors.textSecondary}
                                style={styles.input}
                            />
                        </View>
                    </View>
                </View>
            </View>

            <View style={styles.bottomBar}>
                <TouchableOpacity
                    style={styles.applyButton}
                    activeOpacity={0.9}
                    onPress={handleApply}
                >
                    <Text style={styles.applyButtonText}>Show results</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    page: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: colors.textPrimary,
    },
    resetText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.inputBg,
        borderRadius: radius.full,
        paddingVertical: spacing.xs,
        marginBottom: spacing.lg,
    },
    searchInput: {
        flex: 1,
        color: colors.textPrimary,
        fontSize: 14,
        paddingVertical: 4,
        paddingRight: spacing.sm,
    },
    section: {
        marginBottom: spacing.lg,
    },
    sectionLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    chipsRow: {
        flexDirection: 'row',
    },
    chipsRowWrap: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: spacing.sm,
    },
    chip: {
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        borderRadius: radius.xl,
        backgroundColor: colors.backgroundSecondary,
        marginRight: spacing.xs,
    },
    chipPill: {
        marginBottom: spacing.xs,
    },
    chipActive: {
        backgroundColor: colors.cyanDark,
    },
    chipText: {
        fontSize: 13,
        color: colors.textSecondary,
    },
    chipTextActive: {
        color: colors.textPrimary,
        fontWeight: '500',
    },
    input: {
        backgroundColor: colors.inputBg,
        borderRadius: radius.xl,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        color: colors.textPrimary,
        fontSize: 14,
    },
    priceRow: {
        flexDirection: 'row',
    },
    priceCol: {
        flex: 1,
        marginRight: spacing.sm,
    },
    priceLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    bottomBar: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.lg,
    },
    applyButton: {
        backgroundColor: colors.purple,
        borderRadius: radius['3xl'],
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    applyButtonText: {
        color: colors.textPrimary,
        fontWeight: '600',
        fontSize: 15,
    },
});
