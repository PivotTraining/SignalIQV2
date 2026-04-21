/**
 * import-leads.mjs — Signal IQ v2
 * Loads pivot_school_call_sheet.csv + pivot-calls-2026-04-20.csv into Supabase.
 *
 * Usage:
 *   node scripts/import-leads.mjs
 *   node scripts/import-leads.mjs --dry-run     # preview without writing
 *   node scripts/import-leads.mjs --clear-seed  # remove the 6 seed contacts first
 */

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

// ── Config ────────────────────────────────────────────────────────────────────
const CALL_SHEET_PATH =
  "/Users/chris/Library/Messages/Attachments/95/05/80CC9E6C-DF3D-4E42-8FE3-EF3803B37C64/pivot_school_call_sheet.csv";

const PIVOT_CALLS_PATH = "/Users/chris/Downloads/pivot-calls-2026-04-20.csv";

const SUPABASE_URL  = "https://ghthwxzkchjsvuqebyma.supabase.co";
const SUPABASE_KEY  =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodGh3eHprY2hqc3Z1cWVieW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTEzNDgsImV4cCI6MjA5MjI4NzM0OH0.c7czkfy8-9mMbuJIUilg6QCsiTb7XbrF-FHXy-pXm28";

const DRY_RUN    = process.argv.includes("--dry-run");
const CLEAR_SEED = process.argv.includes("--clear-seed");

// Known seed contact IDs from seed.sql — safe to delete if --clear-seed
const SEED_IDS = [
  "cccccccc-0000-0000-0000-000000000001",
  "cccccccc-0000-0000-0000-000000000002",
  "cccccccc-0000-0000-0000-000000000003",
  "cccccccc-0000-0000-0000-000000000004",
  "cccccccc-0000-0000-0000-000000000005",
  "cccccccc-0000-0000-0000-000000000006",
];

// ── CSV parser (single-pass, correctly handles quoted fields w/ commas/newlines)
function parseCSV(text) {
  // Strip BOM if present
  const raw = text.startsWith("\uFEFF") ? text.slice(1) : text;

  const records = [];   // array of string[]
  let fields = [];
  let field  = "";
  let inQ    = false;

  for (let i = 0; i < raw.length; i++) {
    const ch   = raw[i];
    const next = raw[i + 1];

    if (inQ) {
      if (ch === '"' && next === '"') {
        // escaped quote inside quoted field
        field += '"';
        i++;
      } else if (ch === '"') {
        inQ = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQ = true;
      } else if (ch === ",") {
        fields.push(field.trim());
        field = "";
      } else if (ch === "\n" || (ch === "\r" && next === "\n")) {
        if (ch === "\r") i++; // skip \n of \r\n
        fields.push(field.trim());
        if (fields.some(f => f !== "")) records.push(fields);
        fields = [];
        field  = "";
      } else if (ch === "\r") {
        // bare \r
        fields.push(field.trim());
        if (fields.some(f => f !== "")) records.push(fields);
        fields = [];
        field  = "";
      } else {
        field += ch;
      }
    }
  }
  // flush last field/record
  fields.push(field.trim());
  if (fields.some(f => f !== "")) records.push(fields);

  if (records.length === 0) return [];

  const headers = records[0].map(h => h.trim());
  const rows = [];
  for (let i = 1; i < records.length; i++) {
    const vals = records[i];
    const obj  = {};
    headers.forEach((h, idx) => { obj[h] = (vals[idx] ?? "").trim(); });
    rows.push(obj);
  }
  return rows;
}

// ── Scoring helpers ───────────────────────────────────────────────────────────
function stageToIntent(stage, pct) {
  const p = parseInt(pct, 10);
  if (!isNaN(p) && p > 0) return Math.min(100, Math.max(0, p));
  switch ((stage || "").toLowerCase()) {
    case "closed-won":  return 90;
    case "qualified":   return 50;
    case "new":         return 20;
    default:            return 30;
  }
}

function dealSizeToBudget(dealSize) {
  const v = parseFloat((dealSize || "0").replace(/[^0-9.]/g, ""));
  if (!v || v === 0) return 50;  // unknown → neutral
  if (v >= 20000) return 90;
  if (v >= 15000) return 80;
  if (v >= 10000) return 72;
  if (v >=  7500) return 65;
  if (v >=  5000) return 55;
  if (v >=  3000) return 45;
  return 35;
}

