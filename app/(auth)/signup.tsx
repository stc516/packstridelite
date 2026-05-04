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

export default function SignupScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSignup() {
    setError(null);
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
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    // Supabase may require email confirmation; show a success message
    setSuccess(true);
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
            <Pressable
              style={({ pressed }) => ({
                marginTop: 28,
                height: 52,
                width: '100%',
                borderRadius: 14,
                backgroundColor: pressed ? '#152E4A' : Colors.ocean,
                alignItems: 'center',
                justifyContent: 'center',
              })}
            >
              <Text style={{ fontFamily: 'Nunito_700Bold', fontSize: 16, color: Colors.white }}>
                Back to Log In
              </Text>
            </Pressable>
          </Link>
        </View>
      </SafeAreaView>
    );
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
                textContentType="newPassword"
              />
            </View>

            {/* confirm password */}
            <View className="mb-6">
              <Text style={LABEL}>Confirm Password</Text>
              <TextInput
                style={INPUT}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Re-enter password"
                placeholderTextColor={Colors.mist}
                secureTextEntry
                textContentType="newPassword"
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
              onPress={handleSignup}
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
                  Create Account
                </Text>
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
