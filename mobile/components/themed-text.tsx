import { Text, type TextProps } from 'react-native';

import { Brand } from '@/constants/theme';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'defaultSemiBold' | 'title' | 'subtitle' | 'link';
};

export function ThemedText({ style, type = 'default', ...rest }: ThemedTextProps) {
  return (
    <Text
      style={[
        { color: Brand.ink, fontSize: 16, lineHeight: 24 },
        type === 'defaultSemiBold' ? { fontWeight: '600' as const } : undefined,
        type === 'title' ? { fontSize: 30, fontWeight: '800' as const, lineHeight: 36 } : undefined,
        type === 'subtitle' ? { fontSize: 20, fontWeight: '700' as const } : undefined,
        type === 'link' ? { fontSize: 16, lineHeight: 28, color: Brand.purple, fontWeight: '600' as const } : undefined,
        style,
      ]}
      {...rest}
    />
  );
}
