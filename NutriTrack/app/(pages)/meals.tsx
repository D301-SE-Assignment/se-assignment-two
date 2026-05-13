import { Image } from 'expo-image';
import { Platform, StyleSheet, View, ScrollView, Text, TextInput } from 'react-native';

import { Link } from 'expo-router';
import { useRoute } from '@react-navigation/native';

export default function HomeScreen() {
  return (
    <ScrollView>
        <Text>{useRoute().name}</Text>
    </ScrollView>
  );
};