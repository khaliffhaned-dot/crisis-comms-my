/* shell styles appended - full file via local sync */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

:root {
  --font-family: "Inter", system-ui, -apple-system, sans-serif;
  --background: #f8f9fa;
  --surface: #ffffff;
  --surface-light: #f1f3f5;
  --border-color: #dee2e6;
  --primary: #c81e1e;
  --primary-hover: #a21919;
  --navy: #111827;
  --text-primary: #212529;
  --text-secondary: #6c757d;
  --text-on-primary: #ffffff;
  --success: #198754;
  --danger: #dc3545;
  --warning: #ffc107;
  --info: #0d6efd;
  --saffron: #c81e1e;
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 2px 4px -2px rgba(0, 0, 0, 0.04);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.07), 0 4px 6px -4px rgba(0, 0, 0, 0.04);
  --radius-sm: 6px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius: 10px;
  --border: #dee2e6;
  --text: #212529;
  --text-muted: #6c757d;
  --card: #ffffff;
  --bg: #f8f9fa;
}

*, *::before, *::after {
  box-sizing: border-box; margin: 0; padding: 0;
  -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale;
}
html { scroll-behavior: smooth; }
body {
  font-family: var(--font-family);
  background-color: var(--background);
  color: var(--text-primary);
  line-height: 1.5; min-height: 100vh;
}
#root { min-height: 100vh; display: flex; flex-direction: column; }
button { font: inherit; cursor: pointer; }
textarea, input, select { font-family: inherit; font-size: 0.95rem; }

.btn {
  display: inline-flex; align-items: center; justify-content: center; gap: 8px;
  padding: 10px 20px; font-size: 0.9rem; font-weight: 600;
  border-radius: 100px; border: 1px solid transparent; cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.15s;
}
.btn:hover { transform: translateY(-1px); }
.btn-primary, .btn--primary {
  background-color: var(--primary); color: var(--text-on-primary);
  border-color: var(--primary); box-shadow: 0 10px 18px rgba(200, 30, 30, 0.15);
}
.btn-primary:hover, .btn--primary:hover {
  background-color: var(--primary-hover); border-color: var(--primary-hover);
}
.btn-secondary, .btn--secondary {
  background-color: var(--surface); color: var(--text-primary);
  border: 1px solid var(--border-color);
}
.btn-secondary:hover { background-color: var(--surface-light); }
.btn-saffron {
  background-color: var(--primary); color: white; border-color: var(--primary);
  box-shadow: 0 10px 18px rgba(200, 30, 30, 0.15);
}
.btn-saffron:hover { background-color: var(--primary-hover); }
.btn-lg { padding: 0.75rem 1.4rem; font-size: 0.95rem; }

.lang-toggle {
  display: flex; background: var(--surface-light); border-radius: 100px;
  overflow: hidden; border: 1px solid var(--border-color);
}
.lang-toggle button {
  border: none; background: transparent; color: var(--text-secondary);
  padding: 0.35rem 0.75rem; font-size: 0.8rem; font-weight: 600;
}
.lang-toggle button.active { background: var(--primary); color: white; }

.card {
  background: var(--surface); border: 1px solid var(--border-color);
  border-radius: var(--radius-lg); padding: 1.25rem 1.5rem;
  box-shadow: var(--shadow-sm); margin-bottom: 1.25rem;
}
.card h2 {
  font-size: 1.05rem; font-weight: 700; margin-bottom: 0.85rem; color: var(--navy);
  display: flex; align-items: center; gap: 0.5rem;
}
.card h2 .step {
  background: var(--primary); color: white; font-size: 0.7rem;
  width: 1.45rem; height: 1.45rem; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0;
}

