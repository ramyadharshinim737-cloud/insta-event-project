import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import EditEventWizard from './EditEventWizard';

interface Props { navigation?: any }

const EditEventScreen: React.FC<Props> = ({ navigation }) => {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.headerBar}>
        <Text style={[styles.header, { color: colors.text }]}>Edit Event</Text>
        <Text onPress={() => (navigation?.goBack ? navigation.goBack() : null)} style={[styles.backLink, { color: colors.text }]}>Back</Text>
      </View>
      <ScrollView contentContainerStyle={{ paddingBottom: 12 }}>
        <EditEventWizard />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerBar: { paddingHorizontal: 16, paddingTop: 12, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  header: { fontSize: 20, fontWeight: '700', marginBottom: 8 },
  backLink: { fontSize: 14 },
});

export default EditEventScreen;
