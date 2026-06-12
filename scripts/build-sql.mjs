// full_setup.sql'i kaynak migration'lardan BOM'suz olarak yeniden üretir.
import { readFileSync, writeFileSync } from "node:fs";

const base = new URL("../supabase/", import.meta.url);
const read = (name) =>
  readFileSync(new URL(name, base), "utf8").replace(/﻿/g, "");

const header =
  "-- ============================================================\n" +
  "-- Öğrenci Koçluk — TAM KURULUM (tek dosya)\n" +
  "-- Supabase SQL Editor'a yapıştırıp RUN yeterli.\n" +
  "-- 0001_init + 0002_rls + seed birleşik.\n" +
  "-- ============================================================\n\n";

const combined =
  header +
  read("migrations/0001_init.sql") +
  "\n\n" +
  read("migrations/0002_rls.sql") +
  "\n\n" +
  read("seed.sql") +
  "\n";

writeFileSync(new URL("full_setup.sql", base), combined, { encoding: "utf8" });
console.log("full_setup.sql yeniden üretildi (BOM'suz), uzunluk:", combined.length);
