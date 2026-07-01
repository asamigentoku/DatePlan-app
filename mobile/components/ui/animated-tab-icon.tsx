import { useEffect } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { IconSymbol } from '@/components/ui/icon-symbol';
import { Brand } from '@/constants/theme';

type IconName = Parameters<typeof IconSymbol>[0]['name'];

// タブ選択時にアイコンがポンと弾み、選択中はラベンダーのピルが背景に浮かぶ
export function AnimatedTabIcon({
  name,
  color,
  focused,
}: {
  name: IconName;
  color: string;
  focused: boolean;
}) {
  const scale = useSharedValue(1);
  const lift = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    if (focused) {
      scale.value = withSequence(withTiming(1.22, { duration: 120 }), withSpring(1, { damping: 8, stiffness: 220 }));
    }
    lift.value = withSpring(focused ? 1 : 0, { damping: 14, stiffness: 200 });
  }, [focused, scale, lift]);

  const iconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }, { translateY: -lift.value * 2 }],
  }));

  const pillStyle = useAnimatedStyle(() => ({
    opacity: lift.value,
    transform: [{ scale: 0.7 + lift.value * 0.3 }],
  }));

  return (
    <Animated.View style={{ alignItems: 'center', justifyContent: 'center', width: 40, height: 30 }}>
      <Animated.View
        style={[
          {
            position: 'absolute',
            width: 40,
            height: 30,
            borderRadius: 14,
            backgroundColor: Brand.lav,
          },
          pillStyle,
        ]}
      />
      <Animated.View style={iconStyle}>
        <IconSymbol size={22} name={name} color={color} />
      </Animated.View>
    </Animated.View>
  );
}
