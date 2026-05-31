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
        const [groups, tasks, exercises, subjects, planDays, planItems, sessions, profile] = await Promise.all([
          db.fetchGroups(userId),
          db.fetchTasks(userId),
          db.fetchExercises(userId),
          db.fetchSubjects(userId),
          db.fetchPlanDays(userId),
          db.fetchPlanItems(userId),
          db.fetchSessions(userId),
          db.fetchProfile(userId),
        ]);
        hydrateFromSupabase({ groups, tasks, exercises, subjects, planDays, planItems, sessions, profile });
      } catch {
        hydrateFromSupabase({ groups: [], tasks: [], exercises: [], subjects: [], planDays: [], planItems: [], sessions: [], profile: null });
      }
    }

    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const expire = localStorage.getItem("cognix_expire");
        if (expire && Date.now() > parseInt(expire)) {
          localStorage.removeItem("cognix_expire");
          await supabase.auth.signOut();
          hydrateFromSupabase({ groups: [], tasks: [], exercises: [], subjects: [], planDays: [], planItems: [], sessions: [], profile: null });
          return;
        }
        init(data.user.id);
      } else {
        hydrateFromSupabase({ groups: [], tasks: [], exercises: [], subjects: [], planDays: [], planItems: [], sessions: [], profile: null });
      }
    });

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
