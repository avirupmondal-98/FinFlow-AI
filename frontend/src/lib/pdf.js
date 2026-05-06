import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { inr } from "./format";

// Brand palette
const C = {
  blue: [37, 99, 235],
  teal: [20, 184, 166],
  emerald: [16, 185, 129],
  amber: [245, 158, 11],
  rose: [244, 63, 94],
  ink: [15, 23, 42],
  slate: [71, 85, 105],
  muted: [148, 163, 184],
  paper: [248, 250, 252],
  card: [255, 255, 255],
  border: [226, 232, 240],
};

const PAGE_W = 595.28; // A4 in pt
const PAGE_H = 841.89;
const MARGIN = 36;
const CONTENT_W = PAGE_W - MARGIN * 2;

// ---------- helpers ----------
function setFill(doc, rgb) { doc.setFillColor(rgb[0], rgb[1], rgb[2]); }
function setText(doc, rgb) { doc.setTextColor(rgb[0], rgb[1], rgb[2]); }
function setDraw(doc, rgb) { doc.setDrawColor(rgb[0], rgb[1], rgb[2]); }

async function captureElement(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  try {
    const canvas = await html2canvas(el, {
      backgroundColor: null,
      scale: 2,
      logging: false,
      useCORS: true,
      allowTaint: true,
    });
    return {
      data: canvas.toDataURL("image/jpeg", 0.92),
      w: canvas.width,
      h: canvas.height,
    };
  } catch (err) {
    console.warn(`Failed to capture #${id}`, err);
    return null;
  }
}

function ensureSpace(doc, ctx, needed) {
  if (ctx.y + needed > PAGE_H - MARGIN - 30) {
    addFooter(doc, ctx);
    doc.addPage();
    ctx.page += 1;
    ctx.y = MARGIN + 20;
    addPageBackground(doc);
  }
}

function addPageBackground(doc) {
  setFill(doc, C.paper);
  doc.rect(0, 0, PAGE_W, PAGE_H, "F");
}

// ---------- sections ----------
function drawHeader(doc, ctx, plan) {
  // Gradient-feel band: stack two colored rects
  setFill(doc, C.blue);
  doc.rect(0, 0, PAGE_W, 110, "F");
  setFill(doc, C.teal);
  doc.rect(PAGE_W * 0.55, 0, PAGE_W * 0.45, 110, "F");
  // Diagonal accent
  setFill(doc, [255, 255, 255]);
  doc.setGState && doc.setGState(new doc.GState({ opacity: 0.15 }));
  doc.triangle(PAGE_W * 0.4, 0, PAGE_W * 0.7, 0, PAGE_W * 0.55, 110, "F");
  doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));

  setText(doc, [255, 255, 255]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.text("FinFlow AI", MARGIN, 48);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text("Your Smart Partner in Financial Growth", MARGIN, 66);

  doc.setFontSize(9);
  const meta = `Generated ${new Date(plan.created_at).toLocaleString("en-IN")}  •  Model: GPT-5.2  •  Language: ${plan.language === "hi" ? "Hindi" : "English"}`;
  doc.text(meta, MARGIN, 92);

  ctx.y = 140;
}

function drawSectionTitle(doc, ctx, label, accent = C.blue) {
  ensureSpace(doc, ctx, 36);
  setFill(doc, accent);
  doc.roundedRect(MARGIN, ctx.y, 4, 18, 2, 2, "F");
  setText(doc, C.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text(label, MARGIN + 12, ctx.y + 13);
  ctx.y += 28;
}

function drawSnapshotBoxes(doc, ctx, plan) {
  drawSectionTitle(doc, ctx, "Snapshot");
  const cards = [
    { label: "Total Income", value: inr(plan.total_income), color: C.blue },
    { label: "Total Expenses", value: inr(plan.total_expenses), color: C.rose },
    { label: "Monthly Savings", value: inr(plan.monthly_savings), color: C.emerald },
    { label: "Savings Rate", value: `${plan.savings_rate}%`, color: C.teal },
  ];
  const gap = 8;
  const w = (CONTENT_W - gap * 3) / 4;
  const h = 64;
  ensureSpace(doc, ctx, h + 8);
  cards.forEach((c, i) => {
    const x = MARGIN + i * (w + gap);
    // shadow
    setFill(doc, [0, 0, 0]);
    doc.setGState && doc.setGState(new doc.GState({ opacity: 0.04 }));
    doc.roundedRect(x, ctx.y + 3, w, h, 10, 10, "F");
    doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));
    // body
    setFill(doc, C.card);
    doc.roundedRect(x, ctx.y, w, h, 10, 10, "F");
    setDraw(doc, C.border);
    doc.setLineWidth(0.5);
    doc.roundedRect(x, ctx.y, w, h, 10, 10, "S");
    // accent dot
    setFill(doc, c.color);
    doc.circle(x + 12, ctx.y + 14, 4, "F");
    // label
    setText(doc, C.muted);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7.5);
    doc.text(c.label.toUpperCase(), x + 22, ctx.y + 17);
    // value
    setText(doc, C.ink);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.text(c.value, x + 12, ctx.y + 44);
  });
  ctx.y += h + 12;
}

