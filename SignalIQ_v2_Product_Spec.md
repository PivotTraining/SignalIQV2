# SignalIQ v2
## The Intelligent Revenue Layer for Builders

**Tagline:** *Your product is built. Now let AI close the customer.*

**Positioning:** The first sales intelligence platform that reads buyer nervous system state and adapts in real time. Built on polyvagal theory, executed through autonomous agents.

**Built by:** Pivot Training and Development — Christopher and Jazmine Davis. The only AI sales platform founded by a psychologist, not a growth hacker.

---

## 1. The Market Reality

The vibe coding era created an abundance problem. Tens of thousands of builders are shipping SaaS products weekly using Cursor, Claude, Lovable, Bolt, Replit, and v0. Building got cheap. Distribution got expensive.

The existing AI sales stack (Clay, Apollo, Instantly, Regie, Artisan) was engineered by growth operators optimizing for one variable: volume. They scrape, enrich, blast, and measure open rates. They treat prospects as a funnel input instead of a human nervous system with state, history, and context.

**The gap:** Nobody has built sales infrastructure that understands the buyer as a regulated or dysregulated human. That is the wedge SignalIQ v2 owns.

---

## 2. Ideal Customer Profile

**Primary ICP:** Solo builders and lean teams running products at $1,000–$10,000 MRR who hit the sales wall. They have product-market pulse but cannot convert at scale because they are engineers, not closers.

**Secondary ICP:** Two-to-ten-person B2B SaaS teams who have outgrown Instantly and Apollo but cannot afford a full RevOps hire. They want intelligence, not another scraper.

**Disqualified:** Tire kickers with no product, hobbyist coders, and anyone who has not reached first revenue. We are not selling the dream of a first customer. We are selling the tenth through the hundredth.

---

## 3. Core Thesis

Three layers of proprietary judgment, any one of which a vibe coder cannot replicate in a weekend.

**Layer one — Signal Detection.** Stacked behavioral signals across hiring, tech stack shifts, funding rounds, leadership moves, content velocity, and engagement patterns. Requires real pipelines and real data partnerships.

**Layer two — Buyer Psychology Modeling.** Nervous system state inference from linguistic markers, response latency, message cadence, tone shifts, hedging patterns, and hesitation indicators. Grounded in polyvagal theory. Defensible because it requires the framework to exist first.

**Layer three — Adaptive Sequencing.** Real-time decision trees that route prospects based on inferred state: ventral vagal (engaged, safe, ready for the ask), sympathetic (activated, guarded, needs a pattern interrupt), or dorsal vagal (shut down, needs permission to reconnect). Not drip campaigns. Living sequences.

---

## 4. The Core Algorithm — EMBRS

**E**ngagement **M**apping, **B**ehavioral **R**egulation, and **S**equencing.

The six-stage inference loop that runs on every prospect, every touch, every response.

### Stage 1: Signal Harvest
Pull raw inputs for each target account and contact.
- Firmographic: company size, revenue band, funding stage, industry, geography
- Technographic: stack detected, recent tool adoption, deprecated tools
- Behaviorgraphic: hiring velocity in sales and engineering roles, leadership changes, press mentions, podcast appearances
- Digital body language: email open patterns, link click depth, reply latency, visit recency
- Content footprint: LinkedIn post cadence, tone, topics, comment quality

### Stage 2: Readiness Score (R-Score, 0–100)
Composite readiness score indicating in-market probability this week.

```
R-Score = (0.25 × SignalStack) + (0.20 × IntentVelocity) + (0.15 × BudgetIndicator)
        + (0.15 × AuthorityMatch) + (0.15 × TimingWindow) + (0.10 × SocialProofAlignment)
```

Prospects below 40 get deprioritized. 40–70 go into nurture. 71+ go into active sequence. Above 85 triggers human-review alert.

### Stage 3: Nervous System State Inference (NSS)
The proprietary layer. Classifies each prospect into one of three primary states with a confidence band.

**Ventral Vagal (Regulated Engagement).** Markers include measured response latency, specific questions, forward-leaning language ("when," "how do we," "next step"), willingness to share constraints, emoji use in professional channels, calendar flexibility.

