import React from 'react';
import { StyleSheet, View } from 'react-native';
import { BORDER, MINT } from '../../../constants/colors';

const PendingAssignmentSkeletonCard = () => (
  <View style={styles.card}>
    <View style={styles.headerRow}>
      <View style={styles.iconCircle} />
      <View style={styles.titleContent}>
        <View style={[styles.titleLine, { backgroundColor: '#ffffff' }]} />
        <View style={[styles.typeLine, { backgroundColor: '#ffffff' }]} />
      </View>
      <View style={[styles.arrow, { backgroundColor: '#ffffff' }]} />
    </View>

    <View style={styles.footerRow}>
      <View style={[styles.dateLine, { backgroundColor: '#ffffff' }]} />
      <View style={[styles.statusLine, { backgroundColor: '#ffffff' }]} />
    </View>
  </View>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: MINT,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 16,
    gap: 14,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ffffff',
  },
  titleContent: {
    flex: 1,
    gap: 8,
  },
  titleLine: {
    height: 14,
    width: '85%',
    borderRadius: 6,
    backgroundColor: BORDER,
  },
  typeLine: {
    height: 10,
    width: '55%',
    borderRadius: 6,
    backgroundColor: BORDER,
  },
  arrow: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: BORDER,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dateLine: {
    height: 10,
    width: '45%',
    borderRadius: 6,
    backgroundColor: BORDER,
  },
  statusLine: {
    height: 22,
    width: 72,
    borderRadius: 20,
    backgroundColor: BORDER,
  },
});

export default PendingAssignmentSkeletonCard;
