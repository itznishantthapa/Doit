import React, { useCallback, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { ScreenHeader } from '../../../components/header/ScreenHeader';
import PendingAssignmentCard from '../../pending/components/PendingAssignmentCard';
import PendingAssignmentSkeletonCard from '../../pending/components/PendingAssignmentSkeletonCard';
import { useInfiniteAssignment } from '../../../hooks/query/infinite/useInfiniteAssignment';
import { queryClient } from '../../../services/queryClient';
import { TEXT_DARK, TEXT_MUTED } from '../../../constants/colors';
import { useNavigation } from '@react-navigation/native';
import { PEACH } from '../../../constants/colors';
const SKELETON_DATA = Array.from({ length: 10 }, (_, i) => ({ id: `skeleton-${i}`, isSkeleton: true }));

const Completed = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isFetching, refetch } =
    useInfiniteAssignment('completed');
  const navigation = useNavigation();
  const assignments = useMemo(
    () => data?.pages?.flatMap((p) => p?.assignments ?? []) ?? [],
    [data],
  );

  const isInitialLoading = isFetching && assignments.length === 0;

  const handleLoadMore = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    queryClient.removeQueries({ queryKey: ['assignments', 'completed'] });
    await refetch();
    setIsRefreshing(false);
  }, [refetch]);

  const handleCompletedAssignmentPress = useCallback((item) => {
    navigation.navigate('Progress', { assignmentId: item.id });
  }, [navigation]);

  return (
    <MyWrapper style={styles.screen}>
      <ScreenHeader title="Completed" />
      <View style={styles.content}>
        <View style={styles.listHeader}>
          <Text style={styles.sectionTitle}>Your Assignments</Text>
          <Text style={styles.countLabel}>{data?.pages?.[0]?.total_count ?? 0} total</Text>
        </View>
        <FlatList
          data={isInitialLoading ? SKELETON_DATA : assignments}
          keyExtractor={(item) => String(item.id)}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.listContent}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
          onEndReached={isInitialLoading ? undefined : handleLoadMore}
          onEndReachedThreshold={0.3}
          refreshControl={<RefreshControl refreshing={false} onRefresh={handleRefresh} />}
          ListEmptyComponent={
            !isFetching ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No completed assignments</Text>
                <Text style={styles.emptySubtitle}>Finished assignments will appear here.</Text>
              </View>
            ) : null
          }
          ListFooterComponent={isFetchingNextPage ? <ActivityIndicator style={styles.loader} /> : null}
          renderItem={({ item }) =>
            item.isSkeleton ? <PendingAssignmentSkeletonCard /> : <PendingAssignmentCard onPress={() => handleCompletedAssignmentPress(item)} assignment={item} backgroundColor={PEACH} />
          }
        />
      </View>
    </MyWrapper>
  );
};

const styles = StyleSheet.create({
  screen: { backgroundColor: '#ffffff' },
  content: { flex: 1, paddingHorizontal: 16, paddingTop: 8 },
  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 },
  sectionTitle: { fontFamily: 'Jakarta-Regular', fontSize: 13, color: TEXT_MUTED },
  countLabel: { fontFamily: 'Jakarta-Regular', fontSize: 12, color: TEXT_MUTED },
  listContent: { flexGrow: 1, paddingBottom: 32 },
  separator: { height: 12 },
  loader: { marginVertical: 24 },
  emptyState: { alignItems: 'center', paddingHorizontal: 24, paddingVertical: 48 },
  emptyTitle: { fontFamily: 'Jakarta-SemiBold', fontSize: 16, color: TEXT_DARK, marginBottom: 8, textAlign: 'center' },
  emptySubtitle: { fontFamily: 'Jakarta-Regular', fontSize: 13, color: TEXT_MUTED, lineHeight: 19, textAlign: 'center' },
});

export default Completed;
