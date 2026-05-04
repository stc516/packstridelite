import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { trainingContentBySlug } from '@/data/trainingContent';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

type TrainingModuleRow = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
};

type TrainingProgressRow = {
  lesson_id: string;
  completed: boolean;
};

export default function TrainingModuleDetailScreen() {
  const router = useRouter();
  const { moduleSlug } = useLocalSearchParams<{ moduleSlug: string }>();
  const session = useAuthStore((state) => state.session);

  const [moduleRow, setModuleRow] = useState<TrainingModuleRow | null>(null);
  const [completedLessonIds, setCompletedLessonIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successXp, setSuccessXp] = useState<number | null>(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState<number | null>(null);

  const moduleContent = moduleSlug ? trainingContentBySlug[moduleSlug] : undefined;

  useEffect(() => {
    let active = true;

    async function loadModule() {
      if (!session?.user.id || !moduleSlug) {
        if (active) setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      const { data: moduleData, error: moduleError } = await supabase
        .from('training_modules')
        .select('id, slug, title, description, category')
        .eq('slug', moduleSlug)
        .maybeSingle();

      if (!active) return;

      if (moduleError || !moduleData) {
        setError(moduleError?.message ?? 'Training module not found.');
        setLoading(false);
        return;
      }

      const { data: progressData, error: progressError } = await supabase
        .from('training_progress')
        .select('lesson_id, completed')
        .eq('user_id', session.user.id)
        .eq('module_id', moduleData.id)
        .eq('completed', true);

      if (!active) return;

      if (progressError) {
        setError(progressError.message);
        setLoading(false);
        return;
      }

      const completed = new Set<string>(
        ((progressData ?? []) as TrainingProgressRow[]).map((row) => row.lesson_id)
      );

      setModuleRow(moduleData as TrainingModuleRow);
      setCompletedLessonIds(completed);
      setLoading(false);
    }

    loadModule();

    return () => {
      active = false;
    };
  }, [session?.user.id, moduleSlug]);

  const lessons = moduleContent?.lessons ?? [];

  const defaultLessonIndex = useMemo(() => {
    const firstIncompleteIndex = lessons.findIndex((lesson) => !completedLessonIds.has(lesson.id));
    return firstIncompleteIndex === -1 ? Math.max(lessons.length - 1, 0) : firstIncompleteIndex;
  }, [lessons, completedLessonIds]);

  useEffect(() => {
    if (activeLessonIndex !== null) return;
    setActiveLessonIndex(defaultLessonIndex);
  }, [activeLessonIndex, defaultLessonIndex]);

  const currentLessonIndex = activeLessonIndex ?? defaultLessonIndex;

  const currentLesson = lessons[currentLessonIndex];
  const currentCompleted = currentLesson ? completedLessonIds.has(currentLesson.id) : false;
  const completedCount = completedLessonIds.size;
  const canGoPrevious = currentLessonIndex > 0;
  const canGoNext = currentLessonIndex < lessons.length - 1;

  async function markLessonComplete() {
    if (!session?.user.id || !moduleRow || !currentLesson || currentCompleted) return;

    setSaving(true);
    setError(null);

    const nowIso = new Date().toISOString();
    const xpReward = currentLesson.xpReward;

    const { error: progressError } = await supabase.from('training_progress').upsert(
      {
        user_id: session.user.id,
        module_id: moduleRow.id,
        lesson_id: currentLesson.id,
        completed: true,
        completed_at: nowIso,
      },
      { onConflict: 'user_id,module_id,lesson_id' }
    );

    if (progressError) {
      setSaving(false);
      setError(progressError.message);
      return;
    }

    const { error: xpError } = await supabase.from('xp_events').insert({
      user_id: session.user.id,
      dog_id: null,
      event_type: `training:${moduleRow.slug}:${currentLesson.id}`,
      xp_amount: xpReward,
    });

    setSaving(false);

    if (xpError) {
      setError(xpError.message);
      return;
    }

    setCompletedLessonIds((prev) => {
      const next = new Set(prev);
      next.add(currentLesson.id);
      return next;
    });

    if (currentLessonIndex < lessons.length - 1) {
      setActiveLessonIndex(currentLessonIndex + 1);
    }

    setSuccessXp(xpReward);
    setTimeout(() => setSuccessXp(null), 1400);
  }

  if (!moduleSlug || !moduleContent) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center" style={{ backgroundColor: Colors.snow }}>
        <Text style={{ fontFamily: 'Outfit_500Medium', color: Colors.navy }}>Module not found.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.snow }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Pressable onPress={() => router.back()} style={{ marginBottom: 16 }}>
          <Text style={{ fontFamily: 'Outfit_500Medium', color: Colors.ocean }}>{'< Back'}</Text>
        </Pressable>

        {loading ? (
          <View className="py-8">
            <ActivityIndicator color={Colors.ocean} />
          </View>
        ) : error ? (
          <Text style={{ fontFamily: 'Outfit_400Regular', color: '#C0392B' }}>{error}</Text>
        ) : (
          <>
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 24, color: Colors.navy, marginBottom: 4 }}>
              {moduleRow?.title}
            </Text>
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mist, marginBottom: 14 }}>
              {moduleRow?.description}
            </Text>

            <View className="mb-5">
              <View
                className="rounded-full overflow-hidden"
                style={{ height: 9, backgroundColor: Colors.iceBlue }}
              >
                <View
                  style={{
                    width: `${lessons.length > 0 ? (completedCount / lessons.length) * 100 : 0}%`,
                    height: 9,
                    backgroundColor: Colors.ocean,
                  }}
                />
              </View>
              <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 12, color: Colors.mist, marginTop: 8 }}>
                {completedCount}/{lessons.length} lessons complete
              </Text>
            </View>

            {currentLesson && (
              <View
                className="rounded-3xl p-6"
                style={{
                  backgroundColor: Colors.white,
                  shadowColor: '#000',
                  shadowOpacity: 0.06,
                  shadowRadius: 14,
                  shadowOffset: { width: 0, height: 4 },
                  elevation: 3,
                }}
              >
                <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 12, color: Colors.mist, marginBottom: 6 }}>
                  Lesson {currentLessonIndex + 1} of {lessons.length}
                </Text>
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 22, color: Colors.navy, marginBottom: 10 }}>
                  {currentLesson.title}
                </Text>
                <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 15, color: Colors.navy, lineHeight: 22, marginBottom: 16 }}>
                  {currentLesson.body}
                </Text>

                <View
                  className="rounded-full px-3 py-1 self-start mb-16"
                  style={{ backgroundColor: Colors.iceBlue }}
                >
                  <Text style={{ fontFamily: 'Outfit_500Medium', color: Colors.ocean }}>
                    +{currentLesson.xpReward} XP
                  </Text>
                </View>

                {successXp !== null && (
                  <Text style={{ fontFamily: 'Outfit_500Medium', color: Colors.gold, marginBottom: 10 }}>
                    Nice work! +{successXp} XP awarded.
                  </Text>
                )}

                <View className="flex-row gap-3 mb-4">
                  <Pressable
                    onPress={() => canGoPrevious && setActiveLessonIndex(currentLessonIndex - 1)}
                    disabled={!canGoPrevious}
                    style={({ pressed }) => ({
                      flex: 1,
                      height: 46,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1.5,
                      borderColor: canGoPrevious ? Colors.sky : Colors.iceBlue,
                      backgroundColor: pressed ? Colors.iceBlue : Colors.white,
                      opacity: canGoPrevious ? 1 : 0.6,
                    })}
                  >
                    <Text style={{ fontFamily: 'Outfit_500Medium', color: Colors.ocean }}>Previous</Text>
                  </Pressable>
                  <Pressable
                    onPress={() => canGoNext && setActiveLessonIndex(currentLessonIndex + 1)}
                    disabled={!canGoNext}
                    style={({ pressed }) => ({
                      flex: 1,
                      height: 46,
                      borderRadius: 12,
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderWidth: 1.5,
                      borderColor: canGoNext ? Colors.sky : Colors.iceBlue,
                      backgroundColor: pressed ? Colors.iceBlue : Colors.white,
                      opacity: canGoNext ? 1 : 0.6,
                    })}
                  >
                    <Text style={{ fontFamily: 'Outfit_500Medium', color: Colors.ocean }}>Next lesson</Text>
                  </Pressable>
                </View>

                <Pressable
                  onPress={markLessonComplete}
                  disabled={saving || currentCompleted}
                  style={({ pressed }) => ({
                    height: 50,
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: currentCompleted ? Colors.mist : pressed ? '#152E4A' : Colors.ocean,
                    opacity: saving ? 0.75 : 1,
                  })}
                >
                  {saving ? (
                    <ActivityIndicator color={Colors.white} />
                  ) : (
                    <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: Colors.white }}>
                      {currentCompleted ? 'Completed' : 'Complete Lesson'}
                    </Text>
                  )}
                </Pressable>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
