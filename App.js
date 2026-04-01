import { useEffect } from 'react';
import AppNavigator from './src/navigation/AppNavigator';
import { initDb } from './src/database/db';

export default function App() {
  useEffect(() => {
    initDb();
  }, []);

  return <AppNavigator />;
}
