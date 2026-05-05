import * as QueryParams from 'expo-auth-session/build/QueryParams';
import { makeRedirectUri } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

import { supabase } from '@/lib/supabase';

/**
 * Add this exact URL in Supabase Dashboard → Authentication → URL configuration → Redirect URLs.
 * It is logged once in __DEV__ when the user taps Google (see getOAuthRedirectUri).
 */
export function getOAuthRedirectUri(): string {
  return makeRedirectUri({
    scheme: 'packstride',
    path: 'auth/callback',
  });
}

export type GoogleSignInResult = { ok: true } | { ok: false; message: string; cancelled?: boolean };

export async function signInWithGoogle(): Promise<GoogleSignInResult> {
  const redirectTo = getOAuthRedirectUri();
  if (__DEV__) {
    // Paste this into Supabase → Auth → URL configuration → Redirect URLs
    console.log('[PackStride] OAuth redirectTo (add to Supabase):', redirectTo);
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true,
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }
  if (!data?.url) {
    return { ok: false, message: 'Could not start Google sign-in.' };
  }

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'cancel' || result.type === 'dismiss') {
    return { ok: false, message: 'Sign-in cancelled.', cancelled: true };
  }

  if (result.type !== 'success' || !result.url) {
    return { ok: false, message: 'Sign-in was not completed.' };
  }

  const { params, errorCode } = QueryParams.getQueryParams(result.url);
  if (errorCode) {
    return { ok: false, message: `Google error: ${errorCode}` };
  }

  if (params.code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(params.code);
    if (exchangeError) {
      return { ok: false, message: exchangeError.message };
    }
    return { ok: true };
  }

  const access_token = params.access_token;
  const refresh_token = params.refresh_token;

  if (!access_token || !refresh_token) {
    return {
      ok: false,
      message:
        'Missing session from Google. In Supabase: enable Google provider, add the redirect URL above, and save.',
    };
  }

  const { error: sessionError } = await supabase.auth.setSession({
    access_token,
    refresh_token,
  });

  if (sessionError) {
    return { ok: false, message: sessionError.message };
  }

  return { ok: true };
}
