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
      .then(({ data, error }) => {
        if (error) {
          console.error("Error al cargar el mapa de la watchlist:", error.message);
          return;
        }
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
  const [error, setError] = useState<string | null>(null);

  const fetchItem = useCallback(async () => {
    if (!user || !filmId) {
      setItem(null);
      return;
    }
    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", user.id)
      .eq("film_id", filmId)
      .maybeSingle();
    if (error) {
      console.error("Error al cargar el título de la watchlist:", error.message);
      setError("No se pudo cargar el estado de tu lista");
      return;
    }
    setError(null);
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

      const prev = item;
      if (item?.status === status) {
        setItem(null);
        const { error } = await supabase.from("watchlist").delete().eq("id", item.id);
        if (error) {
          console.error("Error al quitar de la watchlist:", error.message);
          setError("No se pudo actualizar tu lista");
          setItem(prev);
        } else {
          setError(null);
        }
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
        if (error) {
          console.error("Error al guardar en la watchlist:", error.message);
          setError("No se pudo actualizar tu lista");
        } else if (data) {
          setError(null);
          setItem(data as WatchlistItem);
        }
      }
      setLoading(false);
    },
    [user, filmId, item]
  );

  const updateRating = useCallback(
    async (rating: number | null) => {
      if (!user || !item) return;
      const { data, error } = await supabase
        .from("watchlist")
        .update({ rating, updated_at: new Date().toISOString() })
        .eq("id", item.id)
        .select()
        .single();
      if (error) {
        console.error("Error al guardar la valoración:", error.message);
        setError("No se pudo guardar la valoración");
      } else if (data) {
        setError(null);
        setItem(data as WatchlistItem);
      }
    },
    [user, item]
  );

  const updateNotes = useCallback(
    async (notes: string) => {
      if (!user || !item) return;
      const { data, error } = await supabase
        .from("watchlist")
        .update({ notes, updated_at: new Date().toISOString() })
        .eq("id", item.id)
        .select()
        .single();
      if (error) {
        console.error("Error al guardar las notas:", error.message);
        setError("No se pudieron guardar las notas");
      } else if (data) {
        setError(null);
        setItem(data as WatchlistItem);
      }
    },
    [user, item]
  );

  return { item, loading, error, setStatus, updateRating, updateNotes, refetch: fetchItem };
}

export function useFullWatchlist() {
  const { user } = useAuth();
  const [items, setItems] = useState<WatchlistItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setItems([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("watchlist")
      .select("*")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false });
    if (error) {
      console.error("Error al cargar la watchlist:", error.message);
      setError("No se pudo cargar tu lista. Inténtalo de nuevo.");
    } else {
      setError(null);
      setItems((data as WatchlistItem[]) ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const removeItem = async (id: string) => {
    const prev = items;
    setItems((current) => current.filter((i) => i.id !== id));
    const { error } = await supabase.from("watchlist").delete().eq("id", id);
    if (error) {
      console.error("Error al eliminar de la watchlist:", error.message);
      setError("No se pudo eliminar el título");
      setItems(prev);
    } else {
      setError(null);
    }
  };

  const changeStatus = async (id: string, status: WatchlistStatus) => {
    const { data, error } = await supabase
      .from("watchlist")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) {
      console.error("Error al cambiar el estado:", error.message);
      setError("No se pudo cambiar el estado del título");
    } else if (data) {
      setError(null);
      setItems((prev) =>
        prev.map((i) => (i.id === id ? (data as WatchlistItem) : i))
      );
    }
  };

  return { items, loading, error, refetch: fetchAll, removeItem, changeStatus };
}
