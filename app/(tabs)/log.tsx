import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import DogAvatarGroup from '@/components/DogAvatarGroup';
import Colors from '@/constants/colors';
import { PRIMARY_BUTTON, PRIMARY_BUTTON_TEXT } from '@/constants/primaryButton';
import { supabase } from '@/lib/supabase';
import { calculateAdventureXp } from '@/lib/xp';
import { useAuthStore } from '@/store/authStore';

type DogRow = {
  id: string;
  name: string;
  breed: string;
  avatar_url: string | null;
};

type StreakRow = {
  id: string;
  user_id: string;
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
};

const ACTIVITY_TYPES = ['Trail walk', 'Beach run', 'Park play', 'Hike', 'Swim', 'Other'] as const;

const INPUT = {
  height: 52,
  borderRadius: 12,
  borderWidth: 1.5,
  borderColor: Colors.sky,
  backgroundColor: Colors.white,
  paddingHorizontal: 16,
  fontFamily: 'Outfit_400Regular',
  fontSize: 15,
  color: Colors.navy,
} as const;

const LABEL = {
  fontFamily: 'Outfit_500Medium',
  fontSize: 13,
  color: Colors.navy,
  marginBottom: 6,
} as const;

function toDateOnly(input: Date): string {
  return `${input.getFullYear()}-${String(input.getMonth() + 1).padStart(2, '0')}-${String(input.getDate()).padStart(2, '0')}`;
}

function toDateOnlyOffset(base: Date, dayOffset: number): string {
  const next = new Date(base);
  next.setDate(base.getDate() + dayOffset);
  return toDateOnly(next);
}

