import { supabase } from './supabase.js';

const TABLE = 'platform_admin_state';

/**
 * Fetches a single platform state document by key.
 * Gracefully handles missing table (PGRST205 / 42P01) without throwing.
 */
export async function fetchPlatformState(key) {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('data, updated_at')
      .eq('id', key)
      .maybeSingle();

    if (error) {
      const isMissing =
        error.code === 'PGRST205' ||
        error.code === '42P01' ||
        (error.message && error.message.includes('does not exist'));
      return { data: null, updatedAt: null, tableMissing: isMissing, error };
    }

    return {
      data: data?.data ?? null,
      updatedAt: data?.updated_at ?? null,
      tableMissing: false,
      error: null,
    };
  } catch (err) {
    return { data: null, updatedAt: null, tableMissing: false, error: err };
  }
}

/**
 * Fetches all platform state documents at once for fast initial hydration.
 */
export async function fetchAllPlatformStates() {
  try {
    const { data, error } = await supabase
      .from(TABLE)
      .select('id, data, updated_at');

    if (error) {
      const isMissing =
        error.code === 'PGRST205' ||
        error.code === '42P01' ||
        (error.message && error.message.includes('does not exist'));
      return { states: {}, tableMissing: isMissing, error };
    }

    const states = {};
    (data || []).forEach((row) => {
      states[row.id] = row.data;
    });
    return { states, tableMissing: false, error: null };
  } catch (err) {
    return { states: {}, tableMissing: false, error: err };
  }
}

/**
 * Upserts a platform state document into Supabase.
 */
export async function savePlatformState(key, payload) {
  try {
    const { error } = await supabase
      .from(TABLE)
      .upsert(
        { id: key, data: payload, updated_at: new Date().toISOString() },
        { onConflict: 'id' }
      );

    if (error) {
      const isMissing =
        error.code === 'PGRST205' ||
        error.code === '42P01' ||
        (error.message && error.message.includes('does not exist'));
      return { ok: false, tableMissing: isMissing, error };
    }
    return { ok: true, tableMissing: false, error: null };
  } catch (err) {
    return { ok: false, tableMissing: false, error: err };
  }
}

export const PLATFORM_SYNC_SQL = `CREATE TABLE IF NOT EXISTS public.platform_admin_state (
  id text PRIMARY KEY,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.platform_admin_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of platform_admin_state"
  ON public.platform_admin_state FOR SELECT
  USING (true);

CREATE POLICY "Allow admin write to platform_admin_state"
  ON public.platform_admin_state FOR ALL
  USING (true)
  WITH CHECK (true);`;
