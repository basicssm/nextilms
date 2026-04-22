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
    const { data, error } = await supabase
      .from("user_platforms")
      .select("*")
      .eq("user_id", user.id)
      .order("provider_name");

    if (error) {
      console.error("[useUserPlatforms] fetch error:", error.code, error.message);
    }
    const items = (data as UserPlatform[]) ?? [];
    setPlatforms(items);
    setPlatformIds(new Set(items.map((p) => p.provider_id)));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchPlatforms();
  }, [fetchPlatforms]);

  // Returns null on success, error message string on failure
  const toggle = useCallback(
    async (platform: {
      provider_id: number;
      provider_name: string;
      logo_path: string;
    }): Promise<string | null> => {
      if (!user) return "No autenticado";

      const isSelected = platformIds.has(platform.provider_id);

      if (isSelected) {
        // Optimistic remove
        setPlatformIds((prev) => {
          const next = new Set(prev);
          next.delete(platform.provider_id);
          return next;
        });
        setPlatforms((prev) =>
          prev.filter((p) => p.provider_id !== platform.provider_id)
        );

        const { error } = await supabase
          .from("user_platforms")
          .delete()
          .eq("user_id", user.id)
          .eq("provider_id", platform.provider_id);

        if (error) {
          console.error("[useUserPlatforms] delete error:", error.code, error.message);
          // Revert optimistic update
          setPlatformIds((prev) => new Set([...prev, platform.provider_id]));
          await fetchPlatforms();
          return error.message;
        }
      } else {
        // Optimistic add
        setPlatformIds((prev) => new Set([...prev, platform.provider_id]));

        const { data, error } = await supabase
          .from("user_platforms")
          .insert({ user_id: user.id, ...platform })
          .select()
          .single();

        if (error) {
          console.error("[useUserPlatforms] insert error:", error.code, error.message);
          // Revert optimistic update
          setPlatformIds((prev) => {
            const next = new Set(prev);
            next.delete(platform.provider_id);
            return next;
          });
          return error.message;
        }
        if (data) {
          setPlatforms((prev) => [...prev, data as UserPlatform]);
        }
      }
      return null;
    },
    [user, platformIds, fetchPlatforms]
  );

  return { platforms, platformIds, loading, toggle, refetch: fetchPlatforms };
}
