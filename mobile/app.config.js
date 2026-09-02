module.exports = {
  expo: {
    name: "Lumoria",
    slug: "Lumoria",
    version: "1.1.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "mobile",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    ios: {
      bundleIdentifier: "com.asamigentoku.lumoria",
      supportsTablet: true,
      infoPlist: {
        CFBundleDevelopmentRegion: "ja",
        CFBundleLocalizations: ["ja"],
      },
    },
    android: {
      package: "com.asamigentoku.lumoria",
      adaptiveIcon: {
        backgroundColor: "#E6F4FE",
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundImage: "./assets/images/android-icon-background.png",
        monochromeImage: "./assets/images/android-icon-monochrome.png",
      },
      edgeToEdgeEnabled: true,
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: process.env.ANDROID_GOOGLE_MAPS_API_KEY ?? "",
        },
      },
    },
    web: {
      output: "static",
      favicon: "./assets/images/favicon.png",
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          image: "./assets/images/splash-icon.png",
          imageWidth: 200,
          resizeMode: "contain",
          backgroundColor: "#ffffff",
          dark: {
            backgroundColor: "#000000",
          },
        },
      ],
      "@react-native-community/datetimepicker",
      "expo-font",
      "expo-web-browser",
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
    extra: {
      eas: {
        projectId: "62a27749-e2eb-4a13-b103-dd3048919d6a",
      },
    },
  },
};
