import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { BabyProvider } from "@/lib/BabyContext";
import { useAppTheme } from "@/lib/use-app-theme";
import { useFonts, Nunito_400Regular, Nunito_500Medium, Nunito_600SemiBold, Nunito_700Bold, Nunito_800ExtraBold } from "@expo-google-fonts/nunito";

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { colors } = useAppTheme();

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        contentStyle: { backgroundColor: colors.background },
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.primary,
        headerTitleStyle: {
          fontFamily: "Nunito_700Bold",
          fontSize: 18,
          color: colors.text,
        },
        headerShadowVisible: false,
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="onboarding" options={{ headerShown: false, gestureEnabled: false }} />
      <Stack.Screen
        name="helper/index"
        options={{
          title: "What Should I Do?",
        }}
      />
      <Stack.Screen
        name="helper/[topic]"
        options={{
          headerTitleStyle: { fontFamily: "Nunito_700Bold", fontSize: 18, color: colors.text },
        }}
      />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_500Medium,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <GestureHandlerRootView style={{ flex: 1 }}>
          <KeyboardProvider>
            <BabyProvider>
              <RootLayoutNav />
            </BabyProvider>
          </KeyboardProvider>
        </GestureHandlerRootView>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
