import { useMemo, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Colors from '@/constants/colors';
import { PRIMARY_BUTTON, PRIMARY_BUTTON_TEXT } from '@/constants/primaryButton';
import { adventurePrograms } from '@/data/adventurePrograms';
import { trainingPrograms } from '@/data/trainingPrograms';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

type ProgramType = 'adventure' | 'training';

export default function ProgramsScreen() {
  const session = useAuthStore((state) => state.session);
  const [loadingProgramId, setLoadingProgramId] = useState<string | null>(null);

  const sections = useMemo(
    () => [
      { title: 'Adventure Programs', programType: 'adventure' as ProgramType, items: adventurePrograms },
      { title: 'Training Programs', programType: 'training' as ProgramType, items: trainingPrograms },
    ],
    []
  );

  async function handleEnroll(programId: string, programType: ProgramType, title: string, durationDays: number) {
    if (!session?.user.id) {
      Alert.alert('Login required', 'Please log in to enroll in a program.');
      return;
    }

    setLoadingProgramId(programId);

    const { error } = await supabase.from('user_programs').upsert(
      {
        user_id: session.user.id,
        program_id: programId,
        program_type: programType,
        started_at: new Date().toISOString(),
        current_day: 1,
        completed_at: null,
      },
      { onConflict: 'user_id,program_id,program_type' }
    );

    setLoadingProgramId(null);

    if (error) {
      Alert.alert('Enrollment failed', error.message);
      return;
    }

    Alert.alert(
      'Enrolled successfully',
      `${title}\n\nDuration: ${durationDays} days\nDay 1 mission is now available in Today.`
    );
  }

  async function openMaps(url: string) {
    const supported = await Linking.canOpenURL(url);
    if (!supported) {
      Alert.alert('Unable to open map link');
      return;
    }
    await Linking.openURL(url);
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.snow }}>
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 44 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 24, color: Colors.navy, marginBottom: 4 }}>
          Programs
        </Text>
        <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mist, marginBottom: 20 }}>
          Choose a pre-packaged plan and get daily missions in Today.
        </Text>

        {sections.map((section) => (
          <View key={section.title} className="mb-7">
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 18, color: Colors.navy, marginBottom: 10 }}>
              {section.title}
            </Text>

            <View className="gap-4">
              {section.items.map((program) => (
                <View
                  key={program.id}
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
                  <View className="flex-row items-center justify-between mb-1">
                    <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 18, color: Colors.navy, flex: 1 }}>
                      {program.title}
                    </Text>
                    <View className="rounded-full px-2 py-1" style={{ backgroundColor: Colors.iceBlue }}>
                      <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 12, color: Colors.ocean }}>
                        {program.difficulty}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mist, marginBottom: 10 }}>
                    {program.description}
                  </Text>

                  <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 12, color: Colors.mist, marginBottom: 8 }}>
                    {program.duration_days} days
                    {'weekly_miles_target' in program
                      ? ` · ${program.weekly_miles_target} mi/week target`
                      : ''}
                  </Text>

                  {'locations' in program && program.locations.length > 0 && (
                    <View className="gap-2 mb-4">
                      {program.locations.map((location) => (
                        <View key={`${program.id}-${location.name}`}>
                          <Text style={{ fontFamily: 'Outfit_500Medium', color: Colors.navy }}>
                            {location.name}
                          </Text>
                          <Text style={{ fontFamily: 'Outfit_400Regular', color: Colors.mist, fontSize: 12 }}>
                            {location.address}
                          </Text>
                          <Pressable onPress={() => openMaps(location.maps_url)}>
                            <Text style={{ fontFamily: 'Outfit_500Medium', color: Colors.ocean, marginTop: 2 }}>
                              Open in Maps
                            </Text>
                          </Pressable>
                        </View>
                      ))}
                    </View>
                  )}

                  <TouchableOpacity
                    onPress={() =>
                      handleEnroll(program.id, section.programType, program.title, program.duration_days)
                    }
                    disabled={loadingProgramId === program.id}
                    activeOpacity={0.85}
                    style={[PRIMARY_BUTTON, { opacity: loadingProgramId === program.id ? 0.7 : 1 }]}
                  >
                    <Text style={[PRIMARY_BUTTON_TEXT, { fontSize: 15 }]}>
                      {loadingProgramId === program.id ? 'Enrolling...' : 'Enroll'}
                    </Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
