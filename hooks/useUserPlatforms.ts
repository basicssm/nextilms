import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { UserPlatform } from "@/types";
import { useAuth } from "@/context/AuthContext";

export function useUserPlatforms() {
  const { user } = useAuth();
  const [platforms, setPlatforms] = useState<UserPlatform[]>([]);
  const [platformIds, setPlatformIds] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  const fetchPlatforms = useCallback(async () => {
    if (!user) {
      setPlatforms([]);
      setPlatformIds(new Set());
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("user_platforms")
      .select("*")
      .eq("user_id", user.id)
      .order("provider_name");
    const items = (data as UserPlatform[]) ?? [];
    setPlatforms(items);
    setPlatformIds(new Set(items.map((p) => p.provider_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  const toggle = useCallback(
    async (platform: { provider_id: number; provider_name: string; logo_path: string }) => {
      if (!user) return;
      if (platformIds.has(platform.provider_id)) {
        await supabase
          .from("user_platforms")
          .delete()
          .eq("user_id", user.id)
          .eq("provider_id", platform.provider_id);
        setPlatformIds((prev) => {
          const next = new Set(prev);
          next.delete(platform.provider_id);
          return next;
        });
        setPlatforms((prev) => prev.filter((p) => p.provider_id !== platform.provider_id));
      } else {
        const { data, error } = await supabase
          .from("user_platforms")
          .insert({ user_id: user.id, ...platform })
          .select()
          .single();
        if (!error && data) {
          setPlatformIds((prev) => new Set([...prev, platform.provider_id]));
          setPlatforms((prev) => [...prev, data as UserPlatform]);
        }
      }
    },
    [user, platformIds]
  );

  return { platforms, platformIds, loading, toggle, refetch: fetchPlatforms };
}
