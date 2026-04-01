import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import WorkoutListScreen from '../screens/WorkoutListScreen';
import CreateWorkoutScreen from '../screens/CreateWorkoutScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Início: '🏠',
  Histórico: '📋',
  Registrar: '➕',
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: () => (
            <Text style={{ fontSize: 20 }}>{TAB_ICONS[route.name]}</Text>
          ),
          tabBarActiveTintColor: '#00FF66',
          tabBarInactiveTintColor: '#666666',
          tabBarStyle: {
            backgroundColor: '#1A1A1A',
            borderTopColor: '#2A2A2A',
          },
          tabBarLabelStyle: {
            fontSize: 12,
            fontWeight: 'bold',
          },
          headerStyle: { backgroundColor: '#1A1A1A' },
          headerTintColor: '#00FF66',
          headerTitleStyle: { fontWeight: 'bold' },
        })}
      >
        <Tab.Screen name="Início" component={HomeScreen} />
        <Tab.Screen name="Histórico" component={WorkoutListScreen} />
        <Tab.Screen name="Registrar" component={CreateWorkoutScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
