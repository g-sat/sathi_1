import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, usePathname } from 'expo-router';
import type { DrawerContentComponentProps } from 'expo-router/build/react-navigation/drawer';
import {
  Activity,
  ClipboardList,
  HeartPulse,
  Home,
  LogOut,
  NotebookPen,
  UserPlus,
} from 'lucide-react-native';
import type { ReactNode } from 'react';
import { useSession } from '@/context/SessionContext';

interface NavItem {
  href: string;
  label: string;
  icon: (color: string) => ReactNode;
}

const CHW_ITEMS: NavItem[] = [
  { href: '/chw/dashboard', label: 'Dashboard', icon: (c) => <Home size={18} color={c} /> },
  { href: '/chw/onboard', label: 'Onboard patient', icon: (c) => <UserPlus size={18} color={c} /> },
  { href: '/chw/monitor', label: 'Monitor all', icon: (c) => <Activity size={18} color={c} /> },
];

const PATIENT_ITEMS: NavItem[] = [
  { href: '/patient/home', label: 'Home', icon: (c) => <Home size={18} color={c} /> },
  { href: '/patient/plan', label: 'My plan', icon: (c) => <ClipboardList size={18} color={c} /> },
  { href: '/patient/tracker', label: 'Daily tracker', icon: (c) => <NotebookPen size={18} color={c} /> },
];

export function SidebarContent(props: DrawerContentComponentProps) {
  const { session, signOut } = useSession();
  const pathname = usePathname();

  const isChw = session?.role === 'chw';
  const items = isChw ? CHW_ITEMS : PATIENT_ITEMS;
  const name = isChw ? session?.user.name : session?.patient.name;
  const sectionLabel = isChw ? 'Community Health Worker' : 'Patient';

  function go(href: string) {
    router.replace(href as never);
    props.navigation.closeDrawer?.();
  }

  async function handleSignOut() {
    props.navigation.closeDrawer?.();
    await signOut();
    router.replace('/');
  }

  return (
    <SafeAreaView className="flex-1 bg-cream-50" edges={['top', 'bottom', 'left']}>
      <View className="flex-1 px-3 pt-4">
        <View className="flex-row items-center gap-2.5 px-2 pb-6">
          <View className="h-9 w-9 items-center justify-center rounded-lg bg-terracotta-500">
            <HeartPulse size={18} color="#FFFFFF" />
          </View>
          <Text className="font-display text-lg text-ink-800">Sathi</Text>
        </View>

        <Text className="px-2 pb-2 font-body-semibold text-[11px] uppercase tracking-widest text-ink-700/50">
          Menu
        </Text>
        <View className="gap-1">
          {items.map((item) => {
            const active = pathname === item.href;
            return (
              <Pressable
                key={item.href}
                onPress={() => go(item.href)}
                className={`flex-row items-center gap-3 rounded-lg px-3 py-2.5 ${
                  active ? 'bg-terracotta-500' : ''
                }`}
              >
                {item.icon(active ? '#FFFFFF' : '#64748B')}
                <Text
                  className={`font-body-medium text-sm ${active ? 'text-white' : 'text-ink-700'}`}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View className="gap-3 border-t border-cream-300 px-4 py-4">
        <View className="gap-0.5">
          <Text className="font-body-semibold text-xs uppercase tracking-widest text-terracotta-600">
            {sectionLabel}
          </Text>
          <Text className="font-body-semibold text-sm text-ink-800" numberOfLines={1}>
            {name}
          </Text>
        </View>
        <Pressable
          onPress={handleSignOut}
          className="flex-row items-center gap-2.5 rounded-lg bg-cream-200 px-3 py-2.5"
        >
          <LogOut size={16} color="#1E293B" />
          <Text className="font-body-medium text-sm text-ink-800">Sign out</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

export const NAV_ITEMS_BY_ROLE = { chw: CHW_ITEMS, patient: PATIENT_ITEMS };
