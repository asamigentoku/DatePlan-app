import { GetProps, Text, styled } from 'tamagui';

import { Brand } from '@/constants/theme';

export const ThemedText = styled(Text, {
  name: 'ThemedText',
  color: '$color',
  fontSize: 16,
  lineHeight: 24,

  variants: {
    type: {
      default: {},
      defaultSemiBold: {
        fontWeight: '600',
      },
      title: {
        fontSize: 30,
        fontWeight: '800',
        lineHeight: 36,
      },
      subtitle: {
        fontSize: 20,
        fontWeight: '700',
      },
      link: {
        fontSize: 16,
        lineHeight: 28,
        color: Brand.purple,
        fontWeight: '600',
      },
    },
  } as const,

  defaultVariants: {
    type: 'default',
  },
});

export type ThemedTextProps = GetProps<typeof ThemedText>;
