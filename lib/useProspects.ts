"use client";
import { useEffect, useState, useCallback } from "react";
import type { Prospect } from "./types";

const REFRESH_MS = 2 * 60 * 1000; // 2 minutes per spec §7.4

export function useProspects() {
  const [prospects, setProspects] = useState<Prospect[]>([]);
  const [source, setSource]       = useState<"airtable" | "seed" | "loading">("loading");
  const [lastSync, setLastSync]   = useState<Date | null>(null);

  const fetch_ = useCallback(async () => {
    try {
      const res  = await fetch("/api/contacts", { cache: "no-store" });
      const json = await res.json() as { source: string; data: Prospect[] };
      setProspects(json.data);
      setSource(json.source as "airtable" | "seed");
      setLastSync(new Date());
    } catch {
      // keep previous state on error
    }
  }, []);

  useEffect(() => {
    fetch_();
    const id = setInterval(fetch_, REFRESH_MS);
    return () => clearInterval(id);
  }, [fetch_]);

  return { prospects, source, lastSync, refetch: fetch_ };
}

export function useProspect(id: string) {
  const [prospect, setProspect] = useState<Prospect | null>(null);

  useEffect(() => {
    fetch(`/api/contacts/${id}`)
      .then(r => r.json())
      .then(setProspect)
      .catch(() => null);
  }, [id]);

  return prospect;
}