function drawHealthRow(doc, ctx, plan, healthImg) {
  drawSectionTitle(doc, ctx, "Financial Health Score", C.teal);
  const rowH = 130;
  ensureSpace(doc, ctx, rowH + 8);
  // card
  setFill(doc, C.card);
  doc.roundedRect(MARGIN, ctx.y, CONTENT_W, rowH, 12, 12, "F");
  setDraw(doc, C.border);
  doc.roundedRect(MARGIN, ctx.y, CONTENT_W, rowH, 12, 12, "S");

  // Left: embed health card screenshot (if captured), else draw native ring
  const leftW = 170;
  if (healthImg) {
    const targetH = rowH - 20;
    const targetW = (healthImg.w / healthImg.h) * targetH;
    const fitW = Math.min(targetW, leftW - 16);
    const fitH = (healthImg.h / healthImg.w) * fitW;
    doc.addImage(healthImg.data, "JPEG", MARGIN + 8, ctx.y + (rowH - fitH) / 2, fitW, fitH, undefined, "FAST");
  } else {
    drawNativeRing(doc, MARGIN + 50, ctx.y + rowH / 2, 40, plan.financial_health_score);
  }

  // Right: numbers
  const rx = MARGIN + leftW + 8;
  setText(doc, C.muted);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.text("SCORE", rx, ctx.y + 24);
  setText(doc, C.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(36);
  doc.text(`${plan.financial_health_score}`, rx, ctx.y + 64);
  doc.setFontSize(10);
  setText(doc, scoreColor(plan.financial_health_score));
  doc.text(plan.health_label.toUpperCase(), rx, ctx.y + 82);
  // Sub: net worth quick line
  setText(doc, C.slate);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const lines = [
    `Monthly net flow: ${inr(plan.monthly_savings)} (${plan.savings_rate}%)`,
    `Income: ${inr(plan.total_income)}  •  Expenses: ${inr(plan.total_expenses)}`,
  ];
  doc.text(lines, rx, ctx.y + 100);

  ctx.y += rowH + 14;
}

function scoreColor(score) {
  if (score >= 70) return C.emerald;
  if (score >= 50) return C.amber;
  return C.rose;
}

function drawNativeRing(doc, cx, cy, r, score) {
  const safe = Math.max(0, Math.min(100, score));
  // bg ring
  setDraw(doc, [226, 232, 240]);
  doc.setLineWidth(8);
  doc.circle(cx, cy, r, "S");
  // We can't easily draw an arc with jsPDF without bezier — emulate with short
  // line segments around the arc.
  setDraw(doc, scoreColor(safe));
  const segments = 60;
  const span = (safe / 100) * 2 * Math.PI;
  let prevX = cx + r * Math.cos(-Math.PI / 2);
  let prevY = cy + r * Math.sin(-Math.PI / 2);
  for (let i = 1; i <= segments; i += 1) {
    const a = -Math.PI / 2 + (span * i) / segments;
    const x = cx + r * Math.cos(a);
    const y = cy + r * Math.sin(a);
    doc.line(prevX, prevY, x, y);
    prevX = x;
    prevY = y;
  }
  // Score text in center
  setText(doc, C.ink);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(`${safe}`, cx, cy + 6, { align: "center" });
}

function drawSummary(doc, ctx, plan) {
  if (!plan.ai_summary) return;
  drawSectionTitle(doc, ctx, "AI Summary", C.blue);
  setFill(doc, [239, 246, 255]);
  setDraw(doc, [186, 219, 255]);
  const lines = doc.splitTextToSize(plan.ai_summary, CONTENT_W - 24);
  const h = lines.length * 13 + 22;
  ensureSpace(doc, ctx, h + 6);
  doc.roundedRect(MARGIN, ctx.y, CONTENT_W, h, 10, 10, "FD");
  setText(doc, C.ink);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(lines, MARGIN + 12, ctx.y + 16);
  ctx.y += h + 10;
}

function drawGoalsTable(doc, ctx, plan, goalsImg) {
  if (!plan.goal_timeline?.length) return;
  drawSectionTitle(doc, ctx, "Goal Timeline", C.emerald);

  // If we managed to capture the live timeline, embed it right away.
  if (goalsImg) {
    const targetW = CONTENT_W;
    const targetH = (goalsImg.h / goalsImg.w) * targetW;
    const capped = Math.min(targetH, 260);
    const finalW = (goalsImg.w / goalsImg.h) * capped;
    const drawW = Math.min(finalW, CONTENT_W);
    const drawH = (goalsImg.h / goalsImg.w) * drawW;
    ensureSpace(doc, ctx, drawH + 10);
    doc.addImage(goalsImg.data, "JPEG", MARGIN, ctx.y, drawW, drawH, undefined, "FAST");
    ctx.y += drawH + 16;
    return;
  }

  // Fallback: build a colored table
  const colWidths = [180, 90, 90, 110, 70];
  const headers = ["Goal", "Target", "Per month", "Months", "Status"];
  // header row
  ensureSpace(doc, ctx, 26);
  setFill(doc, C.ink);
  doc.roundedRect(MARGIN, ctx.y, CONTENT_W, 22, 6, 6, "F");
  setText(doc, [255, 255, 255]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  let cx = MARGIN + 10;
  headers.forEach((h, i) => {
    doc.text(h.toUpperCase(), cx, ctx.y + 14);
    cx += colWidths[i];
  });
  ctx.y += 24;

  plan.goal_timeline.forEach((g, idx) => {
    ensureSpace(doc, ctx, 26);
    if (idx % 2 === 0) {
      setFill(doc, [248, 250, 252]);
      doc.rect(MARGIN, ctx.y, CONTENT_W, 22, "F");
    }
    setText(doc, C.ink);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    let x = MARGIN + 10;
    doc.text(g.name, x, ctx.y + 14);
    x += colWidths[0];
    doc.setFont("helvetica", "normal");
    doc.text(inr(g.target_amount), x, ctx.y + 14);
    x += colWidths[1];
    doc.text(inr(g.monthly_contribution), x, ctx.y + 14);
    x += colWidths[2];
    doc.text(`${g.months_to_achieve} mo`, x, ctx.y + 14);
    x += colWidths[3];
    // pill
    const pillColor = g.on_track ? C.emerald : C.amber;
    setFill(doc, pillColor);
    doc.roundedRect(x, ctx.y + 4, 60, 14, 7, 7, "F");
    setText(doc, [255, 255, 255]);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(7);
    doc.text(g.on_track ? "ON TRACK" : "NEEDS PUSH", x + 30, ctx.y + 13, { align: "center" });
    ctx.y += 22;
  });
  ctx.y += 12;
}

function drawChecklist(doc, ctx, plan) {
  if (!plan.monthly_action_checklist?.length) return;
  drawSectionTitle(doc, ctx, "Monthly Action Checklist", C.amber);
  plan.monthly_action_checklist.forEach((item) => {
    ensureSpace(doc, ctx, 22);
    // Strip leading emoji to keep helvetica happy (helvetica doesn't render emoji).
    const cleaned = item.replace(/^[^\w]+/u, "").trim() || item;
    // bullet circle
    setFill(doc, C.teal);
    doc.circle(MARGIN + 6, ctx.y + 7, 3, "F");
    setText(doc, C.ink);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const lines = doc.splitTextToSize(cleaned, CONTENT_W - 24);
    doc.text(lines, MARGIN + 16, ctx.y + 10);
    ctx.y += lines.length * 12 + 6;
  });
  ctx.y += 6;
}

function drawPlanBody(doc, ctx, plan) {
  if (!plan.ai_plan_markdown) return;
  drawSectionTitle(doc, ctx, "Detailed Plan", C.blue);
  const lines = plan.ai_plan_markdown.split(/\r?\n/);
  lines.forEach((raw) => {
    const line = raw.trim();
    if (!line) {
      ctx.y += 6;
      return;
    }
    if (line.startsWith("## ")) {
      ensureSpace(doc, ctx, 24);
      setText(doc, C.blue);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(12);
      doc.text(line.slice(3), MARGIN, ctx.y + 10);
      ctx.y += 18;
      return;
    }
    if (line.startsWith("### ")) {
      ensureSpace(doc, ctx, 20);
      setText(doc, C.ink);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10.5);
      doc.text(line.slice(4), MARGIN, ctx.y + 10);
      ctx.y += 16;
      return;
    }
    let text = line;
    let bullet = false;
    if (text.startsWith("- ") || text.startsWith("* ")) {
      bullet = true;
      text = text.slice(2);
    }
    text = text.replace(/\*\*(.+?)\*\*/g, "$1");
    setText(doc, C.slate);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    const wrapped = doc.splitTextToSize(text, CONTENT_W - (bullet ? 18 : 0));
    ensureSpace(doc, ctx, wrapped.length * 13 + 4);
    if (bullet) {
      setFill(doc, C.teal);
      doc.circle(MARGIN + 4, ctx.y + 7, 1.6, "F");
      doc.text(wrapped, MARGIN + 14, ctx.y + 10);
    } else {
      doc.text(wrapped, MARGIN, ctx.y + 10);
    }
    ctx.y += wrapped.length * 13 + 4;
  });
}

function drawProTip(doc, ctx, plan) {
  if (!plan.pro_tip) return;
  ensureSpace(doc, ctx, 56);
  // gradient feel: two side-by-side rects
  setFill(doc, C.amber);
  doc.roundedRect(MARGIN, ctx.y, CONTENT_W, 50, 12, 12, "F");
  setFill(doc, C.teal);
  doc.roundedRect(MARGIN + CONTENT_W * 0.55, ctx.y, CONTENT_W * 0.45, 50, 12, 12, "F");
  // curtain mask
  setFill(doc, [255, 255, 255]);
  doc.setGState && doc.setGState(new doc.GState({ opacity: 0.15 }));
  doc.roundedRect(MARGIN, ctx.y, CONTENT_W, 50, 12, 12, "F");
  doc.setGState && doc.setGState(new doc.GState({ opacity: 1 }));
  setText(doc, [255, 255, 255]);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.5);
  doc.text("PRO TIP OF THE DAY", MARGIN + 14, ctx.y + 18);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  const tipLines = doc.splitTextToSize(plan.pro_tip, CONTENT_W - 28);
  doc.text(tipLines, MARGIN + 14, ctx.y + 34);
  ctx.y += 60;
}

