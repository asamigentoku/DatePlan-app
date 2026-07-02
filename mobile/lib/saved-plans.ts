import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Plan } from '@/lib/date-plan-types';

const KEY = '@dateplan:savedPlans';

export interface SavedPlanRecord {
  id: string;
  savedAt: string;
  plan: Plan;
  favorite?: boolean;
}

async function readRaw(): Promise<SavedPlanRecord[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as SavedPlanRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function sortSavedPlans(list: SavedPlanRecord[]): SavedPlanRecord[] {
  return [...list].sort((a, b) => {
    if (!!a.favorite !== !!b.favorite) return a.favorite ? -1 : 1;
    return a.savedAt < b.savedAt ? 1 : -1;
  });
}

export async function getSavedPlans(): Promise<SavedPlanRecord[]> {
  return sortSavedPlans(await readRaw());
}

export async function savePlan(plan: Plan): Promise<void> {
  const list = await readRaw();
  const record: SavedPlanRecord = {
    id: `${Date.now()}`,
    savedAt: new Date().toISOString(),
    plan,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify([record, ...list]));
}

export async function deleteSavedPlan(id: string): Promise<void> {
  const list = await readRaw();
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(list.filter((item) => item.id !== id)),
  );
}

export async function toggleFavoriteSavedPlan(id: string): Promise<void> {
  const list = await readRaw();
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(list.map((item) => (
      item.id === id ? { ...item, favorite: !item.favorite } : item
    ))),
  );
}
