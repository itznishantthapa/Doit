import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { ScreenHeader } from '../../../components/header/ScreenHeader';
import PendingAssignmentCard from '../components/PendingAssignmentCard';
import PendingAssignmentSkeletonCard from '../components/PendingAssignmentSkeletonCard';
import { useInfiniteAssignment } from '../../../hooks/query/infinite/useInfiniteAssignment';
import { queryClient } from '../../../services/queryClient';
import { TEXT_DARK, TEXT_MUTED } from '../../../constants/colors';
import { useNavigation } from '@react-navigation/native';
const SKELETON_DATA = Array.from({ length: 10 }, (_, index) => ({
  id: `skeleton-${index}`,
  isSkeleton: true,
}));

const Pending = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isFetching,
    refetch,
  } = useInfiniteAssignment('pending');
  const navigation = useNavigation();

  const assignments = useMemo(
    () => data?.pages?.flatMap((page) => page?.assignments ?? []) ?? [],
    [data],
  );

  const isInitialLoading = isFetching && assignments.length === 0;
  const listData = isInitialLoading ? SKELETON_DATA : assignments;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    queryClient.removeQueries({ queryKey: ['assignments', 'pending'] });
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handlePendingAssignmentPress = useCallback((item) => {
    navigation.navigate('Progress', { assignmentId: item.id });
  }, [navigation]);

  return (
    <MyWrapper style={styles.screen}>
      <ScreenHeader title="Pending" />

      <View style={styles.content}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Your Assignments</Text>
          <Text style={styles.countLabel}>{data?.pages?.[0]?.total_count ?? 0} total</Text>
        </View>

        <FlatList
          data={listData}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={isInitialLoading ? undefined : handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={
            <RefreshControl refreshing={false} onRefresh={handleRefresh} />
          }
          ListEmptyComponent={
            !isFetching ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No pending assignments</Text>
                <Text style={styles.emptySubtitle}>
                  Assignments you submit will appear here for tracking.
                </Text>
              </View>
            ) : null
          }
          ListFooterComponent={
            isFetchingNextPage ? <ActivityIndicator style={styles.loader} /> : null
          }
          renderItem={({ item }) =>
            item.isSkeleton ? (
              <PendingAssignmentSkeletonCard />
            ) : (
              <PendingAssignmentCard
                assignment={item}
                onPress={() => handlePendingAssignmentPress(item)}
                // onPress={() => __DEV__ && console.log('Pending assignment pressed:', item.id)}
              />
            )
          }
        />
      </View>
    </MyWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  sectionTitle: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
  },
  countLabel: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: TEXT_MUTED,
  },
  listContent: {
    flexGrow: 1,
    paddingBottom: 32,
  },
  separator: {
    height: 12,
  },
  loader: {
    marginVertical: 24,
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  emptyTitle: {
    fontFamily: 'Jakarta-SemiBold',
    fontSize: 16,
    color: TEXT_DARK,
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 19,
    textAlign: 'center',
  },
});

export default Pending;
