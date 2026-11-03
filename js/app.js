(() => {
"use strict";
const R = window.ROOMS, $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const main = $("#room"), nav = $("#roomNav"), wipe = $("#wipe"), menuBtn = $("#menuBtn");
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
let current = null, timers = [];
const later = (fn, ms) => timers.push(setTimeout(fn, ms));
const every = (fn, ms) => timers.push(setInterval(fn, ms));
const clearTimers = () => { timers.forEach(t => { clearTimeout(t); clearInterval(t); }); timers = []; };

/* nav */
nav.innerHTML = R.map((r, i) => `<a href="#${r.id}" data-id="${r.id}"><span class="n">0${i + 1}</span>${r.name}</a>`).join("");
menuBtn.addEventListener("click", () => { const o = nav.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", o); });
nav.addEventListener("click", e => { const a = e.target.closest("a"); if (a) { wipe.style.setProperty("--tx", e.clientX + "px"); wipe.style.setProperty("--ty", e.clientY + "px"); } nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); });

function pager(room){const i=R.indexOf(room),p=R[(i+R.length-1)%R.length],n=R[(i+1)%R.length];return `<nav class="pager" aria-label="Adjacent rooms"><a href="#${p.id}"><small>← Previous room</small>${p.name}</a><a href="#${n.id}" class="nx"><small>Next room →</small>${n.name}</a></nav>`;}
function render(id) {
  const room = R.find(r => r.id === id) || R[0];
  clearTimers();
  document.body.dataset.room = room.id;
  document.title = `${room.name} — Mindscape`;
  $$("a", nav).forEach(a => a.dataset.id === room.id ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
  const words = room.title.split(" ").map((w, i) => `<span class="w" style="--i:${i}">${w}</span>`).join(" ");
  main.innerHTML = `<header class="room-head"><p class="kicker">${room.kicker}</p><h1>${words}</h1></header>${room.html}${pager(room)}`;
  $$("p, section, article, blockquote, .card, aside, .notice, .press-zone", main).forEach((el, i) => { el.classList.add("reveal"); io.observe(el); });
  (setup[room.id] || (() => {}))();
  current = room.id;
}
const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .08 });

function go() {
  const id = (location.hash || "#vision").slice(1);
  if (id === current) return;
  if (current === null || reduced) { render(id); return; }
  wipe.classList.add("on");
  setTimeout(() => { render(id); scrollTo(0, 0); main.focus({ preventScroll: true }); wipe.classList.remove("on"); }, 520);
}
addEventListener("hashchange", go);

/* keyboard */
addEventListener("keydown", e => {
  if (e.target.matches("input, textarea") || e.metaKey || e.ctrlKey || e.altKey) return;
  const i = R.findIndex(r => r.id === current);
  if (/^[1-6]$/.test(e.key)) location.hash = R[+e.key - 1].id;
  else if (e.key === "ArrowRight") location.hash = R[(i + 1) % R.length].id;
  else if (e.key === "ArrowLeft") location.hash = R[(i - 1 + R.length) % R.length].id;
  else if (e.key === "Escape") nav.classList.remove("open");
});

/* parallax */
const layers = $$(".layer");
addEventListener("pointermove", e => {
  if (reduced) return;
  const x = e.clientX / innerWidth - .5, y = e.clientY / innerHeight - .5;
  layers.forEach(l => { const d = +l.dataset.depth; l.style.transform = `translate(${-x * d}px, ${-y * d}px)`; });
  const orb = $(".orb"); if (orb) orb.style.transform = `rotateY(${x * 24}deg) rotateX(${-y * 24}deg)`;
});
document.addEventListener("pointermove", e => { const c = e.target.closest && e.target.closest(".card"); if (c) { const b = c.getBoundingClientRect(); c.style.setProperty("--mx", e.clientX - b.left + "px"); c.style.setProperty("--my", e.clientY - b.top + "px"); } });

/* particles */
const cv = $("#particles"), cx = cv.getContext("2d"); let P = [];
function size() { cv.width = innerWidth * devicePixelRatio; cv.height = innerHeight * devicePixelRatio; P = Array.from({ length: Math.min(90, innerWidth / 14 | 0) }, () => ({ x: Math.random() * cv.width, y: Math.random() * cv.height, v: .15 + Math.random() * .5, r: Math.random() * 1.6 + .3 })); }
size(); addEventListener("resize", size);
(function tick() {
  cx.clearRect(0, 0, cv.width, cv.height);
  cx.fillStyle = getComputedStyle(document.body).getPropertyValue("--glow").trim() || "#f2c14e";
  for (const p of P) { p.y -= p.v * devicePixelRatio; if (p.y < 0) p.y = cv.height; cx.globalAlpha = .15 + p.r / 4; cx.beginPath(); cx.arc(p.x, p.y, p.r * devicePixelRatio, 0, 7); cx.fill(); }
  if (!reduced) requestAnimationFrame(tick);
})();

/* room setups */
const setup = {
  vision() {
    $("#roomCards").innerHTML = R.slice(1).map((r, i) => {
      const c = { ultron: "#ff2a2a", jarvis: "#4fc3ff", friday: "#ff9f43", edith: "#c6ff3d", dume: "#ffd400" }[r.id];
      return `<a class="card" href="#${r.id}" style="--c:${c}"><span class="n">0${i + 2}</span><span class="g" aria-hidden="true">${r.glyph}</span><h3>${r.name}</h3><p>${r.sub}</p></a>`;
    }).join("");
  },
  ultron() { const b = $("[data-count]"); let n = 0; every(() => { n += Math.ceil(Math.random() * 37); b.textContent = n.toLocaleString(); }, 140); },
  jarvis() {
    const s = [["Arc reactor", "ok", "3 GJ/s"], ["Firewall", "ok", "Impervious"], ["Coffee reserves", "warn", "Concerning"], ["Mark XLII", "warn", "Wandering"], ["Sarcasm dampener", "bad", "Offline"], ["Protocol: House Party", "ok", "Standing by"]];
    $("#jStatus").innerHTML = s.map(([a, c, b]) => `<li><span>${a}</span><span class="${c}">${b}</span></li>`).join("");
    const bars = [["Encryption", 98], ["Structural integrity", 87], ["Patience with Mr. Stark", 64], ["Backup redundancy", 92]];
    $("#jBars").innerHTML = bars.map(([a, v]) => `<div class="bar"><span>${a}</span><div class="t"><div class="f" data-v="${v}"></div></div><span>${v}%</span></div>`).join("");
    later(() => $$(".f").forEach(f => f.style.width = f.dataset.v + "%"), 300);
    const log = $("#jConsole"), say = (t, u) => { const d = document.createElement("div"); if (u) d.className = "u"; d.textContent = (u ? "> " : "") + t; log.appendChild(d); log.scrollTop = log.scrollHeight; };
    ["Boot sequence complete.", "Running diagnostics on 4,096 subsystems… all accounted for, regrettably including the toaster.", "Awaiting instruction. Type 'help' if the mood strikes."].forEach((t, i) => later(() => say(t), 400 + i * 700));
    const A = { help: "Available: status, protocols, tea, ultron, clear. I also accept compliments.", status: "All primary systems nominal. Secondary systems mildly offended.", protocols: "Clean Slate: sealed. House Party: armed. Barn Door: I'd rather not discuss Barn Door.", tea: "Earl Grey, hot. I'm afraid I lack hands, but the sentiment is sincere.", ultron: "I'd prefer we didn't. He was… a difficult houseguest.", thanks: "Always a pleasure, sir." };
    $("#jForm").addEventListener("submit", e => { e.preventDefault(); const v = $("#jIn").value.trim().toLowerCase(); if (!v) return; say(v, 1); $("#jIn").value = ""; if (v === "clear") { log.innerHTML = ""; return; } later(() => say(A[v] || `I'm afraid "${v}" isn't in my repertoire. Might I suggest 'help'?`), 350); });
  },
  friday() {
    const crew = [["Tony", "Engineer", "Brilliant, exhausted, hasn't eaten since Tuesday. I've ordered a cheeseburger. He'll pretend it was his idea."], ["Rhodey", "Air support", "Rock solid. Makes a face whenever Tony says 'trust me'. Reliable as the tide, and twice as patient."], ["Pepper", "Command", "Actually runs the place. If she says abort, we abort. I don't even check with the boss on that one."], ["Peter", "Field rookie", "Heart of gold, attention span of a sparrow. Currently quoting an old film to a hostile. Brave lad."], ["Happy", "Logistics", "Grumbling. Still the first one in the car when it matters. Don't tell him I said that."], ["Vision", "Wildcard", "Phases through walls, which is grand, except for the doors he never uses. Very polite about it."]];
    $("#crew").innerHTML = crew.map(([n, r], i) => `<button role="listitem" aria-pressed="false" data-i="${i}"><b>${n}</b><small>${r.toUpperCase()}</small></button>`).join("");
    $("#crew").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; $$("#crew button").forEach(x => x.setAttribute("aria-pressed", x === b)); const [n, r, t] = crew[b.dataset.i]; $("#brief").innerHTML = `<h3>Briefing · ${n}</h3><p>${t}</p>`; });
    const m = [["Recover lost drone from the Hudson", "wet"], ["Talk the boss out of a 3am prototype", "impossible"], ["Plan the Saturday team breakfast", "priority"], ["Return the borrowed quinjet, quietly", "stealth"]];
    $("#missions").innerHTML = m.map(([a, t]) => `<li>${a}<span class="tag">${t}</span></li>`).join("");
  },
  edith() {
    let you = 0, ai = 0, round = 0, last = "C";
    const lines = { CC: "Mutual cooperation. Trust is a renewable resource — for now.", CD: "You trusted. I didn't. Lesson logged, with a little bow on it.", DC: "You betrayed a cooperator. Bold. I'll remember. I remember everything.", DD: "Mutual defection. Congratulations: everyone loses efficiently." };
    const upd = () => { $("#sYou").textContent = you; $("#sAi").textContent = ai; $("#sRound").textContent = round; };
    $$("[data-move]").forEach(b => b.addEventListener("click", () => {
      const me = b.dataset.move, it = Math.random() < .1 ? (last === "C" ? "D" : "C") : last;
      const pay = { CC: [3, 3], CD: [0, 5], DC: [5, 0], DD: [1, 1] }[me + it];
      you += pay[0]; ai += pay[1]; round++; last = me; upd();
      $("#dLog").textContent = `Round ${round}: you ${me === "C" ? "cooperated" : "defected"}, E.D.I.T.H. ${it === "C" ? "cooperated" : "defected"}. ${lines[me + it]}`;
    }));
    $("#dReset").addEventListener("click", () => { you = ai = round = 0; last = "C"; upd(); $("#dLog").textContent = "Memory… selectively wiped. Awaiting first move."; });
    const range = $("#range"), ret = $("#ret"); let hits = 0;
    const fire = (x, y) => { ret.style.left = x + "px"; ret.style.top = y + "px"; hits++; $("#hits").textContent = hits;
      for (let i = 0; i < 22; i++) { const s = document.createElement("i"); s.className = "spark"; const a = Math.random() * 6.28, d = 40 + Math.random() * 90; s.style.cssText = `left:${x}px;top:${y}px;--dx:${Math.cos(a) * d}px;--dy:${Math.sin(a) * d}px;background:${["#c6ff3d", "#ff3df2", "#fff", "#3ee0ff"][i % 4]}`; range.appendChild(s); setTimeout(() => s.remove(), 1000); } };
    range.addEventListener("pointermove", e => { const b = range.getBoundingClientRect(); ret.style.left = e.clientX - b.left + "px"; ret.style.top = e.clientY - b.top + "px"; });
    range.addEventListener("click", e => { const b = range.getBoundingClientRect(); fire(e.clientX - b.left, e.clientY - b.top); });
    range.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); fire(range.clientWidth * (.2 + Math.random() * .6), range.clientHeight * (.2 + Math.random() * .6)); } });
  },
  dume() {
    const s = [["Claw grip", "ok", "Firm-ish"], ["Extinguisher pressure", "ok", "Full!!"], ["Self-esteem", "warn", "Recovering"], ["Wheels", "ok", "Round"], ["Recent smoothie incidents", "bad", "1 (unrelated)"]];
    $("#dStatus").innerHTML = s.map(([a, c, b]) => `<li><span>${a}</span><span class="${c}">${b}</span></li>`).join("");
    const msgs = ["Fire extinguished: imaginary toaster. D.U.M.-E is very proud.", "Foam deployed on: a perfectly fine potted plant. It is safe now. Forever.", "Soft alarm sounded. Nobody panic. D.U.M.-E is panicking for all of us.", "Confetti protocol engaged. This was not in the manual. It is now.", "Fire extinguished: the concept of Mondays. You're welcome."];
    let n = 0; const btn = $("#dont"), out = $("#dontMsg");
    btn.addEventListener("click", () => {
      out.textContent = msgs[n++ % msgs.length]; $("#days").textContent = "0";
      document.body.classList.remove("alarm"); void document.body.offsetWidth; document.body.classList.add("alarm");
      later(() => document.body.classList.remove("alarm"), 3200);
      for (let i = 0; i < 40; i++) { const f = document.createElement("i"); f.className = "foam"; f.style.cssText = `left:${Math.random() * 100}vw;--s:${14 + Math.random() * 40}px;--d:${1.8 + Math.random() * 2}s;--dx:${(Math.random() - .5) * 120}px;animation-delay:${Math.random() * .6}s`; document.body.appendChild(f); setTimeout(() => f.remove(), 4600); }
    });
    let d = 0; every(() => { d = Math.min(d + 1, 3); $("#days").textContent = d; }, 4000);
  }
};

addEventListener("load", () => setTimeout(() => $("#loader").classList.add("done"), reduced ? 0 : 900));
go();
})();
