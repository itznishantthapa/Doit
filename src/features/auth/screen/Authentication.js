import React, { useMemo, useState } from 'react';
import * as yup from 'yup';
import {
  Image,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { KeyboardAvoidingView } from 'react-native-keyboard-controller';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { EyeIcon, ViewOffIcon } from '@hugeicons/core-free-icons';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { TEXT_DARK, TEXT_MUTED, WHITE } from '../../../constants/colors';
import CoolButton from '../../../components/button/CoolButton';
import Animated, { FadeIn, FadeOut, FadeInDown, FadeOutUp } from 'react-native-reanimated';
import { useKeyboardState } from 'react-native-keyboard-controller';
import { getDeviceData } from '../device/device';
import { getApiErrorMessage } from '../api/api';
import { useAuthStore } from '../store/useAuthStore';

const PEEK_GRADIENT = [
  '#cdb4db',
  '#F0F2F5',
  '#F0F2F5',
];

const EMOJI_REGEX = /\p{Extended_Pictographic}/u;

//username can containe numbers
const usernameSchema = yup
  .string()
  .trim()
  .required('Username is required')
  .matches(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers and underscores');

const passwordSchema = yup
  .string()
  .required('Password is required')
  .test('no-emoji', 'Password cannot contain emojis', (value) => !value || !EMOJI_REGEX.test(value));

const signUpPasswordSchema = passwordSchema.min(6, 'Password must be at least 6 characters');

const loginSchema = yup.object({
  username: usernameSchema,
  password: passwordSchema,
});

const signUpSchema = yup.object({
  username: usernameSchema,
  password: signUpPasswordSchema,
  confirmPassword: yup
    .string()
    .required('Please confirm your password')
    .oneOf([yup.ref('password')], 'Passwords do not match'),
});

const mapYupErrors = (err) => {
  const fieldErrors = {};
  err.inner.forEach(({ path, message }) => {
    if (path) fieldErrors[path] = message;
  });
  return fieldErrors;
};

const INVALID_CREDENTIALS_MESSAGE = 'Invalid username or password';
const USERNAME_TAKEN_MESSAGE = 'Username is already taken.';

const mapLoginApiError = (message) => {
  if (message === INVALID_CREDENTIALS_MESSAGE) {
    return { username: true, password: message };
  }
  return { form: message };
};

const mapCreateApiError = (message) => {
  if (message === USERNAME_TAKEN_MESSAGE) {
    return { username: message };
  }
  return { form: message };
};

const Authentication = () => {
  const insets = useSafeAreaInsets();
  const { isVisible } = useKeyboardState();
  const { login, create } = useAuthStore();

  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({
    username: '',
    password: '',
    confirmPassword: '',
  });
  const [visibility, setVisibility] = useState({
    password: false,
    confirmPassword: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [loader, setLoader] = useState(false);

  const getValidationSchema = () => (isSignUp ? signUpSchema : loginSchema);

  const buildFormValues = (snapshot) => ({
    username: snapshot.username.trim(),
    password: snapshot.password,
    confirmPassword: snapshot.confirmPassword,
  });

  const validateField = async (field, snapshot) => {
    try {
      const schema = getValidationSchema();
      await schema.validateAt(field, buildFormValues(snapshot));
      setErrors((prev) => ({ ...prev, [field]: '' }));
    } catch (error) {
      if (error instanceof yup.ValidationError) {
        setErrors((prev) => ({ ...prev, [field]: error.message }));
      }
    }
  };

  const updateForm = (field) => (value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      validateField(field, next);
      if (field === 'password' && isSignUp && next.confirmPassword) {
        validateField('confirmPassword', next);
      }
      return next;
    });
  };

  const toggleVisibility = (field) => {
    setVisibility((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const resetForm = () => {
    setForm({
      username: '',
      password: '',
      confirmPassword: '',
    });
    setVisibility({
      password: false,
      confirmPassword: false,
    });
    setErrors({});
  };

  const toggleMode = () => {
    resetForm();
    setIsSignUp(!isSignUp);
  };

  const handleLogin = async () => {
    const payload = {
      username: form.username.trim(),
      password: form.password,
    };

    try {
      setErrors({});
      await loginSchema.validate(payload, { abortEarly: false });
      setIsSubmitting(true);
      await login(payload);
      Keyboard.dismiss();
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors(mapYupErrors(err));
      } else {
        setErrors(mapLoginApiError(getApiErrorMessage(err, 'Could not log in.')));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreate = async () => {
    const { deviceId, platform } = await getDeviceData();

    const payload = {
      username: form.username.trim(),
      password: form.password,
      confirmPassword: form.confirmPassword,
      deviceId,
      platform,
    };

    try {
      setErrors({});
      await signUpSchema.validate(payload, { abortEarly: false });
      setIsSubmitting(true);
      await create(payload);
      Keyboard.dismiss();
    } catch (err) {
      if (err instanceof yup.ValidationError) {
        setErrors(mapYupErrors(err));
      } else {
        setErrors(mapCreateApiError(getApiErrorMessage(err, 'Could not create account.')));
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmit = isSignUp ? handleCreate : handleLogin;

  const canSubmit = useMemo(() => {
    try {
      if (isSignUp) {
        signUpSchema.validateSync(
          {
            username: form.username.trim(),
            password: form.password,
            confirmPassword: form.confirmPassword,
          },
          { abortEarly: true },
        );
      } else {
        loginSchema.validateSync(
          {
            username: form.username.trim(),
            password: form.password,
          },
          { abortEarly: true },
        );
      }
      return true;
    } catch {
      return false;
    }
  }, [form, isSignUp]);

  return (
    <MyWrapper
      enableTopInset={false}
      enableBottomInset={false}
      style={styles.screen}
      statusBarStyle="dark-content"
    >
      <LinearGradient
        colors={PEEK_GRADIENT}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior="padding"
        automaticOffset
      >
        <View style={styles.layout}>
          <View style={styles.peek}>
            {!isVisible && (
              <Animated.View
              entering={FadeInDown.duration(300)}
              exiting={FadeOutUp.duration(200)}
              style={[styles.logoBox, { paddingTop: insets.top }]}
              >
                <View style={styles.logoImageWrap}>
                  <Image
                    source={require('../../../assets/applogo.png')}
                    style={styles.logoImage}
                    resizeMode="contain"
                  />
                </View>
              </Animated.View>
            )}
          </View>

          <View style={[styles.card, { paddingBottom: insets.bottom + 20 }]}>
            <View style={styles.titleBlock}>
              <Text style={styles.title}>
                {isSignUp ? 'Create Account' : 'Welcome Back'}
              </Text>
              <Text style={styles.subtitle}>
                {isSignUp
                  ? 'Start your education journey today.\nSign up to get going.'
                  : 'Ready to continue your education journey?\nYour path is right here.'}
              </Text>
            </View>

            <View style={styles.form}>
              <View style={styles.inputGroup}>
                <TextInput
                  style={[
                    styles.input,
                    errors.username && styles.inputError,
                  ]}
                  placeholder={isSignUp ? "Username (eg. anonymous_123)" : "Username"}
                  placeholderTextColor={TEXT_MUTED}
                  value={form.username}
                  onChangeText={updateForm('username')}
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                />
                {typeof errors.username === 'string' && errors.username ? (
                  <Text style={styles.errorText}>{errors.username}</Text>
                ) : null}
              </View>

              <View style={styles.inputGroup}>
                <View style={styles.passwordWrap}>
                  <TextInput
                    style={[
                      styles.input,
                      styles.passwordInput,
                      errors.password && styles.inputError,
                    ]}
                    placeholder={isSignUp ? 'Create Password' : 'Password'}
                    placeholderTextColor={TEXT_MUTED}
                    value={form.password}
                    onChangeText={updateForm('password')}
                    secureTextEntry={!visibility.password}
                    autoCapitalize="none"
                    autoCorrect={false}
                    returnKeyType={isSignUp ? 'next' : 'done'}
                    onSubmitEditing={isSignUp ? undefined : handleLogin}
                  />
                  <Pressable
                    style={styles.eyeButton}
                    onPress={() => toggleVisibility('password')}
                    hitSlop={8}
                  >
                    <HugeiconsIcon
                      icon={visibility.password ? EyeIcon : ViewOffIcon}
                      size={20}
                      color={TEXT_MUTED}
                      strokeWidth={1.5}
                    />
                  </Pressable>
                </View>
                {errors.password ? (
                  <Text style={styles.errorText}>{errors.password}</Text>
                ) : null}
              </View>

              {isSignUp ? (
                <View style={styles.inputGroup}>
                  <View style={styles.passwordWrap}>
                    <TextInput
                      style={[
                        styles.input,
                        styles.passwordInput,
                        errors.confirmPassword && styles.inputError,
                      ]}
                      placeholder="Confirm Password"
                      placeholderTextColor={TEXT_MUTED}
                      value={form.confirmPassword}
                      onChangeText={updateForm('confirmPassword')}
                      secureTextEntry={!visibility.confirmPassword}
                      autoCapitalize="none"
                      autoCorrect={false}
                      returnKeyType="done"
                      onSubmitEditing={handleCreate}
                    />
                    <Pressable
                      style={styles.eyeButton}
                      onPress={() => toggleVisibility('confirmPassword')}
                      hitSlop={8}
                    >
                      <HugeiconsIcon
                        icon={visibility.confirmPassword ? EyeIcon : ViewOffIcon}
                        size={20}
                        color={TEXT_MUTED}
                        strokeWidth={1.5}
                      />
                    </Pressable>
                  </View>
                  {errors.confirmPassword ? (
                    <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                  ) : null}
                </View>
              ) : null}
            </View>

            <Pressable style={styles.switchRow} onPress={toggleMode}>
              <Text style={styles.switchText}>
                {isSignUp ? "Already have an account? " : "Don't have an account? "}
                <Text style={styles.switchLink}>
                  {isSignUp ? 'Log In' : 'Sign Up'}
                </Text>
              </Text>
            </Pressable>

            {errors.form ? (
              <Text style={styles.errorText}>{errors.form}</Text>
            ) : null}

            <CoolButton
              onPress={handleSubmit}
              disabled={!canSubmit || isSubmitting}
              buttonTitle={isSignUp ? 'Sign Up' : 'Log In'}
              loader={isSubmitting}
            />
          </View>
        </View>
      </KeyboardAvoidingView>
    </MyWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: 'transparent',
  },
  keyboardView: {
    flex: 1,
  },
  layout: {
    flex: 1,
  },

  peek: {
    flex: 1,
    minHeight: 120,
  },
  logoBox: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoImageWrap: {
    width: 80,
    height: 80,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  logoImage: {
    width: 60,
    height: 60,
  },

  card: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 36,
    borderTopRightRadius: 36,
    borderBottomLeftRadius: 36,
    borderBottomRightRadius: 36,
    paddingTop: 28,
    paddingHorizontal: 24,
  },

  titleBlock: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 22,
    color: TEXT_DARK,
    letterSpacing: -0.3,
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 14,
    color: TEXT_MUTED,
    lineHeight: 21,
    textAlign: 'center',
  },

  form: {
    gap: 12,
    marginBottom: 16,
  },
  inputGroup: {
    gap: 6,
  },
  input: {
    height: 50,
    borderWidth: 1.5,
    borderColor: TEXT_MUTED,
    borderRadius: 14,
    paddingHorizontal: 16,
    fontFamily: 'Jakarta-Regular',
    fontSize: 15,
    color: TEXT_DARK,
    backgroundColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF4444',
  },
  passwordWrap: {
    position: 'relative',
    justifyContent: 'center',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    height: 50,
    justifyContent: 'center',
  },
  errorText: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    fontWeight: '500',
    color: '#FF4444',
    marginTop: 4,
  },

  switchRow: {
    marginBottom: 16,
  },
  switchText: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 14,
    color: TEXT_MUTED,
  },
  switchLink: {
    fontFamily: 'Jakarta-SemiBold',
    color: TEXT_DARK,
  },
});

export default Authentication;
