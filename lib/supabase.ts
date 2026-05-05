import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://ulailgbpgjloohsymquk.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVsYWlsZ2JwZ2psb29oc3ltcXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc4ODUyOTgsImV4cCI6MjA5MzQ2MTI5OH0.SvZ9HyjK9gG24ISnqJ7f8q48-H7rnTkV-yPEPO3_VgA',
  {
    auth: {
      storage: AsyncStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: false,
    },
  }
);

export const isSupabaseConfigured = true;
