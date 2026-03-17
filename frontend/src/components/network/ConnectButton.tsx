import React, { useState } from 'react';
import { TouchableOpacity, Text, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

type State = 'Connect' | 'Pending' | 'Connected';

interface Props { initial?: State }

const ConnectButton: React.FC<Props> = ({ initial = 'Connect' }) => {
  const [state, setState] = useState<State>(initial);

  const onPress = () => {
    if (state === 'Connect') {
      setState('Pending');
    }
  };

  const getButtonStyle = () => {
    switch (state) {
      case 'Connect':
        return styles.connectButton;
      case 'Pending':
        return styles.pendingButton;
      case 'Connected':
        return styles.connectedButton;
    }
  };

  const getTextStyle = () => {
    switch (state) {
      case 'Connect':
        return styles.connectText;
      case 'Pending':
        return styles.pendingText;
      case 'Connected':
        return styles.connectedText;
    }
  };

  return (
    <TouchableOpacity 
      onPress={onPress} 
      style={[styles.button, getButtonStyle()]}
      activeOpacity={0.8}
      disabled={state === 'Pending' || state === 'Connected'}
    >
      {state === 'Connected' && (
        <Ionicons name="checkmark-circle" size={16} color="#059669" style={styles.icon} />
      )}
      <Text style={[styles.buttonText, getTextStyle()]}>
        {state === 'Connect' ? 'Connect' : state === 'Pending' ? 'Pending' : 'Connected'}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({ 
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 11,
    paddingHorizontal: 24,
    borderRadius: 24,
    borderWidth: 2,
    minWidth: 120,
  },
  connectButton: {
    backgroundColor: '#0A66C2',
    borderColor: '#0A66C2',
  },
  pendingButton: {
    backgroundColor: '#FFFFFF',
    borderColor: '#D1D5DB',
  },
  connectedButton: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  connectText: {
    color: '#FFFFFF',
  },
  pendingText: {
    color: '#6B7280',
  },
  connectedText: {
    color: '#059669',
  },
  icon: {
    marginRight: 6,
  },
});

export default ConnectButton;