export default function LogScreen() {
  const insets = useSafeAreaInsets();
  const session = useAuthStore((state) => state.session);

  const [dogs, setDogs] = useState<DogRow[]>([]);
  const [dogsLoading, setDogsLoading] = useState(true);
  const [dogsError, setDogsError] = useState<string | null>(null);

  const [selectedDogId, setSelectedDogId] = useState<string | null>(null);
  const [activityType, setActivityType] = useState<(typeof ACTIVITY_TYPES)[number]>('Trail walk');
  const [distanceMiles, setDistanceMiles] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [notes, setNotes] = useState('');
  const [locationName, setLocationName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [earnedXp, setEarnedXp] = useState<number | null>(null);

  const anim = useRef(new Animated.Value(0)).current;

  const previewXp = useMemo(
    () =>
      calculateAdventureXp({
        durationMinutes: Number(durationMinutes) || 0,
        distanceMiles: Number(distanceMiles) || 0,
      }),
    [durationMinutes, distanceMiles]
  );

  useEffect(() => {
    let active = true;

    async function loadDogs() {
      if (!session?.user.id) {
        if (active) {
          setDogs([]);
          setDogsLoading(false);
        }
        return;
      }

      setDogsLoading(true);
      setDogsError(null);

      const { data, error } = await supabase
        .from('dogs')
        .select('id, name, breed, avatar_url')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: true });

      if (!active) return;

      if (error) {
        setDogs([]);
        setDogsError(error.message);
        setDogsLoading(false);
        return;
      }

      setDogs((data ?? []) as DogRow[]);
      setSelectedDogId((prev) => prev ?? (data?.[0]?.id ?? null));
      setDogsLoading(false);
    }

    loadDogs();

    return () => {
      active = false;
    };
  }, [session?.user.id]);

  function triggerSuccessAnimation(xp: number) {
    setEarnedXp(xp);
    anim.setValue(0);
    Animated.sequence([
      Animated.timing(anim, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.delay(1100),
      Animated.timing(anim, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start(() => setEarnedXp(null));
  }

  async function upsertStreak(userId: string) {
    const today = new Date();
    const todayOnly = toDateOnly(today);
    const yesterdayOnly = toDateOnlyOffset(today, -1);

    const { data: existing, error: streakFetchError } = await supabase
      .from('streaks')
      .select('id, user_id, current_streak, longest_streak, last_activity_date')
      .eq('user_id', userId)
      .maybeSingle();

    if (streakFetchError) throw new Error(streakFetchError.message);

    const row = existing as StreakRow | null;

    if (!row) {
      const { error: insertError } = await supabase.from('streaks').insert({
        user_id: userId,
        current_streak: 1,
        longest_streak: 1,
        last_activity_date: todayOnly,
      });
      if (insertError) throw new Error(insertError.message);
      return;
    }

    const canIncrement =
      row.last_activity_date === todayOnly || row.last_activity_date === yesterdayOnly;
    const nextCurrentStreak = canIncrement ? row.current_streak + 1 : 1;
    const nextLongestStreak = Math.max(row.longest_streak, nextCurrentStreak);

    const { error: updateError } = await supabase
      .from('streaks')
      .update({
        current_streak: nextCurrentStreak,
        longest_streak: nextLongestStreak,
        last_activity_date: todayOnly,
        updated_at: new Date().toISOString(),
      })
      .eq('id', row.id);

    if (updateError) throw new Error(updateError.message);
  }

  async function handleSubmit() {
    setSubmitError(null);

    const userId = session?.user.id;
    if (!userId) {
      setSubmitError('Please sign in again.');
      return;
    }

    if (!selectedDogId) {
      setSubmitError('Select a dog before logging an adventure.');
      return;
    }

    const distance = Number(distanceMiles);
    const duration = Number(durationMinutes);

    if (!Number.isFinite(distance) || distance < 0) {
      setSubmitError('Distance must be a valid number.');
      return;
    }

    if (!Number.isFinite(duration) || duration < 0) {
      setSubmitError('Duration must be a valid number.');
      return;
    }

    setSubmitting(true);

    try {
      const xpAmount = calculateAdventureXp({
        durationMinutes: duration,
        distanceMiles: distance,
      });

      const { error: adventureError } = await supabase.from('adventures').insert({
        user_id: userId,
        dog_id: selectedDogId,
        title: activityType,
        notes: notes.trim() || null,
        distance_miles: distance,
        duration_minutes: Math.round(duration),
        location_name: locationName.trim() || null,
        logged_at: new Date().toISOString(),
      });

      if (adventureError) throw new Error(adventureError.message);

      const { error: xpError } = await supabase.from('xp_events').insert({
        user_id: userId,
        dog_id: selectedDogId,
        event_type: `adventure:${activityType.toLowerCase().replace(/\s+/g, '_')}`,
        xp_amount: xpAmount,
      });

      if (xpError) throw new Error(xpError.message);

      await upsertStreak(userId);

      setDistanceMiles('');
      setDurationMinutes('');
      setNotes('');
      setLocationName('');
      triggerSuccessAnimation(xpAmount);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save adventure.';
      setSubmitError(message);
    } finally {
      setSubmitting(false);
    }
  }

  const successScale = anim.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] });
  const successOpacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.snow }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 16,
            paddingBottom: Math.max(insets.bottom + 280, 320),
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
        <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 24, color: Colors.navy, marginBottom: 4 }}>
          Log Adventure
        </Text>
        <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mist, marginBottom: 20 }}>
          Capture today&apos;s activity and grow your pack XP.
        </Text>

        <View
          className="rounded-3xl p-5"
          style={{
            backgroundColor: Colors.white,
            shadowColor: '#000',
            shadowOpacity: 0.07,
            shadowRadius: 16,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        >
          <Text style={LABEL}>Dog</Text>
          {dogsLoading ? (
            <View className="py-3">
              <ActivityIndicator color={Colors.ocean} />
            </View>
          ) : dogs.length === 0 ? (
            <Text style={{ fontFamily: 'Outfit_400Regular', color: Colors.mist, marginBottom: 12 }}>
              Add a dog in onboarding before logging adventures.
            </Text>
          ) : (
            <View className="flex-row flex-wrap gap-2 mb-4">
              {dogs.map((dog) => {
                const selected = selectedDogId === dog.id;
                return (
                  <Pressable
                    key={dog.id}
                    onPress={() => setSelectedDogId((prev) => (prev === dog.id ? null : dog.id))}
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 8,
                      borderRadius: 999,
                      borderWidth: 1.5,
                      borderColor: selected ? Colors.ocean : Colors.sky,
                      paddingVertical: 6,
                      paddingLeft: 6,
                      paddingRight: 12,
                      backgroundColor: selected ? Colors.iceBlue : Colors.white,
                    }}
                  >
                    <DogAvatarGroup dogs={[{ name: dog.name, imageUrl: dog.avatar_url ?? undefined }]} max={1} />
                    <Text style={{ fontFamily: 'Outfit_500Medium', color: Colors.navy }}>
                      {dog.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          )}
          {dogsError && (
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 13, color: '#C0392B', marginBottom: 12 }}>
              {dogsError}
            </Text>
          )}

          <Text style={LABEL}>Activity type</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {ACTIVITY_TYPES.map((type) => {
              const selected = type === activityType;
              return (
                <Pressable
                  key={type}
                  onPress={() => setActivityType(type)}
                  style={{
                    borderRadius: 999,
                    borderWidth: 1.5,
                    borderColor: selected ? Colors.ocean : Colors.sky,
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    backgroundColor: selected ? Colors.iceBlue : Colors.white,
                  }}
                >
                  <Text style={{ fontFamily: 'Outfit_500Medium', color: Colors.navy }}>
                    {type}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          <View className="flex-row gap-3 mb-4">
            <View style={{ flex: 1 }}>
              <Text style={LABEL}>Distance (miles)</Text>
              <TextInput
                style={INPUT}
                value={distanceMiles}
                onChangeText={setDistanceMiles}
                placeholder="0.0"
                placeholderTextColor={Colors.mist}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={LABEL}>Duration (minutes)</Text>
              <TextInput
                style={INPUT}
                value={durationMinutes}
                onChangeText={setDurationMinutes}
                placeholder="0"
                placeholderTextColor={Colors.mist}
                keyboardType="number-pad"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text style={LABEL}>Location</Text>
            <TextInput
              style={INPUT}
              value={locationName}
              onChangeText={setLocationName}
              placeholder="e.g. Mission Trail Park"
              placeholderTextColor={Colors.mist}
              autoCapitalize="words"
            />
          </View>

          <View className="mb-4">
            <Text style={LABEL}>Notes</Text>
            <TextInput
              style={[
                INPUT,
                {
                  minHeight: 110,
                  height: 110,
                  paddingTop: 12,
                  textAlignVertical: 'top',
                },
              ]}
              value={notes}
              onChangeText={setNotes}
              placeholder="How did it go today?"
              placeholderTextColor={Colors.mist}
              multiline
            />
          </View>

          <View
            className="rounded-2xl px-4 py-3 mb-4"
            style={{ backgroundColor: Colors.iceBlue }}
          >
            <Text style={{ fontFamily: 'Outfit_500Medium', color: Colors.ocean }}>
              XP preview: +{previewXp}
            </Text>
            <Text style={{ fontFamily: 'Outfit_400Regular', color: Colors.mist, fontSize: 12, marginTop: 2 }}>
              Base 30 + 1/min + 10/mile (max 150)
            </Text>
          </View>

          {submitError && (
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 13, color: '#C0392B', marginBottom: 10 }}>
              {submitError}
            </Text>
          )}

          <TouchableOpacity
            onPress={handleSubmit}
            disabled={submitting || dogsLoading || dogs.length === 0}
            activeOpacity={0.85}
            style={[PRIMARY_BUTTON, { opacity: submitting || dogsLoading || dogs.length === 0 ? 0.7 : 1 }]}
          >
            {submitting ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={PRIMARY_BUTTON_TEXT}>Save adventure</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
      </KeyboardAvoidingView>

      {earnedXp !== null && (
        <View
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Animated.View
            style={{
              opacity: successOpacity,
              transform: [{ scale: successScale }],
              paddingHorizontal: 24,
              paddingVertical: 18,
              borderRadius: 20,
              backgroundColor: Colors.ocean,
              alignItems: 'center',
            }}
          >
            <Text style={{ fontSize: 28, marginBottom: 6 }}>🎉</Text>
            <Text style={{ fontFamily: 'Nunito_700Bold', color: Colors.white, fontSize: 20 }}>
              +{earnedXp} XP
            </Text>
            <Text style={{ fontFamily: 'Outfit_400Regular', color: Colors.iceBlue, marginTop: 2 }}>
              Adventure logged
            </Text>
          </Animated.View>
        </View>
      )}
    </SafeAreaView>
  );
}
