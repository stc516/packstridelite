import '../global.css';

import * as WebBrowser from 'expo-web-browser';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import { Nunito_600SemiBold, Nunito_700Bold } from '@expo-google-fonts/nunito';
import { Outfit_400Regular, Outfit_500Medium, Outfit_700Bold } from '@expo-google-fonts/outfit';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

WebBrowser.maybeCompleteAuthSession();

function AuthGate() {
  const { session, initialized, setSession, setInitialized } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setInitialized(true);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function checkProfile() {
      if (!session) {
        if (isMounted) setHasProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('users')
        .select('id')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        setHasProfile(false);
        return;
      }

      setHasProfile(Boolean(data?.id));
    }

    checkProfile();

    return () => {
      isMounted = false;
    };
  }, [session?.user.id]);

  useEffect(() => {
    if (!initialized) return;

    const inAuth = segments[0] === '(auth)';
    const inTabs = segments[0] === '(tabs)';
    const inOnboarding = segments[0] === 'onboarding';

    if (!session) {
      if (!inAuth) router.replace('/(auth)/login');
      return;
    }

    if (hasProfile === null) return;

    if (!hasProfile && !inOnboarding) {
      router.replace('/onboarding');
      return;
    }

    if (hasProfile && (inAuth || inOnboarding || !inTabs)) {
      router.replace('/(tabs)');
    }
  }, [session, initialized, segments, hasProfile]);

  return null;
}

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
        <ActivityIndicator color="#1A3A5C" />
      </View>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="programs" />
        <Stack.Screen name="train/[moduleSlug]" />
      </Stack>
      <AuthGate />
    </>
  );
}
