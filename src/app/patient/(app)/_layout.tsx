import { Drawer } from 'expo-router/drawer';
import { SidebarContent } from '@/components/SidebarContent';

export default function PatientAppLayout() {
  return (
    <Drawer
      drawerContent={(props) => <SidebarContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: { width: 260, backgroundColor: '#FFFFFF' },
        overlayColor: 'rgba(15,23,42,0.25)',
        swipeEdgeWidth: 60,
        sceneStyle: { backgroundColor: '#F8FAFC' },
      }}
    >
      <Drawer.Screen name="home" options={{ drawerLabel: 'Home' }} />
      <Drawer.Screen name="plan" options={{ drawerLabel: 'My plan' }} />
      <Drawer.Screen name="tracker" options={{ drawerLabel: 'Daily tracker' }} />
    </Drawer>
  );
}
