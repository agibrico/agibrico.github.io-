import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'QR.ODE01',
  appName: 'AGB vCard Studio',
  webDir: 'dist',
  server: {
    // We remove the hardcoded URL to allow Capacitor to load local files from the APK
    androidScheme: 'https'
  }
};

export default config;
