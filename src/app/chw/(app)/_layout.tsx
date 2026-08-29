import { Drawer } from 'expo-router/drawer';
import { SidebarContent } from '@/components/SidebarContent';

export default function ChwAppLayout() {
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
      <Drawer.Screen name="dashboard" options={{ drawerLabel: 'Dashboard' }} />
      <Drawer.Screen name="onboard" options={{ drawerLabel: 'Onboard patient' }} />
      <Drawer.Screen name="monitor" options={{ drawerLabel: 'Monitor all' }} />
    </Drawer>
  );
}
