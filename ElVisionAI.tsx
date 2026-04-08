import { useState, useEffect, useRef } from "react";
import {
  handleFbcCookieManager,
  initFacebookPixelWithLogging,
  trackPageViewEvent,
  trackViewContentEvent,
  getFbcFbpCookies,
  getClientIp,
  sendCAPI,
} from "./src/fbpixel";

const PIXEL_ID = "3319324491540889";

const WA_NUMBER = "62895325633487";

function waLink(msg: string) {
  return `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`;
}

const problems = [
  {
    id: "convapi",
    icon: "📡",
    tag: "Meta Ads",
    title: "Conversion API not tracking",
    short: "Meta Ads stuck — your ROAS is blind",
    pain: "Your Meta Ads look like they're running, but Conversion API is broken. Facebook has zero signal. Budget burns, ROAS tanks, you keep optimizing in the dark.",
    fix: "We connect & verify your Conversion API end-to-end. Facebook gets real purchase signals again. Campaigns optimize correctly within 72 hours.",
    stat: "Avg ROAS lift: 2.4×",
    color: "#4F7BF7",
    bg: "rgba(79,123,247,0.08)",
    border: "rgba(79,123,247,0.25)",
  },
  {
    id: "creative",
    icon: "🎨",
    title: "Wrong creative, wrong market",
    short: "Creative is killing your ROAS",
    pain: "You're running the same 2 creatives to everyone. Wrong hook, wrong audience, wrong format. Your competitors A/B test 50 variations a week. You test 2 a month.",
    fix: "AI generates 100+ creatives per week — hooks, copy, visuals — auto-matched to each audience segment. Losers die in 24h. Only winners scale.",
    stat: "CPL drop avg: 58%",
    color: "#E8522A",
    bg: "rgba(232,82,42,0.08)",
    border: "rgba(232,82,42,0.25)",
    tag: "Ads Creative",
  },
  {
    id: "followup",
    icon: "⚡",
    title: "Slow lead follow-up",
    short: "Leads go cold in 4 minutes",
    pain: "A lead fills your form at 11pm. Your sales team replies at 10am. That lead already signed with someone who replied in 3 minutes. Every day, silently.",
    fix: "AI replies within 60 seconds — 24/7. Personalized by lead source, qualifies automatically, books the appointment. Your team wakes up to hot leads.",
    stat: "Conversion rate: +320%",
    color: "#1DB974",
    bg: "rgba(29,185,116,0.08)",
    border: "rgba(29,185,116,0.25)",
    tag: "Lead Response",
  },
  {
    id: "autopost",
    icon: "🚀",
    title: "Auto post hundreds of creatives to ads",
    short: "Manual posting is killing your scale",
    pain: "Your team manually uploads creatives, sets targeting, duplicates ad sets. It takes hours. By the time you launch, the moment has passed.",
    fix: "AI auto-generates, schedules, and publishes hundreds of creatives across campaigns. Full targeting rules applied automatically. Zero manual uploads.",
    stat: "Output: 200+ creatives/week",
    color: "#9B5DE5",
    bg: "rgba(155,93,229,0.08)",
    border: "rgba(155,93,229,0.25)",
    tag: "Automation",
  },
  {
    id: "comments",
    icon: "💬",
    title: "Auto-reply comments on social media",
    short: "Comments ignored = lost buyers",
    pain: "Hundreds of comments on your posts — questions, DMs, objections. Most go unanswered for days. Every unanswered comment is a buyer who walked away.",
    fix: "AI replies to every comment and DM instantly — in your brand voice. Handles FAQs, redirects hot leads to WhatsApp, escalates complaints to humans.",
    stat: "Response time: <90 sec",
    color: "#F5A623",
    bg: "rgba(245,166,35,0.08)",
    border: "rgba(245,166,35,0.25)",
    tag: "Social Media",
  },
  {
    id: "calls",
    icon: "📞",
    title: "Missed calls → lost customers",
    short: "After-hours calls go to competitors",
    pain: "Your phone rings at 7pm. Nobody's there. Customer calls your competitor. They pick up. You just lost a $3,000 job without knowing it.",
    fix: "AI answers every call, 24/7. Captures need, qualifies, books appointment, sends WhatsApp confirmation. You wake up to a full calendar.",
    stat: "Recovery rate: 87%",
    color: "#00C9C8",
    bg: "rgba(0,201,200,0.08)",
    border: "rgba(0,201,200,0.25)",
    tag: "Inbound Calls",
  },
];

