import type { NSS } from "./types";

// ── Email Scripts ─────────────────────────────────────────────────────────────

export interface EmailBody {
  body: string;
  ps?: string;
}

export interface EmailScript {
  subjects: string[];                   // 2-3 subject line options
  states: Record<NSS, EmailBody>;       // body adapts to contact's current state
  tips: string[];
}

const emailScripts: Record<string, EmailScript> = {

  Education: {
    subjects: [
      "20 minutes — [Company]",
      "What [Similar District] did differently this year",
      "One thing worth seeing, [FirstName]",
    ],
    states: {
      ventral: {
        body: `Hi [FirstName],

You mentioned [timing / interest] and I haven't stopped thinking about it since.

Districts dealing with the same staff turnover and behavior issues you're facing are getting real results — not a new initiative, not another binder on a shelf. Actual retention numbers moving. Referrals dropping.

I have about 20 minutes of data I'd put in front of you. That's all I'm asking.

Tuesday at 10am or Thursday at 2pm — which one works?

Chris
Pivot Training`,
        ps: "If neither works, just reply with a time. I'll make it happen.",
      },
      sympathetic: {
        body: `Hi [FirstName],

I know you get emails like this constantly. I'm going to skip the usual part where I tell you about our program.

Instead — one question: What's your biggest challenge with staff right now? Turnover, performance, burnout, something else?

Because the answer completely changes what I'd send you. And I'd rather send you the right thing than waste your time with a one-size-fits-all pitch.

One sentence reply is all I need.

Chris
Pivot Training`,
        ps: "No meeting required. Not even a phone call. Just a reply.",
      },
      dorsal: {
        body: `Hi [FirstName],

No agenda here. Just checking back in.

I know timing hasn't been right — and that's completely fine. I'm not reaching out to push anything. Just wanted to make sure you knew we're still here when it makes sense.

No need to reply to this.

Chris
Pivot Training`,
        ps: "If something's shifted and you want to reconnect, I'm one email away.",
      },
    },
    tips: [
      "Subject line A/B: '20 minutes' outperforms longer subjects by 30%+ in education",
      "Replace [Company] with actual district name and [Similar District] with a real reference if you have one",
      "For Cautious contacts: asking one question > making any pitch. They control the reply.",
      "For Quiet contacts: the goal is zero pressure. One response is a win.",
      "Send Tuesday–Thursday, 7–9am or 4–6pm. Avoid Monday and Friday.",
    ],
  },

  "Education Service Center": {
    subjects: [
      "Regional impact — [Organization]",
      "How [Region] ISDs are solving this together",
      "[FirstName] — one idea for your member districts",
    ],
    states: {
      ventral: {
        body: `Hi [FirstName],

Quick question: how many of your member districts are coming to you right now with staff retention and behavior problems?

Because what we've built is designed specifically for centers like [Organization] — one engagement that reaches your entire network instead of district by district, year by year.

I'd love to walk you through how two other regional centers are rolling this out. 20 minutes.

Are you available [Day] or [Day]?

Chris
Pivot Training`,
        ps: "I'll send the one-page overview today so you have it before we talk.",
      },
      sympathetic: {
        body: `Hi [FirstName],

I'm not here to sell you a program. I want to ask you something first.

When your member districts come to you with staff burnout and turnover problems — what do you have to give them right now? What's in the toolkit?

Because if there's a gap there, I might have something worth 10 minutes of your time. If there isn't, no harm done.

Worth a quick reply?

Chris
Pivot Training`,
        ps: "This is a genuine question, not a setup for a pitch.",
      },
      dorsal: {
        body: `Hi [FirstName],

No ask, no meeting request. Just want to stay on your radar.

When timing is right and your districts start asking for something different on staff wellness and retention — we're here. We've worked with regional centers before and know how to make it easy on your team.

Keep us in mind.

Chris
Pivot Training`,
        ps: "Happy to send a quick one-pager whenever it's useful.",
      },
    },
    tips: [
      "Lead with the multiplier effect — one engagement reaches dozens of districts",
      "Ask how many member districts they serve before pitching anything",
      "Offer to present at a regional convening — visibility builds credibility fast",
      "Service centers are relationship-driven. Multiple touches before a yes is normal.",
    ],
  },

  "Non-profit": {
    subjects: [
      "Your frontline staff — [FirstName]",
      "What's actually causing turnover in orgs like yours",
      "One case study from [Similar Org Type]",
    ],
    states: {
      ventral: {
        body: `Hi [FirstName],

You already know what I'm going to say — your frontline staff are carrying weight no one trained them for, and the turnover it causes is quietly destroying your ability to deliver on your mission.

Here's what I want to share: one case study from an org almost identical to [Company]. Same size, same population served, same burnout problem. Different outcome.

Can we get 20 minutes on the calendar this week?

Chris
Pivot Training`,
        ps: "I'll send the case study today so you have it before we connect.",
      },
      sympathetic: {
        body: `Hi [FirstName],

Quick question and then I'll leave you alone.

What's the number one reason your frontline staff give when they leave? And be honest with yourself about it — not the exit survey answer, the real one.

Because if it's anything related to emotional exhaustion, secondary trauma, or just feeling unsupported — I have something worth seeing. Not a wellness program. Something that actually addresses the cause.

Worth a reply?

Chris
Pivot Training`,
        ps: "If this isn't the right time, just say so. No hard feelings.",
      },
      dorsal: {
        body: `Hi [FirstName],

Just checking in. No ask.

I know organizations like [Company] are stretched right now — everything is. I'm not here to add to your list.

When capacity opens up and you're ready to think about staff retention and sustainability — we're here. Until then, take care of your team.

Chris
Pivot Training`,
        ps: "One resource that might be useful in the meantime: [insert free resource]. No strings.",
      },
    },
    tips: [
      "Use the word 'mission' not 'ROI' — nonprofits connect staff wellness to impact, not profit",
      "Reference secondary traumatic stress — they know the term and feel it acutely",
      "SAMHSA, HRSA, and foundation grants often cover this work — mention it in the rebuttal if needed",
      "Ask: 'What would it mean for the people you serve if your staff had more capacity?' — connects retention to mission",
    ],
  },

  Corporate: {
    subjects: [
      "Leadership performance — [Company]",
      "What's actually behind your turnover number",
      "[FirstName] — 20 minutes on something specific",
    ],
    states: {
      ventral: {
        body: `Hi [FirstName],

Here's what I've seen at companies like [Company]: the managers who are technically excellent and still struggling to lead people effectively aren't doing it on purpose. Nobody taught them how to perform under pressure. That gap is expensive.

I'd like to show you what it looks like to close it — not theoretically, with actual before-and-after performance data from teams in your space.

20 minutes this week?

Chris
Pivot Training`,
        ps: "I'll send the one-page ROI model today so you have something concrete before we talk.",
      },
      sympathetic: {
        body: `Hi [FirstName],

I won't pitch you. One question instead.

Where does leadership performance break down most visibly at [Company] right now — in high-pressure situations, in communication, or in retaining the people you've invested in?

Because the answer tells me whether what we do is even relevant for you. And if it's not, I'll tell you that.

Worth a reply?

Chris
Pivot Training`,
        ps: "No meeting request attached to this. Just a question.",
      },
      dorsal: {
        body: `Hi [FirstName],

I know you've got a full plate. I'll keep this short.

If leadership development and retention ever come back up on the priority list — I'd like to be the first call you make. We've helped companies in [Company]'s position before, and I think we could help you too.

No rush. Just keeping the door open.

Chris
Pivot Training`,
        ps: "Happy to send something over whenever it's a better time.",
      },
    },
    tips: [
      "Frame it as leadership performance, not wellness — L&D budgets are more accessible",
      "The ROI number: $60K average cost to replace a manager. Use it.",
      "Ask early: 'Who owns this decision?' Don't invest time in someone who can't say yes.",
      "Cardone rule: every email ends with a specific ask or a specific next step.",
    ],
  },

  Government: {
    subjects: [
      "Workforce retention — [Department]",
      "[FirstName] — staff performance and the problem everyone ignores",
      "One idea for [Department]",
    ],
    states: {
      ventral: {
        body: `Hi [FirstName],

Public sector turnover is at a 20-year high and the institutional knowledge walking out the door doesn't come back. The people left behind are stretched thin and losing the capacity to deliver.

What we do is give public service teams real tools to stay effective under that kind of pressure — and keep the experienced staff you've spent years developing.

I'd like to put 20 minutes in front of you. Can we connect [Day] or [Day]?

Chris
Pivot Training`,
        ps: "I can send our program overview in your preferred format before the call.",
      },
      sympathetic: {
        body: `Hi [FirstName],

Simple question: what's the biggest people challenge your department is actually dealing with right now? Not the one in the strategic plan — the real one.

I ask because what we do is very specific, and I'd rather know if it's relevant before I take up more of your time.

One sentence reply tells me everything.

Chris
Pivot Training`,
        ps: "If now isn't the right time in the budget cycle, I'd still appreciate knowing when to follow up.",
      },
      dorsal: {
        body: `Hi [FirstName],

No ask today. Just want to stay on your radar for the next budget cycle.

When workforce retention and staff performance come back up on the agenda — and they always do — I'd like the chance to show you what Pivot Training has done for agencies in similar positions.

Keep us in mind.

Chris
Pivot Training`,
        ps: "Happy to send a summary in your preferred format whenever it's useful.",
      },
    },
    tips: [
      "Government procurement is slow — plant the seed early, follow up quarterly",
      "Reference their existing wellness mandates: EAP, OPM guidelines, workforce resilience plans",
      "Find the internal champion who's frustrated with the problem — they'll move things internally",
      "'Performance' and 'retention' unlock budget. 'Wellness' often doesn't.",
    ],
  },

  Healthcare: {
    subjects: [
      "Clinical retention — [Organization]",
      "The real reason your nurses are leaving",
      "[FirstName] — 20 minutes on something specific",
    ],
    states: {
      ventral: {
        body: `Hi [FirstName],

Every health system I talk to is dealing with the same thing: clinical staff who are technically excellent but emotionally depleted — and leaving because of it.

At $50,000 to $80,000 per nurse replacement, you already know this is a financial problem. What I want to show you is that it's also a solvable one.

I have outcomes data from health systems in your position. Can we get 20 minutes this week?

Chris
Pivot Training`,
        ps: "I'll send our clinical retention brief today so you have the numbers before we talk.",
      },
      sympathetic: {
        body: `Hi [FirstName],

One question before anything else.

When your best clinical staff leave — the ones you trained, the ones your patients trust — what do they tell you is the real reason? Not the exit survey answer. The conversation in the parking lot.

Because if the answer involves exhaustion, feeling unsupported, or the system feeling misaligned with why they got into healthcare — I have something worth your time.

Worth a reply?

Chris
Pivot Training`,
        ps: "No meeting attached to this. Just want to know if we're talking about the same problem.",
      },
      dorsal: {
        body: `Hi [FirstName],

No pitch. Just checking in.

I know healthcare leadership is under enormous pressure right now. I'm not here to add to it.

When the timing is better and clinical retention comes back to the top of the list — we're here, and I'd like to be the first call you make.

Take care of your team.

Chris
Pivot Training`,
        ps: "I can send our clinical outcomes brief whenever it's a better time.",
      },
    },
    tips: [
      "The number that ends the budget objection: $50K–80K per nurse replaced. Have it ready.",
      "Say 'moral injury' not just burnout — clinical leaders know the term and it signals you understand the depth of the problem",
      "Connect retention to patient safety scores — that's a metric their board tracks",
      "Find out if the conversation is CNO, HR, or both — the framing shifts completely",
    ],
  },

  Default: {
    subjects: [
      "Quick question — [Company]",
      "[FirstName] — 20 minutes on something worth seeing",
      "One thing before I leave you alone",
    ],
    states: {
      ventral: {
        body: `Hi [FirstName],

I'll be direct. We help organizations like [Company] solve the people problems that keep showing up no matter what else you fix — turnover, performance under pressure, communication breaking down when it matters most.

The results are measurable and they happen fast. I'd like to show you what that looks like for an organization in your position.

Can we find 20 minutes this week?

Chris
Pivot Training`,
        ps: "I'll send one page of outcomes data today so you have something concrete before we talk.",
      },
      sympathetic: {
        body: `Hi [FirstName],

I'm not going to pitch you on this email. One question first.

What's the biggest people challenge slowing [Company] down right now? Turnover, leadership, culture, communication — pick the one that's actually on your mind.

If what we do is relevant, I'll tell you how. If it's not, I'll tell you that too.

One sentence reply is all I need.

Chris
Pivot Training`,
        ps: "No meeting request attached. Just a question.",
      },
      dorsal: {
        body: `Hi [FirstName],

Just wanted to check back in — no agenda.

I know timing hasn't been right, and that's completely fine. When it changes and you're ready to look at what Pivot Training does, I'll be here.

No pressure. Take care.

Chris
Pivot Training`,
        ps: "One email is all it takes to reconnect whenever you're ready.",
      },
    },
    tips: [
      "Keep it under 150 words. Every sentence they have to read is a reason to stop reading.",
      "One question beats any pitch on a cold or warm email.",
      "P.S. lines get read almost as often as subject lines — use them for the real ask.",
      "If no reply after 3 days, one follow-up: 'Bumping this up in case it got buried.'",
    ],
  },

};

