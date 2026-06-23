module.exports = function (api) {
  api.cache(true);
  const isDev = process.env.NODE_ENV !== 'production' && !process.env.CI;
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ...(isDev ? ['nativewind/babel'] : []),
      // reanimated MUST be last
      'react-native-reanimated/plugin',
    ],
  };
};
