import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Image } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import WorkoutListScreen from '../screens/WorkoutListScreen';
import CreateWorkoutScreen from '../screens/CreateWorkoutScreen';
import TemplatesScreen from '../screens/TemplatesScreen';
import CreateTemplateScreen from '../screens/CreateTemplateScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

const TAB_ICONS = {
  Início: require('../../assets/icons/inicio.png'),
  Histórico: require('../../assets/icons/historico.png'),
  Registrar: require('../../assets/icons/registrar.png'),
  Criar: require('../../assets/icons/criar.png'),
};

const tabScreenOptions = ({ route }) => ({
  tabBarIcon: ({ focused }) => (
    <Image
      source={TAB_ICONS[route.name]}
      style={{ width: 24, height: 24, opacity: focused ? 1 : 0.45 }}
    />
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
});

function TabNavigator() {
  return (
    <Tab.Navigator screenOptions={tabScreenOptions}>
      <Tab.Screen name="Início" component={HomeScreen} />
      <Tab.Screen name="Histórico" component={WorkoutListScreen} />
      <Tab.Screen name="Registrar" component={CreateWorkoutScreen} />
      <Tab.Screen name="Criar" component={TemplatesScreen} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen
          name="CriarTemplate"
          component={CreateTemplateScreen}
          options={{
            headerShown: true,
            title: 'Novo Treino Padrão',
            headerStyle: { backgroundColor: '#1A1A1A' },
            headerTintColor: '#00FF66',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
