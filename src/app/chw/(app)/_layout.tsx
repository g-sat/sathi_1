import { Drawer } from 'expo-router/drawer';
import { SidebarContent } from '@/components/SidebarContent';

export default function ChwAppLayout() {
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
      <Drawer.Screen name="dashboard" options={{ drawerLabel: 'Dashboard' }} />
      <Drawer.Screen name="onboard" options={{ drawerLabel: 'Onboard patient' }} />
      <Drawer.Screen name="monitor" options={{ drawerLabel: 'Monitor all' }} />
    </Drawer>
  );
}