const capabilities = [
  { icon: "🤖", label: "AI receptionist", sub: "24/7 — never misses a lead" },
  { icon: "📊", label: "Live ad dashboard", sub: "All channels in one view" },
  { icon: "🔁", label: "Auto creative rotation", sub: "Fresh ads every 24 hours" },
  { icon: "🎯", label: "Audience targeting AI", sub: "Right message, right person" },
  { icon: "📧", label: "Email + WA sequences", sub: "Automated nurture flows" },
  { icon: "📈", label: "Revenue attribution", sub: "Know what actually works" },
];

export default function ElVisionAI() {
  const [dark, setDark] = useState(true);
  const [active, setActive] = useState<string | null>(null);
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const demoRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    setDark(mq.matches);
  }, []);

  // Pixel: capture fbclid, init pixel, fire PageView + ViewContent
  useEffect(() => {
    handleFbcCookieManager();
    initFacebookPixelWithLogging(PIXEL_ID);
    trackPageViewEvent(PIXEL_ID);
    trackViewContentEvent({ content_name: "EL Vision AI - Fix" }, PIXEL_ID);
  }, []);

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const id = (e.target as HTMLElement).dataset.revealId;
            if (id) setRevealed((prev) => new Set([...prev, id]));
          }
        });
      },
      { threshold: 0.15 }
    );
    Object.values(cardRefs.current).forEach((el) => el && obs.observe(el));
    return () => obs.disconnect();
  }, []);

  const selected = problems.find((p) => p.id === active);

  const handleSelect = (id: string) => {
    setActive((prev) => (prev === id ? null : id));
    setTimeout(() => {
      demoRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }, 80);
  };

  // CAPI: AddPaymentInfo when user clicks any WA CTA button
  const handleWAClick = async () => {
    const { fbc, fbp } = getFbcFbpCookies();
    const clientIp = await getClientIp();
    const contentName = selected ? selected.title : "EL Vision AI - Free Demo";
    await sendCAPI({
      pixelId: PIXEL_ID,
      eventName: "AddPaymentInfo",
      customData: { content_name: contentName },
      userData: {
        fbc,
        fbp,
        client_ip_address: clientIp,
      },
    });
  };

  const t = dark
    ? {
        bg: "#0A0A0F",
        surface: "#13131A",
        card: "#1A1A24",
        border: "rgba(255,255,255,0.07)",
        borderHover: "rgba(255,255,255,0.15)",
        text: "#F0F0F5",
        muted: "#8888AA",
        hint: "#55556A",
        accent: "#4F7BF7",
      }
    : {
        bg: "#F6F6F9",
        surface: "#FFFFFF",
        card: "#FFFFFF",
        border: "rgba(0,0,0,0.07)",
        borderHover: "rgba(0,0,0,0.18)",
        text: "#0D0D14",
        muted: "#555566",
        hint: "#AAAABC",
        accent: "#2B5CE6",
      };

  const waMsgMap: Record<string, string> = {
    convapi: `Hi, I'm interested in the free demo. My Meta Ads are spending but I'm not seeing results — I think my Conversion API might be broken. My ROAS has been dropping and I can't figure out why. Can you take a look?`,
    creative: `Hi, I'm interested in the free demo. My ad creatives are getting stale — same visuals running for weeks, CTR is dropping. I need a better system for generating and rotating creatives. Can you help?`,
    followup: `Hi, I'm interested in the free demo. My team is too slow at following up leads — by the time we reply, they've already gone with someone else. I need a faster response system. Can you show me how it works?`,
    autopost: `Hi, I'm interested in the free demo. My team spends too much time manually uploading and setting up ads. It's slowing everything down. I want to see how you automate the publishing pipeline.`,
    comments: `Hi, I'm interested in the free demo. We have a lot of comments and DMs on our posts that go unanswered for days. I'm losing buyers because of it. Can you show me how your auto-reply system works?`,
    calls: `Hi, I'm interested in the free demo. We're missing calls after hours and losing customers to competitors who pick up. I need an AI that answers and qualifies calls 24/7. Can you walk me through it?`,
  };

  const waMsg = selected
    ? waMsgMap[selected.id]
    : `Hi, I'm interested in a free demo for my business. I'd like to find out where we're leaking revenue and how you can help fix it.`;

  return (
    <div
      style={{
        background: t.bg,
        color: t.text,
        fontFamily: "'DM Sans', 'Helvetica Neue', sans-serif",
        minHeight: "100vh",
        transition: "background 0.3s, color 0.3s",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        ::selection { background: #4F7BF744; }
        .problem-card { cursor: pointer; transition: transform 0.18s, border-color 0.18s, box-shadow 0.18s; }
        .problem-card:hover { transform: translateY(-3px); }
        .problem-card.active { transform: translateY(-2px); }
        .cap-card { transition: transform 0.15s; }
        .cap-card:hover { transform: translateY(-2px); }
        .wa-btn { transition: transform 0.15s, opacity 0.15s; }
        .wa-btn:hover { transform: translateY(-2px); opacity: 0.92; }
        .wa-btn:active { transform: scale(0.97); }
        .portfolio-btn { transition: transform 0.15s, opacity 0.15s; }
        .portfolio-btn:hover { transform: translateY(-1px); opacity: 0.8; }
        .toggle-btn { cursor: pointer; border: none; background: none; transition: opacity 0.15s; }
        .toggle-btn:hover { opacity: 0.7; }
        .reveal { opacity: 0; transform: translateY(18px); transition: opacity 0.5s, transform 0.5s; }
        .reveal.shown { opacity: 1; transform: none; }
        .tag-pill { font-size: 11px; font-weight: 600; letter-spacing: 0.04em; padding: 3px 10px; border-radius: 99px; }
        .demo-enter { animation: slideDown 0.3s ease; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: none; } }
        .blink { animation: blink 1.2s step-end infinite; }
        @keyframes blink { 50% { opacity: 0; } }
        a { color: inherit; }
        .ticker-wrap { overflow: hidden; white-space: nowrap; }
        .ticker { display: inline-block; animation: ticker 18s linear infinite; }
        @keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }
      `}</style>

      {/* Nav */}
      <nav
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 28px",
          borderBottom: `1px solid ${t.border}`,
          background: t.bg,
          position: "sticky",
          top: 0,
          zIndex: 100,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img
            src="/fixlogo.jpeg"
            alt="EL Vision Fix AI"
            style={{
              height: 36,
              width: "auto",
              borderRadius: 8,
              display: "block",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <a
            href="https://dev.elvisiongroup.com"
            target="_blank"
            rel="noreferrer"
            className="portfolio-btn"
            style={{
              fontSize: 13,
              color: t.accent,
              textDecoration: "none",
              fontWeight: 600,
              border: `1px solid ${dark ? "rgba(79,123,247,0.35)" : "rgba(43,92,230,0.25)"}`,
              borderRadius: 8,
              padding: "6px 14px",
              background: dark ? "rgba(79,123,247,0.08)" : "rgba(43,92,230,0.06)",
              letterSpacing: "0.01em",
            }}
          >
            Our Portfolio
          </a>
          <button
            className="toggle-btn"
            onClick={() => setDark((d) => !d)}
            aria-label="Toggle dark/light"
            style={{
              width: 36,
              height: 20,
              borderRadius: 10,
              background: dark ? "#4F7BF7" : "#DDD",
              position: "relative",
              transition: "background 0.25s",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 3,
                left: dark ? 18 : 3,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#fff",
                transition: "left 0.25s",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Ticker */}
      <div
        style={{
          borderBottom: `1px solid ${t.border}`,
          padding: "10px 0",
          overflow: "hidden",
        }}
        className="ticker-wrap"
      >
        <div className="ticker" style={{ color: t.muted, fontSize: 12, fontWeight: 500 }}>
          {[
            "Meta Ads Optimization",
            "Auto Creative Generation",
            "Conversion API Fix",
            "24/7 AI Lead Response",
            "WhatsApp Automation",
            "Comment Auto-Reply",
            "ROAS Recovery",
            "Missed Call AI",
          ]
            .concat([
              "Meta Ads Optimization",
              "Auto Creative Generation",
              "Conversion API Fix",
              "24/7 AI Lead Response",
              "WhatsApp Automation",
              "Comment Auto-Reply",
              "ROAS Recovery",
              "Missed Call AI",
            ])
            .map((t, i) => (
              <span key={i} style={{ marginRight: 48 }}>
                ◆ {t}
              </span>
            ))}
        </div>
      </div>

      {/* Hero */}
      <section
        style={{
          maxWidth: 860,
          margin: "0 auto",
          padding: "80px 28px 60px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
            background: dark ? "rgba(79,123,247,0.12)" : "rgba(43,92,230,0.08)",
            border: `1px solid ${dark ? "rgba(79,123,247,0.3)" : "rgba(43,92,230,0.2)"}`,
            borderRadius: 99,
            padding: "5px 16px",
            fontSize: 12,
            fontWeight: 600,
            color: t.accent,
            marginBottom: 28,
            letterSpacing: "0.05em",
          }}
        >
          <span
            className="blink"
            style={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: t.accent,
              display: "inline-block",
            }}
          />
          FREE DEMO — NO CREDIT CARD
        </div>

        <h1
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(36px, 6vw, 62px)",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
            marginBottom: 22,
            color: t.text,
          }}
        >
          Where is your business{" "}
          <span
            style={{
              color: t.accent,
              fontStyle: "italic",
            }}
          >
            leaking money?
          </span>
        </h1>

        <p
          style={{
            fontSize: 18,
            color: t.muted,
            lineHeight: 1.6,
            maxWidth: 540,
            margin: "0 auto 40px",
            fontWeight: 400,
          }}
        >
          Pick your gap below. We'll show you the exact problem — and fix it free in your demo.
        </p>

        <div
          style={{
            marginTop: 24,
            maxWidth: 520,
            margin: "24px auto 0",
            background: dark
              ? "linear-gradient(135deg, rgba(79,123,247,0.10) 0%, rgba(29,185,116,0.07) 100%)"
              : "linear-gradient(135deg, rgba(43,92,230,0.07) 0%, rgba(29,185,116,0.06) 100%)",
            border: `1.5px solid ${dark ? "rgba(79,123,247,0.22)" : "rgba(43,92,230,0.18)"}`,
            borderRadius: 16,
            padding: "20px 24px",
            textAlign: "left",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <span style={{
              fontSize: 11,
              fontWeight: 700,
              letterSpacing: "0.07em",
              color: t.accent,
              textTransform: "uppercase",
              background: dark ? "rgba(79,123,247,0.15)" : "rgba(43,92,230,0.1)",
              border: `1px solid ${dark ? "rgba(79,123,247,0.3)" : "rgba(43,92,230,0.2)"}`,
              borderRadius: 99,
              padding: "3px 10px",
            }}>
              Why Free?
            </span>
          </div>
          <p style={{ fontSize: 14, color: t.text, lineHeight: 1.75, margin: 0 }}>
            We give this demo free because we want a{" "}
            <strong style={{ color: t.accent, fontWeight: 600 }}>long-term relationship</strong>
            {" "}— not a one-time sale. We'll diagnose and fix your exact money leak at no cost.
          </p>
          <div style={{
            marginTop: 14,
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 10,
          }}>
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 8,
              background: dark ? "rgba(29,185,116,0.08)" : "rgba(29,185,116,0.06)",
              border: "1px solid rgba(29,185,116,0.2)",
              borderRadius: 10, padding: "10px 12px",
            }}>
              <span style={{ fontSize: 15, marginTop: 1 }}>✓</span>
              <span style={{ fontSize: 13, color: t.text, lineHeight: 1.5 }}>
                Satisfied? Continue working with us.
              </span>
            </div>
            <div style={{
              display: "flex", alignItems: "flex-start", gap: 8,
              background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
              border: `1px solid ${t.border}`,
              borderRadius: 10, padding: "10px 12px",
            }}>
              <span style={{ fontSize: 15, marginTop: 1 }}>↩</span>
              <span style={{ fontSize: 13, color: t.muted, lineHeight: 1.5 }}>
                Not happy? No obligation. Just walk away.
              </span>
            </div>
          </div>
        </div>
        <p
          style={{
            marginTop: 10,
            fontSize: 12,
            color: t.hint,
            letterSpacing: "0.02em",
          }}
        >
          Trusted by brands across Indonesia, Singapore & the Philippines —{" "}
          <a
            href="https://dev.elvisiongroup.com"
            target="_blank"
            rel="noreferrer"
            style={{ color: t.accent, textDecoration: "none", fontWeight: 600 }}
          >
            see our portfolio →
          </a>
        </p>
      </section>

      {/* Problem Cards */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "0 20px 20px" }}>
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            color: t.hint,
            letterSpacing: "0.08em",
            marginBottom: 24,
            textTransform: "uppercase",
          }}
        >
          Choose your biggest problem
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
            gap: 14,
          }}
        >
          {problems.map((p, i) => {
            const isActive = active === p.id;
            const isRevealed = revealed.has(p.id);
            return (
              <div
                key={p.id}
                data-reveal-id={p.id}
                ref={(el) => { cardRefs.current[p.id] = el; }}
                className={`problem-card reveal ${isRevealed ? "shown" : ""} ${isActive ? "active" : ""}`}
                style={{
                  transitionDelay: `${i * 60}ms`,
                  background: isActive ? p.bg : t.card,
                  border: `1.5px solid ${isActive ? p.border : t.border}`,
                  borderRadius: 16,
                  padding: "20px 22px",
                  cursor: "pointer",
                  boxShadow: isActive ? `0 0 0 1px ${p.border}` : "none",
                }}
                onClick={() => handleSelect(p.id)}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                  <div
                    style={{
                      width: 42,
                      height: 42,
                      borderRadius: 10,
                      background: isActive ? p.bg : dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.04)",
                      border: `1px solid ${isActive ? p.border : t.border}`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 20,
                    }}
                  >
                    {p.icon}
                  </div>
                  {p.tag && (
                    <span
                      className="tag-pill"
                      style={{
                        background: isActive ? p.bg : dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
                        color: isActive ? p.color : t.muted,
                        border: `1px solid ${isActive ? p.border : t.border}`,
                      }}
                    >
                      {p.tag}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontFamily: "'Syne', sans-serif",
                    fontWeight: 700,
                    fontSize: 15,
                    color: t.text,
                    marginBottom: 6,
                    lineHeight: 1.3,
                  }}
                >
                  {p.title}
                </div>
                <div style={{ fontSize: 13, color: t.muted, lineHeight: 1.55, marginBottom: 14 }}>
                  {p.short}
                </div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: isActive ? p.color : t.hint,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {p.stat}
                  </span>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: isActive ? p.color : t.muted,
                      display: "flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    {isActive ? "Selected ✓" : "Tap to select →"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Demo Panel */}
      <div ref={demoRef} style={{ maxWidth: 860, margin: "0 auto", padding: "20px 20px 0" }}>
        {selected ? (
          <div
            className="demo-enter"
            style={{
              background: selected.bg,
              border: `1.5px solid ${selected.border}`,
              borderRadius: 20,
              padding: "28px 32px",
              marginBottom: 28,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
              <span style={{ fontSize: 24 }}>{selected.icon}</span>
              <span
                style={{
                  fontFamily: "'Syne', sans-serif",
                  fontWeight: 800,
                  fontSize: 20,
                  color: selected.color,
                }}
              >
                {selected.title}
              </span>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16,
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  background: dark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)",
                  borderRadius: 12,
                  padding: "16px 20px",
                  border: `1px solid ${t.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    color: "#E24B4A",
                    marginBottom: 10,
                    textTransform: "uppercase",
                  }}
                >
                  ✗ Without AI — right now
                </div>
                <p style={{ fontSize: 14, color: t.muted, lineHeight: 1.65 }}>{selected.pain}</p>
              </div>
              <div
                style={{
                  background: dark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.7)",
                  borderRadius: 12,
                  padding: "16px 20px",
                  border: `1px solid ${selected.border}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: "0.07em",
                    color: "#1DB974",
                    marginBottom: 10,
                    textTransform: "uppercase",
                  }}
                >
                  ✓ With EL Vision AI
                </div>
                <p style={{ fontSize: 14, color: t.text, lineHeight: 1.65 }}>{selected.fix}</p>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <a
                href={waLink(waMsg)}
                target="_blank"
                rel="noreferrer"
                className="wa-btn"
                onClick={handleWAClick}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  background: "#25D366",
                  color: "#fff",
                  borderRadius: 10,
                  padding: "12px 24px",
                  fontSize: 14,
                  fontWeight: 700,
                  textDecoration: "none",
                  letterSpacing: "0.01em",
                }}
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="white">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Ask Free Demo — {selected.title}
              </a>
              <span
                style={{
                  fontSize: 13,
                  color: selected.color,
                  fontWeight: 700,
                  background: selected.bg,
                  border: `1px solid ${selected.border}`,
                  borderRadius: 8,
                  padding: "8px 14px",
                }}
              >
                {selected.stat}
              </span>
            </div>
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "32px 20px",
              color: t.hint,
              fontSize: 14,
              border: `1.5px dashed ${t.border}`,
              borderRadius: 16,
              marginBottom: 28,
            }}
          >
            ↑ Select a problem above to see your free demo preview
          </div>
        )}
      </div>

      {/* Capabilities */}
      <section style={{ maxWidth: 1080, margin: "0 auto", padding: "20px 20px 60px" }}>
        <p
          style={{
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            color: t.hint,
            letterSpacing: "0.08em",
            marginBottom: 20,
            textTransform: "uppercase",
          }}
        >
          More AI capabilities
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
            gap: 12,
          }}
        >
          {capabilities.map((c) => (
            <div
              key={c.label}
              className="cap-card"
              style={{
                background: t.card,
                border: `1px solid ${t.border}`,
                borderRadius: 14,
                padding: "16px 18px",
              }}
            >
              <div style={{ fontSize: 22, marginBottom: 10 }}>{c.icon}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: t.text, marginBottom: 4 }}>
                {c.label}
              </div>
              <div style={{ fontSize: 12, color: t.muted, lineHeight: 1.45 }}>{c.sub}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section
        style={{
          borderTop: `1px solid ${t.border}`,
          background: t.surface,
          padding: "60px 28px",
          textAlign: "center",
        }}
      >
        <h2
          style={{
            fontFamily: "'Syne', sans-serif",
            fontWeight: 800,
            fontSize: "clamp(26px, 4vw, 42px)",
            letterSpacing: "-0.03em",
            marginBottom: 14,
            color: t.text,
          }}
        >
          Ready to stop the leak?
        </h2>
        <p style={{ fontSize: 16, color: t.muted, marginBottom: 32 }}>
          Chat with us on WhatsApp — tell us your problem, we fix it. Free.
        </p>
        <a
          href={waLink("Halo EL Vision AI! Saya mau Free Demo untuk bisnis saya. Tolong bantu diagnosa kebocoran bisnis saya.")}
          target="_blank"
          rel="noreferrer"
          className="wa-btn"
          onClick={handleWAClick}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: "#25D366",
            color: "#fff",
            borderRadius: 14,
            padding: "17px 36px",
            fontSize: 16,
            fontWeight: 700,
            textDecoration: "none",
          }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
          </svg>
          Start Free Demo on WhatsApp
        </a>
      </section>

      {/* Footer */}
      <footer
        style={{
          borderTop: `1px solid ${t.border}`,
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <span style={{ fontSize: 13, color: t.hint }}>© 2026 EL Vision AI</span>
      </footer>
    </div>
  );
}
