import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import FireGuardHome from "../screens/FireGuardHome";
import CameraScreen from "../screens/CameraScreen";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={FireGuardHome} />
      <Stack.Screen name="Camera" component={CameraScreen} />
    </Stack.Navigator>
  );
}