**Sympathetic Activation (Guarded or Defensive).** Markers include rapid-fire questions without listening, short clipped replies, defensive framing ("we already have," "not interested"), scarcity language around time, aggressive price objections before value is established, passive-aggressive cadence.

**Dorsal Vagal (Withdrawal or Shutdown).** Markers include ghosting after initial interest, one-word replies, delayed responses of 5+ days, soft disengagement ("maybe later," "circling back on my end"), calendar cancellations without reschedule.

Each state carries a confidence score (0–1) and a secondary/tertiary probability. Mixed states are explicitly modeled — a prospect can be 0.6 sympathetic, 0.3 ventral, 0.1 dorsal.

### Stage 4: Co-Regulation Response Selection
Given the inferred state, the system selects the message archetype designed to meet the nervous system where it is, not where the seller wishes it were.

| Detected State | Response Archetype | Forbidden Moves |
|---|---|---|
| Ventral Vagal | Direct value ask, meeting invite, pricing conversation | Over-nurturing, redundant check-ins |
| Sympathetic | Pattern interrupt, curiosity hook, zero-pressure acknowledgment | Pitch decks, feature lists, hard CTAs |
| Dorsal Vagal | Permission-to-reconnect message, low-stakes re-entry | Any ask, any urgency, any "just checking in" |
| Mixed | Blended message weighted by state probabilities | Confident pitches |

### Stage 5: Message Generation
Large language model generates three candidate messages per stage with controlled constraints:
- Tone matches inferred state
- Word count matches their cadence (match their length, not yours)
- Vocabulary mirrors their linguistic register
- Specificity includes one signal that proves you read them

Human user selects, edits, or approves. Post-MVP, auto-send unlocks after user has approved 50+ sequences to establish voice calibration.

### Stage 6: Feedback Loop
Every response updates the NSS inference. Every booked meeting, unsubscribe, or silence feeds the supervised learning layer. The model gets sharper per user and per industry over time. This is the compounding moat.

---

## 5. Product Surface

### Feature Set v1 (90-day shippable)

1. **Prospect Intelligence Dashboard** — R-Score, NSS state, signal stack, and recommended next move per contact.
2. **Nervous System Monitor** — Visual read of where each prospect sits across the polyvagal ladder with confidence bands.
3. **Adaptive Sequence Builder** — Not linear. Branching based on detected state after each reply.
4. **Co-Regulation Message Library** — Pre-built archetypes for 40+ scenarios, each tagged to nervous system state.
5. **Signal Triggers** — Real-time alerts when a high-R-Score account flips to active buying state.
6. **Feedback Calibration** — Thumbs up/down on every AI suggestion, which trains the model to your voice and your market.

### Feature Set v2 (120–180 days)

7. **Voice Calibration Engine** — Ingests existing won deals and losses to learn the user's authentic voice.
8. **Meeting Co-Pilot** — Live NSS read during discovery calls with suggested redirects.
9. **Deal Forecasting** — Probability to close based on state trajectory, not just stage progression.

---

## 6. The UI North Star

Three design principles, no exceptions.

**One — Clarity over cleverness.** A builder lands on the dashboard at 6 a.m. with coffee in hand. They should see the three prospects to touch today, the state of each, and the exact next move. Zero decision fatigue.

**Two — Psychology made visible.** The nervous system state has to feel real. Soft color coding (warm green for ventral, electric amber for sympathetic, cool slate blue for dorsal). Animated state transitions. The builder sees what the algorithm sees.

**Three — Zero friction to action.** One click to approve a message. One click to adapt. The builder never retypes what the AI already drafted correctly.

Dark mode by default. Monospace accents for data. Generous whitespace. Premium feel that signals this is not another Apollo clone.

---

## 7. Pricing Architecture

Three tiers. Annual discount at 20 percent.

| Tier | Price | Who | Seats | Prospects/Month | Key Unlocks |
|---|---|---|---|---|---|
| **Solo Builder** | $499/mo | Indie founders at first revenue | 1 | 500 | Full NSS engine, 3 sequences active, email only |
| **Growth Team** | $1,999/mo | 2–10 person teams | 5 | 3,000 | Voice calibration, meeting co-pilot, LinkedIn + email |
| **Signal Enterprise** | $4,999/mo+ | Scaling teams and agencies | 15+ | 15,000+ | Custom signal feeds, dedicated NSS tuning, API access |