function grantAmountToBudget(usdStr) {
  const v = parseFloat((usdStr || "0").replace(/[^0-9.]/g, ""));
  if (!v) return 60;
  if (v >= 6_000_000) return 95;
  if (v >= 4_000_000) return 88;
  if (v >= 2_000_000) return 78;
  if (v >= 1_000_000) return 65;
  return 55;
}

function titleToAuthority(title) {
  const t = (title || "").toLowerCase();
  if (/superintendent|ceo|coo|cto|cfo|chief|vp|vice president|deputy super/i.test(t)) return 90;
  if (/director|exec(utive)?|head of|assistant super/i.test(t)) return 78;
  if (/principal|coordinator|manager|assistant principal/i.test(t)) return 65;
  if (/counselor|advisor|specialist|associate/i.test(t)) return 50;
  return 45;
}

function sourceToSocialProof(source) {
  const s = (source || "").toLowerCase();
  if (/returning client/i.test(s)) return 90;
  if (/speaking event/i.test(s))   return 75;
  if (/buyer.quality/i.test(s))    return 65;
  if (/pacific tz/i.test(s))       return 50;
  if (/hbcu|community college/i.test(s)) return 45;
  if (/monday/i.test(s))           return 42;
  if (/cold outreach/i.test(s))    return 30;
  return 40;
}

function dateToDaysSince(dateStr) {
  if (!dateStr) return 999;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return 999;
  return Math.floor((Date.now() - d.getTime()) / 86_400_000);
}

function calcRecency(days) {
  return Math.round(100 * Math.exp(-0.023 * days));
}

function orgTypeToIndustry(orgType) {
  const t = (orgType || "").toLowerCase();
  if (/school|edu/i.test(t))        return "Education";
  if (/non.profit|nonprofit/i.test(t)) return "Non-profit";
  if (/corporate/i.test(t))         return "Corporate";
  if (/government/i.test(t))        return "Government";
  if (/higher ed/i.test(t))         return "Higher Education";
  if (/community college/i.test(t)) return "Community College";
  return "Other";
}

function timingFromCloseDate(closeDateStr) {
  if (!closeDateStr) return 50;
  const d = new Date(closeDateStr);
  if (isNaN(d.getTime())) return 50;
  const daysOut = Math.floor((d.getTime() - Date.now()) / 86_400_000);
  if (daysOut <= 0)   return 20;   // overdue
  if (daysOut <= 30)  return 90;   // urgent
  if (daysOut <= 60)  return 75;
  if (daysOut <= 90)  return 60;
  if (daysOut <= 180) return 45;
  return 30;
}

// ── Map pivot-calls row → contact ────────────────────────────────────────────
function mapPivotRow(row) {
  const intent  = stageToIntent(row["Stage"], row["Probability %"]);
  const budget  = dealSizeToBudget(row["Deal Size"]);
  const auth    = titleToAuthority(row["Title"]);
  const timing  = timingFromCloseDate(row["Est Close Date"]);
  const social  = sourceToSocialProof(row["Lead Source"]);
  const days    = dateToDaysSince(row["Date"]);
  const recency = calcRecency(days);

  // Simple signal score for initial import
  const signalStack = Math.round(
    recency * 0.45 + Math.min(100, 25) * 0.25 + 60 * 0.20 + intent * 0.10
  );

  const lastTouch = row["Date"] ? row["Date"].trim() : null;

  // Build notes from source fields
  const notesParts = [];
  if (row["Lead Source"])       notesParts.push(`Source: ${row["Lead Source"]}`);
  if (row["Workshop"])          notesParts.push(`Workshop: ${row["Workshop"]}`);
  if (row["Notes"])             notesParts.push(row["Notes"]);
  if (row["Follow-up Status"]) notesParts.push(`Status: ${row["Follow-up Status"]}`);

  return {
    name:              (row["Contact"] || "").trim(),
    title:             (row["Title"]  || "").trim(),
    company:           (row["Organization"] || "").trim(),
    email:             (row["Email"] || "").trim().toLowerCase(),
    phone:             (row["Phone"] || "").trim(),
    industry:          orgTypeToIndustry(row["Org Type"]),
    intent,
    signal_stack:      Math.min(100, Math.max(0, signalStack)),
    intent_velocity:   intent,
    budget_indicator:  budget,
    authority_match:   auth,
    timing_window:     timing,
    social_proof:      social,
    last_touch:        lastTouch,
    next_move:         (row["Next Action"] || "").trim() || null,
    notes:             notesParts.filter(Boolean).join(" | ") || null,
    _channel:          "email",
    _source:           row["Lead Source"],
  };
}

