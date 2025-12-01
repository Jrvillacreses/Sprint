import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, TextInput,
    ActivityIndicator, Alert, ScrollView, Image, KeyboardAvoidingView, Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute } from '@react-navigation/native';

import { colors, spacing, radius } from '../theme/design';
import { getVideo, updateVideo } from '../api/videosApi'; // <--- Importamos update
import { createPresignedUrl } from '../api/uploadsApi';

export default function EditItemScreen() {
    const navigation = useNavigation();
    const route = useRoute();
    const { id } = route.params; // Recibimos el ID del video

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    // Estados del formulario
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState('');
    const [videoUrl, setVideoUrl] = useState('');
    const [currentThumb, setCurrentThumb] = useState(null); // URL de la imagen actual
    const [newThumb, setNewThumb] = useState(null); // Si el usuario sube una nueva

    // 1. Cargar datos iniciales
    useEffect(() => {
        loadVideoData();
    }, [id]);

    const loadVideoData = async () => {
        try {
            const data = await getVideo(id);
            setTitle(data.title);
            setDescription(data.description || '');
            setPrice(data.price ? data.price.toString() : '');
            setVideoUrl(data.videoUrl);
            setCurrentThumb(data.thumbnailUrl); // Asumiendo que el backend devuelve thumbnailUrl
        } catch (error) {
            Alert.alert("Error", "No se pudo cargar el video");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    };

    // 2. Seleccionar nueva imagen (Opcional)
    const pickThumbnail = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, quality: 0.8,
        });
        if (!result.canceled) {
            setNewThumb(result.assets[0]);
        }
    };

    // 3. Guardar cambios
    const handleSave = async () => {
        if (!title) return Alert.alert("Error", "El título es obligatorio");

        setSubmitting(true);
        try {
            let thumbnailKey = undefined;

            // Si hay nueva imagen, la subimos primero
            if (newThumb) {
                const fileName = newThumb.uri.split('/').pop();
                const presign = await createPresignedUrl({ fileName, contentType: newThumb.mimeType || 'image/jpeg' });

                const imgRes = await fetch(newThumb.uri);
                const blob = await imgRes.blob();
                await fetch(presign.url, { method: 'PUT', body: blob });

                thumbnailKey = presign.key;
            }

            const payload = {
                title,
                description,
                price: parseFloat(price) || 0,
                videoUrl,
                ...(thumbnailKey && { thumbnailKey }), // Solo enviamos si cambió
            };

            await updateVideo(id, payload);

            Alert.alert("Éxito", "Video actualizado correctamente", [
                { text: "OK", onPress: () => navigation.navigate('Detail', { id: id, refresh: true }) } // Volver al detalle
            ]);
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Falló la actualización");
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <ActivityIndicator style={styles.center} color={colors.purple} />;

    return (
        <SafeAreaView style={styles.screen}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Editar Video</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.form}>

                    {/* Sección Imagen */}
                    <Text style={styles.label}>Miniatura</Text>
                    <TouchableOpacity onPress={pickThumbnail} style={styles.imagePicker}>
                        {newThumb ? (
                            <Image source={{ uri: newThumb.uri }} style={styles.thumb} />
                        ) : currentThumb ? (
                            <Image source={{ uri: currentThumb }} style={styles.thumb} />
                        ) : (
                            <View style={styles.placeholder}>
                                <Ionicons name="image-outline" size={40} color={colors.textSecondary} />
                            </View>
                        )}
                        <View style={styles.overlay}>
                            <Ionicons name="camera" size={20} color="#FFF" />
                        </View>
                    </TouchableOpacity>

                    {/* Campos de Texto */}
                    <Text style={styles.label}>Título</Text>
                    <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholderTextColor={colors.textSecondary} />

                    <Text style={styles.label}>Descripción</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        value={description}
                        onChangeText={setDescription}
                        multiline numberOfLines={4}
                        placeholderTextColor={colors.textSecondary}
                    />

                    <Text style={styles.label}>URL Video (YouTube)</Text>
                    <TextInput style={styles.input} value={videoUrl} onChangeText={setVideoUrl} autoCapitalize="none" placeholderTextColor={colors.textSecondary} />

                    <Text style={styles.label}>Precio (€)</Text>
                    <TextInput style={styles.input} value={price} onChangeText={setPrice} keyboardType="numeric" placeholderTextColor={colors.textSecondary} />

                    <TouchableOpacity
                        style={[styles.saveBtn, submitting && { opacity: 0.7 }]}
                        onPress={handleSave}
                        disabled={submitting}
                    >
                        {submitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveText}>Guardar Cambios</Text>}
                    </TouchableOpacity>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: colors.background },
    center: { flex: 1, justifyContent: 'center' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: spacing.lg },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: colors.textPrimary },
    form: { padding: spacing.lg },
    label: { color: colors.textSecondary, marginBottom: 8, fontWeight: '600' },
    input: { backgroundColor: colors.inputBg, color: colors.textPrimary, padding: spacing.md, borderRadius: radius.lg, marginBottom: spacing.lg },
    textArea: { height: 100, textAlignVertical: 'top' },
    imagePicker: { height: 200, borderRadius: radius.xl, overflow: 'hidden', marginBottom: spacing.lg, backgroundColor: colors.inputBg },
    thumb: { width: '100%', height: '100%' },
    placeholder: { flex: 1, alignItems: 'center', justifyContent: 'center' },
    overlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', padding: 8, borderRadius: 20 },
    saveBtn: { backgroundColor: colors.purple, padding: spacing.lg, borderRadius: radius.full, alignItems: 'center', marginTop: spacing.md },
    saveText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 }
});