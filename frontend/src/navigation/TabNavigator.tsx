import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/home/HomeScreen';
import EventsScreen from '../screens/events/EventsScreen';
import { NetworkScreen } from '../screens/NetworkScreen';
import MessagesScreen from '../screens/messages/MessagesScreen';
import ProfileScreen from '../screens/ProfileScreen';
import { TabParamList } from './types';

const Tab = createBottomTabNavigator<TabParamList>();

const TabNavigator = () => (
  <Tab.Navigator 
    screenOptions={{ 
      headerShown: false,
      tabBarStyle: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        elevation: 8,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#e0e0e0',
        height: 60,
        paddingBottom: 8,
        paddingTop: 8,
      }
    }}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Events" component={EventsScreen} />
    <Tab.Screen name="Network" component={NetworkScreen} />
    <Tab.Screen name="Messages" component={MessagesScreen} />
    <Tab.Screen name="Profile" component={ProfileScreen} />
  </Tab.Navigator>
);

export default TabNavigator;

