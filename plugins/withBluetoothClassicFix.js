const { withGradleProperties } = require('expo/config-plugins');

/**
 * Mengaktifkan BuildConfig pada modul library (dibutuhkan oleh react-native-bluetooth-classic di AGP 8+).
 */
module.exports = function withBluetoothClassicFix(config) {
  return withGradleProperties(config, (mod) => {
    const key = 'android.defaults.buildfeatures.buildconfig';
    const exists = mod.modResults.some(
      (item) => item.type === 'property' && item.key === key
    );
    if (!exists) {
      mod.modResults.push({
        type: 'property',
        key,
        value: 'true',
      });
    }
    return mod;
  });
};
