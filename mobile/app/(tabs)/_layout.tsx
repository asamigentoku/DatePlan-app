import { Tabs } from 'expo-router';
import React from 'react';

import { HapticTab } from '@/components/haptic-tab';
import { AnimatedTabIcon } from '@/components/ui/animated-tab-icon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#7C5CFC',
        tabBarInactiveTintColor: '#9B91C8',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: '#EDE9FF',
          borderTopWidth: 1,
          height: 88,
          paddingBottom: 28,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
          letterSpacing: 0.2,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'ホーム',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="heart.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'プラン',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="bookmark.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="discover"
        options={{
          title: 'トーク',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="bubble.left.and.bubble.right.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: '設定',
          tabBarIcon: ({ color, focused }) => (
            <AnimatedTabIcon name="gearshape.fill" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen name="explore" options={{ href: null }} />
    </Tabs>
  );
}
