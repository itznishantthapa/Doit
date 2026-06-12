import React, { useCallback } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MyWrapper } from '../../../components/wrapper/MyWrapper';
import { ScreenHeader } from '../../../components/header/ScreenHeader';
import { BORDER, TEXT_DARK, TEXT_MUTED, WHITE } from '../../../constants/colors';
import { useUserNotification } from '../../../hooks/query/query/useUserNotification';

const NotificationRow = ({ item, onPress }) => (
  <Pressable
    style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
    onPress={onPress}
  >
    <View style={styles.headerRow}>
      <Text style={styles.title} numberOfLines={2}>
        {item.title}
      </Text>
      <Text style={styles.date}>{item.created_at}</Text>
    </View>
    <Text style={styles.description}>{item.description}</Text>
  </Pressable>
);

const Notification = () => {
  const navigation = useNavigation();
  const { data: notifications = [], isLoading } = useUserNotification();

  const handleNotificationPress = useCallback(
    (item) => {
      if (!item.screen_name) return;
      navigation.navigate(item.screen_name, { assignmentId: item.assignment_id });
    },
    [navigation],
  );

  return (
    <MyWrapper style={styles.screen}>
      <ScreenHeader title="Notifications" />

      <FlatList
        data={notifications}
        keyExtractor={(item) => String(item.id)}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        ListEmptyComponent={
          isLoading ? (
            <ActivityIndicator style={styles.loader} />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>No notifications</Text>
              <Text style={styles.emptySubtitle}>Updates about your assignments will appear here.</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <NotificationRow item={item} onPress={() => handleNotificationPress(item)} />
        )}
      />
    </MyWrapper>
  );
};

const styles = StyleSheet.create({
  screen: {
    backgroundColor: WHITE,
  },
  listContent: {
    flexGrow: 1,
  },
  row: {
    backgroundColor: WHITE,
    paddingHorizontal: 20,
    paddingVertical: 18,
  },
  rowPressed: {
    opacity: 0.7,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 6,
  },
  separator: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: BORDER,
  },
  title: {
    flex: 1,
    fontFamily: 'Jakarta-Bold',
    fontSize: 15,
    color: TEXT_DARK,
    letterSpacing: -0.2,
  },
  date: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 11,
    color: TEXT_MUTED,
    textAlign: 'right',
    flexShrink: 0,
    maxWidth: '42%',
  },
  description: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
    lineHeight: 19,
  },
  loader: {
    marginTop: 48,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 64,
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

export default Notification;
