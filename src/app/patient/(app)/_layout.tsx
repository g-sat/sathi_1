import { Drawer } from 'expo-router/drawer';
import { SidebarContent } from '@/components/SidebarContent';

export default function PatientAppLayout() {
  return (
    <Drawer
      drawerContent={(props) => <SidebarContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: { width: 260, backgroundColor: '#16161D' },
        overlayColor: 'rgba(0,0,0,0.6)',
        swipeEdgeWidth: 60,
        sceneStyle: { backgroundColor: '#0A0A0F' },
      }}
    >
      <Drawer.Screen name="home" options={{ drawerLabel: 'Home' }} />
      <Drawer.Screen name="plan" options={{ drawerLabel: 'My plan' }} />
      <Drawer.Screen name="tracker" options={{ drawerLabel: 'Daily tracker' }} />
    </Drawer>
  );
}
