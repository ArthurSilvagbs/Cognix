"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useStore } from "@/lib/store";
import * as db from "@/lib/supabase/db";

export default function StoreInitializer() {
  const { setUserId, hydrateFromSupabase, clearStore } = useStore();

  useEffect(() => {
    const supabase = createClient();

    async function init(userId: string) {
      setUserId(userId);
      try {
        const [groups, tasks, sessions, exercises, profile] = await Promise.all([
          db.fetchGroups(userId),
          db.fetchTasks(userId),
          db.fetchSessions(userId),
          db.fetchExercises(userId),
          db.fetchProfile(userId),
        ]);
        hydrateFromSupabase({ groups, tasks, sessions, exercises, profile });
      } catch {
        // Supabase not configured yet — mark as initialized so app loads normally
        hydrateFromSupabase({ groups: [], tasks: [], sessions: [], exercises: [], profile: null });
      }
    }

    // Get current session
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        init(data.user.id);
      } else {
        // Not logged in — just mark as initialized (middleware will handle redirect)
        hydrateFromSupabase({ groups: [], tasks: [], sessions: [], exercises: [], profile: null });
      }
    });

    // Listen for auth state changes (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        init(session.user.id);
      } else {
        clearStore();
      }
    });

    return () => subscription.unsubscribe();
  }, [setUserId, hydrateFromSupabase, clearStore]);

  return null;
}
