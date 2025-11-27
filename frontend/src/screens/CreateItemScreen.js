import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    Image,
    ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme/design';
import { createPresignedUrl } from '../api/uploadsApi';
import { createVideo } from '../api/videosApi';
import { useNavigation } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function CreateItemScreen({ }) {
    const { user } = useAuth();
    const [title, setTitle] = useState('');
    const [subject, setSubject] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [thumb, setThumb] = useState(null); // { uri, mime }
    const navigation = useNavigation();
    const [uploading, setUploading] = useState(false);

    const pickThumbnail = async () => {
        const { status } =
            await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
            Alert.alert(
                'Permission needed',
                'We need access to your gallery to pick a thumbnail.',
            );
            return;
        }

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.8,
        });

        if (!result.canceled) {
            const asset = result.assets[0];
            setThumb({
                uri: asset.uri,
                mime: asset.mimeType || 'image/jpeg',
            });
        }
    };

    const isYouTubeUrl = (url) =>
        /youtube\.com|youtu\.be/.test(url.toLowerCase());

    const handleSubmit = async () => {
        if (!user || !user.id) {
            Alert.alert(
                'Error',
                'You must be logged in to upload.',
            );
            return;
        }

        if (!title || title.length < 3) {
            Alert.alert('Validation', 'Title must be at least 3 characters.');
            return;
        }
        if (!isYouTubeUrl(videoUrl)) {
            Alert.alert('Validation', 'Please enter a valid YouTube URL.');
            return;
        }
        if (!thumb) {
            Alert.alert('Validation', 'Please upload a thumbnail image.');
            return;
        }

        setUploading(true);
        try {
            // 1) Presigned URL
            const fileName = thumb.uri.split('/').pop() || 'thumbnail.jpg';
            const presign = await createPresignedUrl({
                fileName,
                contentType: thumb.mime,
            });

            // 2) Subir imagen a S3 con PUT
            const fileRes = await fetch(thumb.uri);
            const blob = await fileRes.blob();

            const putRes = await fetch(presign.url, {
                method: 'PUT',
                headers: {
                    'Content-Type': thumb.mime,
                },
                body: blob,
            });

            if (!putRes.ok) {
                throw new Error('Error uploading thumbnail to S3');
            }

            // 3) Crear vídeo en el backend
            const numericPrice =
                price.trim() === '' ? 0 : Number(price.replace(',', '.'));

            const payload = {
                title,
                description,
                subject,
                price: isNaN(numericPrice) ? 0 : numericPrice,
                videoUrl,
                thumbnailKey: presign.key,
                thumbnailKey: presign.key,
                teacherId: user.id,
            };

            const created = await createVideo(payload);

            Alert.alert('Success', 'Video created successfully!', [
                {
                    text: 'View',
                    onPress: () =>
                        navigation.navigate('Detail', { id: created.id }),
                },
                {
                    text: 'OK',
                    style: 'cancel',
                },
            ]);

            // limpiar formulario básico
            setTitle('');
            setSubject('');
            setDescription('');
            setPrice('');
            setVideoUrl('');
            setThumb(null);
        } catch (err) {
            console.error(err);
            Alert.alert('Error', err.message || 'Error creating video.');
        } finally {
            setUploading(false);
        }
    };

    return (
        <SafeAreaView style={styles.screen}>
            {/* HEADER */}
            <View style={styles.headerRow}>
                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={22} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Upload New Lesson</Text>
                {/* espacio para balancear el header */}
                <View style={{ width: 32 }} />
            </View>

            {/* CONTENIDO SCROLL + TECLADO */}
            <KeyboardAvoidingView
                style={styles.page}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 80 : 0}
            >
                <ScrollView
                    contentContainerStyle={styles.container}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.subtitle}>Upload New Lesson</Text>
                    <Text style={styles.title}>Add your educational video</Text>

                    {/* THUMBNAIL CARD */}
                    <View style={styles.thumbCard}>
                        <View style={styles.thumbIconCircle}>
                            {thumb ? (
                                <Image source={{ uri: thumb.uri }} style={styles.thumbImage} />
                            ) : (
                                <Ionicons
                                    name="image-outline"
                                    size={32}
                                    color={colors.textSecondary}
                                />
                            )}
                        </View>
                        <Text style={styles.thumbTitle}>Clip Thumbnail</Text>
                        <Text style={styles.thumbHint}>
                            Tap below to upload a custom thumbnail.
                        </Text>

                        <TouchableOpacity
                            style={styles.thumbButton}
                            onPress={pickThumbnail}
                            disabled={uploading}
                        >
                            <Text style={styles.thumbButtonText}>Upload thumbnail</Text>
                        </TouchableOpacity>
                    </View>

                    {/* YOUTUBE URL */}
                    <Text style={styles.fieldLabel}>YouTube video URL</Text>
                    <TextInput
                        style={styles.input}
                        value={videoUrl}
                        onChangeText={setVideoUrl}
                        placeholder="https://youtube.com/..."
                        placeholderTextColor={colors.textSecondary}
                        autoCapitalize="none"
                    />
                    <Text style={styles.validationText}>
                        Please enter a valid YouTube URL.
                    </Text>

                    {/* TITLE / SUBJECT / PRICE */}
                    <Text style={styles.fieldLabel}>Title</Text>
                    <TextInput
                        style={styles.input}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Lesson title"
                        placeholderTextColor={colors.textSecondary}
                    />

                    <Text style={styles.fieldLabel}>Subject</Text>
                    <TextInput
                        style={styles.input}
                        value={subject}
                        onChangeText={setSubject}
                        placeholder="Math, English..."
                        placeholderTextColor={colors.textSecondary}
                    />

                    <Text style={styles.fieldLabel}>Price (optional)</Text>
                    <TextInput
                        style={styles.input}
                        value={price}
                        onChangeText={setPrice}
                        placeholder="0 for free"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                    />

                    {/* BOTÓN INFERIOR */}
                    <TouchableOpacity
                        style={[styles.submitButton, uploading && { opacity: 0.6 }]}
                        onPress={handleSubmit}
                        disabled={uploading}
                    >
                        {uploading ? (
                            <ActivityIndicator color={colors.textPrimary} />
                        ) : (
                            <Text style={styles.submitText}>Upload clip</Text>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );

}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: colors.background,
    },
    page: {
        flex: 1,
        backgroundColor: colors.background,
    },
    container: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
        paddingBottom: spacing.lg,
    },
    subtitle: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    title: {
        fontSize: 20,
        fontWeight: '600',
        color: colors.textPrimary,
        marginBottom: spacing.lg,
    },
    thumbCard: {
        backgroundColor: colors.backgroundSecondary,
        borderRadius: radius['3xl'],
        padding: spacing.lg,
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    thumbIconCircle: {
        width: 72,
        height: 72,
        borderRadius: radius.full,
        backgroundColor: colors.inputBg,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: spacing.sm,
        overflow: 'hidden',
    },
    thumbImage: {
        width: '100%',
        height: '100%',
    },
    thumbTitle: {
        fontSize: 16,
        fontWeight: '500',
        color: colors.textPrimary,
        marginBottom: 2,
    },
    thumbHint: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        marginBottom: spacing.md,
    },
    thumbButton: {
        backgroundColor: colors.inputBg,
        borderRadius: radius.full,
        paddingHorizontal: spacing.lg,
        paddingVertical: spacing.sm,
    },
    thumbButtonText: {
        fontSize: 13,
        color: colors.textPrimary,
    },
    fieldLabel: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 4,
    },
    input: {
        backgroundColor: colors.inputBg,
        borderRadius: radius.xl,
        paddingHorizontal: spacing.sm,
        paddingVertical: spacing.xs,
        color: colors.textPrimary,
        fontSize: 14,
        marginBottom: spacing.md,
    },
    validationText: {
        fontSize: 11,
        color: colors.textSecondary,
        marginBottom: spacing.md,
    },
    submitButton: {
        marginTop: spacing.md,
        backgroundColor: colors.purple,
        borderRadius: radius['3xl'],
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    submitText: {
        color: colors.textPrimary,
        fontWeight: '600',
        fontSize: 15,
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    backButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '500',
        color: '#FFFFFF',
    },

});
