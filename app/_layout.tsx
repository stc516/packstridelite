import '../global.css';

import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  Nunito_600SemiBold,
  Nunito_700Bold,
} from '@expo-google-fonts/nunito';
import {
  Outfit_400Regular,
  Outfit_500Medium,
  Outfit_700Bold,
} from '@expo-google-fonts/outfit';
import { View, ActivityIndicator } from 'react-native';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_600SemiBold,
    Nunito_700Bold,
    Outfit_400Regular,
    Outfit_500Medium,
    Outfit_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F7F9FC]">
        <ActivityIndicator />
      </View>
    );
  }

  // TODO: add auth gate — check session here and redirect to /auth when unauthenticated
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  );
}
