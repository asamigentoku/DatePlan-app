import AsyncStorage from '@react-native-async-storage/async-storage';

import type { Plan } from '@/lib/date-plan-types';

const KEY = '@dateplan:savedPlans';

export interface SavedPlanRecord {
  id: string;
  savedAt: string;
  plan: Plan;
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

export async function getSavedPlans(): Promise<SavedPlanRecord[]> {
  const list = await readRaw();
  return [...list].sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1));
}

export async function savePlan(plan: Plan): Promise<SavedPlanRecord> {
  const list = await readRaw();
  const record: SavedPlanRecord = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    savedAt: new Date().toISOString(),
    plan,
  };
  await AsyncStorage.setItem(KEY, JSON.stringify([record, ...list]));
  return record;
}

export async function deleteSavedPlan(id: string): Promise<void> {
  const list = await readRaw();
  await AsyncStorage.setItem(
    KEY,
    JSON.stringify(list.filter((item) => item.id !== id)),
  );
}