// ── Map call-sheet row → contact ─────────────────────────────────────────────
function mapCallSheetRow(row) {
  const intent  = row["priority"] === "High" ? 70 : 50;
  const budget  = grantAmountToBudget(row["funding_amount_usd"]);
  const auth    = titleToAuthority(row["target_contact_title"]);
  const timing  = 70; // grant money in-hand → near term
  const social  = 65; // funded district, direct outreach
  const days    = 14; // recently researched
  const recency = calcRecency(days);

  const signalStack = Math.round(
    recency * 0.45 + Math.min(100, 25) * 0.25 + 60 * 0.20 + intent * 0.10
  );

  const notesParts = [];
  notesParts.push(`Funding: ${row["funding_source"]} — $${Number(row["funding_amount_usd"] || 0).toLocaleString()}`);
  if (row["what_to_target"]) notesParts.push(`Target: ${row["what_to_target"]}`);
  if (row["notes"])          notesParts.push(row["notes"]);

  const name = row["target_contact_name"] || `${row["organization_name"]} Office`;

  return {
    name:              name.trim(),
    title:             (row["target_contact_title"] || "").trim(),
    company:           (row["organization_name"] || "").trim(),
    email:             "",
    phone:             (row["phone"] || "").trim(),
    industry:          row["type"] === "Education Service Center" ? "Education Service Center" : "Education",
    intent,
    signal_stack:      Math.min(100, Math.max(0, signalStack)),
    intent_velocity:   intent,
    budget_indicator:  budget,
    authority_match:   auth,
    timing_window:     timing,
    social_proof:      social,
    last_touch:        new Date().toISOString().slice(0, 10),
    next_move:         (row["call_angle"] || "").trim().slice(0, 500) || null,
    notes:             notesParts.filter(Boolean).join(" | ") || null,
    _channel:          "call",
    _source:           "Grant Research",
  };
}

// ── Dedup key ─────────────────────────────────────────────────────────────────
function dedupKey(c) {
  if (c.email && c.email.length > 3) return c.email.toLowerCase();
  return `${c.name.toLowerCase()}||${c.company.toLowerCase()}`;
}

