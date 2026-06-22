module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'nativewind/babel',
      // reanimated MUST be last
      'react-native-reanimated/plugin',
    ],
  };
};
// module.exports = function (api) {
//   api.cache(true);
//   let plugins = [];

//   plugins.push('react-native-worklets/plugin');

//   return {
//     presets: ['babel-preset-expo'],
//     plugins: ['react-native-reanimated/plugin'],
//   };
// };
