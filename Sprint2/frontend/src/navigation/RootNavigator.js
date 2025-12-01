import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Imports de pantallas
import HomeScreen from '../screens/HomeScreen';
import BrowseScreen from '../screens/BrowseScreen';
import FiltersScreen from '../screens/FiltersScreen';
import DetailScreen from '../screens/DetailScreen';
import FavoritesScreen from '../screens/FavoritesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import CreateItemScreen from '../screens/CreateItemScreen';
import EditItemScreen from '../screens/EditItemScreen';
import PanelAdminScreen from '../screens/PanelAdminScreen';
// import LoginScreen from '../screens/LoginScreen'; // YA NO LO NECESITAMOS
// import RegisterScreen from '../screens/RegisterScreen'; // YA NO LO NECESITAMOS
import RoleSelectionScreen from '../screens/RoleSelectionScreen'; // <--- IMPORTA ESTO

import { useAuth } from '../context/AuthContext';
import { colors } from '../theme/design';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// --- TABS (Protegidos por permisos) ---
function MainTabs() {
    const { can } = useAuth(); // Usamos can() para ocultar tabs

    return (
        <Tab.Navigator
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: colors.background,
                    borderTopColor: '#1F2933',
                    borderTopWidth: 1,
                    height: 64,
                    paddingBottom: 8,
                    paddingTop: 6,
                },
                tabBarActiveTintColor: colors.purple,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarIcon: ({ color, size, focused }) => {
                    let iconName = 'square';
                    if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
                    if (route.name === 'Browse') iconName = focused ? 'compass' : 'compass-outline';
                    if (route.name === 'Favorites') iconName = focused ? 'heart' : 'heart-outline';
                    if (route.name === 'Profile') iconName = focused ? 'person' : 'person-outline';
                    // Icono para el panel admin (temporalmente Create)
                    if (route.name === 'Admin') iconName = focused ? 'settings' : 'settings-outline';

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Browse" component={BrowseScreen} />

            {/* Solo mostramos Favoritos si tiene permiso */}
            {can('FAVORITES_USE') && (
                <Tab.Screen name="Favorites" component={FavoritesScreen} />
            )}

            {/* Solo mostramos Panel Admin si tiene permiso (Usamos CreateItemScreen como placeholder del panel por ahora) */}
            {can('ADMIN_PANEL_VIEW') && (
                <Tab.Screen
                    name="Admin"
                    component={PanelAdminScreen} // <--- 2. CAMBIAR AQUÍ
                    options={{ title: 'Panel' }}
                />
            )}

            <Tab.Screen name="Profile" component={ProfileScreen} />
        </Tab.Navigator>
    );
}

// --- NAVEGADOR PRINCIPAL ---
export default function RootNavigator() {
    const { user, loading } = useAuth();

    if (loading) {
        return null; // O un spinner
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    // SI ESTÁ LOGUEADO (Rol seleccionado)
                    <>
                        <Stack.Screen name="MainTabs" component={MainTabs} />
                        <Stack.Screen name="Detail" component={DetailScreen} />
                        <Stack.Screen name="Filters" component={FiltersScreen} options={{ presentation: 'modal' }} />
                        <Stack.Screen name="CreateItem" component={CreateItemScreen} />
                        <Stack.Screen name="EditItem" component={EditItemScreen} />
                        <Stack.Screen name="TeacherProfile" component={ProfileScreen} />
                    </>
                ) : (
                    // SI NO ESTÁ LOGUEADO -> PANTALLA DE SELECCIÓN DE ROL
                    <Stack.Screen name="RoleSelection" component={RoleSelectionScreen} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}