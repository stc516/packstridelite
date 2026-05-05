import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import DogAvatar from '@/components/DogAvatar';
import Colors from '@/constants/colors';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';
import { PRIMARY_BUTTON } from '@/constants/primaryButton';

type AdventureRow = {
  id: string;
  title: string;
  notes: string | null;
  distance_miles: number | null;
  duration_minutes: number | null;
  logged_at: string;
  dog: {
    name: string;
    avatar_url: string | null;
  } | null;
};

type DogEmbed = { name: string; avatar_url: string | null };

function normalizeDogEmbed(
  dog: DogEmbed | DogEmbed[] | null | undefined
): DogEmbed | null {
  if (dog == null) return null;
  return Array.isArray(dog) ? dog[0] ?? null : dog;
}

function formatRelativeTime(input: string): string {
  const now = new Date();
  const target = new Date(input);
  const diffMs = now.getTime() - target.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return 'yesterday';
  if (diffDays < 7) return `${diffDays}d ago`;
  return target.toLocaleDateString();
}

export default function MomentsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const session = useAuthStore((state) => state.session);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adventures, setAdventures] = useState<AdventureRow[]>([]);

  useEffect(() => {
    let active = true;

    async function loadMoments() {
      if (!session?.user.id) {
        if (active) {
          setAdventures([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: adventuresError } = await supabase
        .from('adventures')
        .select('id, title, notes, distance_miles, duration_minutes, logged_at, dog:dogs(name, avatar_url)')
        .eq('user_id', session.user.id)
        .order('logged_at', { ascending: false });

      if (!active) return;

      if (adventuresError) {
        setError(adventuresError.message);
        setLoading(false);
        return;
      }

      const normalized = (data ?? []).map((row: {
        id: string;
        title: string;
        notes: string | null;
        distance_miles: number | null;
        duration_minutes: number | null;
        logged_at: string;
        dog: DogEmbed | DogEmbed[] | null;
      }) => ({
        id: row.id,
        title: row.title,
        notes: row.notes,
        distance_miles: row.distance_miles,
        duration_minutes: row.duration_minutes,
        logged_at: row.logged_at,
        dog: normalizeDogEmbed(row.dog),
      }));

      setAdventures(normalized);
      setLoading(false);
    }

    loadMoments();

    return () => {
      active = false;
    };
  }, [session?.user.id]);

  const hasData = useMemo(() => adventures.length > 0, [adventures.length]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.snow }}>
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: Math.max(insets.bottom + 100, 120),
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 24, color: Colors.navy, marginBottom: 4 }}>
          Moments
        </Text>
        <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mist, marginBottom: 20 }}>
          Your recent adventures with the pack.
        </Text>

        {loading ? (
          <View className="py-8">
            <ActivityIndicator color={Colors.ocean} />
          </View>
        ) : error ? (
          <Text style={{ fontFamily: 'Outfit_400Regular', color: '#C0392B' }}>{error}</Text>
        ) : !hasData ? (
          <Text style={{ fontFamily: 'Outfit_400Regular', color: Colors.mist }}>
            No moments yet. Log your first adventure to start the feed.
          </Text>
        ) : (
          <View className="gap-4">
            {adventures.map((adventure) => (
              <View
                key={adventure.id}
                className="rounded-2xl p-4"
                style={{
                  backgroundColor: Colors.white,
                  shadowColor: '#000',
                  shadowOpacity: 0.05,
                  shadowRadius: 10,
                  shadowOffset: { width: 0, height: 3 },
                  elevation: 2,
                }}
              >
                <View className="flex-row items-center justify-between mb-3">
                  <View className="flex-row items-center">
                    <DogAvatar
                      name={adventure.dog?.name ?? 'Dog'}
                      size="md"
                      imageUrl={adventure.dog?.avatar_url ?? undefined}
                    />
                    <View className="ml-3">
                      <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: Colors.navy }}>
                        {adventure.dog?.name ?? 'Unknown dog'}
                      </Text>
                      <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.mist }}>
                        {formatRelativeTime(adventure.logged_at)}
                      </Text>
                    </View>
                  </View>
                  <View className="rounded-full px-2 py-1" style={{ backgroundColor: Colors.iceBlue }}>
                    <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 12, color: Colors.ocean }}>
                      {adventure.title}
                    </Text>
                  </View>
                </View>

                <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.navy, marginBottom: 8 }}>
                  {adventure.notes || 'Great session with the pack today.'}
                </Text>

                <View className="flex-row items-center gap-3">
                  <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 12, color: Colors.mist }}>
                    {adventure.distance_miles ?? 0} mi
                  </Text>
                  <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 12, color: Colors.mist }}>
                    {adventure.duration_minutes ?? 0} min
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <TouchableOpacity
        onPress={() => router.push('/(tabs)/log')}
        activeOpacity={0.85}
        style={[
          PRIMARY_BUTTON,
          {
            position: 'absolute',
            right: 22,
            bottom: Math.max(insets.bottom + 16, 28),
            width: 56,
            height: 56,
            borderRadius: 28,
            shadowColor: '#000',
            shadowOpacity: 0.2,
            shadowRadius: 8,
            shadowOffset: { width: 0, height: 4 },
            elevation: 6,
          },
        ]}
      >
        <Text style={{ fontFamily: 'Nunito_700Bold', color: Colors.white, fontSize: 28, lineHeight: 32 }}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
