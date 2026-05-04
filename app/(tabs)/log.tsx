import { SafeAreaView } from 'react-native-safe-area-context';
import { Text } from 'react-native';

export default function LogScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-white">
      <Text className="text-2xl font-bold">Log</Text>
    </SafeAreaView>
  );
}
