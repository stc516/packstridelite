import { Image, Text, View } from 'react-native';
import Colors from '@/constants/colors';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface DogAvatarProps {
  name: string;
  size?: AvatarSize;
  imageUrl?: string;
}

const DIMENSIONS: Record<AvatarSize, number> = {
  sm: 28,
  md: 36,
  lg: 56,
};

const FONT_SIZES: Record<AvatarSize, number> = {
  sm: 11,
  md: 14,
  lg: 22,
};

function avatarColor(name: string): string {
  if (name in Colors.dogs) {
    return Colors.dogs[name as keyof typeof Colors.dogs];
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  }
  return Colors.dogPalette[hash % Colors.dogPalette.length];
}

function initials(name: string): string {
  return name.trim().charAt(0).toUpperCase();
}

export default function DogAvatar({ name, size = 'md', imageUrl }: DogAvatarProps) {
  const dim = DIMENSIONS[size];
  const fontSize = FONT_SIZES[size];
  const color = avatarColor(name);

  const circleStyle = {
    width: dim,
    height: dim,
    borderRadius: dim / 2,
    backgroundColor: color,
    alignItems: 'center' as const,
    justifyContent: 'center' as const,
    overflow: 'hidden' as const,
  };

  if (imageUrl) {
    return (
      <View style={circleStyle}>
        <Image
          source={{ uri: imageUrl }}
          style={{ width: dim, height: dim, borderRadius: dim / 2 }}
        />
      </View>
    );
  }

  return (
    <View style={circleStyle}>
      <Text style={{ color: '#FFFFFF', fontSize, fontWeight: '700', lineHeight: fontSize * 1.2 }}>
        {initials(name)}
      </Text>
    </View>
  );
}
