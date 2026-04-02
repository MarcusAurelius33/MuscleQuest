import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';

export default function StatCard({ title, value, icon, color = '#FF6B00', onPress }) {
  return (
    <TouchableOpacity
      style={[styles.card, { borderLeftColor: color }]}
      onPress={onPress}
      activeOpacity={onPress ? 0.7 : 1}
    >
      <Image source={icon} style={styles.icon} />
      <View>
        <Text style={styles.title}>{title}</Text>
        <Text style={[styles.value, { color }]}>{value}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#222222',
    borderLeftWidth: 4,
    borderRadius: 8,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    elevation: 4,
  },
  icon: {
    width: 36,
    height: 36,
  },
  title: {
    color: '#999999',
    fontSize: 13,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
