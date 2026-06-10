import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, Image, Pressable, Dimensions, Linking } from 'react-native';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import { useThemeStore } from '../../../store/themeStore';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';

const BANNER_HEIGHT = 160;

const BannerPage = ({ data }) => {
  const handlePress = useCallback(() => {
    if (data?.url) {
      Linking.openURL(data.url).catch((err) => {
        if (__DEV__) console.error('Error opening URL:', err);
      });
    }
  }, [data?.url]);

  const isPressable = !!data?.url;

  return (
    <Pressable
      style={styles.pageContainer}
      onPress={isPressable ? handlePress : undefined}
      disabled={!isPressable}
    >
      <Image
        source={{ uri: data?.image }}
        style={styles.bannerImage}
        resizeMode="cover"
      />
    </Pressable>
  );
};

const HomeBanner = ({ data = [], height }) => {
  const carouselRef = useRef(null);
  const progress = useSharedValue(0);
  const animatedProgress = useDerivedValue(() => progress.value);
  const { isLight } = useThemeStore();

  const wrapperBg = isLight ? '#ffffff' : '#000000';
  const { width } = Dimensions.get('window');
  const PAGE_WIDTH = width - 20;
  const PAGE_HEIGHT = typeof height === 'number' ? height : BANNER_HEIGHT;

  useFocusEffect(
    useCallback(() => {
      progress.value = 0;
    }, [progress])
  );

  if (!data.length) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={[styles.wrapper, { backgroundColor: wrapperBg, height: PAGE_HEIGHT }]}>
        <Carousel
          ref={carouselRef}
          width={PAGE_WIDTH}
          height={PAGE_HEIGHT}
          autoPlay
          autoPlayInterval={5000}
          loop
          pagingEnabled
          data={data}
          style={{ width: '100%' }}
          onProgressChange={(_, absoluteProgress) => {
            progress.value = absoluteProgress;
          }}
          renderItem={({ item }) => <BannerPage data={item} />}
        />
      </View>

      <Pagination.Basic
        progress={animatedProgress}
        data={data}
        dotStyle={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: 'transparent',
          borderWidth: 1,
          borderColor: isLight ? '#000000' : '#ffffff',
        }}
        activeDotStyle={{
          width: 8,
          height: 8,
          borderRadius: 4,
          backgroundColor: isLight ? '#000000' : '#ffffff',
          borderWidth: 0,
          borderColor: isLight ? '#000000' : '#ffffff',
        }}
        containerStyle={{
          alignSelf: 'center',
          gap: 8,
          marginTop: 8,
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 10,
    marginBottom: 16,
    marginTop: 10,
  },
  wrapper: {
    position: 'relative',
    overflow: 'hidden',
  },
  pageContainer: {
    flex: 1,
    paddingHorizontal: 4,
  },
  bannerImage: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
});

export default HomeBanner;