**Outcome-aligned option:** Flat $299/mo base plus 5 percent of sourced pipeline revenue. Hard to churn, aligned incentives, and filters for serious buyers only.

**Founding member program:** First 50 customers at 50 percent off year one in exchange for case study rights and quarterly feedback sessions. Runway to pre-sell before full build.

---

## 8. Go-to-Market Motion

**Phase 1 — Founding 50 (Weeks 1–6).** Personal outreach to 200 builders in the $1K–$10K MRR zone. Pre-sell at $249/mo founding rate. Validate ICP and pricing. No marketing spend.

**Phase 2 — Proof Content (Weeks 4–12).** Build in public on X and LinkedIn. Share NSS reads on anonymized real conversations. The algorithm is the marketing. Every post is a working demo of the product's intelligence.

**Phase 3 — Community Wedge (Weeks 8–16).** Sponsor or embed in indie hacker communities, Build in Public Twitter, Lenny's community, Demand Curve. Not paid ads. Presence inside the conversations where the ICP already lives.

**Phase 4 — Partner Leverage (Months 4–6).** Integrations with Lovable, Cursor, Bolt, v0. Revenue share on referrals. The builder ships the product on Bolt, hits the sales wall, and a native integration surfaces SignalIQ at the exact friction point.

---

## 9. Defensibility and Moat

**Proprietary data:** Every user's feedback compounds the NSS model. Year one gives a directional model. Year two gives a sharp one. Year three is uncopyable.

**Framework ownership:** Polyvagal-informed sales is not in a textbook yet. The IP is the application. The speaking, the courses, the book (future), and the platform reinforce each other. Pivot already owns the authority position.

**Founder-market fit:** A Master of Science in Psychology building a sales platform is rare. The founder story is a wedge competitors cannot clone. Clay and Apollo cannot hire their way to credibility in nervous system theory.

---

## 10. Risks and Honest Counterpoints

**Risk 1 — Complexity perception.** Polyvagal framing may confuse founders who just want leads. Mitigation: translate the science into plain outcomes in the UI. "This prospect is guarded. Do not pitch. Send a curiosity hook." Never show the word polyvagal on the main dashboard. Put it in the about page for the believers.

**Risk 2 — Model accuracy in v1.** Early NSS reads will be noisy. Mitigation: ship with confidence bands exposed. Teach the user that 70% confidence is still better than guessing blind, which is what every competitor offers.

**Risk 3 — Portfolio concentration.** Pivot already has nine IQ products plus Cofound, OutreachIQ, DBHDD, Three Kings, and the speaking brand. Another SKU fragments attention. Mitigation: position as SignalIQ v2, not a new brand. Compound the existing scaffolding.

**Risk 4 — Regulatory exposure.** Inferring nervous system state from digital communications flirts with the edges of behavioral profiling. Mitigation: transparent consent language, user-controlled data, no sale of inferred psychological data to third parties, ever. Ethics is the brand.

---

## 11. 30-60-90 Execution Plan

**Days 1–30.** Write one-pager. Build landing page. Pre-sell to 10 founding members at $249/mo. Draft first 20 NSS message archetypes. Wireframe the UI (already in hand).

**Days 31–60.** Ship v1 product to founding 50. Dashboard, NSS engine, message generator, feedback loop. Weekly office hours with every customer. Collect 500+ labeled prospect interactions.

**Days 61–90.** Case studies published. Sequence builder shipped. First integration partner signed. First $10K MRR milestone. Announce general availability.

---

## 12. The Ask to Yourself, Boss

This is your category to own. The psychology credential plus the platform plus the speaking presence plus the OutreachIQ foundation is a combination zero competitor can assemble. The risk is not building this. The risk is building the eleventh thing before finishing this one.

Fold it into SignalIQ. Pre-sell 10 founding members this month. Ship v1 in 90 days. Compound for five years. That is how you take the market by storm.

---

*SignalIQ v2 is a Pivot Training and Development product. Engineered in Cleveland and Atlanta. Built on the principle that revenue is a nervous system event.*