function drawDisclaimer(doc, ctx) {
  ensureSpace(doc, ctx, 60);
  const text =
    "Disclaimer: FinFlow AI provides AI-generated financial guidance for informational purposes only. " +
    "It does not constitute financial, investment, or legal advice. Consult a certified financial " +
    "advisor before making decisions. © 2026 FinFlow AI. All Rights Reserved.";
  setText(doc, C.muted);
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7.5);
  const lines = doc.splitTextToSize(text, CONTENT_W);
  doc.text(lines, MARGIN, ctx.y + 8);
  ctx.y += lines.length * 10 + 6;
}

function addFooter(doc, ctx) {
  setDraw(doc, C.border);
  doc.setLineWidth(0.5);
  doc.line(MARGIN, PAGE_H - 30, PAGE_W - MARGIN, PAGE_H - 30);
  setText(doc, C.muted);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(8);
  doc.text("FinFlow AI — Your Smart Partner in Financial Growth", MARGIN, PAGE_H - 16);
  doc.text(`Page ${ctx.page}`, PAGE_W - MARGIN, PAGE_H - 16, { align: "right" });
}

// ---------- public ----------
export async function exportPlanPdf(plan) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const ctx = { y: 0, page: 1 };

  addPageBackground(doc);

  // Capture dashboard pieces (run in parallel for speed).
  const [statImg, healthImg, goalsImg] = await Promise.all([
    captureElement("pdf-stat-grid"),
    captureElement("pdf-health-card"),
    captureElement("pdf-goal-timeline"),
  ]);

  drawHeader(doc, ctx, plan);
  drawSnapshotBoxes(doc, ctx, plan);

  // Stat grid screenshot — embed as a "Live Dashboard" visual
  if (statImg) {
    drawSectionTitle(doc, ctx, "Live Dashboard", C.blue);
    const drawW = CONTENT_W;
    const drawH = (statImg.h / statImg.w) * drawW;
    const cappedH = Math.min(drawH, 140);
    const finalW = (statImg.w / statImg.h) * cappedH;
    const fitW = Math.min(finalW, CONTENT_W);
    const fitH = (statImg.h / statImg.w) * fitW;
    ensureSpace(doc, ctx, fitH + 10);
    doc.addImage(statImg.data, "JPEG", MARGIN, ctx.y, fitW, fitH, undefined, "FAST");
    ctx.y += fitH + 14;
  }

  drawHealthRow(doc, ctx, plan, healthImg);
  drawSummary(doc, ctx, plan);
  drawProTip(doc, ctx, plan);
  drawGoalsTable(doc, ctx, plan, goalsImg);
  drawChecklist(doc, ctx, plan);
  drawPlanBody(doc, ctx, plan);
  drawDisclaimer(doc, ctx);

  // Footer on every page
  const total = doc.getNumberOfPages();
  for (let p = 1; p <= total; p += 1) {
    doc.setPage(p);
    addFooter(doc, { page: p });
  }

  doc.save(`FinFlow-Plan-${plan.id.slice(0, 8)}.pdf`);
}