export function getEmailScript(industry: string | null): EmailScript {
  if (!industry) return emailScripts.Default;
  const key = Object.keys(emailScripts).find(k =>
    k !== "Default" && industry.toLowerCase().includes(k.toLowerCase())
  );
  return emailScripts[key ?? "Default"];
}

// ── Call Scripts ──────────────────────────────────────────────────────────────

export interface Voicemail {
  cold:         string;
  followup:     string;
  reengagement: string;
}

export interface CallScript {
  gatekeeper: string;  // what to say to get past the front desk
  opener:     string;  // pattern interrupt — sounds nothing like a PD vendor
  rapport:    string;  // show you understand their world before asking anything
  discovery:  string;  // questions to find the real problem — listen more than talk
  pivot:      string;  // when they ask "so what do you do?" — never say PD workshops
  bridge:     string;  // connect their problem to your work, naturally
  rebuttal:   string;  // handle pushback without sounding defensive
  close:      string;  // simple next step — not a hard sell
  voicemail:  Voicemail;
  tips:       string[];
}

export const NSS_TONE: Record<NSS, string> = {
  ventral:     "They're Engaged — curious and open. Keep building rapport, then move toward the next step naturally. Don't rush it, but don't stall either.",
  sympathetic: "They're Cautious — guarded. Lead with curiosity, not pitch. Ask questions. Make them feel heard before anything else.",
  dorsal:      "They've gone Quiet. Don't pitch, don't ask for anything. One genuine human question. If they reply at all, that's a win.",
};

