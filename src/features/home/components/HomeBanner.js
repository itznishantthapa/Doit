import React, { useRef, useCallback } from 'react';
import { StyleSheet, View, Image, Pressable, Dimensions, Linking } from 'react-native';
import Carousel, { Pagination } from 'react-native-reanimated-carousel';
import { useSharedValue, useDerivedValue } from 'react-native-reanimated';
import { useFocusEffect } from '@react-navigation/native';
import { GHOSTWHITE } from '../../../constants/colors';

const BANNER_HEIGHT = 160;

const SKELETON_BANNERS = [
  { id: 'skeleton-1' },
  { id: 'skeleton-2' },
  { id: 'skeleton-3' },
];

const BannerSlide = ({ item }) => {
  const handlePress = useCallback(() => {
    if (item.url) {
      Linking.openURL(item.url).catch((err) => {
        if (__DEV__) console.error('Error opening URL:', err);
      });
    }
  }, [item.url]);

  if (!item.image) {
    return (
      <View style={styles.pageContainer}>
        <View style={styles.skeletonBanner} />
      </View>
    );
  }

  return (
    <Pressable
      style={styles.pageContainer}
      onPress={item.url ? handlePress : undefined}
      disabled={!item.url}
    >
      <Image source={{ uri: item.image }} style={styles.bannerImage} resizeMode="cover" />
    </Pressable>
  );
};

const HomeBanner = ({ data = [], height, isLoading }) => {
  const carouselRef = useRef(null);
  const progress = useSharedValue(0);
  const animatedProgress = useDerivedValue(() => progress.value);
  const { width } = Dimensions.get('window');
  const PAGE_WIDTH = width - 20;
  const PAGE_HEIGHT = typeof height === 'number' ? height : BANNER_HEIGHT;
  const isSkeleton = isLoading || !data.length;
  const carouselData = isSkeleton ? SKELETON_BANNERS : data;

  useFocusEffect(
    useCallback(() => {
      progress.value = 0;
    }, [progress])
  );

  return (
    <View style={styles.container}>
      <View style={[styles.wrapper, { height: PAGE_HEIGHT }]}>
        <Carousel
          ref={carouselRef}
          width={PAGE_WIDTH}
          height={PAGE_HEIGHT}
          autoPlay={!isSkeleton}
          autoPlayInterval={5000}
          loop={!isSkeleton}
          pagingEnabled
          data={carouselData}
          style={{ width: '100%' }}
          onProgressChange={(_, absoluteProgress) => {
            progress.value = absoluteProgress;
          }}
          renderItem={({ item }) => <BannerSlide item={item} />}
        />
      </View>

      <Pagination.Basic
        progress={animatedProgress}
        data={carouselData}
        dotStyle={styles.dot}
        activeDotStyle={styles.activeDot}
        containerStyle={styles.pagination}
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
    overflow: 'hidden',
    backgroundColor: '#ffffff',
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
  skeletonBanner: {
    width: '100%',
    height: '100%',
    borderRadius: 16,
    backgroundColor:GHOSTWHITE,
  },
  pagination: {
    flexDirection: 'row',
    alignSelf: 'center',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#000000',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000000',
    borderWidth: 0,
  },
});

export default HomeBanner;
