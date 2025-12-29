import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import AppNavigator from "./src/navigation/AppNavigator";
import notifee from '@notifee/react-native';
import { useEffect } from "react";

export default function App() {

  useEffect(() => {
    async function init() {
      await notifee.requestPermission(); // 🔔 İZİN BURADA
    }
    init();
  }, []);

  return (
    <NavigationContainer>
      <AppNavigator />
    </NavigationContainer>
  );
}
