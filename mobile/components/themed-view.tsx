import { View, type ViewProps } from 'react-native';

import { Brand } from '@/constants/theme';

export type ThemedViewProps = ViewProps;

export function ThemedView({ style, ...rest }: ThemedViewProps) {
  return <View style={[{ backgroundColor: Brand.bg }, style]} {...rest} />;
}
