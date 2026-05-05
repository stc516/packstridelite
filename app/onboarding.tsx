import { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

import Colors from '@/constants/colors';
import { PRIMARY_BUTTON, PRIMARY_BUTTON_TEXT } from '@/constants/primaryButton';
import { supabase } from '@/lib/supabase';

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

export default function OnboardingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [step, setStep] = useState<1 | 2>(1);
  const [displayName, setDisplayName] = useState('');
  const [dogName, setDogName] = useState('');
  const [dogBreed, setDogBreed] = useState('');
  const [dogBirthday, setDogBirthday] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const progressWidth = useMemo(() => (step === 1 ? '50%' : '100%'), [step]);

  const isBirthdayValid = useMemo(() => {
    if (!dogBirthday.trim()) return true;
    return /^\d{4}-\d{2}-\d{2}$/.test(dogBirthday.trim());
  }, [dogBirthday]);

  function nextStep() {
    setError(null);
    if (!displayName.trim()) {
      setError('Please enter your display name.');
      return;
    }
    setStep(2);
  }

  async function completeOnboarding() {
    setError(null);

    if (!dogName.trim() || !dogBreed.trim()) {
      setError('Please add your dog name and breed.');
      return;
    }

    if (!isBirthdayValid) {
      setError('Birthday must be in YYYY-MM-DD format.');
      return;
    }

    setLoading(true);

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      setLoading(false);
      setError(userError?.message ?? 'You need to log in again before onboarding.');
      return;
    }

    const { error: profileError } = await supabase
      .from('users')
      .upsert(
        {
          id: user.id,
          display_name: displayName.trim(),
        },
        { onConflict: 'id' }
      );

    if (profileError) {
      setLoading(false);
      setError(profileError.message);
      return;
    }

    const { error: dogError } = await supabase.from('dogs').insert({
      user_id: user.id,
      name: dogName.trim(),
      breed: dogBreed.trim(),
      birthday: dogBirthday.trim() ? dogBirthday.trim() : null,
    });

    setLoading(false);

    if (dogError) {
      setError(dogError.message);
      return;
    }

    router.replace('/(tabs)');
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.snow }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            paddingHorizontal: 24,
            paddingTop: 24,
            paddingBottom: Math.max(insets.bottom + 280, 320),
          }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
          showsVerticalScrollIndicator={false}
        >
          <View className="items-center mb-8">
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 30, color: Colors.navy }}>
              PackStride
            </Text>
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mist, marginTop: 4 }}>
              Let&apos;s set up your pack
            </Text>
          </View>

          <View className="mb-6">
            <View
              className="w-full rounded-full overflow-hidden"
              style={{ height: 8, backgroundColor: Colors.iceBlue }}
            >
              <View style={{ width: progressWidth, height: 8, backgroundColor: Colors.ocean }} />
            </View>
            <Text style={{ fontFamily: 'Outfit_500Medium', color: Colors.mist, marginTop: 8, fontSize: 12 }}>
              Step {step} of 2
            </Text>
          </View>

          <View
            className="rounded-3xl p-6"
            style={{
              backgroundColor: Colors.white,
              shadowColor: '#000',
              shadowOpacity: 0.07,
              shadowRadius: 20,
              shadowOffset: { width: 0, height: 6 },
              elevation: 4,
            }}
          >
            {step === 1 ? (
              <>
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 22, color: Colors.navy, marginBottom: 8 }}>
                  What should we call you?
                </Text>
                <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mist, marginBottom: 24 }}>
                  This name shows up in your dashboard and activity feed.
                </Text>
                <View className="mb-6">
                  <Text style={LABEL}>Display name</Text>
                  <TextInput
                    style={INPUT}
                    value={displayName}
                    onChangeText={setDisplayName}
                    placeholder="e.g. Stephen"
                    placeholderTextColor={Colors.mist}
                    autoCapitalize="words"
                    autoCorrect={false}
                    returnKeyType="done"
                  />
                </View>
                <TouchableOpacity
                  onPress={nextStep}
                  activeOpacity={0.85}
                  style={PRIMARY_BUTTON}
                >
                  <Text style={PRIMARY_BUTTON_TEXT}>Next</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 22, color: Colors.navy, marginBottom: 8 }}>
                  Add your first dog
                </Text>
                <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mist, marginBottom: 24 }}>
                  We&apos;ll use this to personalize your activity tracking.
                </Text>

                <View className="mb-4">
                  <Text style={LABEL}>Dog name</Text>
                  <TextInput
                    style={INPUT}
                    value={dogName}
                    onChangeText={setDogName}
                    placeholder="e.g. Bailey"
                    placeholderTextColor={Colors.mist}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>

                <View className="mb-4">
                  <Text style={LABEL}>Breed</Text>
                  <TextInput
                    style={INPUT}
                    value={dogBreed}
                    onChangeText={setDogBreed}
                    placeholder="e.g. Golden Retriever"
                    placeholderTextColor={Colors.mist}
                    autoCapitalize="words"
                    autoCorrect={false}
                  />
                </View>

                <View className="mb-6">
                  <Text style={LABEL}>Birthday (optional)</Text>
                  <TextInput
                    style={INPUT}
                    value={dogBirthday}
                    onChangeText={setDogBirthday}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={Colors.mist}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>

                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => setStep(1)}
                    activeOpacity={0.85}
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 12,
                      borderWidth: 1.5,
                      borderColor: Colors.sky,
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: Colors.white,
                    }}
                  >
                    <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 15, color: Colors.ocean }}>
                      Back
                    </Text>
                  </TouchableOpacity>
                  <View style={{ flex: 1.5 }}>
                    <TouchableOpacity
                      onPress={completeOnboarding}
                      disabled={loading}
                      activeOpacity={0.85}
                      style={[PRIMARY_BUTTON, { opacity: loading ? 0.7 : 1 }]}
                    >
                      {loading ? (
                        <ActivityIndicator color={Colors.white} />
                      ) : (
                        <Text style={PRIMARY_BUTTON_TEXT}>Finish</Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>
              </>
            )}

            {error && (
              <Text
                style={{
                  fontFamily: 'Outfit_400Regular',
                  fontSize: 13,
                  color: '#C0392B',
                  marginTop: 16,
                  lineHeight: 18,
                }}
              >
                {error}
              </Text>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
