import type { NSS } from "./types";

// ── Email Scripts ─────────────────────────────────────────────────────────────

export interface EmailBody {
  body: string;
  ps?: string;
}

export interface EmailScript {
  subjects:  string[];   // 3-4 punchy options
  cold:      EmailBody;  // first touch
  followup:  EmailBody;  // after no reply
  reengage:  EmailBody;  // after silence (21+ days)
  tips:      string[];
}

const emailScripts: Record<string, EmailScript> = {

  Education: {
    subjects: [
      "What [Company] is missing",
      "The real reason good teachers leave",
      "5 minutes, [FirstName]",
      "One question before I leave you alone",
    ],
    cold: {
      body: `Hi [FirstName],

I'm going to skip the intro and ask you one thing.

When a great teacher leaves your building — the kind your students come back to visit — what's the honest reason they give?

Not the exit survey answer. The one they tell a colleague in the parking lot.

Because if it has anything to do with the weight of the job, not the pay — I have something specific worth seeing.

One page. No meeting required.

Chris
Pivot Training`,
      ps: "Reply with one word: burnout, behavior, leadership, or something else. I'll send the right thing.",
    },
    followup: {
      body: `Hi [FirstName],

Sent you something last week — didn't want it to get buried.

One question: is staff burnout something you're actively measuring right now, or is it more of a "we'll know it when we see it" situation?

Because most districts are in the second camp. And I have something that changes that.

Worth a reply?

Chris
Pivot Training`,
      ps: "If the timing is bad, just say so. I'll circle back.",
    },
    reengage: {
      body: `Hi [FirstName],

It's been a while. No agenda.

Just wanted to check in and see how the year's going over there. Staff situations in education have been rough across the board — curious how your building is holding up.

No ask. Just a check-in.

Chris`,
    },
    tips: [
      "The parking lot question is your opener — most administrators know exactly what that answer is.",
      "Never lead with your program. Lead with their problem.",
      "Education contacts respond to specificity. 'A district like yours' beats 'many districts.'",
      "Send Tuesday–Thursday, 6:30–8am or 3:30–5pm — before and after the school day.",
    ],
  },

  "Education Service Center": {
    subjects: [
      "One idea for your member districts",
      "The gap your ISDs keep hitting",
      "[FirstName] — regional question",
      "What [Company] could offer that most centers can't",
    ],
    cold: {
      body: `Hi [FirstName],

Quick question.

When your member districts come to you with staff burnout and retention problems — what do you hand them right now?

Because what I keep hearing from service center leaders is that the demand from their districts is outpacing what they're equipped to offer on the people side.

If that's the gap, I have something worth 15 minutes.

Chris
Pivot Training`,
      ps: "Two regional centers are already running this across their networks — happy to share what that looks like.",
    },
    followup: {
      body: `Hi [FirstName],

Sent you something recently — wanted to follow up before it got lost.

The core question I was asking: what does [Company] have to offer when a district comes to you with a staff burnout or retention problem?

If there's a gap there, I have something worth a conversation.

Chris
Pivot Training`,
      ps: "One page is all I need to show you. No meeting required.",
    },
    reengage: {
      body: `Hi [FirstName],

Been a while — no pressure here.

Just wanted to stay on your radar. When your member districts start asking for something different on staff wellness and retention, I'd like to be the first call.

Chris`,
    },
    tips: [
      "Lead with the multiplier effect — one program reaches dozens of districts.",
      "Ask how many member districts they serve before saying anything about what you do.",
      "Offer to present at a regional convening — visibility with districts is currency for them.",
      "Service center relationships move slowly. Multiple touches before a yes is completely normal.",
    ],
  },

  "Non-profit": {
    subjects: [
      "Your frontline staff, [FirstName]",
      "The honest reason people leave orgs like yours",
      "One case study — under 2 minutes",
      "Before I leave you alone",
    ],
    cold: {
      body: `Hi [FirstName],

One question before anything else.

When your best frontline staff leave — not the ones you expected to go, the ones you couldn't afford to lose — what's the real reason?

Not the exit form. The conversation in the parking lot.

Because if the answer involves exhaustion, secondary trauma, or feeling unsupported by a system they believe in — I have something worth seeing.

Not a wellness program. Something that addresses the actual cause.

Chris
Pivot Training`,
      ps: "One case study, one page. Reply and I'll send it today.",
    },
    followup: {
      body: `Hi [FirstName],

Sent you something last week. Didn't want it to get buried.

Real question: what's your staff turnover situation actually looking like right now? Because in most orgs I talk to, the number being tracked and the number being felt are different.

Worth a reply.

Chris
Pivot Training`,
      ps: "If this isn't the right time, just say so. No hard feelings.",
    },
    reengage: {
      body: `Hi [FirstName],

It's been a while. No ask.

Nonprofits are carrying a lot right now and I'm not here to add to your list. Just wanted to check in and see how your team is doing.

Take care of them.

Chris`,
    },
    tips: [
      "Say 'mission' not 'ROI' — nonprofits connect staff care to the people they serve, not a P&L.",
      "Ask about secondary traumatic stress — they feel it constantly and rarely have the right language for it.",
      "SAMHSA, HRSA, and foundation grants often fund this work — mention it if budget comes up.",
      "Never say 'training program.' Say 'staff capacity' or 'retention infrastructure.'",
    ],
  },

  Corporate: {
    subjects: [
      "What's actually behind your turnover number",
      "[FirstName] — leadership performance question",
      "The gap no one trains for",
      "20 minutes on something specific",
    ],
    cold: {
      body: `Hi [FirstName],

Here's what I keep seeing at companies like [Company].

Managers who are technically excellent — promoted because they were great at the work — and still struggling when the pressure goes up. Communication breaks down. Good people leave. Performance dips exactly when you need it not to.

Nobody taught them how to lead under pressure. That gap is expensive.

I'd like to show you what closing it looks like.

20 minutes this week?

Chris
Pivot Training`,
      ps: "I'll send one page of before/after data today — no meeting required to see it.",
    },
    followup: {
      body: `Hi [FirstName],

Sent you something last week. Bumping it up in case it got buried.

Quick question: where does your leadership team break down most visibly when pressure goes up?

Because that's exactly where we get traction.

Worth a reply.

Chris
Pivot Training`,
      ps: "No meeting attached. Just a question.",
    },
    reengage: {
      body: `Hi [FirstName],

It's been a while. Nothing to sell today.

Just wanted to stay on your radar. When leadership performance or retention comes back up as a priority — I'd like to be the first call.

Chris`,
    },
    tips: [
      "Lead with 'leadership performance' not 'wellness' — L&D budgets are more accessible.",
      "The ROI anchor: $60K per manager replaced. Don't lead with it — bring it when they say budget.",
      "Ask 'who else needs to be part of this conversation?' early — don't invest in someone who can't say yes.",
      "What's been tried already tells you why the problem persists and exactly where to position.",
    ],
  },

  Government: {
    subjects: [
      "Workforce retention — [Company]",
      "The people problem no agency is solving",
      "[FirstName] — one question",
      "Before the next budget cycle",
    ],
    cold: {
      body: `Hi [FirstName],

Public sector turnover is at a 20-year high. The institutional knowledge walking out the door doesn't come back — and the team left behind is operating at a level of strain that doesn't show up in any report.

What we do is give public service teams real tools to stay effective under that kind of pressure.

I'd like to put 20 minutes in front of you. Not a pitch — outcomes data from agencies in your position.

Worth it?

Chris
Pivot Training`,
      ps: "I can send it in whatever format your approval process needs.",
    },
    followup: {
      body: `Hi [FirstName],

Sent you something recently — didn't want it to get buried in the inbox.

One question: what's the biggest people challenge your department is actually dealing with right now? Not the strategic plan answer. The real one.

Because what we do is specific, and I'd rather know if it's relevant before I take up more of your time.

Chris
Pivot Training`,
      ps: "One sentence reply is all I need.",
    },
    reengage: {
      body: `Hi [FirstName],

Been a while. No agenda.

Just want to stay on your radar ahead of the next budget cycle. When workforce retention comes back up on the agenda — and it always does — I'd like the chance to show you what we've done for agencies in your position.

Chris`,
    },
    tips: [
      "Plant seeds early — government procurement is long. The goal of the first email is to be remembered.",
      "Find the internal champion: someone frustrated by the problem who will carry it forward internally.",
      "'Performance' and 'retention' open budget conversations. 'Wellness' rarely does.",
      "Ask what format they need information in — it signals you understand their approval process.",
    ],
  },

  Healthcare: {
    subjects: [
      "The real reason your nurses are leaving",
      "Clinical retention — [Company]",
      "[FirstName] — one question for you",
      "What the exit surveys aren't capturing",
    ],
    cold: {
      body: `Hi [FirstName],

One question.

When your best clinical staff leave — the ones your patients trust, the ones who trained the people behind them — what do they tell you is the real reason?

Not the exit survey answer. The conversation in the parking lot.

Because if the answer involves exhaustion, moral injury, or a system that feels misaligned with why they got into healthcare — I have something specific worth seeing.

Not another wellness program.

Chris
Pivot Training`,
      ps: "At $50–80K per nurse replaced, this conversation is worth 20 minutes.",
    },
    followup: {
      body: `Hi [FirstName],

Sent you something last week. Didn't want it to slip through.

Real question: is clinical staff burnout something you're actively measuring right now, or is it more reactive — you find out when someone leaves?

Because most health systems are in the second camp. And there's a better way.

Worth a reply.

Chris
Pivot Training`,
      ps: "No meeting attached. Just a question.",
    },
    reengage: {
      body: `Hi [FirstName],

It's been a while. No pitch.

Healthcare leadership is under enormous pressure right now and I'm not here to add to it. Just wanted to check in and see how your team is holding up.

When clinical retention comes back to the top of the list — I'd like to be the first call.

Chris`,
    },
    tips: [
      "Ask what it's like 'on the floor' not what the numbers say — you want them to say it in their own words.",
      "Use 'moral injury' not just burnout — clinical leaders know the term and it signals depth.",
      "The number: $50–80K per nurse replaced. Don't lead with it — bring it when they say budget.",
      "Ask about patient safety scores — that's a metric their board tracks and it connects retention to outcomes.",
    ],
  },

  Default: {
    subjects: [
      "One question, [FirstName]",
      "Before I leave you alone",
      "20 minutes on something specific",
      "What's actually behind the problem",
    ],
    cold: {
      body: `Hi [FirstName],

I'm going to skip the pitch and ask you one thing.

What's the biggest people challenge slowing [Company] down right now — turnover, leadership, performance under pressure, something else?

Because what we do is specific. And the answer tells me whether it's even worth saying more.

One sentence is all I need.

Chris
Pivot Training`,
      ps: "If it's relevant, I'll tell you how. If it's not, I'll tell you that too.",
    },
    followup: {
      body: `Hi [FirstName],

Sent you something last week. Bumping it up in case it got buried.

Still just the one question: where does your team break down most when the pressure goes up?

Worth a reply.

Chris
Pivot Training`,
      ps: "No meeting attached. Just a question.",
    },
    reengage: {
      body: `Hi [FirstName],

It's been a while. No agenda.

Just checking back in. When the timing is right and you're ready to look at what Pivot Training does — I'll be here.

No pressure.

Chris`,
    },
    tips: [
      "Keep it under 120 words. Every sentence they have to read is a reason to stop reading.",
      "One question beats any pitch on a cold email.",
      "P.S. lines get read almost as often as subject lines — use them.",
      "If no reply after 3 days: 'Bumping this up in case it got buried.' That's the whole email.",
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
  gatekeeper: string;
  opener:     string;
  rapport:    string;
  discovery:  string;
  pivot:      string;
  bridge:     string;
  rebuttal:   string;
  close:      string;
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
