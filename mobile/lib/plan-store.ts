import type { DtoPlanResponse } from './api/petstore';

export type PlanMeta = { area: string; budget: string };

let _plan: DtoPlanResponse | null = null;
let _meta: PlanMeta | null = null;

export function setCurrentPlan(
  plan: DtoPlanResponse,
  meta: PlanMeta,
) {
  _plan = plan;
  _meta = meta;
}

export function getCurrentPlan() {
  if (!_plan || !_meta) return null;
  return { plan: _plan, meta: _meta };
}