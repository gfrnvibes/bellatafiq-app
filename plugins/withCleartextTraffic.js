const { withAndroidManifest } = require('expo/config-plugins');

/**
 * Mengizinkan HTTP cleartext (dibutuhkan untuk koneksi Wi-Fi lokal ke http://192.168.4.1/).
 */
module.exports = function withCleartextTraffic(config) {
  return withAndroidManifest(config, (mod) => {
    const app = mod.modResults.manifest.application?.[0];
    if (app) {
      app.$['android:usesCleartextTraffic'] = 'true';
    }
    return mod;
  });
};
