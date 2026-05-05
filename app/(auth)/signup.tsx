import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { signInWithGoogle } from '@/lib/googleAuth';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import Colors from '@/constants/colors';
import { PRIMARY_BUTTON, PRIMARY_BUTTON_TEXT } from '@/constants/primaryButton';

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

export default function SignupScreen() {
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignup() {
    setError(null);
    if (!isSupabaseConfigured) {
      setError(
        'Missing Supabase configuration. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart Expo: npx expo start --clear'
      );
      return;
    }
    if (!email.trim() || !password) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    try {
      const { error: authError } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (authError) {
        setError(authError.message);
        return;
      }
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof TypeError
          ? 'Network error — check Supabase URL and anon key in .env.local, then restart Expo with --clear.'
          : err instanceof Error
            ? err.message
            : 'Something went wrong.'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogle() {
    setError(null);
    if (!isSupabaseConfigured) {
      setError(
        'Missing Supabase configuration. Add EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY to .env.local, then restart Expo: npx expo start --clear'
      );
      return;
    }
    setGoogleLoading(true);
    const result = await signInWithGoogle();
    setGoogleLoading(false);
    if (!result.ok && !result.cancelled) {
      setError(result.message);
    }
  }

  if (success) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center px-6" style={{ backgroundColor: Colors.snow }}>
        <View
          className="rounded-3xl p-8 w-full items-center"
          style={{
            backgroundColor: Colors.white,
            shadowColor: '#000',
            shadowOpacity: 0.07,
            shadowRadius: 20,
            shadowOffset: { width: 0, height: 6 },
            elevation: 4,
          }}
        >
          <Text style={{ fontSize: 40, marginBottom: 16 }}>📬</Text>
          <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 22, color: Colors.navy, marginBottom: 8, textAlign: 'center' }}>
            Check your email
          </Text>
          <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mist, textAlign: 'center', lineHeight: 22 }}>
            We sent a confirmation link to{' '}
            <Text style={{ fontFamily: 'Outfit_700Bold', color: Colors.ocean }}>{email.trim()}</Text>.
            {'\n'}Open it to activate your account.
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity
              activeOpacity={0.85}
              style={[PRIMARY_BUTTON, { marginTop: 28 }]}
            >
              <Text style={PRIMARY_BUTTON_TEXT}>Back to log in</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </SafeAreaView>
    );
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
          showsVerticalScrollIndicator={true}
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

          {!isSupabaseConfigured && (
            <Text
              style={{
                fontFamily: 'Outfit_400Regular',
                fontSize: 13,
                color: '#C0392B',
                marginBottom: 16,
                textAlign: 'center',
                lineHeight: 18,
              }}
            >
              Supabase env vars are missing or empty. Add them to .env.local and restart with npx expo start --clear.
            </Text>
          )}

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
              Create account
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
            <View className="mb-4">
              <Text style={LABEL}>Password</Text>
              <TextInput
                style={INPUT}
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 8 characters"
                placeholderTextColor={Colors.mist}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="oneTimeCode"
                passwordRules=""
              />
            </View>

            {/* confirm password */}
            <View className="mb-5">
              <Text style={LABEL}>Confirm Password</Text>
              <TextInput
                style={INPUT}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                placeholderTextColor={Colors.mist}
                secureTextEntry
                autoCapitalize="none"
                autoCorrect={false}
                autoComplete="off"
                textContentType="oneTimeCode"
                passwordRules=""
              />
            </View>

            {error && (
              <Text
                style={{
                  fontFamily: 'Outfit_400Regular',
                  fontSize: 13,
                  color: '#C0392B',
                  marginBottom: 12,
                  lineHeight: 18,
                }}
              >
                {error}
              </Text>
            )}

            <TouchableOpacity
              onPress={handleSignup}
              disabled={loading || googleLoading}
              activeOpacity={0.85}
              style={[PRIMARY_BUTTON, { opacity: loading || googleLoading ? 0.7 : 1 }]}
            >
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={PRIMARY_BUTTON_TEXT}>Create account</Text>
              )}
            </TouchableOpacity>

            <View className="flex-row items-center my-5">
              <View className="flex-1 h-px" style={{ backgroundColor: Colors.sky }} />
              <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 13, color: Colors.mist, marginHorizontal: 12 }}>
                or
              </Text>
              <View className="flex-1 h-px" style={{ backgroundColor: Colors.sky }} />
            </View>

            <Pressable
              onPress={handleGoogle}
              disabled={googleLoading || loading}
              style={({ pressed }) => ({
                height: 52,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: Colors.sky,
                backgroundColor: pressed ? Colors.iceBlue : Colors.white,
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'row',
                gap: 8,
                opacity: googleLoading || loading ? 0.7 : 1,
              })}
            >
              {googleLoading ? (
                <ActivityIndicator color={Colors.ocean} />
              ) : (
                <>
                  <Text style={{ fontSize: 18 }}>G</Text>
                  <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 15, color: Colors.navy }}>
                    Continue with Google
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {/* footer link */}
          <View className="flex-row justify-center items-center mt-8 gap-1">
            <Text style={{ fontFamily: 'Outfit_400Regular', fontSize: 14, color: Colors.mist }}>
              Already have an account?
            </Text>
            <Link href="/(auth)/login" asChild>
              <Pressable>
                <Text style={{ fontFamily: 'Outfit_700Bold', fontSize: 14, color: Colors.ocean }}>
                  Log in
                </Text>
              </Pressable>
            </Link>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
