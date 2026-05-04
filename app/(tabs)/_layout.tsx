import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen name="index" />
      <Tabs.Screen name="log" />
      <Tabs.Screen name="train" />
      <Tabs.Screen name="discover" />
      <Tabs.Screen name="pack" />
      <Tabs.Screen name="moments" />
    </Tabs>
  );
}
