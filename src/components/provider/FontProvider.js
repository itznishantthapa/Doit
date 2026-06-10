// src/components/FontProvider.jsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import * as Font from 'expo-font';



export default function FontProvider({ children }) {
 

  const [fontsLoaded, fontError] = Font.useFonts({
    'Jakarta-Regular': require('../../assets/fonts/PlusJakartaSans-Regular.ttf'),
    'Jakarta-SemiBold': require('../../assets/fonts/PlusJakartaSans-SemiBold.ttf'),
    'Jakarta-Bold': require('../../assets/fonts/PlusJakartaSans-Bold.ttf'),
  });


  return <View style={styles.container}>{children}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});