.dashboard-banner {
  background: linear-gradient(135deg, #111827 0%, #1f2937 100%);
  color: white; border-radius: var(--radius-lg); padding: 1.25rem 1.5rem;
  margin-bottom: 1.25rem; display: flex; flex-wrap: wrap; align-items: center;
  justify-content: space-between; gap: 1rem; box-shadow: var(--shadow-md);
}
.dashboard-banner h2 { font-size: 1.1rem; font-weight: 700; margin: 0 0 0.2rem; color: white; }
.dashboard-banner p { font-size: 0.82rem; opacity: 0.8; margin: 0; }
.dashboard-stats { display: flex; gap: 1.5rem; }
.dashboard-stat { text-align: center; }
.dashboard-stat .val { display: block; font-size: 1.25rem; font-weight: 800; }
.dashboard-stat .lbl { font-size: 0.68rem; opacity: 0.7; text-transform: uppercase; letter-spacing: 0.05em; }

.severity-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.65rem; }
.severity-btn {
  border: 2px solid var(--border-color); background: white; border-radius: var(--radius-md);
  padding: 0.85rem 0.6rem; text-align: center; transition: all 0.15s;
}
.severity-btn:hover { border-color: #adb5bd; transform: translateY(-1px); }
.severity-btn.selected { border-color: var(--primary); background: rgba(200, 30, 30, 0.04); }
.severity-btn .level { font-weight: 700; font-size: 0.95rem; display: block; }
.severity-btn .bm { font-size: 0.78rem; color: var(--text-secondary); margin-top: 0.15rem; }
.severity-btn.level-1.selected { border-color: #198754; background: #f0fdf4; }
.severity-btn.level-2.selected { border-color: #ffc107; background: #fffbeb; }
.severity-btn.level-3.selected { border-color: #fd7e14; background: #fff7ed; }
.severity-btn.level-4.selected { border-color: #dc3545; background: #fef2f2; }
.severity-action {
  margin-top: 0.85rem; padding: 0.75rem 1rem; background: var(--surface-light);
  border-radius: var(--radius-md); font-size: 0.9rem; border: 1px solid var(--border-color);
}

.checklist { list-style: none; }
.checklist li {
  display: flex; align-items: flex-start; gap: 0.65rem; padding: 0.5rem 0;
  border-bottom: 1px solid var(--surface-light); font-size: 0.92rem;
}
.checklist li:last-child { border-bottom: none; }
.checklist input[type="checkbox"] {
  margin-top: 0.2rem; width: 1.05rem; height: 1.05rem; accent-color: var(--primary); flex-shrink: 0;
}

.form-row { margin-bottom: 0.85rem; }
.form-row label {
  display: block; font-size: 0.8rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 0.35rem;
}
.form-row select, .form-row input, .form-row textarea {
  width: 100%; padding: 0.65rem 0.85rem; border: 1px solid var(--border-color);
  border-radius: var(--radius-sm); background: var(--background); color: var(--text-primary);
}
.form-row textarea { min-height: 140px; resize: vertical; line-height: 1.55; }
.btn-row { display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.75rem; }
.log-list { list-style: none; max-height: 220px; overflow-y: auto; }
.log-list li { padding: 0.5rem 0; border-bottom: 1px solid var(--surface-light); font-size: 0.85rem; }
.log-list .time { color: var(--text-secondary); font-size: 0.75rem; }
.empty-state { color: var(--text-secondary); font-size: 0.9rem; padding: 0.75rem 0; }

.executive-dashboard {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  max-width: 1400px;
  margin: 0 auto;
}
.executive-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  background: linear-gradient(135deg, #101827 0%, #1f2937 45%, #2a1515 100%);
  border-radius: 18px;
  padding: 1.4rem 1.5rem;
  color: white;
  box-shadow: var(--shadow-md);
}
.executive-header h2 {
  margin-top: 0.4rem;
  font-size: clamp(1.4rem, 2vw, 2rem);
  line-height: 1.2;
  letter-spacing: -0.04em;
  max-width: 700px;
}
.executive-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #fca5a5;
  font-weight: 700;
}
.executive-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}
.executive-summary-panel {
  display: grid;
  grid-template-columns: repeat(5, minmax(0, 1fr));
  gap: 0.85rem;
}
.summary-stat-block {
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1rem;
  box-shadow: var(--shadow-sm);
}
.summary-label {
  display: block;
  font-size: 0.72rem;
  color: var(--text-secondary);
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin-bottom: 0.6rem;
}
.summary-value {
  font-size: clamp(1.4rem, 2.6vw, 2rem);
  letter-spacing: -0.04em;
  font-weight: 800;
  color: var(--navy);
}
.executive-card-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0.8rem;
}
.executive-card {
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1rem 0.9rem;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-shadow: var(--shadow-sm);
}
.executive-card__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  margin-bottom: 0.5rem;
}
.executive-card__value {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--navy);
}
.executive-card.tone-severity { background: linear-gradient(180deg, #fff 0%, #fff5f5 100%); }
.executive-card.tone-alert { background: linear-gradient(180deg, #fff 0%, #fff7ed 100%); }
.executive-card.tone-warning { background: linear-gradient(180deg, #fff 0%, #fffbeb 100%); }
.executive-card.tone-success { background: linear-gradient(180deg, #fff 0%, #f0fdf4 100%); }
.executive-section-header {
  font-size: 0.76rem;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0.13em;
  color: var(--primary);
}
.command-centre {
  display: grid;
  grid-template-columns: 1.1fr 1.5fr 0.9fr;
  gap: 0.9rem;
}
.timeline-panel, .fact-panel, .stakeholder-panel, .graph-card, .decision-log-box, .board-callout {
  background: var(--surface);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1rem;
  box-shadow: var(--shadow-sm);
}
.panel-title {
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--navy);
  margin-bottom: 0.75rem;
}
.timeline-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  font-size: 0.9rem;
  color: var(--text-primary);
}
.timeline-list li {
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid var(--border-color);
}
.fact-group { margin-bottom: 0.9rem; }
.fact-head {
  font-size: 0.68rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-weight: 700;
  margin-bottom: 0.45rem;
}
.fact-head.confirmed { color: #166534; }
.fact-head.unverified { color: #92400e; }
.fact-head.false { color: #991b1b; }
.fact-group ul {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
  font-size: 0.86rem;
}
.fact-group li {
  padding-left: 0.8rem;
  position: relative;
  color: var(--text-primary);
}
.fact-group li::before {
  content: '•';
  position: absolute;
  left: 0;
  color: var(--primary);
  font-weight: 700;
}
.stakeholder-list {
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 0.55rem;
}
.stakeholder-list li {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.6rem 0.7rem;
  border-radius: 10px;
  background: var(--surface-light);
  border: 1px solid var(--border-color);
  font-size: 0.88rem;
}
.stakeholder-list li.live strong { color: #166534; }
.stakeholder-list li.pending strong { color: #7c2d12; }
.intelligence-strip {
  background: linear-gradient(180deg, #fff 0%, #f8fafc 100%);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  padding: 1rem;
}
.intelligence-nav {
  display: flex;
  flex-wrap: wrap;
  gap: 0.6rem;
  margin-bottom: 1rem;
}
.intelligence-nav span {
  padding: 0.45rem 0.7rem;
  border-radius: 999px;
  background: #f1f5f9;
  color: var(--text-secondary);
  font-size: 0.75rem;
  font-weight: 600;
}
.intelligence-nav span.active {
  background: rgba(200, 30, 30, 0.1);
  color: var(--primary);
}
.intelligence-metrics {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
}
.metric-box {
  background: white;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  padding: 0.9rem 0.8rem;
}
.metric-box__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
  margin-bottom: 0.45rem;
}
.metric-box__value {
  font-size: 1.25rem;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.04em;
}
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
}
.kpi-tile {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: center;
  min-height: 112px;
  background: linear-gradient(180deg, #fff 0%, #fff7f7 100%);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  padding: 1rem;
}
.kpi-tile.risk {
  background: linear-gradient(180deg, #fff0f0 0%, #fff 100%);
}
.kpi-label {
  font-size: 1.55rem;
  font-weight: 800;
  color: var(--navy);
  letter-spacing: -0.05em;
}
.kpi-value {
  margin-top: 0.2rem;
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--text-secondary);
}
.executive-graphs {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
}
.graph-card__title {
  font-size: 0.8rem;
  color: var(--text-secondary);
  margin-bottom: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}
.mini-chart {
  height: 120px;
  border-radius: 10px;
  background: linear-gradient(180deg, #fff 0%, #f1f5f9 100%);
  position: relative;
  overflow: hidden;
}
.mini-chart::before {
  content: "";
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(200, 30, 30, 0.14), rgba(200, 30, 30, 0));
  clip-path: polygon(0 82%, 12% 75%, 25% 68%, 37% 80%, 52% 58%, 65% 60%, 77% 42%, 100% 38%, 100% 100%, 0 100%);
}
.mini-chart.sentiment::before { clip-path: polygon(0 80%, 12% 70%, 26% 62%, 38% 72%, 52% 52%, 68% 45%, 82% 55%, 100% 28%, 100% 100%, 0 100%); }
.mini-chart.media::before { clip-path: polygon(0 75%, 15% 62%, 30% 52%, 45% 62%, 60% 40%, 75% 38%, 100% 25%, 100% 100%, 0 100%); }
.mini-chart.incidents::before { clip-path: polygon(0 88%, 20% 76%, 40% 70%, 57% 58%, 78% 62%, 100% 42%, 100% 100%, 0 100%); }
.mini-chart.engagement::before { clip-path: polygon(0 62%, 18% 68%, 34% 58%, 52% 46%, 72% 52%, 100% 22%, 100% 100%, 0 100%); }
.decision-log-box {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}
.decision-entry {
  background: #fff7f7;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 0.8rem 0.9rem;
}
.decision-entry__meta, .decision-entry__time {
  font-size: 0.8rem;
  color: var(--text-secondary);
}
.decision-entry__action {
  margin: 0.45rem 0;
  font-weight: 800;
  color: var(--primary);
  font-size: 1rem;
}
.board-callout {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: linear-gradient(135deg, #131a2a 0%, #1f2937 100%);
  color: white;
}
.board-callout__label {
  font-size: 0.7rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  color: #fca5a5;
}
.board-callout__title {
  margin-top: 0.35rem;
  font-size: 1.15rem;
  font-weight: 700;
}

.landing { min-height: 100vh; display: flex; flex-direction: column; background: var(--background); }
.landing-header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 1rem 2rem; position: sticky; top: 0;
  background: rgba(255, 255, 255, 0.82); backdrop-filter: blur(10px);
  border-bottom: 1px solid var(--border-color); z-index: 40;
}
.landing-brand { display: flex; align-items: center; gap: 0.5rem; }
.brand-mark { color: var(--primary); font-size: 1.1rem; }
.brand-name { font-size: 1.35rem; font-weight: 800; letter-spacing: -0.04em; color: var(--navy); }
.brand-tag {
  display: block; font-size: 0.65rem; font-weight: 600; color: var(--text-secondary);
  letter-spacing: 0.06em; text-transform: uppercase; margin-top: 0.05rem;
}
.header-right { display: flex; align-items: center; gap: 1rem; }
.landing-nav { display: flex; align-items: center; gap: 0.5rem; }
.landing-nav button {
  border: none; background: transparent; color: var(--text-secondary);
  padding: 0.4rem 0.75rem; font-size: 0.9rem; font-weight: 500; border-radius: 100px;
}
.landing-nav button:hover { color: var(--text-primary); }

.hero, .hero-enterprise {
  display: grid; grid-template-columns: 1fr 1fr; gap: 2.5rem; align-items: center;
  padding: 4rem 2rem 3rem; max-width: 1100px; margin: 0 auto; width: 100%;
  background:
    radial-gradient(circle at top left, rgba(200, 30, 30, 0.06), transparent 28%),
    radial-gradient(circle at top right, rgba(0, 0, 0, 0.02), transparent 26%);
}
.hero-eyebrow {
  font-size: 0.78rem; font-weight: 700; color: var(--primary);
  text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 0.75rem;
}
.hero h1 {
  font-size: clamp(2.2rem, 4vw, 3.25rem); font-weight: 800; line-height: 1.08;
  letter-spacing: -0.05em; color: #111827; margin-bottom: 1rem;
}
.hero h1 .highlight {
  background: linear-gradient(90deg, #c81e1e, #ef476f, #f4a261);
  -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
}
.hero-sub {
  font-size: 1.1rem; color: var(--text-secondary); line-height: 1.75;
  margin-bottom: 1.5rem; max-width: 34rem;
}
.hero-cta { display: flex; gap: 0.75rem; flex-wrap: wrap; }
.hero-note { margin-top: 1.1rem; font-size: 0.8rem; color: var(--text-secondary); max-width: 28rem; }

.dash-preview {
  background: #111827; border-radius: var(--radius-lg); padding: 1.25rem; color: white;
  box-shadow: var(--shadow-lg); max-width: 380px; width: 100%;
}
.dash-preview-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.dash-preview-title { font-size: 0.9rem; font-weight: 700; }
.dash-preview-badge {
  font-size: 0.65rem; background: rgba(200, 30, 30, 0.25); color: #fca5a5;
  padding: 0.25rem 0.55rem; border-radius: 100px; font-weight: 700;
}
.dash-preview-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; margin-bottom: 1rem; }
.dash-preview-card { background: rgba(255,255,255,0.06); border-radius: var(--radius-md); padding: 0.7rem 0.8rem; }
.dpc-label { display: block; font-size: 0.65rem; color: #9ca3af; margin-bottom: 0.2rem; }
.dpc-value { font-size: 1rem; font-weight: 700; }
.dash-preview-row { display: flex; align-items: center; gap: 0.75rem; }
.severity-pills { display: flex; gap: 0.3rem; }
.pill {
  width: 1.6rem; height: 1.6rem; border-radius: 6px; display: flex;
  align-items: center; justify-content: center; font-size: 0.75rem; font-weight: 700; color: white;
}
.pill.l1 { background: #198754; } .pill.l2 { background: #ffc107; color: #212529; }
.pill.l3 { background: #fd7e14; } .pill.l4 { background: #dc3545; }
.dash-preview-caption { font-size: 0.72rem; color: #9ca3af; }

.enterprise-strip {
  background: var(--surface); border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color); padding: 1.75rem 2rem;
}
.strip-inner {
  max-width: 1100px; margin: 0 auto; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;
}
.strip-item strong { display: block; font-size: 0.95rem; color: var(--navy); margin-bottom: 0.25rem; font-weight: 700; }
.strip-item span { font-size: 0.85rem; color: var(--text-secondary); line-height: 1.5; }

.features-section, .how-section { max-width: 1100px; margin: 0 auto; padding: 3.5rem 2rem; }
.section-title {
  font-size: 2rem; font-weight: 800; letter-spacing: -0.04em; color: var(--navy);
  margin-bottom: 1.75rem; text-align: center;
}
.features-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem; }
.feature-card {
  background: var(--surface); border: 1px solid var(--border-color); border-radius: var(--radius-lg);
  padding: 1.5rem; box-shadow: var(--shadow-sm);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.feature-card:hover { transform: translateY(-4px); box-shadow: var(--shadow-md); }
.feature-card h3 { font-size: 1.15rem; font-weight: 700; color: var(--navy); margin-bottom: 0.5rem; }
.feature-card p { font-size: 0.9rem; color: var(--text-secondary); line-height: 1.7; }

.how-steps {
  list-style: none; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;
}
.how-steps li {
  display: flex; gap: 0.9rem; background: var(--surface); border: 1px solid var(--border-color);
  border-radius: var(--radius-lg); padding: 1.25rem; box-shadow: var(--shadow-sm);
}
.step-num {
  flex-shrink: 0; width: 1.85rem; height: 1.85rem; background: var(--primary); color: white;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem; font-weight: 700;
}
.how-steps strong { display: block; font-size: 1rem; color: var(--navy); margin-bottom: 0.25rem; font-weight: 700; }
.how-steps p { font-size: 0.88rem; color: var(--text-secondary); margin: 0; line-height: 1.55; }

.cta-band { background: #111827; color: white; padding: 3.5rem 2rem; }
.cta-band-inner { max-width: 640px; margin: 0 auto; text-align: center; }
.cta-band h2 { font-size: 1.85rem; margin-bottom: 0.6rem; font-weight: 800; letter-spacing: -0.03em; }
.cta-band p { opacity: 0.85; margin-bottom: 1.75rem; font-size: 1rem; line-height: 1.6; }
.cta-band .btn-secondary {
  background: transparent; border-color: rgba(255,255,255,0.35); color: white;
}
.cta-band .btn-secondary:hover { background: rgba(255,255,255,0.1); }

.landing-footer {
  padding: 2rem; text-align: center; border-top: 1px solid var(--border-color);
  background: var(--surface); font-size: 0.85rem; color: var(--text-secondary);
}
.footer-inner {
  max-width: 1100px; margin: 0 auto; display: flex; flex-direction: column; gap: 0.4rem; align-items: center;
}

.manual-view { max-width: 720px; margin: 0 auto; }
.manual-header { margin-bottom: 1.5rem; }
.manual-header h2 {
  font-size: 1.5rem; font-weight: 800; letter-spacing: -0.03em; color: var(--navy); margin-bottom: 0.35rem;
}
.manual-sub { font-size: 0.95rem; color: var(--text-secondary); margin-bottom: 1rem; }
.manual-section h3 {
  font-size: 1rem; font-weight: 700; color: var(--navy); margin-bottom: 0.65rem;
  padding-bottom: 0.35rem; border-bottom: 1px solid var(--border-color);
}
.manual-list { list-style: none; padding: 0; }
.manual-list li {
  position: relative; padding: 0.45rem 0 0.45rem 1.15rem; font-size: 0.92rem;
  line-height: 1.55; border-bottom: 1px solid var(--surface-light);
}
.manual-list li:last-child { border-bottom: none; }
.manual-list li::before {
  content: "•"; position: absolute; left: 0; color: var(--primary); font-weight: 700;
}
.manual-footer-note {
  text-align: center; font-size: 0.85rem; color: var(--text-secondary);
  margin: 1.5rem 0 1rem; padding: 1rem; background: var(--surface-light); border-radius: var(--radius-md);
}

/* ===== App shell: sidebar + multi-client ===== */
.app-shell {
  display: flex;
  min-height: 100vh;
  background: var(--background);
}
.sidebar {
  width: 260px;
  background-color: var(--surface);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  padding: 1.5rem 1rem;
  flex-shrink: 0;
}
.sidebar__header { margin-bottom: 1.75rem; padding: 0 0.5rem; }
.sidebar__logo-wrapper { display: flex; align-items: baseline; gap: 4px; }
.sidebar__title {
  font-size: 1.5rem; font-weight: 800; letter-spacing: -0.04em; color: var(--navy); cursor: pointer;
}
.sidebar__title-v { color: var(--primary); }
.sidebar__tagline {
  font-size: 0.7rem; color: var(--text-secondary); font-weight: 600;
  letter-spacing: 0.06em; text-transform: uppercase; margin-top: 0.15rem;
}
.sidebar__nav { flex-grow: 1; overflow-y: auto; }
.nav-pillar { margin-bottom: 0.35rem; }
.nav-item {
  display: flex; align-items: center; justify-content: space-between;
  padding: 10px 14px; border-radius: var(--radius-sm); font-size: 0.9rem; font-weight: 500;
  color: var(--text-secondary); cursor: pointer; border: none; background: transparent;
  width: 100%; text-align: left; transition: background 0.15s, color 0.15s;
}
.nav-item:hover { background: var(--surface-light); color: var(--text-primary); }
.nav-item.active-parent {
  background-color: var(--surface-light); color: var(--text-primary); font-weight: 600;
}
.nav-item__content { display: flex; align-items: center; gap: 10px; }
.nav-item__icon { width: 1.25rem; text-align: center; font-size: 0.95rem; }
.nav-item__text { font-weight: 600; }
.sub-nav-list {
  list-style: none; margin: 0; padding-left: 12px; margin-top: 4px;
  display: flex; flex-direction: column; gap: 2px;
}
.sub-nav-item {
  display: block; padding: 8px 14px 8px 28px; font-size: 0.85rem; color: var(--text-secondary);
  border-radius: var(--radius-sm); border: none; background: transparent; width: 100%;
  text-align: left; cursor: pointer;
}
.sub-nav-item:hover { color: var(--text-primary); background: var(--surface-light); }
.sub-nav-item.active {
  color: var(--primary); background-color: rgba(200, 30, 30, 0.06); font-weight: 600;
}
.sidebar__footer {
  margin-top: auto; padding-top: 1rem; border-top: 1px solid var(--border-color);
  font-size: 0.72rem; color: var(--text-secondary); padding-left: 0.5rem; padding-right: 0.5rem;
}
.main-wrapper {
  flex: 1; display: flex; flex-direction: column; overflow: hidden; min-width: 0;
}
.shell-header {
  display: flex; align-items: center; padding: 0.85rem 1.5rem;
  background-color: var(--surface); border-bottom: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm); z-index: 40; gap: 1rem; flex-wrap: wrap;
}
.shell-header h2 {
  font-size: 1.15rem; font-weight: 700; margin: 0; letter-spacing: -0.02em; color: var(--navy);
}
.shell-header__actions {
  margin-left: auto; display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap;
}
.client-switcher { position: relative; }
.client-switcher__display {
  display: flex; align-items: center; gap: 10px; background-color: var(--surface);
  padding: 6px 12px 6px 6px; border-radius: var(--radius-md);
  border: 1px solid var(--border-color); cursor: pointer; min-width: 180px;
}
.client-switcher__display:hover { border-color: #adb5bd; }
.client-switcher__logo {
  width: 34px; height: 34px; border-radius: 50%;
  background: linear-gradient(135deg, var(--primary), #df6a6a);
  color: white; font-size: 0.8rem; font-weight: 700; display: grid; place-items: center; flex-shrink: 0;
}
.client-switcher__info { display: flex; flex-direction: column; min-width: 0; }
.client-switcher__name {
  font-size: 0.85rem; font-weight: 600; max-width: 160px;
  white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
}
.client-switcher__label { font-size: 0.7rem; color: var(--text-secondary); }
.client-switcher__arrow { font-size: 0.75rem; color: var(--text-secondary); margin-left: auto; }
.client-switcher__menu {
  position: absolute; top: calc(100% + 6px); right: 0; min-width: 240px;
  background: var(--surface); border: 1px solid var(--border-color);
  border-radius: var(--radius-md); box-shadow: var(--shadow-lg); z-index: 100; padding: 0.4rem;
}
.client-switcher__option {
  display: flex; align-items: center; gap: 10px; width: 100%;
  padding: 0.55rem 0.65rem; border: none; background: transparent;
  border-radius: var(--radius-sm); cursor: pointer; text-align: left;
}
.client-switcher__option:hover { background: var(--surface-light); }
.client-switcher__option.active { background: rgba(200, 30, 30, 0.06); }
.client-switcher__option-name { font-size: 0.85rem; font-weight: 600; color: var(--text-primary); }
.client-switcher__option-meta { font-size: 0.7rem; color: var(--text-secondary); }
.shell-main {
  flex: 1; padding: 1.5rem; overflow-y: auto; background: var(--background);
}

@media (max-width: 1200px) {
  .executive-card-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .executive-summary-panel { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .command-centre { grid-template-columns: 1fr; }
  .intelligence-metrics { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .executive-graphs { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
@media (max-width: 900px) {
  .app-shell { flex-direction: column; }
  .sidebar {
    width: 100%; border-right: none; border-bottom: 1px solid var(--border-color); padding: 1rem;
  }
  .sidebar__nav { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .nav-pillar { margin-bottom: 0; }
  .sub-nav-list { display: none; }
  .hero, .hero-enterprise { grid-template-columns: 1fr; padding: 2.5rem 1.25rem; gap: 2rem; }
  .hero-visual { order: -1; }
  .strip-inner, .features-grid, .how-steps { grid-template-columns: 1fr; }
  .landing-nav { display: none; }
  .dashboard-stats { width: 100%; justify-content: space-between; }
  .section-title { font-size: 1.5rem; }
}
@media (max-width: 800px) {
  .executive-card-grid, .executive-summary-panel, .kpi-grid, .intelligence-metrics, .executive-graphs { grid-template-columns: 1fr 1fr; }
  .executive-header { flex-direction: column; }
  .board-callout { flex-direction: column; align-items: flex-start; }
}
@media (max-width: 600px) {
  .landing-header { padding: 1rem 1.2rem; }
  .shell-header { padding: 0.75rem 1rem; }
  .shell-main { padding: 1rem; }
  .severity-grid { grid-template-columns: 1fr 1fr; }
  .executive-card-grid, .executive-summary-panel, .kpi-grid, .intelligence-metrics, .executive-graphs { grid-template-columns: 1fr; }
}

/* existing project styles continue below */

@media (max-width: 900px) {
  .app-shell { flex-direction: column; }
  .sidebar {
    width: 100%; border-right: none; border-bottom: 1px solid var(--border-color); padding: 1rem;
  }
  .sidebar__nav { display: flex; flex-wrap: wrap; gap: 0.35rem; }
  .nav-pillar { margin-bottom: 0; }
  .sub-nav-list { display: none; }
}
@media (max-width: 800px) {
  .hero, .hero-enterprise { grid-template-columns: 1fr; padding: 2.5rem 1.25rem; gap: 2rem; }
  .hero-visual { order: -1; }
  .strip-inner, .features-grid, .how-steps { grid-template-columns: 1fr; }
  .landing-nav { display: none; }
  .dashboard-stats { width: 100%; justify-content: space-between; }
  .section-title { font-size: 1.5rem; }
}
@media (max-width: 600px) {
  .landing-header { padding: 1rem 1.2rem; }
  .shell-header { padding: 0.75rem 1rem; }
  .shell-main { padding: 1rem; }
  .severity-grid { grid-template-columns: 1fr 1fr; }
}

* { box-sizing: border-box; }

/* Ensure app shell is not hidden by generic reset */

html, body, #root {
  min-height: 100%;
}

body {
  margin: 0; 
}

button, input, select, textarea {
  font: inherit;
}

/* Additional layout helpers */
.app-shell .main-wrapper {
  min-width: 0;
}

@media (max-width: 700px) {
  .executive-header {
    padding: 1rem;
  }
}

@media (max-width: 520px) {
  .summary-stat-block {
    padding: 0.8rem;
  }
}

/* no-op padding end */

/***** Final global app polish *****/

.executive-dashboard .btn {
  white-space: nowrap;
}

.executive-dashboard .summary-value,
.executive-dashboard .metric-box__value,
.executive-dashboard .kpi-label {
  font-variant-numeric: tabular-nums;
}

.executive-dashboard h2 {
  color: white;
}

.executive-dashboard .timeline-panel,
.executive-dashboard .fact-panel,
.executive-dashboard .stakeholder-panel,
.executive-dashboard .decision-log-box,
.executive-dashboard .graph-card,
.executive-dashboard .board-callout {
  overflow: hidden;
}

.executive-dashboard .timeline-panel .panel-title,
.executive-dashboard .stakeholder-panel .panel-title,
.executive-dashboard .fact-panel .panel-title {
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 0.55rem;
}

.executive-dashboard .stakeholder-list li span {
  font-weight: 600;
}

.executive-dashboard .movie-disclaimer {
  display: none;
}

/* file ends */


























































































































































































































































































































































































































"use strict";















































































































































































































































































































































































































































































































































































default}{"content":""}


























































































































































n