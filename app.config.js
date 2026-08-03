export default {
  expo: {
    name: "SeanPControl",
    slug: "SeanPControl",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: "seanpcontrol",
    userInterfaceStyle: "automatic",
    extra: {
      supabaseUrl: "https://ggqjcyqwevpsbrbcuriv.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdncWpjeXF3ZXZwc2JyYmN1cml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MzcxODAsImV4cCI6MjEwMTMxMzE4MH0.MsqHSSzpihfe-evFlq51l8v-S0DfVUPPlK0DICxiRH4"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.seanpcontrol.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/android-icon-foreground.png",
        backgroundColor: "#E6F4FE"
      },
      package: "com.seanpcontrol.app"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#208AEF",
          image: "./assets/images/splash-icon.png",
          imageWidth: 76
        }
      ]
    ]
  }
};