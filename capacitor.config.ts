import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.agb.smartqr',
  appName: 'AGB vCard Studio',
  webDir: 'dist',
  server: {
    url: 'https://agibrico.github.io/agibrico.github.io-/',
    cleartext: true
  }
};

export default config;
