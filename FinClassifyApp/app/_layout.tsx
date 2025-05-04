// app/_layout.tsx - Make sure the filename starts with an underscore!
import React from "react";
import { Stack } from "expo-router";
// Path relative from app/_layout.tsx to app/context/DateContext.tsx
import { DateProvider } from "./context/DateContext";

export default function RootLayout() {
  return (
    // DateProvider wraps the entire navigation stack
    <DateProvider>
      <Stack>
        {/* All screens within this Stack can now use useDateContext */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="record" options={{ headerShown: false }} />
        <Stack.Screen name="transactions" options={{ presentation: "modal" }} />
        <Stack.Screen name="Accounts" options={{ headerShown: false }} />
        <Stack.Screen name="CreateAccounts" />
        <Stack.Screen name="Budgets" options={{ headerShown: false }} />
        <Stack.Screen name="analysis" options={{ headerShown: false }} />
        {/* Add other screens as needed */}
      </Stack>
    </DateProvider>
  );
}
