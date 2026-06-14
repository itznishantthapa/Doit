import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Linking,
  Platform,
  StatusBar,
} from 'react-native';
import { getAppStoreUrls } from '../../../services/versionService';
import { LAVENDER, TEXT_DARK, TEXT_MUTED, WHITE } from '../../../constants/colors';

const UpdateScreen = () => {
  const [storeUrls, setStoreUrls] = useState(null);

  useEffect(() => {
    getAppStoreUrls().then(setStoreUrls);
  }, []);

  const handleUpdate = () => {
    if (!storeUrls) return;

    const storeUrl = Platform.OS === 'ios' ? storeUrls.appstoreUrl : storeUrls.playstoreUrl;
    Linking.openURL(storeUrl).catch(() => {});
  };

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="dark-content" />

      <View style={styles.card}>
        <Text style={styles.title}>New Update Available</Text>
        <Text style={styles.description}>
          A new version of the app is available.{'\n'}Please update to continue.
        </Text>
        <Pressable
          style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
          onPress={handleUpdate}
          disabled={!storeUrls}
        >
          <Text style={styles.buttonText}>UPDATE</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: WHITE,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: LAVENDER,
    borderRadius: 16,
    padding: 24,
  },
  title: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 20,
    color: TEXT_DARK,
    marginBottom: 12,
  },
  description: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 15,
    color: TEXT_MUTED,
    lineHeight: 22,
    marginBottom: 24,
  },
  button: {
    alignSelf: 'flex-end',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  buttonPressed: {
    opacity: 0.6,
  },
  buttonText: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 14,
    color: TEXT_DARK,
    letterSpacing: 0.5,
  },
});

export default UpdateScreen;
