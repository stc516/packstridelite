import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

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
  order_index: number;
};

type TrainingProgressRow = {
  module_id: string;
  lesson_id: string;
  completed: boolean;
};

export default function TrainScreen() {
  const router = useRouter();
  const session = useAuthStore((state) => state.session);

  const [modules, setModules] = useState<TrainingModuleRow[]>([]);
  const [completedRows, setCompletedRows] = useState<TrainingProgressRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadTrainingData() {
      if (!session?.user.id) {
        if (active) {
          setLoading(false);
          setModules([]);
          setCompletedRows([]);
        }
        return;
      }

      setLoading(true);
      setError(null);

      const [{ data: moduleData, error: moduleError }, { data: progressData, error: progressError }] =
        await Promise.all([
          supabase
            .from('training_modules')
            .select('id, slug, title, description, category, order_index')
            .order('order_index', { ascending: true }),
          supabase
            .from('training_progress')
            .select('module_id, lesson_id, completed')
            .eq('user_id', session.user.id)
            .eq('completed', true),
        ]);

      if (!active) return;

      if (moduleError || progressError) {
        setError(moduleError?.message ?? progressError?.message ?? 'Unable to load training data.');
        setLoading(false);
        return;
      }

      setModules((moduleData ?? []) as TrainingModuleRow[]);
      setCompletedRows((progressData ?? []) as TrainingProgressRow[]);
      setLoading(false);
    }

    loadTrainingData();

    return () => {
      active = false;
    };
  }, [session?.user.id]);

  const completedLessonMap = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const row of completedRows) {
      if (!map.has(row.module_id)) {
        map.set(row.module_id, new Set<string>());
      }
      map.get(row.module_id)?.add(row.lesson_id);
    }
    return map;
  }, [completedRows]);

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.snow }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 24, color: Colors.navy, marginBottom: 4 }}>
          Training
        </Text>
        <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mist, marginBottom: 20 }}>
          Complete lessons and earn XP with your pack.
        </Text>

        {loading ? (
          <View className="py-8">
            <ActivityIndicator color={Colors.ocean} />
          </View>
        ) : error ? (
          <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: '#C0392B' }}>
            {error}
          </Text>
        ) : (
          <View className="gap-4">
            {modules.map((module) => {
              const lessonCount = trainingContentBySlug[module.slug]?.lessons.length ?? 0;
              const completedCount = completedLessonMap.get(module.id)?.size ?? 0;
              const progress = lessonCount > 0 ? completedCount / lessonCount : 0;

              return (
                <TouchableOpacity
                  key={module.id}
                  activeOpacity={0.85}
                  onPress={() => {
                    router.push({
                      pathname: '/train/[moduleSlug]',
                      params: { moduleSlug: module.slug },
                    });
                  }}
                  style={{
                    borderRadius: 18,
                    padding: 18,
                    backgroundColor: Colors.white,
                    shadowColor: '#000',
                    shadowOpacity: 0.06,
                    shadowRadius: 12,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 3,
                  }}
                >
                  <View className="flex-row items-center justify-between mb-2">
                    <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 18, color: Colors.navy, flex: 1 }}>
                      {module.title}
                    </Text>
                    <View
                      className="rounded-full px-2 py-1"
                      style={{ backgroundColor: Colors.iceBlue }}
                    >
                      <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 12, color: Colors.ocean }}>
                        {module.category}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mist, marginBottom: 12 }}>
                    {module.description}
                  </Text>

                  <View
                    className="rounded-full overflow-hidden"
                    style={{ height: 9, backgroundColor: Colors.iceBlue }}
                  >
                    <View
                      style={{
                        width: `${progress * 100}%`,
                        height: 9,
                        backgroundColor: Colors.ocean,
                      }}
                    />
                  </View>

                  <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 12, color: Colors.mist, marginTop: 8 }}>
                    {completedCount}/{lessonCount} lessons completed
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
