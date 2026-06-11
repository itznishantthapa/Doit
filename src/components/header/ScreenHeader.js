import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { TEXT_DARK } from '../../constants/colors';

export const ScreenHeader = ({ title }) => {
  const navigation = useNavigation();

  return (
    <View style={styles.container}>
      <Pressable
        onPress={() => navigation.goBack()}
        hitSlop={8}
        style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
      >
        <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={TEXT_DARK} strokeWidth={1.5} />
      </Pressable>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      <View style={styles.spacer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    // paddingVertical: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  title: {
    flex: 1,
    textAlign: 'center',
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 17,
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  spacer: {
    width: 40,
  },
});

export default ScreenHeader;
