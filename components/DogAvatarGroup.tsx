import { Text, View } from 'react-native';
import DogAvatar from './DogAvatar';
import Colors from '@/constants/colors';

export interface DogEntry {
  name: string;
  imageUrl?: string;
}

interface Props {
  dogs: DogEntry[];
  max?: number;
}

const OVERLAP = 10;
const SM = 28;

export default function DogAvatarGroup({ dogs, max = 3 }: Props) {
  const visible = dogs.slice(0, max);
  const overflow = dogs.length - max;

  const totalWidth = visible.length * (SM - OVERLAP) + OVERLAP + (overflow > 0 ? SM - OVERLAP : 0);

  return (
    <View style={{ width: totalWidth, height: SM, flexDirection: 'row' }}>
      {visible.map((dog, i) => (
        <View
          key={dog.name}
          style={{
            position: 'absolute',
            left: i * (SM - OVERLAP),
            borderWidth: 2,
            borderColor: Colors.snow,
            borderRadius: SM / 2,
          }}
        >
          <DogAvatar name={dog.name} size="sm" imageUrl={dog.imageUrl} />
        </View>
      ))}
      {overflow > 0 && (
        <View
          style={{
            position: 'absolute',
            left: visible.length * (SM - OVERLAP),
            width: SM,
            height: SM,
            borderRadius: SM / 2,
            backgroundColor: Colors.mist,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: Colors.snow,
          }}
        >
          <Text style={{ color: Colors.white, fontSize: 11, fontWeight: '700' }}>
            +{overflow}
          </Text>
        </View>
      )}
    </View>
  );
}
