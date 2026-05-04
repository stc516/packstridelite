import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';

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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    }
    // on success, onAuthStateChange in _layout fires → redirects to (tabs)
  }

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.snow }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 24, paddingVertical: 32 }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* wordmark */}
          <View className="items-center mb-10">
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 32, color: Colors.navy }}>
              PackStride
            </Text>
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mist, marginTop: 4 }}>
              Train together. Thrive together.
            </Text>
          </View>

          {/* card */}
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
            <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 22, color: Colors.navy, marginBottom: 24 }}>
              Welcome back
            </Text>

            {/* email */}
            <View className="mb-4">
              <Text style={LABEL}>Email</Text>
              <TextInput
                style={INPUT}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={Colors.mist}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            </View>

            {/* password */}
            <View className="mb-6">
              <Text style={LABEL}>Password</Text>
              <TextInput
                style={INPUT}
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                placeholderTextColor={Colors.mist}
                secureTextEntry
                textContentType="password"
              />
            </View>

            {/* inline error */}
            {error && (
              <Text
                style={{
                  fontFamily: 'Outfit_400Regular',
                  fontSize: 13,
                  color: '#C0392B',
                  marginBottom: 16,
                  lineHeight: 18,
                }}
              >
                {error}
              </Text>
            )}

            {/* submit */}
            <Pressable
              onPress={handleLogin}
              disabled={loading}
              style={({ pressed }) => ({
                height: 52,
                borderRadius: 14,
                backgroundColor: pressed ? '#152E4A' : Colors.ocean,
                alignItems: 'center',
                justifyContent: 'center',
                opacity: loading ? 0.7 : 1,
              })}
            >
              {loading ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: Colors.white }}>
                  Log In
                </Text>
              )}
            </Pressable>
          </View>

          {/* footer link */}
          <View className="flex-row justify-center items-center mt-8 gap-1">
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mist }}>
              New to PackStride?
            </Text>
            <Link href="/(auth)/signup" asChild>
              <Pressable>
                <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.ocean }}>
                  Create account
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
