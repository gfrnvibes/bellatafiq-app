import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { Image, View } from 'react-native';
import { useTheme } from '@/theme/useTheme';

export default function TabLayout() {
  const { colors } = useTheme();

  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        headerShadowVisible: false,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 62,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Bellatafiq',
          tabBarLabel: 'Beranda',
          headerTitleAlign: 'center',
          headerTitle: () => (
            <View
              style={{
                backgroundColor: '#FFFFFF',
                paddingHorizontal: 10,
                paddingVertical: 3,
                borderRadius: 8,
              }}
            >
              <Image
                source={require('../../assets/images/logo.png')}
                style={{ width: 112, height: 30 }}
                resizeMode="contain"
              />
            </View>
          ),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="schedule"
        options={{
          title: 'Jadwal',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="audio"
        options={{
          title: 'Bel Harian',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="notifications-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="playlists"
        options={{
          title: 'Daftar Putar',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="albums-outline" size={size} color={color as string} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Koneksi & Data',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color as string} />
          ),
        }}
      />
    </Tabs>
  );
}
