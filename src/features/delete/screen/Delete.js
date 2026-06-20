import React, { useCallback, useState } from 'react';
import { Alert, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import { ArrowLeft01Icon } from '@hugeicons/core-free-icons';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import CoolButton from '../../../components/button/CoolButton';
import { TEXT_DARK, WHITE } from '../../../constants/colors';
import { useAuthStore } from '../../auth/store/useAuthStore';

const TEXT_SECONDARY = 'rgba(26, 26, 26, 0.55)';

const Delete = () => {
  const navigation = useNavigation();
  const { user, deleteAccount } = useAuthStore();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteAccountPress = useCallback(() => {
    if (isDeleting) return;

    Alert.alert(
      '',
      'Confirm Account Deletion',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Confirm',
          style: 'destructive',
          onPress: async () => {
            setIsDeleting(true);

            try {
              await deleteAccount();
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ],
      { cancelable: true },
    );
  }, [deleteAccount, isDeleting]);

    return (
        <MyWrapper style={styles.screen}>
            <View style={styles.header}>
                <Pressable
                    onPress={() => navigation.goBack()}
                    hitSlop={8}
                    style={({ pressed }) => [styles.backButton, pressed && styles.pressed]}
                >
                    <HugeiconsIcon icon={ArrowLeft01Icon} size={24} color={TEXT_DARK} strokeWidth={1.5} />
                </Pressable>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>Delete Account</Text>
                <Text style={styles.username}>{user?.username ?? 'User'}</Text>

                <Image
                    source={require('../../../assets/deleteicon.png')}
                    style={styles.deleteIcon}
                    resizeMode="contain"
                />

                <Text style={styles.warningText}>
                    Once your account is deleted, all your data will be permanently erased and you won't be able to log back in. Your username will also become available for others to claim.
                </Text>
            </View>

            <View style={styles.footer}>
                <CoolButton
                    buttonTitle="Delete Account"
                    onPress={handleDeleteAccountPress}
                    loader={isDeleting}
                    disabled={isDeleting}
                />
            </View>
        </MyWrapper>
    );
};

export default Delete;

const styles = StyleSheet.create({
    screen: {
        backgroundColor: WHITE,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
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
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: 24,
    },
    title: {
        fontFamily: 'Jakarta-Bold',
        fontSize: 26,
        color: TEXT_DARK,
        textAlign: 'center',
        letterSpacing: -0.4,
        marginBottom: 8,
    },
    username: {
        fontFamily: 'Jakarta-Regular',
        fontSize: 14,
        color: TEXT_SECONDARY,
        textAlign: 'center',
        marginBottom: 32,
    },
    deleteIcon: {
        width: 180,
        height: 180,
        marginBottom: 32,
    },
    warningText: {
        fontFamily: 'Jakarta-Regular',
        fontSize: 14,
        color: TEXT_DARK,
        textAlign: 'center',
        lineHeight: 22,
        maxWidth: 320,
    },
    footer: {
        paddingHorizontal: 24,
        paddingBottom: 16,
    },
});
