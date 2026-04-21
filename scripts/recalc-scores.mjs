/**
 * recalc-scores.mjs — Signal IQ v2
 * Recalculates signal_stack for all contacts using real CRM data.
 *
 * New formula (replaces flat import defaults):
 *   signal = recency(0.35) + social_proof(0.30) + intent(0.20) + authority_match(0.15)
 *
 * This produces a genuine spread:
 *   Returning clients      → 82–92  (Hot)
 *   Grant-funded leads     → 70–80  (Warm)
 *   Pacific TZ top picks   → 58–68  (Warm/Cooling)
 *   HBCU / CC outreach     → 48–60  (Cooling)
 *   Cold new prospects     → 38–50  (Cold)
 *   Legacy Monday CRM      → 22–38  (Cold/Dormant)
 *
 * Usage:
 *   node scripts/recalc-scores.mjs
 *   node scripts/recalc-scores.mjs --dry-run
 */

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://ghthwxzkchjsvuqebyma.supabase.co";
const SUPABASE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdodGh3eHprY2hqc3Z1cWVieW1hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3MTEzNDgsImV4cCI6MjA5MjI4NzM0OH0.c7czkfy8-9mMbuJIUilg6QCsiTb7XbrF-FHXy-pXm28";

const DRY_RUN = process.argv.includes("--dry-run");

function calcRecency(lastTouch) {
  if (!lastTouch) return 5;
  const days = Math.floor((Date.now() - new Date(lastTouch).getTime()) / 86_400_000);
  return Math.round(100 * Math.exp(-0.023 * days));
}

function newSignalStack(c) {
  const recency   = calcRecency(c.last_touch);
  const social    = Math.min(100, Math.max(0, c.social_proof      ?? 40));
  const intent    = Math.min(100, Math.max(0, c.intent            ?? 30));
  const authority = Math.min(100, Math.max(0, c.authority_match   ?? 50));

  const raw = recency * 0.35 + social * 0.30 + intent * 0.20 + authority * 0.15;
  return Math.min(100, Math.max(1, Math.round(raw)));
}

async function main() {
  const db = createClient(SUPABASE_URL, SUPABASE_KEY);

  console.log("📥 Fetching all contacts...");
  const { data: contacts, error } = await db
    .from("contacts")
    .select("id, name, last_touch, intent, social_proof, authority_match, signal_stack");

  if (error) { console.error(error); process.exit(1); }
  console.log(`   ${contacts.length} contacts loaded.`);

  // Recalculate
  const updates = contacts.map(c => ({
    id:           c.id,
    old_score:    c.signal_stack,
    new_score:    newSignalStack(c),
    name:         c.name,
  }));

  // Sort preview by new score
  updates.sort((a, b) => b.new_score - a.new_score);

  // Score distribution
  const bands = { Hot:0, Warm:0, Cooling:0, Cold:0, Dormant:0 };
  updates.forEach(u => {
    if      (u.new_score >= 80) bands.Hot++;
    else if (u.new_score >= 60) bands.Warm++;
    else if (u.new_score >= 40) bands.Cooling++;
    else if (u.new_score >= 20) bands.Cold++;
    else                        bands.Dormant++;
  });

  console.log("\n📊 New score distribution:");
  Object.entries(bands).forEach(([k,v]) => v && console.log(`   ${k}: ${v} contacts`));

  console.log("\n🔝 Top 10 after recalc:");
  updates.slice(0, 10).forEach((u, i) =>
    console.log(`   ${i+1}. [${u.new_score}] ${u.name}`)
  );
  console.log("\n🔻 Bottom 5:");
  updates.slice(-5).forEach(u =>
    console.log(`   [${u.new_score}] ${u.name}`)
  );

  if (DRY_RUN) {
    console.log("\n(dry run — no changes written)");
    return;
  }

  console.log("\n⬆️  Updating signal_stack in Supabase...");
  const BATCH = 50;
  let updated = 0;
  let errors  = 0;

  for (let i = 0; i < updates.length; i += BATCH) {
    const batch = updates.slice(i, i + BATCH);
    // Update each contact individually (anon UPDATE policy allows this)
    for (const u of batch) {
      const { error: ue } = await db
        .from("contacts")
        .update({ signal_stack: u.new_score })
        .eq("id", u.id);
      if (ue) { console.error(`   Error on ${u.name}:`, ue.message); errors++; }
      else updated++;
    }
    process.stdout.write(`   ✓ ${updated}/${updates.length}\r`);
  }

  console.log(`\n\n✅ Done — ${updated} contacts updated, ${errors} errors.`);
}

main().catch(e => { console.error(e); process.exit(1); });
