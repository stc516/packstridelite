import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DogAvatar from '@/components/DogAvatar';
import Colors from '@/constants/colors';

interface Dog {
  name: string;
  breed: string;
  age: string;
  xp: number;
  level: number;
  imageUrl?: string;
}

const DOGS: Dog[] = [
  { name: 'Bailey', breed: 'Husky', age: '4 yrs', xp: 1240, level: 8 },
  { name: 'Meiomi', breed: 'Lab Mix', age: 'Senior', xp: 980, level: 6 },
  { name: 'Monte', breed: 'Lab / Cane Corso', age: '2 yrs', xp: 560, level: 4 },
];

const XP_PER_LEVEL = 200;

function LevelBar({ xp, level }: { xp: number; level: number }) {
  const xpIntoLevel = xp - (level - 1) * XP_PER_LEVEL;
  const progress = Math.min(xpIntoLevel / XP_PER_LEVEL, 1);

  return (
    <View className="mt-3">
      <View className="flex-row justify-between mb-1">
        <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.mist }}>
          Lvl {level}
        </Text>
        <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 12, color: Colors.mist }}>
          {xp} XP
        </Text>
      </View>
      <View
        className="rounded-full overflow-hidden"
        style={{ height: 6, backgroundColor: Colors.iceBlue }}
      >
        <View
          style={{
            width: `${progress * 100}%`,
            height: '100%',
            backgroundColor: Colors.ocean,
            borderRadius: 99,
          }}
        />
      </View>
    </View>
  );
}

function DogCard({ dog }: { dog: Dog }) {
  return (
    <View
      className="rounded-2xl p-4 mb-4 flex-row items-start"
      style={{
        backgroundColor: Colors.white,
        shadowColor: '#000',
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 4 },
        elevation: 3,
      }}
    >
      <DogAvatar name={dog.name} size="lg" imageUrl={dog.imageUrl} />
      <View className="flex-1 ml-4">
        <View className="flex-row items-center justify-between">
          <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 18, color: Colors.navy }}>
            {dog.name}
          </Text>
          <View
            className="rounded-full px-2 py-0.5"
            style={{ backgroundColor: Colors.iceBlue }}
          >
            <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 12, color: Colors.ocean }}>
              Lvl {dog.level}
            </Text>
          </View>
        </View>
        <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.mist, marginTop: 2 }}>
          {dog.breed} · {dog.age}
        </Text>
        <LevelBar xp={dog.xp} level={dog.level} />
      </View>
    </View>
  );
}

export default function PackScreen() {
  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.snow }}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 24, color: Colors.navy, marginBottom: 20 }}>
          My Pack
        </Text>

        {DOGS.map((dog) => (
          <DogCard key={dog.name} dog={dog} />
        ))}

        <TouchableOpacity
          activeOpacity={0.75}
          className="rounded-2xl py-4 items-center justify-center flex-row gap-2"
          style={{
            borderWidth: 2,
            borderColor: Colors.sky,
            borderStyle: 'dashed',
          }}
        >
          <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: Colors.ocean }}>
            + Add Dog
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
