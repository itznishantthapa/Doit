import { View, Text, Pressable, StyleSheet } from 'react-native'
import React from 'react'
import { TEXT_DARK } from '../../constants/colors';
import LoaderKitView from 'react-native-loader-kit';

const BG_BUTTON = '#CDEBDD';

const CoolButton = ({ onPress, disabled=false, buttonTitle, loader=false }) => {

  return (
    <Pressable
    style={() => [
      styles.loginButton,
    ]}
    onPress={onPress}
    disabled={disabled}
  >
    {loader ? (
      <LoaderKitView
        style={{ width: 50, height: 50 }}
        name={'BallPulse'}
        animationSpeedMultiplier={1.0}
        color={TEXT_DARK}
      />
    ) : (
      <Text style={styles.buttonText}>{buttonTitle}</Text>
    )}
  </Pressable>
  )
}


 
export default CoolButton

const styles = StyleSheet.create({

    loginButton: {
        height: 50,
        borderRadius: 25,
        backgroundColor: BG_BUTTON,
        alignItems: 'center',
        justifyContent: 'center',
      },
 
      buttonText: {
        fontFamily: 'Jakarta-SemiBold',
        fontSize: 16,
        color: TEXT_DARK,
        letterSpacing: 0.2,
      },
});