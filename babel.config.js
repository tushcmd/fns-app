module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // NativeWind v5 preview: styling is handled via Metro + PostCSS, not Babel
      'react-native-reanimated/plugin',
    ],
  };
};
