import React from 'react';
import { View, Text, Button } from 'react-native';

const EventsScreen = ({ navigation }: any) => {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Events Screen</Text>
      <Button title="Go to Event Detail" onPress={() => navigation.navigate('EventDetail')} />
    </View>
  );
};

export default EventsScreen;
