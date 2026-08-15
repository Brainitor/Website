(function () {
  "use strict";

  const ASSET_BASE = "assets/generated";
  const CSR_INTER_STIMULUS_MS = 500;

  const protocols = {
    mdt: {
      code: "MDT-OS",
      name: "Snapshot",
      construct: "Memory precision and pattern separation",
      claim: "Participants distinguish exact repeats from subtly changed objects and scenes, localizing a change directly on the image when one is present.",
      blueprint: [
        ["01", "Phase 1: one-back", "One pair of images per trial."],
        ["02", "Protocol set", "64 pairs total; half repeats and half similar lures."],
        ["03", "Delay", "24 hours in most cohorts; two weeks in one continuous cohort."],
        ["04", "Phase 2: two-back", "Two interleaved image pairs per trial; independent from phase 1."],
      ],
      evidence: [
        ["paper", "Objects and scenes are followed by either an identical repeat or a similar lure."],
        ["paper", "A response is either “nothing changed” or a tap on the changed image region."],
        ["paper", "Parallel task versions prevent stimulus repetition."],
        ["assumption", "The demo uses four one-back pairs and two two-back pairs. Protocol timing uses the supplied mapping; exact trial timing is not reported in the main paper."],
        ["assumption", "AI-generated modular stimuli and rectangular hit regions are for interaction review only."],
      ],
      formula: "CHR(domain) = P(identical | repeat) - P(identical | lure)",
      scoreIntro: "The attached mapping specifies corrected hit rate by domain. A lure tap is correct only when it lands in the predefined change region.",
    },
    orr: {
      code: "ORR",
      name: "Room Recall",
      construct: "Associative memory and pattern completion",
      claim: "Participants learn two object-location associations in each room, then choose the object that occupied a cued location during immediate and delayed recall.",
      blueprint: [
        ["01", "Encoding", "25 rooms, each containing two objects."],
        ["02", "Immediate recall", "Empty room, one cued location, and three object choices."],
        ["03", "Delay", "30 minutes, 90 minutes, or 24 hours depending on cohort and session."],
        ["04", "Delayed recall", "The immediate recall procedure is repeated."],
      ],
      evidence: [
        ["paper", "Each encoded room contains two objects."],
        ["paper", "Choices are target, same-room wrong-location lure, and unfamiliar lure."],
        ["paper", "Delayed recall is identical to immediate recall."],
        ["assumption", "This demo configures a 24-hour target delay and uses three rooms."],
        ["assumption", "Five-second exposure and 15-second recall windows come from the supplied protocol mapping, not the main paper."],
      ],
      formula: "Mean accuracy = (immediate accuracy + delayed accuracy) / 2",
      scoreIntro: "Accuracy is paired with error typing: a same-room lure suggests a location-binding error, while a different-room lure suggests a broader associative error.",
    },
    csr: {
      code: "CSR",
      name: "Scene Memory",
      construct: "Familiarity-dependent recognition memory",
      claim: "Participants make an inside/outside judgment for scenes during encoding, then classify old and new scenes as seen, not seen, or unsure after a delay.",
      blueprint: [
        ["01", "Encoding", "60 photographic scenes with an inside/outside judgment."],
        ["02", "Delay", "Recognition unlocks after 65 minutes."],
        ["03", "Recognition", "60 encoded scenes intermixed with 30 new scenes."],
        ["04", "Response", "Yes, no, or unsure; order is randomized."],
      ],
      evidence: [
        ["paper", "Encoding contains 60 photographic scenes."],
        ["paper", "Recognition adds 30 new scenes after a 65-minute delay."],
        ["paper", "The response set is seen before, not seen, or unsure."],
        ["assumption", "The demo uses six encoded scenes plus three new scenes."],
        ["assumption", "A 500 ms neutral interval between scenes is an implementation choice; the paper does not specify an inter-image interval."],
        ["assumption", "AI-generated scenes stand in for a licensed, psychometrically matched photographic stimulus library."],
      ],
      formula: "CHR = P(yes | old) - P(yes | new)",
      scoreIntro: "The attached mapping specifies a corrected hit rate. “Unsure” is logged as its own response and never counted as “yes.”",
    },
  };

  const mdtPhase1 = [
    { id: "mdt-o-01", domain: "object", kind: "chair", condition: "repeat", changeBox: null },
    { id: "mdt-s-02", domain: "scene", kind: "studio", condition: "lure", changeBox: { x: 0.18, y: 0.46, w: 0.45, h: 0.46 } },
    { id: "mdt-o-03", domain: "object", kind: "lamp", condition: "lure", changeBox: { x: 0.35, y: 0.14, w: 0.3, h: 0.21 } },
    { id: "mdt-s-04", domain: "scene", kind: "lounge", condition: "repeat", changeBox: null },
  ];

  const mdtPhase2 = [
    { id: "mdt-o-05", domain: "object", kind: "cabinet", condition: "lure", changeBox: { x: 0.43, y: 0.38, w: 0.15, h: 0.2 } },
    { id: "mdt-s-06", domain: "scene", kind: "dining", condition: "repeat", changeBox: null },
  ];

  const rooms = [
    { id: "room-01", room: "sand", target: "lamp", other: "chair", incorrect: "plant", probe: { x: 0.25, y: 0.68 } },
    { id: "room-02", room: "sage", target: "plant", other: "table", incorrect: "clock", probe: { x: 0.72, y: 0.65 } },
    { id: "room-03", room: "blue", target: "clock", other: "stool", incorrect: "lamp", probe: { x: 0.49, y: 0.2 } },
  ];

  const csrEncoded = [
    { id: "scene-01", kind: "lake", category: "outside", role: "old" },
    { id: "scene-02", kind: "kitchen", category: "inside", role: "old" },
    { id: "scene-03", kind: "terrace", category: "outside", role: "old" },
    { id: "scene-04", kind: "study", category: "inside", role: "old" },
    { id: "scene-05", kind: "garden", category: "outside", role: "old" },
    { id: "scene-06", kind: "gallery", category: "inside", role: "old" },
  ];

  const csrRecognition = [
    csrEncoded[3],
    { id: "scene-07", kind: "hall", category: "inside", role: "new" },
    csrEncoded[0],
    csrEncoded[5],
    { id: "scene-08", kind: "cliffs", category: "outside", role: "new" },
    csrEncoded[1],
    csrEncoded[4],
    { id: "scene-09", kind: "bedroom", category: "inside", role: "new" },
    csrEncoded[2],
  ];

  const generatedAssetPaths = [
    ...["chair", "lamp", "cabinet", "plant", "table", "clock", "stool"].map((name) => `${ASSET_BASE}/objects/${name}.png`),
    ...["warm-cream", "soft-sage", "blue-gray"].map((name) => `${ASSET_BASE}/rooms/${name}.jpg`),
    ...["lake", "kitchen", "terrace", "study", "garden", "gallery", "hall", "cliffs", "bedroom"].map((name) => `${ASSET_BASE}/scenes/${name}.jpg`),
  ];

  const generatedAssetsReady = Promise.all(generatedAssetPaths.map((src) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => resolve({ src, loaded: true });
    image.onerror = () => resolve({ src, loaded: false });
    image.src = src;
  })));

  const state = {
    protocol: "mdt",
    screen: "intro",
    reviewerMode: false,
    events: [],
    timers: [],
    onset: 0,
    phase: 1,
    index: 0,
    subIndex: 0,
    survey: { distraction: null, concentration: null },
    mdtResponses: [],
    orrResponses: { immediate: [], delayed: [] },
    csrResponses: [],
  };

  const dom = {
    root: document.getElementById("game-root"),
    phaseLabel: document.getElementById("phase-label"),
    progressBar: document.getElementById("progress-bar"),
    reviewerMode: document.getElementById("reviewer-mode"),
    reviewerBanner: document.getElementById("reviewer-banner"),
    protocolSummary: document.getElementById("protocol-summary"),
    scoreSummary: document.getElementById("score-summary"),
    eventLog: document.getElementById("event-log"),
    eventCount: document.getElementById("event-count"),
    toast: document.getElementById("toast"),
    reviewDialog: document.getElementById("review-dialog"),
    openReviewGuide: document.getElementById("open-review-guide"),
    closeReviewGuide: document.getElementById("close-review-guide"),
    startScientificReview: document.getElementById("start-scientific-review"),
  };

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function clearTimers() {
    state.timers.forEach(window.clearTimeout);
    state.timers = [];
  }

  function after(milliseconds, callback) {
    const timer = window.setTimeout(callback, milliseconds);
    state.timers.push(timer);
    return timer;
  }

  function setHeader(label, progress) {
    dom.phaseLabel.textContent = label;
    dom.progressBar.style.width = `${Math.max(0, Math.min(100, progress))}%`;
  }

  function setScreen(html, label, progress) {
    clearTimers();
    setHeader(label, progress);
    dom.root.innerHTML = html;
  }

  function listen(selector, eventName, callback) {
    const element = dom.root.querySelector(selector);
    if (element) element.addEventListener(eventName, callback);
    return element;
  }

  function showToast(message) {
    dom.toast.textContent = message;
    dom.toast.classList.add("is-visible");
    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => dom.toast.classList.remove("is-visible"), 2600);
  }

  function openReviewGuide() {
    if (!dom.reviewDialog.open) dom.reviewDialog.showModal();
  }

  function closeReviewGuide() {
    if (dom.reviewDialog.open) dom.reviewDialog.close();
  }

  function nowLabel() {
    return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }

  function logEvent(type, payload = {}) {
    state.events.push({ type, payload, time: nowLabel() });
    renderEvents();
  }

  function captureSessionContext() {
    return {
      screen_css_px: { width: window.innerWidth, height: window.innerHeight },
      device_pixel_ratio: window.devicePixelRatio,
      user_agent: navigator.userAgent,
      local_time: new Date().toISOString(),
      tz: Intl.DateTimeFormat().resolvedOptions().timeZone,
    };
  }

  function renderEvents() {
    dom.eventCount.textContent = state.events.length;
    if (!state.events.length) {
      dom.eventLog.innerHTML = '<li class="empty-event">Start the protocol to see trial events.</li>';
      return;
    }

    dom.eventLog.innerHTML = state.events
      .slice()
      .reverse()
      .map((event) => `
        <li>
          <div class="event-title"><span>${escapeHtml(event.type)}</span><span class="event-time">${escapeHtml(event.time)}</span></div>
          <code class="event-data">${escapeHtml(JSON.stringify(event.payload))}</code>
        </li>
      `)
      .join("");
  }

  function renderProtocolInspector() {
    const item = protocols[state.protocol];
    dom.protocolSummary.innerHTML = `
      <div class="protocol-title-row">
        <div>
          <h3>${item.name}</h3>
          <p>${item.construct}</p>
        </div>
        <span class="protocol-code">${item.code}</span>
      </div>
      <p class="protocol-claim">${item.claim}</p>
      <p class="section-label">Full-session blueprint</p>
      <dl class="blueprint">
        ${item.blueprint.map(([number, title, description]) => `
          <div class="blueprint-row">
            <dt>${number}</dt>
            <dd><strong>${title}</strong><span>${description}</span></dd>
          </div>
        `).join("")}
      </dl>
      <p class="section-label">Provenance check</p>
      <ul class="evidence-list">
        ${item.evidence.map(([type, text]) => `
          <li><span class="evidence-tag ${type}">${type === "paper" ? "PAPER" : "DEMO"}</span><span>${text}</span></li>
        `).join("")}
      </ul>
    `;
  }

  function percentage(value) {
    return Number.isFinite(value) ? `${Math.round(value * 100)}%` : "Pending";
  }

  function signed(value) {
    return Number.isFinite(value) ? `${value >= 0 ? "+" : ""}${value.toFixed(2)}` : "Pending";
  }

  function calculateMdt() {
    const output = {};
    ["object", "scene"].forEach((domain) => {
      const rows = state.mdtResponses.filter((row) => row.domain === domain);
      const repeats = rows.filter((row) => row.condition === "repeat");
      const lures = rows.filter((row) => row.condition === "lure");
      const pRepeat = repeats.length ? repeats.filter((row) => row.response === "identical").length / repeats.length : NaN;
      const pLure = lures.length ? lures.filter((row) => row.response === "identical").length / lures.length : NaN;
      output[domain] = { pRepeat, pLure, chr: pRepeat - pLure };
    });
    return output;
  }

  function calculateOrr() {
    const accuracy = (rows) => rows.length ? rows.filter((row) => row.role === "target").length / rows.length : NaN;
    const immediate = accuracy(state.orrResponses.immediate);
    const delayed = accuracy(state.orrResponses.delayed);
    const allRows = [...state.orrResponses.immediate, ...state.orrResponses.delayed];
    return {
      immediate,
      delayed,
      mean: Number.isFinite(immediate) && Number.isFinite(delayed) ? (immediate + delayed) / 2 : NaN,
      correctSourceErrors: allRows.filter((row) => row.role === "correct_source").length,
      incorrectSourceErrors: allRows.filter((row) => row.role === "incorrect_source").length,
    };
  }

  function calculateCsr() {
    const oldRows = state.csrResponses.filter((row) => row.role === "old");
    const newRows = state.csrResponses.filter((row) => row.role === "new");
    const pOldYes = oldRows.length ? oldRows.filter((row) => row.response === "yes").length / oldRows.length : NaN;
    const pNewYes = newRows.length ? newRows.filter((row) => row.response === "yes").length / newRows.length : NaN;
    return { pOldYes, pNewYes, chr: pOldYes - pNewYes, unsure: state.csrResponses.filter((row) => row.response === "unsure").length };
  }

  function renderScoreInspector() {
    const item = protocols[state.protocol];
    let rows = "";

    if (state.protocol === "mdt") {
      const score = calculateMdt();
      rows = `
        <div class="score-row"><span>Object corrected hit rate</span><strong>${signed(score.object.chr)}</strong></div>
        <div class="score-row"><span>Scene corrected hit rate</span><strong>${signed(score.scene.chr)}</strong></div>
        <div class="score-row"><span>Responses logged</span><strong>${state.mdtResponses.length} / 6 demo</strong></div>
      `;
    } else if (state.protocol === "orr") {
      const score = calculateOrr();
      rows = `
        <div class="score-row"><span>Immediate accuracy</span><strong>${percentage(score.immediate)}</strong></div>
        <div class="score-row"><span>Delayed accuracy</span><strong>${percentage(score.delayed)}</strong></div>
        <div class="score-row"><span>Mean accuracy</span><strong>${percentage(score.mean)}</strong></div>
        <div class="score-row"><span>Same-room lure selections</span><strong>${score.correctSourceErrors}</strong></div>
        <div class="score-row"><span>Different-room lure selections</span><strong>${score.incorrectSourceErrors}</strong></div>
      `;
    } else {
      const score = calculateCsr();
      rows = `
        <div class="score-row"><span>Yes rate for old scenes</span><strong>${percentage(score.pOldYes)}</strong></div>
        <div class="score-row"><span>Yes rate for new scenes</span><strong>${percentage(score.pNewYes)}</strong></div>
        <div class="score-row"><span>Corrected hit rate</span><strong>${signed(score.chr)}</strong></div>
        <div class="score-row"><span>Unsure responses</span><strong>${score.unsure}</strong></div>
      `;
    }

    dom.scoreSummary.innerHTML = `
      <p class="score-intro">${item.scoreIntro}</p>
      <div class="formula">${item.formula}</div>
      <div class="score-preview">${rows}</div>
      <p class="qc-note"><strong>QC before interpretation.</strong> A production session should be voided for technical failure, excessive timeouts, insufficient completion, or delay outside the configured window. A single session is not a meaningful trend.</p>
    `;
  }

  function resetProtocol(protocol = state.protocol) {
    clearTimers();
    state.protocol = protocol;
    state.screen = "intro";
    state.phase = 1;
    state.index = 0;
    state.subIndex = 0;
    state.survey = { distraction: null, concentration: null };
    state.events = [];
    state.mdtResponses = [];
    state.orrResponses = { immediate: [], delayed: [] };
    state.csrResponses = [];
    document.querySelectorAll(".protocol-tab").forEach((button) => {
      const active = button.dataset.protocol === protocol;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
    renderProtocolInspector();
    renderEvents();
    renderScoreInspector();
    activateInspectorTab("protocol", false);
    renderIntro();
  }

  function introCopy() {
    if (state.protocol === "mdt") {
      return {
        kicker: "Snapshot · phase 1",
        title: "Notice what changes",
        copy: "You will see one image, a brief interruption, then a second image. If they match, choose “Nothing changed.” Otherwise, tap the changed area.",
        chip: "Memory precision",
      };
    }
    if (state.protocol === "orr") {
      return {
        kicker: "Room Recall · phase 1",
        title: "Remember what goes where",
        copy: "Study two objects in each room. Next, an empty room and a location cue will ask which object belonged there.",
        chip: "Associative memory",
      };
    }
    return {
      kicker: "Scene Memory · phase 1",
      title: "Look closely at each scene",
      copy: "Classify each scene as inside or outside. Later, you will decide whether you saw it before.",
      chip: "Recognition memory",
    };
  }

  function renderIntro() {
    const copy = introCopy();
    setScreen(`
      <section class="game-screen">
        <span class="construct-chip">${copy.chip}</span>
        <p class="task-kicker">${copy.kicker}</p>
        <h3>${copy.title}</h3>
        <p>${copy.copy}</p>
        <ul class="instruction-list">
          <li><span>1</span>Find a quiet place where you can focus.</li>
          <li><span>2</span>Wear your glasses if you use them.</li>
          <li><span>3</span>Make sure your screen is clear and bright.</li>
        </ul>
        <button class="primary-button" id="begin-task" type="button" disabled>Preparing stimuli…</button>
      </section>
    `, "Orientation", 0);

    const beginButton = listen("#begin-task", "click", () => {
      logEvent("session_started", {
        task: protocols[state.protocol].code,
        mode: state.reviewerMode ? "reviewer" : "standard",
        ...captureSessionContext(),
      });
      if (state.protocol === "mdt") startMdtPhase1();
      if (state.protocol === "orr") startOrrEncoding();
      if (state.protocol === "csr") startCsrEncoding();
    });
    generatedAssetsReady.then((assets) => {
      if (!beginButton.isConnected) return;
      beginButton.disabled = false;
      beginButton.innerHTML = `Begin review task <span aria-hidden="true">→</span>`;
      const missing = assets.filter((asset) => !asset.loaded);
      if (missing.length) logEvent("asset_preload_warning", { missing_assets: missing.map((asset) => asset.src) });
    });
  }

  function objectImage(kind, className = "") {
    return `<img class="object-layer object-${kind} ${className}" src="${ASSET_BASE}/objects/${kind}.png" alt="" draggable="false" />`;
  }

  function roomImage(kind) {
    const filename = { sand: "warm-cream", sage: "soft-sage", blue: "blue-gray" }[kind] || kind;
    return `<img class="room-backplate" src="${ASSET_BASE}/rooms/${filename}.jpg" alt="" draggable="false" />`;
  }

  function mdtSvg(item, changed) {
    const lure = changed && item.condition === "lure";

    if (["chair", "lamp", "cabinet"].includes(item.kind)) {
      const detail = item.kind === "lamp" && lure
        ? '<span class="lure-detail lamp-band" aria-hidden="true"></span>'
        : item.kind === "cabinet" && lure
          ? '<span class="lure-detail cabinet-knob" aria-hidden="true"></span>'
          : "";
      return `
        <div class="generated-stage mdt-object-stage mdt-${item.kind}">
          ${objectImage(item.kind, "mdt-hero")}
          ${detail}
        </div>`;
    }

    if (item.kind === "studio") {
      return `
        <div class="generated-stage composed-room mdt-studio">
          ${roomImage("sage")}
          ${objectImage("chair", `studio-chair${lure ? " is-shifted" : ""}`)}
          ${objectImage("lamp", "studio-lamp")}
        </div>`;
    }

    if (item.kind === "lounge") {
      return `
        <div class="generated-stage composed-room mdt-lounge">
          ${roomImage("sand")}
          ${objectImage("table", "lounge-table")}
          ${objectImage("chair", "lounge-chair")}
        </div>`;
    }

    return `
      <div class="generated-stage composed-room mdt-dining">
        ${roomImage("blue")}
        ${objectImage("table", "dining-table")}
        ${objectImage("stool", "dining-stool dining-stool-left")}
        ${objectImage("stool", "dining-stool dining-stool-right")}
      </div>`;
  }

  function startMdtPhase1() {
    state.phase = 1;
    state.index = 0;
    renderMdtBase();
  }

  function renderMdtBase() {
    const item = mdtPhase1[state.index];
    const progress = (state.index / mdtPhase1.length) * 42;
    setScreen(`
      <section class="game-screen">
        <div class="stimulus-heading"><strong>Memorize this image</strong><small>${item.domain === "object" ? "Object" : "Scene"} pair ${state.index + 1} of ${mdtPhase1.length}</small></div>
        <div class="stimulus-frame" role="img" aria-label="Base ${item.domain} stimulus">${mdtSvg(item, false)}</div>
      </section>
    `, `Phase 1 · one-back`, progress);
    logEvent("stimulus_onset", { task: "MDT-OS", phase: 1, trial_index: state.index, item_id: item.id, stimulus: "base" });
    after(state.reviewerMode ? 1150 : 3500, renderMdtMask);
  }

  function renderMdtMask() {
    setScreen('<div class="mask-screen" aria-label="Brief visual interruption"><span aria-hidden="true">···</span></div>', "Phase 1 · interruption", 8 + (state.index / mdtPhase1.length) * 42);
    after(500, () => renderMdtTest(mdtPhase1[state.index], 1));
  }

  function renderMdtTest(item, phase) {
    const trialIndex = phase === 1 ? state.index : state.subIndex;
    const total = phase === 1 ? mdtPhase1.length : mdtPhase2.length;
    const progress = phase === 1 ? 8 + ((trialIndex + 0.55) / total) * 42 : 58 + ((trialIndex + 0.55) / total) * 42;
    setScreen(`
      <section class="game-screen">
        ${phase === 2 ? `<div class="memory-queue" aria-label="Two-back queue"><span class="${trialIndex === 0 ? "active" : ""}">A</span><span class="${trialIndex === 1 ? "active" : ""}">B</span></div>` : ""}
        <div class="stimulus-heading"><strong>Where is the difference?</strong><small>Tap the image, or choose nothing changed</small></div>
        <div class="stimulus-frame clickable" id="mdt-image" role="button" tabindex="0" aria-label="Test image. Activate, then tap or click the changed area.">${mdtSvg(item, true)}</div>
        <div class="response-stack">
          <button class="response-button" id="identical-response" type="button">Nothing changed</button>
        </div>
      </section>
    `, `Phase ${phase} · ${phase === 1 ? "one-back" : "two-back"}`, progress);

    state.onset = performance.now();
    logEvent("stimulus_onset", { task: "MDT-OS", phase, trial_index: trialIndex, item_id: item.id, stimulus: "test", condition: item.condition });

    const image = listen("#mdt-image", "click", (event) => {
      const bounds = image.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width;
      const y = (event.clientY - bounds.top) / bounds.height;
      submitMdtResponse(item, phase, "tap", { x, y });
    });
    image.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showToast("For location scoring, click or tap the changed area on the image.");
      }
    });
    listen("#identical-response", "click", () => submitMdtResponse(item, phase, "identical"));
    after(state.reviewerMode ? 30000 : 12000, () => submitMdtResponse(item, phase, "timeout"));
  }

  function pointInBox(point, box, slop = 0.035) {
    if (!box || !point) return false;
    return point.x >= box.x - slop && point.x <= box.x + box.w + slop && point.y >= box.y - slop && point.y <= box.y + box.h + slop;
  }

  function submitMdtResponse(item, phase, response, point = null) {
    clearTimers();
    const rt = Math.round(performance.now() - state.onset);
    const localized = response === "tap" && pointInBox(point, item.changeBox);
    const correct = item.condition === "repeat" ? response === "identical" : localized;
    state.mdtResponses.push({ itemId: item.id, phase, domain: item.domain, condition: item.condition, response, localized, correct, rt });
    logEvent("trial_response", {
      task: "MDT-OS",
      phase,
      item_id: item.id,
      condition: item.condition,
      response_payload: point ? { type: response, tap_xy: { x: +point.x.toFixed(3), y: +point.y.toFixed(3) } } : { type: response },
      rt_ms: rt,
      timeout: response === "timeout",
      scored_correct: correct,
    });
    renderScoreInspector();

    if (phase === 1) {
      state.index += 1;
      if (state.index < mdtPhase1.length) after(180, renderMdtBase);
      else after(180, () => renderSurvey("Phase 1", renderMdtDelay));
    } else {
      state.subIndex += 1;
      if (state.subIndex < mdtPhase2.length) after(180, () => renderMdtTest(mdtPhase2[state.subIndex], 2));
      else after(180, () => renderSurvey("Phase 2", () => renderComplete("mdt")));
    }
  }

  function renderMdtDelay() {
    renderDelay({
      task: "MDT-OS",
      duration: "24 hours",
      note: "The second phase uses new, independent pairs in a two-back sequence. The paper reports a two-week delay in one continuous cohort.",
      nextLabel: "Simulate phase 2 unlock",
      next: startMdtPhase2,
      progress: 50,
    });
  }

  function startMdtPhase2() {
    state.phase = 2;
    state.index = 0;
    state.subIndex = 0;
    renderMdtTwoBackBase(0);
  }

  function renderMdtTwoBackBase(baseIndex) {
    const item = mdtPhase2[baseIndex];
    setScreen(`
      <section class="game-screen">
        <div class="memory-queue" aria-label="Two-back queue"><span class="${baseIndex === 0 ? "active" : ""}">A</span><span class="${baseIndex === 1 ? "active" : ""}">B</span></div>
        <div class="stimulus-heading"><strong>Memorize image ${baseIndex === 0 ? "A" : "B"}</strong><small>Both will be tested in sequence</small></div>
        <div class="stimulus-frame" role="img" aria-label="Base ${item.domain} stimulus">${mdtSvg(item, false)}</div>
      </section>
    `, "Phase 2 · two-back", 54 + baseIndex * 8);
    logEvent("stimulus_onset", { task: "MDT-OS", phase: 2, trial_index: baseIndex, item_id: item.id, stimulus: "base" });
    after(state.reviewerMode ? 1150 : 3500, () => {
      if (baseIndex === 0) renderMdtTwoBackBase(1);
      else {
        setScreen('<div class="mask-screen" aria-label="Brief visual interruption"><span aria-hidden="true">A+B</span></div>', "Phase 2 · interruption", 72);
        after(500, () => renderMdtTest(mdtPhase2[0], 2));
      }
    });
  }

  function roomSvg(room, empty, probe) {
    const roomObjects = {
      "room-01": [objectImage("lamp", "orr-lamp"), objectImage("chair", "orr-chair")],
      "room-02": [objectImage("table", "orr-table"), objectImage("plant", "orr-plant")],
      "room-03": [objectImage("clock", "orr-clock"), objectImage("stool", "orr-stool")],
    };
    const probeMarkup = probe
      ? `<span class="location-probe" style="--probe-x:${probe.x * 100}%; --probe-y:${probe.y * 100}%" aria-hidden="true"><span></span></span>`
      : "";
    return `
      <div class="generated-stage composed-room orr-room ${room.id}">
        ${roomImage(room.room)}
        ${empty ? "" : roomObjects[room.id].join("")}
        ${probeMarkup}
      </div>`;
  }

  function choiceSvg(kind) {
    return `<img class="choice-object" src="${ASSET_BASE}/objects/${kind}.png" alt="" draggable="false" />`;
  }

  function startOrrEncoding() {
    state.phase = 1;
    state.index = 0;
    renderOrrEncoding();
  }

  function renderOrrEncoding() {
    const room = rooms[state.index];
    setScreen(`
      <section class="game-screen">
        <div class="stimulus-heading"><strong>Memorize the objects</strong><small>Remember their locations · room ${state.index + 1} of ${rooms.length}</small></div>
        <div class="stimulus-frame" role="img" aria-label="Furnished room with two objects">${roomSvg(room, false)}</div>
      </section>
    `, "Phase 1 · encoding", (state.index / rooms.length) * 28);
    logEvent("stimulus_onset", { task: "ORR", phase: "encoding", trial_index: state.index, item_id: room.id, stimulus: "room_with_objects" });
    after(state.reviewerMode ? 1400 : 5000, () => {
      state.index += 1;
      if (state.index < rooms.length) renderOrrEncoding();
      else {
        state.index = 0;
        renderOrrRecall("immediate");
      }
    });
  }

  function roleForObject(room, kind) {
    if (kind === room.target) return "target";
    if (kind === room.other) return "correct_source";
    return "incorrect_source";
  }

  function choiceOrder(room, index, phase) {
    const base = [room.other, room.target, room.incorrect];
    const shift = (index + (phase === "delayed" ? 1 : 0)) % base.length;
    return [...base.slice(shift), ...base.slice(0, shift)];
  }

  function renderOrrRecall(phase) {
    const room = rooms[state.index];
    const choices = choiceOrder(room, state.index, phase);
    const phaseNumber = phase === "immediate" ? 1 : 2;
    const baseProgress = phase === "immediate" ? 30 : 67;
    setScreen(`
      <section class="game-screen">
        <div class="stimulus-heading"><strong>Which object was here?</strong><small>${phase === "immediate" ? "Immediate" : "Delayed"} recall · room ${state.index + 1} of ${rooms.length}</small></div>
        <div class="stimulus-frame" role="img" aria-label="Empty room with a cued location">${roomSvg(room, true, room.probe)}</div>
        <div class="choice-grid" role="group" aria-label="Object choices">
          ${choices.map((kind) => `<button class="object-choice" type="button" data-kind="${kind}" aria-label="Choose object ${kind}">${choiceSvg(kind)}</button>`).join("")}
        </div>
      </section>
    `, `Phase ${phaseNumber} · ${phase} recall`, baseProgress + (state.index / rooms.length) * 25);
    state.onset = performance.now();
    logEvent("stimulus_onset", { task: "ORR", phase: `${phase}_recall`, trial_index: state.index, item_id: room.id, stimulus: "empty_room_with_probe" });
    dom.root.querySelectorAll(".object-choice").forEach((button) => {
      button.addEventListener("click", () => submitOrrResponse(phase, room, button.dataset.kind));
    });
    after(state.reviewerMode ? 30000 : 15000, () => submitOrrResponse(phase, room, null));
  }

  function submitOrrResponse(phase, room, kind) {
    clearTimers();
    const role = kind ? roleForObject(room, kind) : "timeout";
    const rt = Math.round(performance.now() - state.onset);
    state.orrResponses[phase].push({ roomId: room.id, object: kind, role, rt });
    logEvent("trial_response", {
      task: "ORR",
      phase: `${phase}_recall`,
      item_id: room.id,
      response_payload: { choice_id: kind, distractor_type: role === "target" ? null : role },
      rt_ms: rt,
      timeout: !kind,
      scored_correct: role === "target",
    });
    renderScoreInspector();
    state.index += 1;
    if (state.index < rooms.length) after(180, () => renderOrrRecall(phase));
    else if (phase === "immediate") after(180, () => renderSurvey("Phase 1", renderOrrDelay));
    else after(180, () => renderSurvey("Phase 2", () => renderComplete("orr")));
  }

  function renderOrrDelay() {
    renderDelay({
      task: "ORR",
      duration: "24 hours",
      note: "This demo chooses one of the paper’s validated cohort schedules. The paper also used 30-minute and 90-minute delays.",
      nextLabel: "Simulate delayed recall",
      next: () => {
        state.phase = 2;
        state.index = 0;
        renderOrrRecall("delayed");
      },
      progress: 62,
    });
  }

  function sceneSvg(scene) {
    return `<img class="scene-photo" src="${ASSET_BASE}/scenes/${scene.kind}.jpg" alt="" draggable="false" />`;
  }

  function startCsrEncoding() {
    state.phase = 1;
    state.index = 0;
    renderCsrEncoding();
  }

  function renderCsrEncoding() {
    const scene = csrEncoded[state.index];
    setScreen(`
      <section class="game-screen">
        <div class="stimulus-heading"><strong>What does this picture show?</strong><small>Scene ${state.index + 1} of ${csrEncoded.length}</small></div>
        <div class="stimulus-frame" role="img" aria-label="Scene stimulus">${sceneSvg(scene)}</div>
        <div class="response-row" role="group" aria-label="Scene category">
          <button class="response-button" type="button" data-response="inside">Inside</button>
          <button class="response-button" type="button" data-response="outside">Outside</button>
        </div>
      </section>
    `, "Phase 1 · encoding", (state.index / csrEncoded.length) * 46);
    state.onset = performance.now();
    logEvent("stimulus_onset", { task: "CSR", phase: "encoding", trial_index: state.index, item_id: scene.id, stimulus: "scene" });
    dom.root.querySelectorAll("[data-response]").forEach((button) => {
      button.addEventListener("click", () => submitCsrEncoding(scene, button.dataset.response));
    });
    after(state.reviewerMode ? 30000 : 8000, () => submitCsrEncoding(scene, "timeout"));
  }

  function submitCsrEncoding(scene, response) {
    clearTimers();
    const rt = Math.round(performance.now() - state.onset);
    logEvent("trial_response", {
      task: "CSR",
      phase: "encoding",
      item_id: scene.id,
      response_payload: { button: response },
      rt_ms: rt,
      timeout: response === "timeout",
    });
    state.index += 1;
    if (state.index < csrEncoded.length) {
      setScreen('<div class="interstimulus-screen" aria-label="Brief pause between scenes"></div>', "Phase 1 · encoding", (state.index / csrEncoded.length) * 46);
      after(CSR_INTER_STIMULUS_MS, renderCsrEncoding);
    } else {
      after(CSR_INTER_STIMULUS_MS, () => renderSurvey("Phase 1", renderCsrDelay));
    }
  }

  function renderCsrDelay() {
    renderDelay({
      task: "CSR",
      duration: "65 minutes",
      note: "Recognition mixes all 60 encoded scenes with 30 new scenes. The demo uses six old and three new AI-generated photographs.",
      nextLabel: "Simulate recognition unlock",
      next: () => {
        state.phase = 2;
        state.index = 0;
        renderCsrRecognition();
      },
      progress: 50,
    });
  }

  function renderCsrRecognition() {
    const scene = csrRecognition[state.index];
    setScreen(`
      <section class="game-screen">
        <div class="stimulus-heading"><strong>Have you seen this picture before?</strong><small>Scene ${state.index + 1} of ${csrRecognition.length}</small></div>
        <div class="stimulus-frame" role="img" aria-label="Recognition scene stimulus">${sceneSvg(scene)}</div>
        <div class="response-row three" role="group" aria-label="Recognition response">
          <button class="response-button" type="button" data-response="yes">Yes</button>
          <button class="response-button" type="button" data-response="no">No</button>
          <button class="response-button" type="button" data-response="unsure">Unsure</button>
        </div>
      </section>
    `, "Phase 2 · recognition", 52 + (state.index / csrRecognition.length) * 45);
    state.onset = performance.now();
    logEvent("stimulus_onset", { task: "CSR", phase: "recognition", trial_index: state.index, item_id: scene.id, condition: scene.role, stimulus: "scene" });
    dom.root.querySelectorAll("[data-response]").forEach((button) => {
      button.addEventListener("click", () => submitCsrRecognition(scene, button.dataset.response));
    });
    after(state.reviewerMode ? 30000 : 10000, () => submitCsrRecognition(scene, "timeout"));
  }

  function submitCsrRecognition(scene, response) {
    clearTimers();
    const rt = Math.round(performance.now() - state.onset);
    state.csrResponses.push({ itemId: scene.id, role: scene.role, response, rt });
    logEvent("trial_response", {
      task: "CSR",
      phase: "recognition",
      item_id: scene.id,
      condition: scene.role,
      response_payload: { button: response },
      rt_ms: rt,
      timeout: response === "timeout",
      scored_correct: scene.role === "old" ? response === "yes" : response === "no",
    });
    renderScoreInspector();
    state.index += 1;
    if (state.index < csrRecognition.length) {
      setScreen('<div class="interstimulus-screen" aria-label="Brief pause between scenes"></div>', "Phase 2 · recognition", 52 + (state.index / csrRecognition.length) * 45);
      after(CSR_INTER_STIMULUS_MS, renderCsrRecognition);
    } else {
      after(CSR_INTER_STIMULUS_MS, () => renderSurvey("Phase 2", () => renderComplete("csr")));
    }
  }

  function renderDelay({ task, duration, note, nextLabel, next, progress }) {
    setScreen(`
      <section class="game-screen centered">
        <div class="delay-clock"><span>${duration}</span></div>
        <p class="task-kicker">Phase 1 complete</p>
        <h3>Return after ${duration}</h3>
        <p>${note}</p>
        <button class="primary-button" id="unlock-phase" type="button">${nextLabel} <span aria-hidden="true">→</span></button>
      </section>
    `, `Delay gate · ${duration}`, progress);
    logEvent("phase_locked", { task, target_delay: duration, reviewer_override_available: true });
    listen("#unlock-phase", "click", () => {
      logEvent("phase_unlocked", { task, target_delay: duration, unlock_method: "reviewer_override", time_to_retrieval_s: 0 });
      next();
    });
  }

  function renderSurvey(phaseLabel, onDone) {
    state.survey = { distraction: null, concentration: null };
    setScreen(`
      <section class="game-screen">
        <p class="task-kicker">${phaseLabel} check-in</p>
        <h3>How did this phase feel?</h3>
        <p class="game-copy">These context questions are recorded with the session and do not change your answers.</p>

        <p class="section-label">Were you distracted?</p>
        <div class="survey-options" role="group" aria-label="Distraction response">
          <button class="survey-option" type="button" data-distraction="no">No</button>
          <button class="survey-option" type="button" data-distraction="yes">Yes</button>
        </div>

        <p class="section-label">How well could you concentrate?</p>
        <div class="survey-scale" role="group" aria-label="Concentration from 0 to 4">
          ${[0, 1, 2, 3, 4].map((value) => `<button class="survey-option" type="button" data-concentration="${value}">${value}</button>`).join("")}
        </div>
        <div class="scale-anchors"><span>Not at all</span><span>Very well</span></div>

        <button class="primary-button" id="submit-context" type="button" disabled>Continue</button>
      </section>
    `, `${phaseLabel} · context`, phaseLabel === "Phase 1" ? 49 : 98);

    dom.root.querySelectorAll("[data-distraction]").forEach((button) => {
      button.addEventListener("click", () => {
        state.survey.distraction = button.dataset.distraction;
        dom.root.querySelectorAll("[data-distraction]").forEach((item) => item.classList.toggle("is-selected", item === button));
        updateSurveySubmit();
      });
    });
    dom.root.querySelectorAll("[data-concentration]").forEach((button) => {
      button.addEventListener("click", () => {
        state.survey.concentration = Number(button.dataset.concentration);
        dom.root.querySelectorAll("[data-concentration]").forEach((item) => item.classList.toggle("is-selected", item === button));
        updateSurveySubmit();
      });
    });
    listen("#submit-context", "click", () => {
      logEvent("phase_context", { task: protocols[state.protocol].code, phase: phaseLabel, distracted: state.survey.distraction === "yes", concentration: state.survey.concentration });
      onDone();
    });
  }

  function updateSurveySubmit() {
    const submit = dom.root.querySelector("#submit-context");
    if (submit) submit.disabled = state.survey.distraction === null || state.survey.concentration === null;
  }

  function renderComplete(protocol) {
    const item = protocols[protocol];
    setScreen(`
      <section class="game-screen centered">
        <div class="completion-mark" aria-hidden="true">✓</div>
        <p class="task-kicker">Session logged</p>
        <h3>${item.name} is complete</h3>
        <p>No score or per-trial feedback is shown to the participant. The scientific review data is available in the inspector.</p>
        <button class="primary-button" id="review-results" type="button">Open scoring review</button>
      </section>
    `, "Session complete", 100);
    logEvent("session_completed", { task: item.code, demo_complete: true, participant_score_revealed: false });
    listen("#review-results", "click", () => activateInspectorTab("score"));
  }

  function activateInspectorTab(panelName, shouldFocus = true) {
    document.querySelectorAll(".inspector-tabs [role=tab]").forEach((tab) => {
      const active = tab.dataset.panel === panelName;
      tab.setAttribute("aria-selected", String(active));
    });
    document.querySelectorAll(".inspector-panel").forEach((panel) => {
      const active = panel.id === `panel-${panelName}`;
      panel.hidden = !active;
      panel.classList.toggle("is-visible", active);
    });
    const tab = document.querySelector(`.inspector-tabs [data-panel="${panelName}"]`);
    if (tab && shouldFocus) tab.focus();
  }

  document.querySelectorAll(".protocol-tab").forEach((button) => {
    button.addEventListener("click", () => resetProtocol(button.dataset.protocol));
  });

  document.querySelectorAll(".inspector-tabs [role=tab]").forEach((tab) => {
    tab.addEventListener("click", () => activateInspectorTab(tab.dataset.panel));
  });

  document.getElementById("restart-button").addEventListener("click", () => resetProtocol());
  document.getElementById("restart-secondary").addEventListener("click", () => resetProtocol());
  document.getElementById("clear-events").addEventListener("click", () => {
    state.events = [];
    renderEvents();
  });
  document.getElementById("info-button").addEventListener("click", () => {
    showToast(protocols[state.protocol].evidence.find(([type]) => type === "assumption")[1]);
  });
  dom.reviewerMode.addEventListener("change", () => {
    state.reviewerMode = dom.reviewerMode.checked;
    dom.reviewerBanner.classList.toggle("is-hidden", !state.reviewerMode);
    showToast(state.reviewerMode ? "Accelerated walkthrough enabled." : "Protocol timing restored. Delay gates still use a manual simulation.");
  });
  dom.openReviewGuide.addEventListener("click", openReviewGuide);
  dom.closeReviewGuide.addEventListener("click", closeReviewGuide);
  dom.startScientificReview.addEventListener("click", closeReviewGuide);
  dom.reviewDialog.addEventListener("click", (event) => {
    if (event.target === dom.reviewDialog) closeReviewGuide();
  });

  window.BrainitorProtocolDemo = {
    calculateMdt,
    calculateOrr,
    calculateCsr,
    pointInBox,
    resetProtocol,
    getState: () => state,
  };

  resetProtocol("mdt");
  window.requestAnimationFrame(openReviewGuide);
})();
