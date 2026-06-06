import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Pressable,
  Image,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { AntDesign } from '@expo/vector-icons';
import Carousel from 'react-native-reanimated-carousel';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { useAuth } from '../hook/useAuth';



const ONBOARDING_SLIDES = [
  { key: '1', source: require('../../../assets/onboarding1.png') },
  { key: '2', source: require('../../../assets/onboarding2.png') },
  { key: '3', source: require('../../../assets/onboarding3.png') },
];
const GOOGLE_WEB_CLIENT_ID = "1083886600114-e7t0fg69luegnkq4dejrvp0lrc77gee0.apps.googleusercontent.com";



const CAROUSEL_FLEX = 3;
const CONTENT_FLEX = 1.5;

const Authentication = () => {
  const { width: windowWidth, height: windowHeight } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const carouselWidth = windowWidth;
  const carouselHeight = ((windowHeight) * CAROUSEL_FLEX) / (CAROUSEL_FLEX + CONTENT_FLEX);

  const { googleLogin } = useAuth();

  const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false);
  const [isAppleLoggingIn, setIsAppleLoggingIn] = useState(false);


  // Initialize Google Sign-In
  useEffect(() => {
    GoogleSignin.configure({
      scopes: ['email'],
      webClientId: GOOGLE_WEB_CLIENT_ID,
    });
  }, []);

  // Authentication Functions
  const handleGoogleSignIn = async () => {

    try {
      setIsGoogleLoggingIn(true);
      await GoogleSignin.hasPlayServices();
      
      await GoogleSignin.signOut(); // Clear existing sessions

      const userInfo = await GoogleSignin.signIn();

      if (!userInfo?.data?.idToken) {
        return;
      }

      const payload = { id_token: userInfo.data.idToken };
      console.log('payload', payload);

      //api call to sign in with google...
      googleLogin(payload);
      

    } catch (error) {
      if (__DEV__) {
        console.error('Google Sign-In Error:', error);
      }
    } finally {
      setIsGoogleLoggingIn(false);
    } 
  };

  const handleAppleSignIn = async () => {
    await GoogleSignin.signOut();
    console.log('Apple Sign-In');
  }



  return (
    <MyWrapper enableBottomInset={false} style={styles.screen} statusBarStyle="dark-content">

      <View style={styles.layout}>
        {/* Carousel fills the top portion */}
        <View style={styles.carouselArea}>
          <Carousel
            loop
            autoPlay
            autoPlayInterval={5000}
            pagingEnabled
            width={carouselWidth}
            height={carouselHeight}
            data={ONBOARDING_SLIDES}
            style={{ width: carouselWidth }}
            renderItem={({ item }) => (
              <View style={styles.slide}>
                {item.source ? (
                  <Image
                    source={item.source}
                    style={styles.slideImage}
                    resizeMode="cover"
                  />
                ) : null}
              </View>
            )}
          />
        </View>

        {/* Bottom content panel */}
        <View style={styles.contentPanel}>
          <View style={[styles.contentInner, { paddingBottom: insets.bottom+10 }]}>

            <View style={styles.welcomeBlock}>
              <Text style={styles.welcomeTitle}>You're Welcome</Text>
              <Text style={styles.welcomeSubtitle}>
                Let's get you signed in.
              </Text>
            </View>

            <View style={styles.buttonsContainer}>
              <Pressable
                style={({ pressed }) => [
                  styles.primaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleGoogleSignIn}
              >
                <View style={styles.buttonContent}>
                  {
                    isGoogleLoggingIn ? (<ActivityIndicator size="small" color="#ffffff" />):(
                      <AntDesign name="google" size={16} color="#ffffff" />
                    )
                  }
                  <Text style={styles.primaryButtonText}>Continue with Google</Text>
                </View>
              </Pressable>

              <Pressable
                style={({ pressed }) => [
                  styles.secondaryButton,
                  pressed && styles.buttonPressed,
                ]}
                onPress={handleAppleSignIn}
              >
                <View style={styles.buttonContent}>
                  {
                    isAppleLoggingIn ? (<ActivityIndicator size="small" color="#000000" />):(
                      <AntDesign name="apple1" size={18} color="#000000" />
                    )
                  }
                  <Text style={styles.secondaryButtonText}>Continue with Apple</Text>
                </View>
              </Pressable>
            </View>

            <View style={styles.termsContainer}>
              <Text style={styles.termsText}>
                By continuing, you agree to our{' '}
                <Text style={styles.termsLink}>Terms of Service</Text>
                {' '}and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>

          </View>
        </View>
      </View>
    </MyWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#ffffff',
  },
  layout: {
    flex: 1,
  },

  // Carousel takes up top ~60% of screen
  carouselArea: {
    flex: 3,
    backgroundColor: 'transparent',
    position: 'relative',
  },
  slide: {
    flex: 1,
  },
  slideImage: {
    width: '100%',
    height: '100%',
  },

  // White content panel slides up over carousel
  contentPanel: {
    flex: 1.5,
    backgroundColor: '#729ef1',
    borderTopLeftRadius: 58,
    // borderTopRightRadius: 48,
    marginTop: -24,
    overflow: 'hidden',
  },
  contentInner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: 28,
    justifyContent: 'space-between',
  },

  welcomeBlock: {
    alignItems: 'center',
    gap: 6,
  },
  welcomeTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  welcomeSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
    textAlign: 'center',
    lineHeight: 18,
  },

  buttonsContainer: {
    gap: 12,
    width: '100%',
  },
  primaryButton: {
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#dddddd',
    justifyContent: 'center',
    alignItems: 'center',
  },
  secondaryButton: {
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  primaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
    letterSpacing: 0.1,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    letterSpacing: 0.1,
  },
  buttonPressed: {
    opacity: 0.7,
  },

  termsContainer: {
    paddingHorizontal: 12,
  },
  termsText: {
    fontSize: 11,
    textAlign: 'center',
    lineHeight: 17,
    color: 'rgba(255, 255, 255, 0.75)',
  },
  termsLink: {
    fontWeight: '600',
    color: '#ffffff',
  },
});

export default Authentication;