import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@dateplan:settings';

export interface AppSettings {
  // プラン結果画面に地図を表示するか（デフォルトはオフ）
  showMapInPlanResult: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  showMapInPlanResult: false,
};

async function readRaw(): Promise<AppSettings> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return DEFAULT_SETTINGS;
  try {
    const parsed = JSON.parse(raw) as Partial<AppSettings>;
    return { ...DEFAULT_SETTINGS, ...parsed };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function getSettings(): Promise<AppSettings> {
  return readRaw();
}

export async function setShowMapInPlanResult(value: boolean): Promise<void> {
  const current = await readRaw();
  await AsyncStorage.setItem(KEY, JSON.stringify({ ...current, showMapInPlanResult: value }));
}
