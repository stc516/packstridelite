const path = require('path');

// Ensures EXPO_PUBLIC_* are available to native/dev builds when Metro or Xcode runs the config.
require('dotenv').config({ path: path.join(__dirname, '.env.local') });
require('dotenv').config({ path: path.join(__dirname, '.env') });

const appJson = require('./app.json');

/** @type {import('@expo/config').ExpoConfig} */
module.exports = {
  expo: {
    ...appJson.expo,
    extra: {
      supabaseUrl: process.env.EXPO_PUBLIC_SUPABASE_URL,
      supabaseAnonKey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    },
  },
};