// ── Main ──────────────────────────────────────────────────────────────────────
async function main() {
  console.log("📂 Reading CSVs...");

  const callSheetRaw  = fs.readFileSync(CALL_SHEET_PATH, "utf-8");
  const pivotCallsRaw = fs.readFileSync(PIVOT_CALLS_PATH, "utf-8");

  const callSheetRows  = parseCSV(callSheetRaw);
  const pivotCallsRows = parseCSV(pivotCallsRaw);

  console.log(`   Call sheet:  ${callSheetRows.length} rows`);
  console.log(`   Pivot calls: ${pivotCallsRows.length} rows`);

  // Map rows to contact shape
  const allContacts = [
    ...callSheetRows.map(mapCallSheetRow),
    ...pivotCallsRows.map(mapPivotRow),
  ];

  // Deduplicate — last-wins (later in array = more recent data)
  const seen = new Map();
  for (const c of allContacts) {
    if (!c.name || c.name.length < 2) continue; // skip blank rows
    const key = dedupKey(c);
    const existing = seen.get(key);
    if (!existing) {
      seen.set(key, c);
    } else {
      // Merge: keep higher signal values, prefer non-empty fields
      seen.set(key, {
        ...existing,
        ...c,
        // Keep higher intent/signal
        intent:           Math.max(existing.intent,           c.intent),
        signal_stack:     Math.max(existing.signal_stack,     c.signal_stack),
        budget_indicator: Math.max(existing.budget_indicator, c.budget_indicator),
        // Keep richer text fields
        notes: [existing.notes, c.notes].filter(Boolean).join(" | ") || null,
        next_move: c.next_move || existing.next_move,
        // Keep most recent date
        last_touch: (c.last_touch && existing.last_touch)
          ? (c.last_touch > existing.last_touch ? c.last_touch : existing.last_touch)
          : (c.last_touch || existing.last_touch),
      });
    }
  }

  const contacts = [...seen.values()];
  console.log(`\n✅ ${contacts.length} unique contacts after dedup (from ${allContacts.length} total rows)`);

  if (DRY_RUN) {
    console.log("\n🔍 DRY RUN — first 5 contacts:");
    contacts.slice(0, 5).forEach((c, i) => {
      console.log(`\n[${i + 1}] ${c.name} — ${c.company}`);
      console.log(`   email: ${c.email || "(none)"} | phone: ${c.phone || "(none)"}`);
      console.log(`   intent: ${c.intent} | budget: ${c.budget_indicator} | auth: ${c.authority_match}`);
      console.log(`   signal: ${c.signal_stack} | timing: ${c.timing_window} | social: ${c.social_proof}`);
      console.log(`   last_touch: ${c.last_touch} | next_move: ${(c.next_move || "").slice(0, 60)}`);
    });
    console.log(`\n(Run without --dry-run to write to Supabase)`);
    return;
  }

  // ── Write to Supabase ─────────────────────────────────────────────────────
  const db = createClient(SUPABASE_URL, SUPABASE_KEY);

  if (CLEAR_SEED) {
    console.log("\n🗑️  Clearing seed contacts...");
    const { error } = await db.from("contacts").delete().in("id", SEED_IDS);
    if (error) {
      console.warn("   Seed clear warning:", error.message);
    } else {
      console.log("   Seed contacts removed.");
    }
  }

  // Strip internal _channel / _source meta fields before inserting
  const dbRows = contacts.map(({ _channel, _source, ...c }) => ({
    ...c,
    email: c.email || null,
    phone: c.phone || null,
  }));

  console.log(`\n⬆️  Upserting ${dbRows.length} contacts...`);

  // Insert in batches of 50
  const BATCH = 50;
  let inserted = 0;
  let errors   = 0;

  for (let i = 0; i < dbRows.length; i += BATCH) {
    const batch = dbRows.slice(i, i + BATCH);
    const { data, error } = await db.from("contacts").insert(batch).select("id");
    if (error) {
      console.error(`   ❌ Batch ${i / BATCH + 1} error:`, error.message);
      errors++;
    } else {
      inserted += data?.length ?? batch.length;
      process.stdout.write(`   ✓ ${inserted}/${dbRows.length}\r`);
    }
  }

  console.log(`\n\n📊 Done — ${inserted} contacts inserted, ${errors} batch errors.`);

  // ── Log one interaction per contact ──────────────────────────────────────
  console.log("\n⬆️  Fetching inserted contact IDs to log interactions...");
  const { data: allDbContacts, error: fetchErr } = await db
    .from("contacts")
    .select("id, name, email, last_touch, notes")
    .not("notes", "is", null);

  if (fetchErr) {
    console.error("   Could not fetch contacts for interactions:", fetchErr.message);
    return;
  }

  // Build interaction rows for contacts that don't already have one
  const { data: existingIxns } = await db
    .from("interactions")
    .select("contact_id");

  const alreadyHasIxn = new Set((existingIxns ?? []).map((i) => i.contact_id));

  const ixnRows = allDbContacts
    .filter((c) => !alreadyHasIxn.has(c.id) && c.last_touch)
    .map((c) => ({
      contact_id: c.id,
      date:       c.last_touch,
      channel:    "email",
      direction:  "out",
      depth:      2,
      intent:     30,
      notes:      "Initial outreach (imported from CRM)",
    }));

  if (ixnRows.length > 0) {
    console.log(`   Creating ${ixnRows.length} initial interactions...`);
    for (let i = 0; i < ixnRows.length; i += BATCH) {
      const { error: ie } = await db.from("interactions").insert(ixnRows.slice(i, i + BATCH));
      if (ie) console.error("   Interaction batch error:", ie.message);
    }
    console.log("   ✓ Interactions logged.");
  } else {
    console.log("   All contacts already have interactions — skipped.");
  }

  console.log("\n✅ Import complete!");
  console.log(`   Total contacts in DB: ~${inserted + (CLEAR_SEED ? 0 : 6)}`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
