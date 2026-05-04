import { useEffect, useMemo, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Svg, Circle } from 'react-native-svg';
import { Link } from 'expo-router';
import DogAvatarGroup from '@/components/DogAvatarGroup';
import Colors from '@/constants/colors';
import { adventureProgramsById } from '@/data/adventurePrograms';
import { trainingProgramsById } from '@/data/trainingPrograms';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

// ── mock data ──────────────────────────────────────────────────────────────
const USER_NAME = 'Stephen';
const STREAK = 7;
const DOGS = [
  { name: 'Bailey' },
  { name: 'Meiomi' },
  { name: 'Monte' },
];
const DEFAULT_MISSIONS = [
  { id: '1', title: '30-min trail walk', xp: 50, done: false },
  { id: '2', title: 'Log Bailey meal', xp: 20, done: false },
];

type UserProgramRow = {
  id: string;
  program_id: string;
  program_type: 'adventure' | 'training';
  current_day: number;
};

type TodayMission = {
  id: string;
  title: string;
  xp: number;
  done: boolean;
};

// ── streak ring ────────────────────────────────────────────────────────────
const RING_SIZE = 120;
const STROKE = 10;
const RADIUS = (RING_SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
const MAX_STREAK = 30;

function StreakRing({ streak }: { streak: number }) {
  const progress = Math.min(streak / MAX_STREAK, 1);
  const dashOffset = CIRCUMFERENCE * (1 - progress);

  return (
    <View className="items-center justify-center" style={{ width: RING_SIZE, height: RING_SIZE }}>
      <Svg width={RING_SIZE} height={RING_SIZE} style={{ position: 'absolute' }}>
        {/* track */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke={Colors.iceBlue}
          strokeWidth={STROKE}
          fill="none"
        />
        {/* progress */}
        <Circle
          cx={RING_SIZE / 2}
          cy={RING_SIZE / 2}
          r={RADIUS}
          stroke={Colors.gold}
          strokeWidth={STROKE}
          fill="none"
          strokeDasharray={`${CIRCUMFERENCE}`}
          strokeDashoffset={dashOffset}
          strokeLinecap="round"
          rotation="-90"
          origin={`${RING_SIZE / 2}, ${RING_SIZE / 2}`}
        />
      </Svg>
      <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 30, color: Colors.navy }}>
        {streak}
      </Text>
      <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 11, color: Colors.mist }}>
        day streak
      </Text>
    </View>
  );
}

// ── user initials avatar ───────────────────────────────────────────────────
function UserAvatar({ name }: { name: string }) {
  const initial = name.trim().charAt(0).toUpperCase();
  return (
    <View
      className="items-center justify-center"
      style={{
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.ocean,
      }}
    >
      <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 17, color: Colors.white }}>
        {initial}
      </Text>
    </View>
  );
}

// ── xp badge ──────────────────────────────────────────────────────────────
function XpBadge({ xp }: { xp: number }) {
  return (
    <View
      className="rounded-full px-2 py-0.5"
      style={{ backgroundColor: Colors.iceBlue }}
    >
      <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 12, color: Colors.ocean }}>
        +{xp} XP
      </Text>
    </View>
  );
}

