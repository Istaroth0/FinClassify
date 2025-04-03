import {
  DarkTheme,
  DefaultTheme,
  ThemeProvider,
} from "@react-navigation/native";
import { useFonts } from "expo-font";
import { Tabs } from "expo-router"; // Changed from Stack to Tabs
import * as SplashScreen from "expo-splash-screen";
import { StatusBar } from "expo-status-bar";
import React, { useEffect } from "react";
import "react-native-reanimated";

import { useColorScheme } from "@/hooks/useColorScheme";

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    SpaceMono: require("../assets/fonts/SpaceMono-Regular.ttf"),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ThemeProvider value={colorScheme === "dark" ? DarkTheme : DefaultTheme}>
      <Tabs>
        {" "}
        {/* Changed from Stack to Tabs */}
        <Tabs.Screen
          name="index"
          options={{ headerShown: false, href: "/" }}
        />{" "}
        {/* Added href */}
        <Tabs.Screen name="Homepage" options={{ headerShown: false }} />{" "}
        {/* Added Homepage */}
        <Tabs.Screen
          name="transactions"
          options={{ headerShown: false }}
        />{" "}
        {/* Added transactions */}
        <Tabs.Screen name="+not-found" options={{ href: "/+not-found" }} />{" "}
        {/* Added href */}
      </Tabs>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
