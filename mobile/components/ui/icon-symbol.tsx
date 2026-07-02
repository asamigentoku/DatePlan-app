import Ionicons from '@expo/vector-icons/Ionicons';
import { ComponentProps } from 'react';
import { OpaqueColorValue, type StyleProp, type TextStyle } from 'react-native';

type IconMapping = Record<string, ComponentProps<typeof Ionicons>['name']>;
type IconSymbolName = keyof typeof MAPPING;

/**
 * アプリ全体で使うリッチなベクターアイコン（Ionicons / react-native-vector-icons ベース）の一覧。
 * SF Symbols 風のキー名から Ionicons のアイコン名へマッピングし、
 * iOS/Android/Web で見た目を統一する（プラットフォーム分岐しない）。
 */
const MAPPING = {
  'house.fill': 'home',
  'heart.fill': 'heart',
  heart: 'heart-outline',
  'bookmark.fill': 'bookmark',
  bookmark: 'bookmark-outline',
  'map.fill': 'map',
  sparkles: 'sparkles',
  'person.fill': 'person-circle',
  'cart.fill': 'cart',
  'paperplane.fill': 'paper-plane',
  'chevron.left.forwardslash.chevron.right': 'code-slash',
  'chevron.right': 'chevron-forward',
  'chevron.left': 'chevron-back',
  'bubble.left.and.bubble.right.fill': 'chatbubbles',
  calendar: 'calendar',
  'location.fill': 'location',
  'pin.fill': 'pin',
  'wallet.fill': 'wallet',
  'clock.fill': 'time',
  'car.fill': 'car',
  'tram.fill': 'train',
  'figure.walk': 'walk',
  'cloud.sun.fill': 'partly-sunny',
  'star.fill': 'star',
  pencil: 'create',
  checkmark: 'checkmark',
  'checkmark.circle.fill': 'checkmark-circle',
  xmark: 'close',
  'xmark.circle.fill': 'close-circle',
  'trash.fill': 'trash',
  plus: 'add',
  'plus.circle.fill': 'add-circle',
  'lightbulb.fill': 'bulb',
  'cup.and.saucer.fill': 'cafe',
  'fork.knife': 'restaurant',
  'tree.fill': 'leaf',
  'paintpalette.fill': 'color-palette',
  'film.fill': 'film',
  'bag.fill': 'bag',
  'building.columns.fill': 'business',
  'moon.stars.fill': 'moon',
  'photo.fill': 'image',
  'gearshape.fill': 'settings',
  'questionmark.circle.fill': 'help-circle',
  'info.circle.fill': 'information-circle',
} as IconMapping;

/**
 * SF Symbols 風のキー名から Ionicons を描画する共通アイコンコンポーネント。
 */
export function IconSymbol({
  name,
  size = 24,
  color,
  style,
}: {
  name: IconSymbolName;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<TextStyle>;
}) {
  return <Ionicons color={color} size={size} name={MAPPING[name]} style={style} />;
}
