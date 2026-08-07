export default {
  expo: {
    name: "SeanPControl",
    slug: "SeanPControl",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/seanpcontrol-icon.png",
    scheme: "seanpcontrol",
    userInterfaceStyle: "automatic",
    extra: {
      supabaseUrl: "https://ggqjcyqwevpsbrbcuriv.supabase.co",
      supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdncWpjeXF3ZXZwc2JyYmN1cml2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3MzcxODAsImV4cCI6MjEwMTMxMzE4MH0.MsqHSSzpihfe-evFlq51l8v-S0DfVUPPlK0DICxiRH4",
      eas: {
        projectId: "7c8c43df-3f90-4de0-895d-cefe193e38ee"
      }
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.seanpcontrol.app"
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/images/seanpcontrol2.png",
        backgroundColor: "#F8FAFC"
      },
      package: "com.seanpcontrol.app"
    },
    plugins: [
      "expo-router",
      [
        "expo-splash-screen",
        {
          backgroundColor: "#F8FAFC",
          image: "./assets/images/seanpcontrol-splash-icon2.png",
          imageWidth: 76
        }
      ],
      "./withNetworkSecurityConfig"
    ]
  }
};