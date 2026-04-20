# Airtable Setup — Signal IQ v2 Cloud Sync

Per the Signal-IQ-v2-Cloud-Sync-Plan.docx §5 schema.

---

## Step 1 — Create the base

1. Go to https://airtable.com → New base → Start from scratch
2. Name it **Signal IQ v2**

---

## Step 2 — Create the 6 tables

### Table 1: Contacts
| Field | Type | Notes |
|---|---|---|
| Name | Single line text | Primary field |
| Title | Single line text | Job title |
| Organization | Link to Organizations | Linked record |
| Email | Email | |
| Phone | Phone number | |
| Owner | Link to Owners | Who manages this relationship |
| Tags | Link to Tags | Many-to-many |
| Last Touch | Date | Updated automatically via automation |
| Intent | Number | 0–100. Manual or AI-inferred |
| Signal Stack | Number | 0–100. Firmographic strength |
| Intent Velocity | Number | 0–100 |
| Budget Indicator | Number | 0–100 |
| Authority Match | Number | 0–100 |
| Timing Window | Number | 0–100 |
| Social Proof | Number | 0–100 |
| Next Move | Long text | Auto-filled by AI composer |
| Industry | Single line text | |
| Headcount | Number | |
| Notes | Long text | |

### Signal Score formulas (add as Formula fields)

**RecencyScore**
```
ROUND(100 * EXP(-0.023 * DATETIME_DIFF(TODAY(), {Last Touch}, 'days')), 0)
```

**FrequencyScore** (requires rollup from Interactions — see below)
```
ROUND(MIN(100, ({Interactions 90d} / 12) * 100), 0)
```

**SignalScore**
```
ROUND(
  {RecencyScore} * 0.45 +
  {FrequencyScore} * 0.25 +
  (AVERAGE({Depth}) * 20) * 0.20 +
  {Intent} * 0.10,
0)
```

**SignalBand** (formula field)
```
IF({SignalScore} >= 80, "🔥 Hot",
IF({SignalScore} >= 60, "🌡 Warm",
IF({SignalScore} >= 40, "📉 Cooling",
IF({SignalScore} >= 20, "🧊 Cold",
"💤 Dormant"))))
```

---

### Table 2: Organizations
| Field | Type |
|---|---|
| Org Name | Single line text (primary) |
| Type | Single select: School/EDU, Non-profit, Corporate, Government, Other |
| Size | Number (headcount) |
| Revenue Band | Single select |
| Primary Contact | Link to Contacts |
| Notes | Long text |

### Table 3: Interactions
| Field | Type | Notes |
|---|---|---|
| Date | Date | |
| Contact | Link to Contacts | |
| Channel | Single select: email, call, linkedin |
| Direction | Single select: in, out |
| Depth | Number (1–5) | Quality of interaction |
| Intent | Number (0–100) | Signal strength of this touch |
| Notes | Long text | What was said |
| Latency Hours | Number | Hours between outbound and reply (inbound only) |

### Table 4: Owners
| Field | Type |
|---|---|
| Name | Single line text |
| Role | Single select: Founder, CoFounder, VA, Contractor |
| Email | Email |
| Active | Checkbox |

### Table 5: Tags / Segments
| Field | Type |
|---|---|
| Tag Name | Single line text |
| Category | Single select: ICP, Lifecycle, Temp, Custom |
| Color | Single select |

### Table 6: Signal Logs (audit trail)
| Field | Type |
|---|---|
| Timestamp | Date (include time) |
| Actor | Link to Owners |
| Contact | Link to Contacts |
| Field Changed | Single line text |
| Before | Long text |
| After | Long text |

---

## Step 3 — Permissions

| Person | Role |
|---|---|
| Chris Davis | Creator (Owner) |
| Jazmine Davis | Editor |

---

## Step 4 — Get your API token

1. Go to https://airtable.com/create/tokens
2. Click **Create new token**
3. Name: `signaliq-v2-dashboard`
4. Scopes: `data.records:read`, `data.records:write`
5. Access: **Signal IQ v2** base only
6. Copy the token (starts with `pat...`)

---

## Step 5 — Configure the app

1. Copy `.env.example` → `.env.local` in `~/Projects/signaliq`
2. Fill in:
```
AIRTABLE_API_TOKEN=pat...your token...
AIRTABLE_BASE_ID=app...your base ID...  # from the URL: airtable.com/appXXXXXX
NEXT_PUBLIC_AIRTABLE_ENABLED=true
```
3. Restart the dev server: `npm run dev`

The dashboard header will show **"Live from Airtable"** when connected.

---

## Step 6 — Automations (Airtable built-in)

### Nightly recency recalc
- Trigger: At scheduled time → every day at 2am
- Action: Run script → update `Last Touch` field on all open contacts

### Monday 7am digest email
- Trigger: At scheduled time → Monday 7am
- Action: Send email → to Chris + Jazmine
- Body: Filter for Hot and Warming contacts, format as list

### Hot/Cold alert
- Trigger: When record matches condition → `SignalBand` changes to "🔥 Hot" OR "💤 Dormant"  
- Action: Send email or Slack webhook notification

---

## Seed data → Airtable migration

1. Open Call Tracker v2 and click **💾 Backup** → downloads `pivot-tracker-backup-YYYY-MM-DD.json`
2. Convert to CSV (or import JSON manually into Airtable)
3. Map columns:
   - `contact` → Name
   - `org` → Organization
   - `stage` → (map to SignalBand manually)
   - `date` → Last Touch
   - `deal` → Budget Indicator (normalize to 0–100)
   - `notes` → Notes
4. Import CSV into the Contacts table

---

## Architecture diagram

```
HTML Dashboard (Next.js)
    ↓ fetch /api/contacts every 2 min
Next.js API routes (/app/api/*)
    ↓ Airtable SDK (lib/airtable.ts)
Airtable Base — Signal IQ v2
    ├── Contacts (with Signal Score formulas)
    ├── Interactions (every touch logged)
    ├── Organizations
    ├── Owners (Chris + Jazmine)
    ├── Tags
    └── Signal Logs (audit trail)
    ↑ Jazmine edits via Airtable Interface (mobile-ready)
    ↑ Chris views via SignalIQ dashboard
```
