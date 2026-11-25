const { withProjectBuildGradle } = require('expo/config-plugins');

/**
 * Mengaktifkan buildFeatures.buildConfig pada react-native-bluetooth-classic
 * karena AGP 9.0 (Expo SDK 58) menghapus opsi global gradle.properties.
 */
module.exports = function withBluetoothClassicFix(config) {
  return withProjectBuildGradle(config, (mod) => {
    const marker = '// withBluetoothClassicFix';
    if (!mod.modResults.contents.includes(marker)) {
      mod.modResults.contents += `
${marker}
subprojects { subproject ->
  if (subproject.name == 'react-native-bluetooth-classic') {
    subproject.plugins.withId('com.android.library') {
      subproject.android {
        buildFeatures {
          buildConfig = true
        }
      }
    }
  }
}
`;
    }
    return mod;
  });
};
