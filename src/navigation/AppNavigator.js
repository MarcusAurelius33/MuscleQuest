import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Image } from 'react-native';
import HomeScreen from '../screens/HomeScreen';
import WorkoutListScreen from '../screens/WorkoutListScreen';
import CreateWorkoutScreen from '../screens/CreateWorkoutScreen';
import TemplatesScreen from '../screens/TemplatesScreen';
import CreateTemplateScreen from '../screens/CreateTemplateScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Início: require('../../assets/icons/inicio.png'),
  Histórico: require('../../assets/icons/historico.png'),
  Registrar: require('../../assets/icons/registrar.png'),
  Padrões: require('../../assets/icons/meta.png'),
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused }) => {
            if (TAB_ICONS[route.name]) {
              return (
                <Image
                  source={TAB_ICONS[route.name]}
                  style={{ width: 24, height: 24, opacity: focused ? 1 : 0.45 }}
                />
              );
            }
            return null;
          },
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
        <Tab.Screen name="Padrões" component={TemplatesScreen} />
        <Tab.Screen
          name="CriarTemplate"
          component={CreateTemplateScreen}
          options={{
            tabBarButton: () => null,
            tabBarStyle: { display: 'none' },
            title: 'Novo Treino Padrão',
          }}
        />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
