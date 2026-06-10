import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { HugeiconsIcon } from '@hugeicons/react-native';
import {
  AssignmentsIcon,
  Clock01Icon,
  TaskDone01Icon,
  ListIndentIncreaseIcon,
} from '@hugeicons/core-free-icons';
import { TEXT_DARK, TEXT_MUTED } from '../../../constants/colors';

const ACTION_CARDS = [
  {
    id: 'assignment-help',
    title: 'Assignment Help',
    subtitle: 'Provide us your assignment',
    icon: AssignmentsIcon,
    backgroundColor: '#F3F0FA',
    onPress: () => {
      if (__DEV__) console.log('Assignment Help');
    },
  },
  {
    id: 'pending',
    title: 'Pending',
    subtitle: 'Track your given assignments',
    icon: Clock01Icon,
    backgroundColor: '#EAF6F0',
    onPress: () => {
      if (__DEV__) console.log('Pending');
    },
  },
  {
    id: 'completed',
    title: 'Completed',
    subtitle: 'View and download your assignments',
    icon: TaskDone01Icon,
    backgroundColor: '#FFF3EB',
    onPress: () => {
      if (__DEV__) console.log('Completed');
    },
  },
  {
    id: 'all',
    title: 'All',
    subtitle: 'View all of your given assignments',
    icon: ListIndentIncreaseIcon,
    backgroundColor: '#F0F2F5',
    onPress: () => {
      if (__DEV__) console.log('All');
    },
  },
];

const CARD_ROWS = [
  ACTION_CARDS.slice(0, 2),
  ACTION_CARDS.slice(2, 4),
];

const ActionCardItem = ({ title, subtitle, icon, backgroundColor, onPress }) => (
  <Pressable
    style={({ pressed }) => [
      styles.card,
      { backgroundColor },
      pressed && styles.cardPressed,
    ]}
    onPress={onPress}
  >
    <View style={styles.iconWrap}>
      <HugeiconsIcon icon={icon} size={28} color={TEXT_DARK} strokeWidth={1.5} />
    </View>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.subtitle}>{subtitle}</Text>
  </Pressable>
);

const ActionCard = () => (
  <View style={styles.section}>
    <Text style={styles.sectionTitle}>Assignments  &  Actions</Text>
    <View style={styles.cardGrid}>
      {CARD_ROWS.map((row, rowIndex) => (
        <React.Fragment key={row.map((card) => card.id).join('-')}>
          {rowIndex > 0 ? <View style={styles.rowGap} /> : null}
          <View style={styles.cardRow}>
            {row.map((card, cardIndex) => (
              <React.Fragment key={card.id}>
                {cardIndex > 0 ? <View style={styles.cardGap} /> : null}
                <ActionCardItem {...card} />
              </React.Fragment>
            ))}
          </View>
        </React.Fragment>
      ))}
    </View>
  </View>
);

const styles = StyleSheet.create({
  section: {
    paddingHorizontal: 20,
    marginTop: 4,
  },
  sectionTitle: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 13,
    color: TEXT_MUTED,
    marginBottom: 14,
  },
  cardGrid: {
    width: '100%',
  },
  cardRow: {
    flexDirection: 'row',
  },
  cardGap: {
    width: 12,
  },
  rowGap: {
    height: 12,
  },
  card: {
    flex: 1,
    minHeight: 148,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 18,
    justifyContent: 'flex-start',
  },
  cardPressed: {
    opacity: 0.85,
  },
  iconWrap: {
    marginBottom: 14,
  },
  title: {
    fontFamily: 'Jakarta-Bold',
    fontSize: 15,
    color: TEXT_DARK,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  subtitle: {
    fontFamily: 'Jakarta-Regular',
    fontSize: 12,
    color: TEXT_MUTED,
    lineHeight: 17,
  },
});

export default ActionCard;