type Scripts = Record<string, CallScript>;

const scripts: Scripts = {

  Education: {
    gatekeeper:
      "Hi, this is Chris Davis — is [Name] available? ... [If asked what it's about:] I work with school and district leaders — it's a quick call, I just had a question for them specifically. ... [If pushed further:] Honestly it's about some of the staff challenges I've been seeing in districts around here. I don't want to leave a long explanation — I'd rather just ask them directly. Is there a better time I could catch them?",

    opener:
      "Hey [Name], this is Chris Davis — I know I'm probably catching you mid-morning. I'll be quick. I've been talking to a lot of principals and district leaders lately and there's a specific thing that keeps coming up. I just wanted to see if it's something you're dealing with too. You have two minutes?",

    rapport:
      "I appreciate it. I'm not going to pitch you anything — I promise. I just want to ask you a few things and see if any of it resonates. Because what I keep hearing from school leaders right now is that the people stuff is harder than it's ever been — not just for students, for the adults in the building. And nobody's really talking about it the right way. Is that landing with you at all?",

    discovery:
      "So honestly — what's the hardest thing about your staff situation right now? Not the stuff you'd put in a report — the thing that's actually in your head. ... [Let them talk. Don't interrupt. Don't rush to fill silence.] ... How long has that been going on? ... And what have you tried? Like, what's already been put in front of your staff that hasn't really moved the needle?",

    pivot:
      "So what we do — and I'd rather show you than explain it, but the short version is this: we work with schools and organizations to help their people perform under pressure. The kind of pressure your staff is under every day — emotionally, relationally. We help them stay effective instead of just surviving. It shows up in retention, in classroom outcomes, in the culture of the building. It's not a wellness program. It's not a box your HR department checks. It's actually built around the problem you just described.",

    bridge:
      "Here's why I think that matters for you specifically — what you described earlier, [echo their exact words back briefly], that's exactly the kind of thing our work addresses. And the reason most people haven't solved it yet is that everything else out there is built for a different version of the problem. What we bring is different because it starts where the actual stress lives.",

    rebuttal:
      "I hear you — and I'm not asking for a commitment. Let me just ask you one thing: what does it actually cost you every time a good teacher walks out the door? Recruiting, subs, onboarding, the morale hit on everyone left behind — most districts are spending $15,000 to $25,000 per teacher without ever measuring it. The solution is almost always less than the problem. Can we get 20 minutes to just look at what that comparison looks like for your district?",

    close:
      "Here's all I'm asking — let me send you one page. Real outcomes from districts dealing with the same thing. You read it when you get a second, and if it doesn't land, no harm done. If it does, we get on a call and I'll show you what it looks like specifically for your school. Does that sound reasonable?",

    voicemail: {
      cold:
        "Hey [Name], this is Chris Davis — quick message. I've been working with school leaders around some of the staff challenges that keep coming up no matter what else gets fixed. I had a specific question for you — nothing to sell on this message. My number is [Your Number]. I'll shoot you a short email too so you have some context. Hope to connect.",
      followup:
        "Hey [Name], Chris Davis again. Sent you something a few days ago — didn't want it to get buried. If you saw it and it wasn't relevant, just say so and I'll leave you alone. If you haven't had a chance to look, I think it's worth 60 seconds. My number is [Your Number]. No pressure.",
      reengagement:
        "Hey [Name], Chris Davis with Pivot Training. It's been a while and I'm not calling to push anything. Honestly just wanted to check in and see how the year's going over there. My number is [Your Number]. Call or text whenever — take care.",
    },

    tips: [
      "Never say 'professional development' to the gatekeeper — say 'staff challenges' or 'a question for them specifically.'",
      "The opener works because it's about what YOU'VE been hearing — not about what you're selling.",
      "Golden rule: ask before you explain. The more they talk, the more they want to hear what you do.",
      "'What have you already tried?' is the most important question — it tells you why nothing has worked and where you fit.",
      "Budget objection: cost of one teacher lost ($15-25K) almost always exceeds cost of the solution.",
      "Never close with 'does that work?' — close with a specific day and time as a default they can adjust.",
    ],
  },

  "Education Service Center": {
    gatekeeper:
      "Hi, this is Chris Davis — is [Name] in? ... [If asked what it's about:] I work with regional service centers and ISDs — it's a quick conversation, I had something specific I wanted to ask them. ... [If pushed:] It's about some of the staff challenges their member districts are dealing with. I'd rather just ask them directly. Is there a time that works better?",

    opener:
      "Hey [Name], this is Chris Davis — appreciate you picking up. I'll be straight with you: I've been working with regional service centers lately and there's a pattern I keep seeing. I just wanted to see if it's something your team is running into too. Two minutes?",

    rapport:
      "I appreciate it. Before I say anything about what we do, I'd rather just listen for a second. Because what I keep hearing from service center leaders is that the demand from their member districts is outpacing what they're able to offer — especially on the people side. Does that match what you're seeing?",

    discovery:
      "So when your member districts come to you with staff problems — retention, morale, what's happening in classrooms — what do you have to hand them right now? Like, what's in the toolkit? ... [Listen.] ... And is there a gap there? Something they're asking for that you don't have a great answer to? ... How often does that come up?",

    pivot:
      "So what we do — the short version — we work with school systems and the organizations supporting them to help staff stay effective under pressure. The kind that burns people out and pushes them toward the door. What we've built for service centers specifically is a model that runs across your entire network — not one district at a time. Your team brings it in, and it reaches every building in your footprint. That's the version most relevant to what you just described.",

    bridge:
      "What you said about [echo their specific gap] — that's exactly where this fits. And what makes it different from what you've probably already looked at is that it's designed for scale. One engagement your center controls, reaching dozens of districts. You become the resource they don't have anywhere else.",

    rebuttal:
      "That's fair — you've seen programs come and go and most of them didn't stick. I'm not asking you to commit to anything. Give me 20 minutes and I'll show you the outcomes data. If it looks like everything else you've seen, we shake hands and I move on. If it's different, we talk about what a real partnership looks like.",

    close:
      "Here's what I'll do — I'll send you a regional overview today. Shows how other service centers have structured this, what it took to roll out, what they're seeing in their districts now. You share it with whoever would weigh in, and we get on a call this week or next. Who else at your center needs to be in that conversation?",

    voicemail: {
      cold:
        "Hey [Name], Chris Davis — quick message. I work with regional service centers and ISDs, and I had something specific I wanted to get your take on. Not a sales pitch — just a conversation I think would be worth a few minutes. My number is [Your Number]. I'll send a short email too so you have context before we talk.",
      followup:
        "Hey [Name], Chris Davis again. Sent something over recently — didn't want it to slip through. If it wasn't relevant, just say so and I'll leave you alone. If you haven't seen it, worth a look. My number is [Your Number].",
      reengagement:
        "Hey [Name], Chris Davis with Pivot Training. It's been a while — no agenda. Just wanted to check in and see how things are going with your member districts this year. My number is [Your Number]. Call or text whenever.",
    },

    tips: [
      "Ask 'what do you have to hand them right now?' before pitching anything — the gap they name is your entire value prop.",
      "Their selling point is scale: one decision, dozens of districts. Lead with that when you explain what you do.",
      "Offer to present at their next regional convening — visibility with member districts is currency for them.",
      "Ask: 'What would it take for you to feel confident recommending this to your districts?' — it tells you exactly what the bar is.",
    ],
  },

  "Non-profit": {
    gatekeeper:
      "Hi, this is Chris Davis — is [Name] available? ... [If asked:] I work with nonprofits and community organizations on some of the people challenges that come up in this kind of work. Just a quick question for them. ... [If pressed:] It's specifically about frontline staff — I'd rather just ask them directly than leave a long explanation. Is there a better time?",

    opener:
      "Hey [Name], this is Chris Davis — I know you're busy and I'll be brief. I've been talking to a lot of leaders running organizations like yours lately, and there's a theme that keeps coming up. I just wanted to see if it's something you're dealing with. You have two minutes?",

    rapport:
      "I appreciate it. I'm not going to pitch you — I want to ask you something first. Because what I keep hearing from nonprofit leaders is that the people doing the hardest work — the frontline staff — are holding things together with whatever energy they have left. And by the time it becomes a crisis, it's already expensive. Is that close to what you're seeing?",

    discovery:
      "So — how are your frontline staff actually doing right now? Not the answer for the board — the real one. ... [Let them talk.] ... What's the turnover situation look like? ... And when someone good leaves — when a person who really gets it walks out the door — what's the honest reason? Not what they put on the exit form, the conversation in the parking lot.",

    pivot:
      "So what we do — and I'd rather show you than explain it, but the short version — we help organizations build the internal capacity to keep their best people. Not a wellness program, not an EAP. Something that actually addresses the reason people burn out in this kind of work: they're carrying weight nobody prepared them for and nobody's helping them put it down. What we build with your team makes that manageable — and it shows up in retention, in performance, in your ability to deliver on the mission.",

    bridge:
      "What you described — [reflect their words] — that's exactly the kind of situation where we've seen the biggest shift. The reason it hasn't been solved yet is that most offerings in this space treat it like a training problem. It's not. It's a capacity problem. And that requires a different approach.",

    rebuttal:
      "I hear you — budget is always the question in this sector, and I respect that. Let me ask you this: what does it cost you when a frontline worker leaves? Not just recruiting — the relationships they had with clients, the onboarding for whoever comes next, the morale hit on the team left behind. Most orgs in your position are spending more on that cycle than they'd ever spend on preventing it. And I can show you how to fund this through grants you're probably already sitting on.",

    close:
      "Here's what I'll do — I'll send you one case study. An org close to yours in size and mission, same staffing challenge. You read it when you get a minute, and if it resonates, we get on a call and I'll walk you through how to make it work given your budget.",

    voicemail: {
      cold:
        "Hey [Name], Chris Davis — quick message. I work with nonprofits on the frontline staff challenges that tend to come with this kind of work. Had something specific I wanted to get your take on. Not a sales call — just a conversation worth having. My number is [Your Number]. I'll send a short email too.",
      followup:
        "Hey [Name], Chris Davis again. Sent something a few days ago — didn't want it to get buried. If it wasn't relevant, just say the word. If you haven't had a chance to look, I think it's worth a minute. My number is [Your Number].",
      reengagement:
        "Hey [Name], Chris Davis with Pivot Training. It's been a while — not calling with an agenda. Just wanted to check in and see how your team is doing. My number is [Your Number]. Reach out whenever.",
    },

    tips: [
      "Say 'mission' not 'ROI' — nonprofits connect staff care to the people they serve, not a P&L.",
      "Ask about secondary traumatic stress — they feel it constantly and rarely have the right language for it.",
      "Reference SAMHSA, HRSA, foundation grants — most orgs have wellness funding they haven't deployed.",
      "Never say 'training program.' Say 'staff capacity' or 'retention infrastructure.'",
    ],
  },

  Corporate: {
    gatekeeper:
      "Hi, this is Chris Davis — is [Name] available? ... [If asked:] I work with companies on leadership performance and the kind of people challenges that show up when teams are under pressure. Quick conversation — just a question for them. ... [If pressed:] I'd rather explain it directly — is there a better time I could reach them?",

    opener:
      "Hey [Name], this is Chris Davis — I know I'm probably catching you mid-day. I'll be quick. I've been talking to a lot of leaders at companies in your space and there's a pattern that keeps coming up. I just wanted to see if it's something you're dealing with. Two minutes?",

    rapport:
      "I appreciate it. I'm not going to pitch you on this call — I want to ask you something first. Because what I keep seeing in companies at your stage is that leadership teams are technically excellent and still somehow losing good people or underperforming when it counts. And most of the usual fixes don't actually touch it. Does any of that land?",

    discovery:
      "So honestly — where does your leadership team break down right now? Not the strategic plan answer — the thing that actually keeps you up. Is it how people handle pressure, is it communication falling apart when stakes are high, is it a retention problem you can't quite explain? ... [Listen fully.] ... How long has that been happening? ... What's already been tried?",

    pivot:
      "So what we do — we help leadership teams perform under the kind of pressure that breaks down technically skilled people. Most leaders are promoted because they're great at the work, not because anyone prepared them to manage stress, conflict, and people through difficult seasons. We close that gap. It shows up in retention, in team performance, in the decisions people make when the pressure is highest. It's not a wellness program — it's a performance play.",

    bridge:
      "What you described — [echo their words] — that's exactly where we get the most traction. The reason it's persisted is that what's out there treats it at the surface level. We go to where it's actually originating, which is why the results are different.",

    rebuttal:
      "Totally fair — budget is always the first question. But here's the math: one manager at $120K costs you $60,000 minimum to replace — recruiting, onboarding, the productivity gap, the team impact. Lose three in a year and you're at $180,000 before you've fixed anything. What we cost is a fraction of one replacement and it stops the cycle. Which part of that case would be most useful to look at?",

    close:
      "Here's what I'll put together — a one-page look at what staying the same costs versus what we've seen companies like yours gain. You share it with whoever owns this decision, and we get on a call. Who else should be in that conversation?",

    voicemail: {
      cold:
        "Hey [Name], Chris Davis — quick message. I work with companies on what happens to leadership teams when pressure goes up. Had something specific I wanted to run by you. My number is [Your Number]. I'll send an email too so you have context before we talk.",
      followup:
        "Hey [Name], Chris Davis again. Sent something over recently — didn't want it to get lost. If it's not relevant, just say so. My number is [Your Number].",
      reengagement:
        "Hey [Name], Chris Davis with Pivot Training. It's been a while — no pressure, just checking in. Curious if anything's shifted on your end with the leadership or culture side. My number is [Your Number]. Reach out whenever it makes sense.",
    },

    tips: [
      "Lead with 'leadership performance' not 'wellness' — L&D budgets are more accessible and it's a better frame.",
      "The ROI anchor: $60K per manager replaced. Don't lead with it — bring it when they say budget.",
      "Ask 'who else needs to be part of this conversation?' early — don't invest time in someone who can't say yes.",
      "Ask what's been tried already — it tells you why the problem persists and where to position.",
    ],
  },

  Government: {
    gatekeeper:
      "Hi, this is Chris Davis — is [Name] available? ... [If asked:] I work with government agencies and public service organizations on workforce and retention. Just a quick question for them — nothing complicated. ... [If pressed:] It's specifically about the people side of what they're managing. I'd rather ask them directly. Is there a better time?",

    opener:
      "Hey [Name], this is Chris Davis — I know public service leaders are stretched right now. I'll be quick. I've been working with a few agencies dealing with some of the same workforce challenges, and there's a specific thing I wanted to get your perspective on. You have two minutes?",

    rapport:
      "I appreciate it. I'm not going to pitch you anything on this call. I'd rather understand what you're dealing with first. Because what I keep hearing from public service leaders right now is that the experience and institutional knowledge walking out the door is irreplaceable — and the team left behind is operating at a level of strain that doesn't show up in any report. Is that anywhere close to what you're seeing?",

    discovery:
      "So when it comes to your team right now — what's the biggest challenge you're actually navigating on the people side? Not what's in the strategic plan. The thing that's genuinely hard. Is it holding onto experienced staff, the morale situation, performance in the team you have, something else? ... [Listen fully.] ... How long has that been the pattern? ... And what's been tried to address it?",

    pivot:
      "So what we do — the short version — we help public service teams stay effective under the kind of pressure that erodes performance over time. The strain your people are under is different from private sector pressure. It's sustained, it's often invisible, and most of the usual workforce programs don't address it. We built something that does. It shows up in retention, in performance, and in the institutional knowledge that stops walking out the door.",

    bridge:
      "What you described — [reflect their words back specifically] — that's exactly where we see the most impact. And the reason it's persisted is that most options available in your sector are built for a different version of the problem. What we bring is designed for the specific kind of weight your team is carrying.",

    rebuttal:
      "I understand — procurement moves on its own timeline and I'm not asking you to rush anything. What I'm asking is let me get you something in the right format so when the timing is right internally, you've already got the information you need. I'd rather you have it eighteen months early than be trying to find it under pressure. What's the right first step on your end?",

    close:
      "Here's what makes sense for your process — I'll put together a summary in the format your team would need. Outcomes data, funding alignment, implementation structure. You share it with whoever needs to weigh in, and we schedule a call whenever it makes sense — no pressure on timing. Who needs to be in that loop before anything moves?",

    voicemail: {
      cold:
        "Hey [Name], Chris Davis — quick message. I work with government agencies and public service organizations around workforce performance and retention. Had something specific I wanted to get your perspective on. My number is [Your Number]. I'll send a short email too.",
      followup:
        "Hey [Name], Chris Davis again. Sent something over recently — didn't want it to get buried. If it's not relevant to where you are, just let me know. My number is [Your Number].",
      reengagement:
        "Hey [Name], Chris Davis with Pivot Training. It's been a while — no agenda at all. Just checking in to see how things are going heading into the next cycle. My number is [Your Number]. Reach out whenever.",
    },

    tips: [
      "Plant seeds early — government procurement is long. The goal of the first call is to be remembered, not to close.",
      "Find the internal champion: someone frustrated by the problem who will carry it forward internally.",
      "'Performance' and 'retention' open budget conversations. 'Wellness' rarely does.",
      "Ask what format they need information in — shows you understand their approval process.",
    ],
  },

  Healthcare: {
    gatekeeper:
      "Hi, this is Chris Davis — is [Name] available? ... [If asked:] I work with health systems and clinical leadership on staff retention. Quick call — just had a question for them specifically. ... [If pressed:] It's about what's happening with clinical staff right now. I'd rather ask them directly. Is there a better time to reach them?",

    opener:
      "Hey [Name], this is Chris Davis — I know clinical leaders don't have a lot of spare minutes. I'll be quick. I've been talking to a lot of people in your position lately and there's something specific I keep hearing. I just wanted to see if it's landing with you too. Two minutes?",

    rapport:
      "I appreciate it. I'm not going to pitch you anything right now — I'd rather just listen for a second. Because what I keep hearing from healthcare leaders is that the clinical staff who are still there — the ones who didn't leave — are holding things together on pure will at this point. And what's keeping them isn't getting addressed by anything that's been put in front of them. Does that sound familiar?",

    discovery:
      "So — what's the clinical staff situation actually like right now? Not the numbers — what's it like on the floor? ... [Listen. Give them space.] ... Where are you losing people — nursing, allied health, leadership? ... When your best clinicians leave — the ones your patients trust — what do they tell you is the real reason? Not the exit survey answer. The conversation in the parking lot.",

    pivot:
      "So what we do — we work with health systems to help clinical staff stay effective under the kind of load they're currently carrying. What's happening isn't just burnout — it's a specific kind of erosion that comes from doing meaningful work in a system that feels misaligned with why they got into healthcare. We address the root of that. What we build with your team shows up in retention, in patient safety scores, in the performance of the staff who stay. It's not a wellness program — it's clinical workforce sustainability.",

    bridge:
      "What you described — [echo their specific words] — that's exactly what we're designed to address. And the reason it's still there is that most of what's been put in front of your team treats the symptoms. What we do starts where the problem actually lives.",

    rebuttal:
      "I know the margin pressure is real — and I'm not minimizing that. Here's the number that usually reframes it: replacing one nurse costs between $50,000 and $80,000 when you include agency staff, overtime, and lost productivity. If you're losing ten a year, that's close to half a million dollars. What we cost is a fraction of one replacement — and it stops the cycle. Which part of that math would be most useful to walk through?",

    close:
      "Here's what I'll put together — a short outcomes summary for health systems in your situation, with a turnover cost model so you have the business case ready. You can share it with your CNO or HR team, and we get on a call together when it makes sense. Who needs to be in that room?",

    voicemail: {
      cold:
        "Hey [Name], Chris Davis — quick message. I work with health systems around clinical staff retention and what's actually happening on the floor right now. Had something specific I wanted to get your take on. My number is [Your Number]. I'll follow up with a short email too.",
      followup:
        "Hey [Name], Chris Davis again. Sent something over recently — didn't want it to slip through. If it's not the right time, just say so. If you haven't seen it, I think it's worth a minute. My number is [Your Number].",
      reengagement:
        "Hey [Name], Chris Davis with Pivot Training. It's been a while — no pressure. Just wanted to check in and see how your team is holding up. My number is [Your Number]. Reach out whenever it makes sense.",
    },

    tips: [
      "Ask what it's like 'on the floor' not what the numbers say — you want them to say it in their own words.",
      "Use 'moral injury' not just burnout — clinical leaders know the term and it signals you understand the depth.",
      "The number: $50–80K per nurse replaced. Don't lead with it — bring it when they say budget.",
      "Ask about patient safety scores — that's a metric their board tracks and it connects retention to outcomes.",
    ],
  },

  Default: {
    gatekeeper:
      "Hi, this is Chris Davis — is [Name] available? ... [If asked:] I work with organizations on some of the people challenges that come up when teams are under pressure. Just a quick question for them. ... [If pressed:] I'd rather explain it to them directly — is there a better time I could reach them?",

    opener:
      "Hey [Name], this is Chris Davis — I know I'm probably catching you in the middle of something. I'll be quick. There's something I've been seeing come up a lot lately with organizations like yours, and I just wanted to see if it's something you're dealing with too. Two minutes?",

    rapport:
      "I appreciate it. I'm not going to pitch you anything right now — I'd rather just ask you a few questions and see if a conversation even makes sense. Because what I keep hearing is that the people stuff is harder than it looks from the outside, and the usual fixes don't actually stick. Does that land at all?",

    discovery:
      "So honestly — what's the hardest thing about your team situation right now? Not the official answer — the thing that keeps coming back no matter what else gets fixed. Is it people leaving, performance, communication breaking down under pressure — or something else entirely? ... [Let them talk. Really listen.] ... How long has that been the situation? ... What's already been tried?",

    pivot:
      "So what we do — the short version — we help organizations fix the people problems that keep showing up no matter what else you change. The kind that come from teams operating under sustained pressure without the right support. It shows up in turnover, in performance, in the communication that breaks down when it matters most. What we build with your team addresses the cause, not the symptoms. And it moves faster than most things you've probably tried.",

    bridge:
      "What you described — [echo their words specifically] — that's exactly the kind of situation we're built for. Most of what's out there isn't actually designed for the real version of that problem. What we do is different because it starts where the problem originates.",

    rebuttal:
      "I understand — timing and budget are always the first two things. Let me ask you one question: what is it actually costing you to not solve this? Not our fee — the cost of the problem going another year. In my experience it's almost always more than people expect. Can I send you one page that walks through what that comparison looks like?",

    close:
      "Here's what I'll do — I'll send you something specific to your situation. Not a brochure. One page, real outcomes and numbers. You read it, share it with whoever needs to see it, and we get on a call. What works better — end of this week or early next?",

    voicemail: {
      cold:
        "Hey [Name], Chris Davis with Pivot Training. Quick message — I work with organizations on the people challenges that keep showing up no matter what else gets fixed. Had something specific I wanted to get your take on. My number is [Your Number]. I'll send a short email too so you have context.",
      followup:
        "Hey [Name], Chris Davis again. Sent something over recently — didn't want it to get lost. If it's not relevant, just let me know. My number is [Your Number].",
      reengagement:
        "Hey [Name], Chris Davis with Pivot Training. It's been a while. No agenda — just checking in to see how things are going. My number is [Your Number]. Reach out whenever.",
    },

    tips: [
      "Never say what you do before you've heard what they need — ask first, always.",
      "The pivot ('so what do you do?') is your best moment. Answer with their problem, not your product.",
      "Silence after a question is fine. Let them fill it. The more they talk, the more they're invested.",
      "End every call with a specific next step: a day, a time, something they're going to receive.",
    ],
  },

};

export function getCallScript(industry: string | null): CallScript {
  if (!industry) return scripts.Default;
  const key = Object.keys(scripts).find(k =>
    k !== "Default" && industry.toLowerCase().includes(k.toLowerCase())
  );
  return scripts[key ?? "Default"];
}

