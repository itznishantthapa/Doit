import { NavigationContainer } from '@react-navigation/native';
import UserNavigator from '../navigation/user/UserNavigator';
import AuthNavigator from '../navigation/auth/AuthNavigator';
import { useEffect } from 'react';
import { useAppBootstrap } from '../hooks/custom/useAppBootstrap';
import { useAuthStore } from '../features/auth/store/useAuthStore';
import { useNotificationEngine } from '../hooks/custom/useNotificationEngine';
import UpdateScreen from '../features/update/screen/Update';

const Main = () => {
  const { user, initializeAuth } = useAuthStore();
  const { isReady, updateRequired } = useAppBootstrap();

  useNotificationEngine();

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  if (!isReady) {
    return null;
  }

  if (updateRequired) {
    return <UpdateScreen />;
  }

  const getContent = () => {
    if (user === undefined) {
      return null;
    }

    if (!user) {
      return <AuthNavigator />;
    }

    return <UserNavigator />;
  };

  return (
    <NavigationContainer>
      {getContent()}
    </NavigationContainer>
  );
};

export default Main;
