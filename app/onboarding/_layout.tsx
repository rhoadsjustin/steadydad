import { Stack } from 'expo-router';
import React from 'react';

export default function OnboardingLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, gestureEnabled: false, animation: 'slide_from_right' }}>
      <Stack.Screen name="welcome" />
      <Stack.Screen name="baby-info" />
      <Stack.Screen name="dad-goals" />
      <Stack.Screen name="finish" />
    </Stack>
  );
}
