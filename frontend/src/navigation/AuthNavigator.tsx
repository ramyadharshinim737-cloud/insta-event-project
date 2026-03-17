import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import { AuthStackParamList } from './types';

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthNavigator = () => (
  <Stack.Navigator>
    <Stack.Screen
      name="Login"
      component={LoginScreen}
      options={{ title: 'Login' }}
    />
    <Stack.Screen
      name="Onboarding"
      component={OnboardingScreen}
      options={{ title: 'Onboarding' }}
    />
  </Stack.Navigator>
);

export default AuthNavigator;

