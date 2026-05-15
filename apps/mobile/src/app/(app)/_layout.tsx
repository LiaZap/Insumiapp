import { Tabs } from 'expo-router';
import { View } from 'react-native';
import { SolarIcon, type SolarIconName } from '@/components/icons/SolarIcon';
import { colors } from '@/theme/tokens';

type TabIconProps = { focused: boolean; icon: SolarIconName; focusedIcon?: SolarIconName };

function TabIcon({ focused, icon, focusedIcon }: TabIconProps) {
  return (
    <View
      style={{
        width: 48,
        height: 48,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: focused ? colors.brand[500] : 'transparent',
      }}
    >
      <SolarIcon
        name={focused ? (focusedIcon ?? icon) : icon}
        size={22}
        color={focused ? '#FFFFFF' : colors.brand[500]}
      />
    </View>
  );
}

export default function AppLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          position: 'absolute',
          bottom: 20,
          left: 16,
          right: 16,
          height: 68,
          borderRadius: 100,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 6,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: 4 },
          paddingHorizontal: 4,
          paddingTop: 10,
          paddingBottom: 10,
        },
        tabBarItemStyle: { height: 48 },
      }}
    >
      <Tabs.Screen
        name="dashboard"
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="home-2-bold" /> }}
      />
      <Tabs.Screen
        name="pedidos"
        options={{ tabBarIcon: ({ focused }) => <TabIcon focused={focused} icon="inbox-linear" /> }}
      />
      <Tabs.Screen
        name="novo-pedido"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon
              focused={focused}
              icon="add-square-bold-duotone"
              focusedIcon="add-square-bold"
            />
          ),
        }}
      />
      <Tabs.Screen
        name="estoque"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="box-linear" focusedIcon="box-bold-duotone" />
          ),
        }}
      />
      <Tabs.Screen
        name="menu"
        options={{
          tabBarIcon: ({ focused }) => (
            <TabIcon focused={focused} icon="clipboard-add-linear" />
          ),
        }}
      />
      {/* Rotas acessíveis via push mas fora da barra */}
      <Tabs.Screen name="financeiro" options={{ href: null }} />
      <Tabs.Screen name="notificacoes" options={{ href: null }} />
      <Tabs.Screen name="pedido" options={{ href: null }} />
      <Tabs.Screen name="movimentacoes" options={{ href: null }} />
    </Tabs>
  );
}
