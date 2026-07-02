import Ionicons from '@expo/vector-icons/Ionicons';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';

import type { CategoryIconSpec } from '@/constants/categories';

export function CategoryIcon({
  icon,
  size = 16,
  color,
}: {
  icon: CategoryIconSpec;
  size?: number;
  color: string;
}) {
  if (icon.lib === 'mc') {
    return <MaterialCommunityIcons name={icon.name} size={size} color={color} />;
  }
  return <Ionicons name={icon.name} size={size} color={color} />;
}