// ── main screen ───────────────────────────────────────────────────────────
export default function TodayScreen() {
  const session = useAuthStore((state) => state.session);
  const [programRows, setProgramRows] = useState<UserProgramRow[]>([]);
  const [programError, setProgramError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    async function loadProgramMissions() {
      if (!session?.user.id) {
        if (active) {
          setProgramRows([]);
          setProgramError(null);
        }
        return;
      }

      const { data, error } = await supabase
        .from('user_programs')
        .select('id, program_id, program_type, current_day')
        .eq('user_id', session.user.id)
        .is('completed_at', null)
        .order('started_at', { ascending: false });

      if (!active) return;

      if (error) {
        setProgramError(error.message);
        setProgramRows([]);
        return;
      }

      setProgramError(null);
      setProgramRows((data ?? []) as UserProgramRow[]);
    }

    loadProgramMissions();

    return () => {
      active = false;
    };
  }, [session?.user.id]);

  const missions = useMemo<TodayMission[]>(() => {
    const enrolledMissions: TodayMission[] = [];

    for (const row of programRows) {
      if (row.program_type === 'adventure') {
        const program = adventureProgramsById[row.program_id];
        const mission = program?.daily_missions.find((item) => item.day === row.current_day);
        if (!program || !mission) continue;
        enrolledMissions.push({
          id: `up-${row.id}-day-${mission.day}`,
          title: `${program.title}: ${mission.title}`,
          xp: mission.xp,
          done: false,
        });
      } else {
        const program = trainingProgramsById[row.program_id];
        const lesson = program?.daily_lessons.find((item) => item.day === row.current_day);
        if (!program || !lesson) continue;
        enrolledMissions.push({
          id: `up-${row.id}-day-${lesson.day}`,
          title: `${program.title}: ${lesson.title}`,
          xp: lesson.xp,
          done: false,
        });
      }
    }

    return enrolledMissions.length > 0 ? enrolledMissions : DEFAULT_MISSIONS;
  }, [programRows]);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.snow }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.mist }}>
              {greeting},
            </Text>
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 22, color: Colors.navy }}>
              {USER_NAME}
            </Text>
          </View>
          <UserAvatar name={USER_NAME} />
        </View>

        {/* streak card */}
        <View
          className="rounded-2xl p-5 mb-5"
          style={{ backgroundColor: Colors.white, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 3 }}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1 pr-4">
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 18, color: Colors.navy, marginBottom: 4 }}>
                Pack Streak
              </Text>
              <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.mist, marginBottom: 12 }}>
                Keep the momentum going!
              </Text>
              <DogAvatarGroup dogs={DOGS} />
            </View>
            <StreakRing streak={STREAK} />
          </View>
        </View>

        {/* daily missions */}
        <View className="flex-row items-center justify-between mb-3">
          <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 17, color: Colors.navy }}>
            Daily Missions
          </Text>
          <Link href="/programs" asChild>
            <TouchableOpacity activeOpacity={0.75}>
              <Text style={{ fontFamily: 'Outfit_500Medium', fontSize: 13, color: Colors.ocean }}>
                Browse Programs
              </Text>
            </TouchableOpacity>
          </Link>
        </View>
        {programError && (
          <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 12, color: '#C0392B', marginBottom: 10 }}>
            {programError}
          </Text>
        )}
        <View className="gap-3">
          {missions.map((mission) => (
            <TouchableOpacity
              key={mission.id}
              activeOpacity={0.75}
              className="rounded-2xl px-4 py-4 flex-row items-center justify-between"
              style={{
                backgroundColor: Colors.white,
                shadowColor: '#000',
                shadowOpacity: 0.04,
                shadowRadius: 8,
                shadowOffset: { width: 0, height: 2 },
                elevation: 2,
                opacity: mission.done ? 0.5 : 1,
              }}
            >
              <View className="flex-row items-center gap-3 flex-1">
                {/* checkbox */}
                <View
                  style={{
                    width: 22,
                    height: 22,
                    borderRadius: 11,
                    borderWidth: 2,
                    borderColor: mission.done ? Colors.ocean : Colors.sky,
                    backgroundColor: mission.done ? Colors.ocean : 'transparent',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {mission.done && (
                    <Text style={{ color: Colors.white, fontSize: 13, fontWeight: '700' }}>✓</Text>
                  )}
                </View>
                <Text
                  style={{
                    fontFamily: 'Outfit_500Medium',
                    fontSize: 15,
                    color: Colors.navy,
                    flex: 1,
                    textDecorationLine: mission.done ? 'line-through' : 'none',
                  }}
                >
                  {mission.title}
                </Text>
              </View>
              <XpBadge xp={mission.xp} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
