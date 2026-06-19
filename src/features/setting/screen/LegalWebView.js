import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { WebView } from 'react-native-webview';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { ScreenHeader } from '../../../components/header/ScreenHeader';
import { TEXT_DARK, WHITE } from '../../../constants/colors';

const LegalWebView = () => {
  const route = useRoute();
  const { title, url } = route.params ?? {};
  const [isLoading, setIsLoading] = useState(true);

  return (
    <MyWrapper style={styles.screen}>
      <ScreenHeader title={title ?? 'Legal'} />

      <View style={styles.webviewWrap}>
        <WebView
          source={{ uri: url }}
          style={styles.webview}
          onLoadStart={() => setIsLoading(true)}
          onLoadEnd={() => setIsLoading(false)}
          startInLoadingState
          showsVerticalScrollIndicator={false}
        />

        {isLoading ? (
          <View style={styles.loader}>
            <ActivityIndicator size="small" color={TEXT_DARK} />
          </View>
        ) : null}
      </View>
    </MyWrapper>
  );
};

export default LegalWebView;

const styles = StyleSheet.create({
  screen: {
    backgroundColor: WHITE,
  },
  webviewWrap: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: WHITE,
  },
  loader: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: WHITE,
  },
});
