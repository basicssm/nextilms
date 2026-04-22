import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { WatchlistItem, WatchlistStatus } from "@/types";
import { useAuth } from "@/context/AuthContext";

export function useWatchlistMap(): Map<number, WatchlistStatus> {
  const { user } = useAuth();
  const [map, setMap] = useState<Map<number, WatchlistStatus>>(new Map());

  useEffect(() => {
    if (!user) { setMap(new Map()); return; }
    supabase
      .from("watchlist")
      .select("film_id,status")
      .eq("user_id", user.id)
      .then(({ data }) => {
        const m = new Map<number, WatchlistStatus>();
        for (const item of (data ?? [])) m.set(item.film_id, item.status as WatchlistStatus);
        setMap(m);
      });
  }, [user]);

  return map;
}

export function useWatchlist(filmId?: number) {
  const { user } = useAuth();
  const [item, setItem] = useState<WatchlistItem | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchItem = useCallback(async () => {
    if (!user || !filmId) {
      setItem(null);
      return;
    }
    const { data } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", user.id)
      .eq("film_id", filmId)
      .maybeSingle();
    setItem(data ?? null);
  }, [user, filmId]);

  useEffect(() => {
    fetchItem();
  }, [fetchItem]);

  const setStatus = useCallback(
    async (
      status: WatchlistStatus,
      filmTitle: string,
      posterPath: string | null,
      mediaType: "film" | "series" = "film"
    ) => {
      if (!user || !filmId) return;
      setLoading(true);

      if (item?.status === status) {
        await supabase.from("watchlist").delete().eq("id", item.id);
        setItem(null);
      } else {
        const { data, error } = await supabase
          .from("watchlist")
          .upsert(
            {
              user_id: user.id,
              film_id: filmId,
              film_title: filmTitle,
              poster_path: posterPath,
              status,
              media_type: mediaType,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "user_id,film_id" }
          )
          .select()
          .single();
        if (!error && data) setItem(data as WatchlistItem);
      }
      setLoading(false);
    },
    [user, filmId, item]
  );

  return { item, loading, setStatus, refetch: fetchItem };
}

export function useFullWatchlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    setItems((data as WatchlistItem[]) ?? []);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const removeItem = async (id: string) => {
    await supabase.from("watchlist").delete().eq("id", id);
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const changeStatus = async (id: string, status: WatchlistStatus) => {
    const { data, error } = await supabase
      .from("watchlist")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (!error && data) {
      setItems((prev) =>
        prev.map((i) => (i.id === id ? (data as WatchlistItem) : i))
      );
    }
  };

  return { items, loading, refetch: fetchAll, removeItem, changeStatus };
}
