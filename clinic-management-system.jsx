import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Stethoscope, Users, UserPlus, ClipboardList, Printer, BarChart3,
  Search, Plus, X, Save, Trash2, IndianRupee, AlertCircle, CheckCircle2,
  Home, Pill, Receipt, CalendarDays, Loader2, Activity, Utensils, Check
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Theme                                                                */
/* ------------------------------------------------------------------ */
const GlobalStyle = () => (
  <style>{`
    .cms-root {
      --bg: #F6FAF9;
      --surface: #FFFFFF;
      --surface-alt: #EEF6F4;
      --primary: #146B5C;
      --primary-dark: #0E4F44;
      --primary-soft: #DCEFEA;
      --accent: #D98E3F;
      --accent-soft: #FBEBD6;
      --danger: #B3524A;
      --danger-soft: #F6E3E1;
      --text: #1B2B29;
      --text-muted: #5E7572;
      --border: #DCEAE7;
      font-family: 'Inter', -apple-system, sans-serif;
      background: var(--bg);
      color: var(--text);
    }
    .cms-root .font-display { font-family: 'Manrope', 'Inter', sans-serif; }
    .cms-root .font-mono { font-family: 'IBM Plex Mono', monospace; }
    .cms-card { background: var(--surface); border: 1px solid var(--border); border-radius: 16px; }
    .cms-input {
      background: var(--surface); border: 1.5px solid var(--border); border-radius: 10px;
      padding: 8px 12px; font-size: 14px; color: var(--text); outline: none;
      transition: border-color .15s ease; width: 100%;
    }
    .cms-input:focus { border-color: var(--primary); }
    .cms-input-sm {
      background: var(--surface); border: 1.3px solid var(--primary); border-radius: 7px;
      padding: 5px 7px; font-size: 12.5px; color: var(--text); outline: none; width: 100%;
    }
    .cms-input-sm:focus { border-color: var(--primary-dark); box-shadow: 0 0 0 2px var(--primary-soft); }
    .cms-label {
      font-size: 11px; font-weight: 600; letter-spacing: .04em; text-transform: uppercase;
      color: var(--text-muted); margin-bottom: 4px; display: block;
    }
    .cms-btn-primary {
      background: var(--primary); color: white; border-radius: 10px; padding: 9px 16px;
      font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;
      transition: background .15s ease; border: none; cursor: pointer;
    }
    .cms-btn-primary:hover { background: var(--primary-dark); }
    .cms-btn-primary:disabled { opacity: .5; cursor: not-allowed; }
    .cms-btn-ghost {
      background: var(--surface-alt); color: var(--primary-dark); border-radius: 10px; padding: 9px 16px;
      font-size: 14px; font-weight: 600; display: inline-flex; align-items: center; gap: 6px;
      border: 1px solid var(--border); cursor: pointer;
    }
    .cms-btn-ghost:hover { background: var(--primary-soft); }
    .cms-btn-danger {
      background: var(--danger-soft); color: var(--danger); border-radius: 8px; padding: 6px 10px;
      font-size: 13px; font-weight: 600; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 4px;
    }
    .cms-btn-icon { padding: 6px 8px; border-radius: 7px; border: none; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
    .cms-nav-item {
      display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 10px;
      font-size: 13.5px; font-weight: 600; color: var(--text-muted); cursor: pointer; transition: all .15s ease;
    }
    .cms-nav-item:hover { background: var(--surface-alt); color: var(--text); }
    .cms-nav-item.active { background: var(--primary); color: white; }
    .cms-table th {
      text-align: left; font-size: 10.5px; text-transform: uppercase; letter-spacing: .04em;
      color: var(--text-muted); font-weight: 700; padding: 8px 8px; border-bottom: 1.5px solid var(--border); white-space: nowrap;
    }
    .cms-table td { padding: 7px 8px; font-size: 13px; border-bottom: 1px solid var(--border); vertical-align: middle; }
    .cms-table tr:last-child td { border-bottom: none; }
    .cms-table tr.cms-entry-row td { background: var(--accent-soft); vertical-align: top; padding-top: 8px; padding-bottom: 8px; }
    .cms-pill { display: inline-flex; align-items: center; gap: 4px; padding: 3px 9px; border-radius: 999px; font-size: 11.5px; font-weight: 700; }
    .cms-badge-due { background: var(--danger-soft); color: var(--danger); }
    .cms-badge-paid { background: var(--primary-soft); color: var(--primary-dark); }
    .cms-kbd {
      font-family: 'IBM Plex Mono', monospace; font-size: 10px; font-weight: 700; padding: 1.5px 6px;
      border-radius: 5px; background: var(--surface-alt); color: var(--text-muted); border: 1px solid var(--border); line-height: 1.5;
    }
    .cms-nav-item.active .cms-kbd { background: rgba(255,255,255,.18); color: white; border-color: rgba(255,255,255,.3); }
    .cms-statusbar {
      background: var(--primary-dark); color: rgba(255,255,255,.92); font-size: 11px; padding: 6px 18px;
      display: flex; align-items: center; gap: 16px; flex-shrink: 0;
    }
    .cms-statusbar .cms-kbd { background: rgba(255,255,255,.14); color: white; border-color: rgba(255,255,255,.22); }
    .cms-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .cms-scrollbar::-webkit-scrollbar-thumb { background: var(--border); border-radius: 10px; }
    @media print {
      body * { visibility: hidden; }
      #cms-print-area, #cms-print-area * { visibility: visible; }
      #cms-print-area { position: absolute; top: 0; left: 0; width: 100%; padding: 24px; }
    }
  `}</style>
);

/* ------------------------------------------------------------------ */
/* Helpers                                                              */
/* ------------------------------------------------------------------ */
const pad = (n, len) => String(n).padStart(len, "0");
const todayISO = () => new Date().toISOString().slice(0, 10);
const nowTime = () => { const d = new Date(); return `${pad(d.getHours(), 2)}:${pad(d.getMinutes(), 2)}`; };
const fmtDate = (iso) => { if (!iso) return "-"; const [y, m, d] = iso.split("-"); return `${d}/${m}/${y}`; };
const fmtMoney = (n) => `\u20B9${Number(n || 0).toLocaleString("en-IN")}`;
const uid = () => Math.random().toString(36).slice(2, 10);

const PRINT_I18N = {
  en: { clinic: "Dhyey Clinic", sub: "Prescription", patient: "Patient", date: "Date", medicine: "Medicine", qty: "Qty", mor: "Morning", noon: "Noon", eve: "Evening", ngt: "Night", dietary: "Dietary Advice" },
  hi: { clinic: "ध्येय क्लिनिक", sub: "नुस्खा", patient: "रोगी", date: "दिनांक", medicine: "दवा", qty: "मात्रा", mor: "सुबह", noon: "दोपहर", eve: "शाम", ngt: "रात", dietary: "आहार सलाह" },
  gu: { clinic: "ધ્યેય ક્લિનિક", sub: "પ્રિસ્ક્રિપ્શન", patient: "દર્દી", date: "તારીખ", medicine: "દવા", qty: "જથ્થો", mor: "સવાર", noon: "બપોર", eve: "સાંજ", ngt: "રાત", dietary: "આહાર સલાહ" },
};

const seedDB = () => ({
  counters: { family: 2, patient: 1, visitCase: 383 },
  dietary: {
    DB: { code: "DB", text: "Diabetic diet: avoid sugar, sweets and fried food. Prefer high-fibre meals, eat on time." },
    CV: { code: "CV", text: "Low-salt, low-oil diet. Avoid red meat and packaged/processed food." },
    LQ: { code: "LQ", text: "Plenty of fluids and light, easily digestible food until fever/cough settles." },
  },
  families: {
    FAM0001: {
      id: "FAM0001",
      headName: "Amitbhai Vijaybhai Patel",
      area: "Govindpark",
      phone: "",
      createdAt: "2019-11-07",
      patients: {
        "FAM0001-1": {
          id: "FAM0001-1",
          name: "Amitbhai Vijaybhai Patel",
          relation: "Head",
          age: "",
          bloodGroup: "",
          allergy: "",
          visits: [
            { id: uid(), caseNo: 382, date: "2019-11-07", time: "10:59", weight: "", bp: "", refDr: "", diagnosis: "", complaint: "PROD. COUGH", treatment: [], prescription: [], charge: 0, received: 0, due: 0 },
            {
              id: uid(), caseNo: 383, date: "2026-07-31", time: "14:13", weight: "", bp: "", refDr: "", diagnosis: "", complaint: "PROD. COUGH",
              treatment: [{ name: "DEMISONE", qty: 5 }, { name: "TRUSTYL-BR 60ML SYRUP", qty: 1 }],
              prescription: [
                { name: "L-DIO-1 M TAB", qty: 5, mor: 1, noon: 0, eve: 0, ngt: 1 },
                { name: "LEVONUC-750 TAB", qty: 5, mor: 1, noon: 0, eve: 0, ngt: 0 },
              ],
              charge: 90, received: 90, due: 0,
            },
          ],
        },
      },
    },
  },
});

function allPatientsFlat(db) {
  const rows = [];
  if (!db) return rows;
  Object.values(db.families).forEach((fam) => {
    Object.values(fam.patients).forEach((pat) => {
      const totalDue = pat.visits.reduce((s, v) => s + (Number(v.due) || 0), 0);
      const lastVisit = pat.visits[pat.visits.length - 1];
      rows.push({ fam, pat, totalDue, lastVisit });
    });
  });
  return rows;
}

function searchFamilies(db, query) {
  if (!db) return [];
  const q = query.trim().toLowerCase();
  if (!q) return Object.values(db.families);
  return Object.values(db.families).filter(
    (f) => f.headName.toLowerCase().includes(q) || f.id.toLowerCase() === q || (f.area || "").toLowerCase().includes(q)
  );
}

/** Collect distinct historical values across all visits, for autocomplete suggestions. */
function useSuggestions(db) {
  return useMemo(() => {
    const diagnosis = new Set(), complaint = new Set(), refDr = new Set(), treatmentNames = new Set(), prescriptionNames = new Set();
    const weight = new Set(), bp = new Set(), relation = new Set(), bloodGroup = new Set(), allergy = new Set();
    Object.values(db.families).forEach((fam) =>
      Object.values(fam.patients).forEach((pat) => {
        if (pat.relation) relation.add(pat.relation);
        if (pat.bloodGroup) bloodGroup.add(pat.bloodGroup);
        if (pat.allergy) allergy.add(pat.allergy);
        pat.visits.forEach((v) => {
          if (v.diagnosis) diagnosis.add(v.diagnosis);
          if (v.complaint) complaint.add(v.complaint);
          if (v.refDr) refDr.add(v.refDr);
          if (v.weight) weight.add(v.weight);
          if (v.bp) bp.add(v.bp);
          (v.treatment || []).forEach((t) => t.name && treatmentNames.add(t.name));
          (v.prescription || []).forEach((p) => p.name && prescriptionNames.add(p.name));
        });
      })
    );
    const toArr = (s) => Array.from(s).sort();
    return {
      diagnosis: toArr(diagnosis), complaint: toArr(complaint), refDr: toArr(refDr),
      treatmentNames: toArr(treatmentNames), prescriptionNames: toArr(prescriptionNames),
      weight: toArr(weight), bp: toArr(bp), relation: toArr(relation), bloodGroup: toArr(bloodGroup), allergy: toArr(allergy),
    };
  }, [db]);
}

function Datalists({ s }) {
  return (
    <>
      <datalist id="dl-diagnosis">{s.diagnosis.map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="dl-complaint">{s.complaint.map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="dl-refdr">{s.refDr.map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="dl-treatment-names">{s.treatmentNames.map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="dl-prescription-names">{s.prescriptionNames.map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="dl-weight">{s.weight.map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="dl-bp">{s.bp.map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="dl-relation">{s.relation.map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="dl-bloodgroup">{s.bloodGroup.map((v) => <option key={v} value={v} />)}</datalist>
      <datalist id="dl-allergy">{s.allergy.map((v) => <option key={v} value={v} />)}</datalist>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Small building blocks                                               */
/* ------------------------------------------------------------------ */
function StatCard({ icon: Icon, label, value, tone = "primary" }) {
  const toneMap = {
    primary: { bg: "var(--primary-soft)", fg: "var(--primary-dark)" },
    accent: { bg: "var(--accent-soft)", fg: "#8A5A1E" },
    danger: { bg: "var(--danger-soft)", fg: "var(--danger)" },
  };
  const c = toneMap[tone];
  return (
    <div className="cms-card" style={{ padding: 18, flex: 1, minWidth: 160 }}>
      <div style={{ width: 34, height: 34, borderRadius: 10, background: c.bg, color: c.fg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 10 }}>
        <Icon size={17} />
      </div>
      <div className="font-mono" style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
      <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: Home, key: "F4" },
  { id: "register", label: "Family / Patient Reg.", icon: UserPlus, key: "F1" },
  { id: "case", label: "Patient Record", icon: ClipboardList, key: "F3" },
  { id: "reports", label: "Reports", icon: BarChart3, key: "F5" },
];

function Sidebar({ view, setView }) {
  return (
    <div style={{ width: 236, flexShrink: 0, background: "var(--surface)", borderRight: "1px solid var(--border)", padding: "20px 14px", display: "flex", flexDirection: "column", gap: 4, height: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 8px 20px" }}>
        <div style={{ width: 32, height: 32, borderRadius: 9, background: "var(--primary)", display: "flex", alignItems: "center", justifyContent: "center", color: "white" }}>
          <Stethoscope size={17} />
        </div>
        <div className="font-display" style={{ fontWeight: 800, fontSize: 15, lineHeight: 1.1 }}>Dhyey Clinic</div>
      </div>
      {NAV_ITEMS.map((it) => (
        <div key={it.id} className={`cms-nav-item ${view === it.id ? "active" : ""}`} onClick={() => setView(it.id)} style={{ justifyContent: "space-between" }}>
          <span style={{ display: "flex", alignItems: "center", gap: 10 }}><it.icon size={16} />{it.label}</span>
          <span className="cms-kbd">{it.key}</span>
        </div>
      ))}
      <div style={{ flex: 1 }} />
      <div style={{ fontSize: 10.5, color: "var(--text-muted)", padding: "10px 8px", lineHeight: 1.7 }}>
        <b>Keyboard first:</b><br />
        F1 Family/Patient Reg &middot; F2 Add Member<br />
        F3 Patient Record &middot; F4 Dashboard<br />
        F5 Reports &middot; F6 New Visit Row<br />
        F9 Print &middot; / Search &middot; Esc Close
      </div>
    </div>
  );
}

function TopBar({ query, setQuery, onSearchSubmit }) {
  return (
    <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "14px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
      <div>
        <div className="font-display" style={{ fontWeight: 800, fontSize: 17 }}>Dhyey Clinic &middot; Patient Management</div>
        <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtDate(todayISO())}</div>
      </div>
      <form onSubmit={(e) => { e.preventDefault(); onSearchSubmit(query); }} style={{ display: "flex", alignItems: "center", gap: 8, width: 380 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} style={{ position: "absolute", left: 10, top: 10, color: "var(--text-muted)" }} />
          <input id="cms-top-search" className="cms-input" style={{ paddingLeft: 32, paddingRight: 46 }} placeholder="Search family head name or ID (e.g. FAM0001)" value={query} onChange={(e) => setQuery(e.target.value)} />
          <span className="cms-kbd" style={{ position: "absolute", right: 8, top: 8 }}>/</span>
        </div>
        <button type="submit" className="cms-btn-primary"><Search size={14} />Go</button>
      </form>
    </div>
  );
}

function StatusBar({ view }) {
  const [clock, setClock] = useState(nowTime());
  useEffect(() => { const t = setInterval(() => setClock(nowTime()), 15000); return () => clearInterval(t); }, []);
  const contextHint = view === "case" ? "F6 New Visit Row \u00b7 F9 Print" : view === "register" ? "F1 New Family \u00b7 F2 New Member" : "";
  return (
    <div className="cms-statusbar">
      <span><b>Dhyey Clinic</b></span>
      <span>F1 Family Reg</span><span>F2 Patient Reg</span><span>F3 Patient Record</span><span>F4 Dashboard</span><span>F5 Reports</span>
      {contextHint && <span style={{ color: "var(--accent-soft)" }}>{contextHint}</span>}
      <span style={{ marginLeft: "auto" }} className="font-mono">{clock}</span>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const isErr = toast.type === "error";
  return (
    <div style={{ position: "fixed", bottom: 22, right: 26, zIndex: 200, background: isErr ? "var(--danger)" : "var(--primary)", color: "white", padding: "11px 18px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,.18)" }}>
      {isErr ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
      {toast.msg}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Dashboard                                                            */
/* ------------------------------------------------------------------ */
function Dashboard({ db, goToPatient }) {
  const rows = useMemo(() => allPatientsFlat(db), [db]);
  const totalFamilies = Object.keys(db.families).length;
  const totalPatients = rows.length;
  const today = todayISO();
  const allVisits = [];
  rows.forEach(({ fam, pat }) => pat.visits.forEach((v) => allVisits.push({ ...v, famHead: fam.headName, famId: fam.id, patId: pat.id, patName: pat.name })));
  const todaysVisits = allVisits.filter((v) => v.date === today);
  const todaysCollection = todaysVisits.reduce((s, v) => s + (Number(v.received) || 0), 0);
  const totalDue = rows.reduce((s, r) => s + r.totalDue, 0);
  const recent = [...allVisits].sort((a, b) => (b.date + b.time).localeCompare(a.date + a.time)).slice(0, 8);
  const duesList = rows.filter((r) => r.totalDue > 0).sort((a, b) => b.totalDue - a.totalDue).slice(0, 8);

  return (
    <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        <StatCard icon={Users} label="Registered Families" value={totalFamilies} />
        <StatCard icon={Activity} label="Total Patients" value={totalPatients} />
        <StatCard icon={ClipboardList} label="Today's Visits" value={todaysVisits.length} tone="accent" />
        <StatCard icon={IndianRupee} label="Today's Collection" value={fmtMoney(todaysCollection)} />
        <StatCard icon={AlertCircle} label="Outstanding Dues" value={fmtMoney(totalDue)} tone="danger" />
      </div>
      <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
        <div className="cms-card" style={{ flex: 1.4, padding: 18 }}>
          <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>Recent Visits</div>
          <div style={{ overflowX: "auto" }}>
            <table className="cms-table" style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead><tr><th>Date</th><th>Case</th><th>Patient</th><th>Complaint</th><th>Due</th></tr></thead>
              <tbody>
                {recent.length === 0 && <tr><td colSpan={5} style={{ color: "var(--text-muted)", textAlign: "center", padding: 20 }}>No visits recorded yet.</td></tr>}
                {recent.map((v) => (
                  <tr key={v.id} onClick={() => goToPatient(v.famId, v.patId)} style={{ cursor: "pointer" }}>
                    <td className="font-mono">{fmtDate(v.date)}</td>
                    <td className="font-mono">#{v.caseNo}</td>
                    <td>{v.patName}<div style={{ fontSize: 11, color: "var(--text-muted)" }}>{v.famHead}</div></td>
                    <td>{v.complaint || "-"}</td>
                    <td>{v.due > 0 ? <span className="cms-pill cms-badge-due">{fmtMoney(v.due)}</span> : <span className="cms-pill cms-badge-paid">Paid</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="cms-card" style={{ flex: 1, padding: 18 }}>
          <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>Top Outstanding Dues</div>
          {duesList.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 13, padding: "10px 0" }}>Nobody owes anything right now.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {duesList.map(({ fam, pat, totalDue }) => (
              <div key={pat.id} onClick={() => goToPatient(fam.id, pat.id)} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "9px 12px", borderRadius: 10, background: "var(--surface-alt)", cursor: "pointer" }}>
                <div><div style={{ fontSize: 13, fontWeight: 700 }}>{pat.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{fam.headName} &middot; {fam.id}</div></div>
                <span className="cms-pill cms-badge-due">{fmtMoney(totalDue)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Register view: Family / Member / Dietary Library                    */
/* ------------------------------------------------------------------ */
function NewFamilyForm({ onCreate, autoFocusRef }) {
  const [headName, setHeadName] = useState("");
  const submit = (e) => { e.preventDefault(); if (!headName.trim()) return; onCreate(headName.trim()); setHeadName(""); };
  return (
    <form onSubmit={submit} className="cms-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="font-display" style={{ fontWeight: 800, fontSize: 15 }}>Step 1 &middot; Register Family Head</div>
      <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: -8 }}>
        Just the head's name is needed here. A special Family Code is generated instantly, and every family
        member &mdash; including the head &mdash; is then added through one identical member form, all linked to that code.
      </div>
      <div>
        <label className="cms-label">Family Head Name *</label>
        <input ref={autoFocusRef} autoFocus className="cms-input" value={headName} onChange={(e) => setHeadName(e.target.value)} placeholder="e.g. Amitbhai Vijaybhai Patel" />
      </div>
      <div><button type="submit" className="cms-btn-primary"><Save size={14} />Generate Family Code<span className="cms-kbd" style={{ marginLeft: 4 }}>Enter</span></button></div>
    </form>
  );
}

function AddMemberForm({ db, onAdd, presetFamId, defaultRelation, onDoneWithPreset, autoFocusRef }) {
  const [query, setQuery] = useState("");
  const [famId, setFamId] = useState(presetFamId || "");
  const [highlight, setHighlight] = useState(0);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState(defaultRelation || "");
  const [age, setAge] = useState("");
  const [bloodGroup, setBloodGroup] = useState("");
  const [allergy, setAllergy] = useState("");

  useEffect(() => { setFamId(presetFamId || ""); setRelation(defaultRelation || ""); setQuery(""); }, [presetFamId, defaultRelation]);

  const matches = !famId && query.trim() ? searchFamilies(db, query).slice(0, 6) : [];
  const chosenFam = famId ? db.families[famId] : null;
  const pick = (f) => { setFamId(f.id); setQuery(""); setHighlight(0); };

  const handleQueryKeyDown = (e) => {
    if (matches.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => Math.min(h + 1, matches.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); pick(matches[highlight]); }
    else if (e.key === "Escape") { setQuery(""); }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!chosenFam || !name.trim()) return;
    onAdd(chosenFam.id, { name: name.trim(), relation: relation.trim(), age, bloodGroup, allergy });
    setName(""); setRelation(""); setAge(""); setBloodGroup(""); setAllergy("");
  };

  return (
    <form onSubmit={submit} className="cms-card" style={{ padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
      <div className="font-display" style={{ fontWeight: 800, fontSize: 15 }}>{presetFamId ? "Step 2 \u00b7 Add Member Details" : "Add Member to Existing Family"}</div>
      {presetFamId && chosenFam && (
        <div style={{ background: "var(--primary-soft)", color: "var(--primary-dark)", padding: "8px 12px", borderRadius: 10, fontSize: 12.5, fontWeight: 600 }}>
          Family Code <span className="font-mono">{chosenFam.id}</span> generated for {chosenFam.headName}. Fill their details below, then keep adding other members before clicking Done.
        </div>
      )}
      {!presetFamId && (
        <div style={{ position: "relative" }}>
          <label className="cms-label">Find Family (head name or Family ID)</label>
          <input
            ref={autoFocusRef}
            className="cms-input"
            value={chosenFam ? `${chosenFam.headName} (${chosenFam.id})` : query}
            onChange={(e) => { setQuery(e.target.value); setFamId(""); setHighlight(0); }}
            onKeyDown={handleQueryKeyDown}
            placeholder="Start typing family head name... (arrows + Enter)"
          />
          {!chosenFam && matches.length > 0 && (
            <div className="cms-card" style={{ marginTop: 6, overflow: "hidden" }}>
              {matches.map((f, i) => (
                <div key={f.id} onClick={() => pick(f)} onMouseEnter={() => setHighlight(i)} style={{ padding: "8px 12px", fontSize: 13, cursor: "pointer", borderBottom: "1px solid var(--border)", background: i === highlight ? "var(--surface-alt)" : "transparent" }}>
                  <b>{f.headName}</b> <span className="font-mono" style={{ color: "var(--text-muted)" }}>&middot; {f.id}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      {chosenFam && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div><label className="cms-label">Member Name *</label><input ref={presetFamId ? autoFocusRef : undefined} autoFocus={!!presetFamId} className="cms-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></div>
          <div><label className="cms-label">Relation to Head</label><input className="cms-input" list="dl-relation" value={relation} onChange={(e) => setRelation(e.target.value)} placeholder="e.g. Head, Wife, Son" /></div>
          <div><label className="cms-label">Age</label><input className="cms-input" value={age} onChange={(e) => setAge(e.target.value)} /></div>
          <div><label className="cms-label">Blood Group</label><input className="cms-input" list="dl-bloodgroup" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)} /></div>
          <div style={{ gridColumn: "1 / -1" }}><label className="cms-label">Allergy</label><input className="cms-input" list="dl-allergy" value={allergy} onChange={(e) => setAllergy(e.target.value)} /></div>
        </div>
      )}
      <div style={{ display: "flex", gap: 10 }}>
        <button type="submit" disabled={!chosenFam} className="cms-btn-primary"><UserPlus size={14} />Save Member<span className="cms-kbd" style={{ marginLeft: 4 }}>Enter</span></button>
        {presetFamId && <button type="button" className="cms-btn-ghost" onClick={onDoneWithPreset}>Done adding to this family</button>}
      </div>
    </form>
  );
}

function DietaryLibraryTab({ db, onAdd, onDelete }) {
  const [code, setCode] = useState("");
  const [text, setText] = useState("");
  const items = Object.values(db.dietary || {}).sort((a, b) => a.code.localeCompare(b.code));

  const submit = (e) => {
    e.preventDefault();
    const c = code.trim().toUpperCase();
    if (!c || !text.trim()) return;
    onAdd(c, text.trim());
    setCode(""); setText("");
  };

  return (
    <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
      <form onSubmit={submit} className="cms-card" style={{ flex: 1, padding: 20, display: "flex", flexDirection: "column", gap: 14 }}>
        <div className="font-display" style={{ fontWeight: 800, fontSize: 15 }}>Dietary Advice Library</div>
        <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: -8 }}>
          Store reusable dietary advice once, with a short code. At print time you can pull any of these onto a
          patient's prescription by code &mdash; this library is never saved into patient history.
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 3fr", gap: 12 }}>
          <div><label className="cms-label">Shortcut Code</label><input className="cms-input" value={code} onChange={(e) => setCode(e.target.value)} placeholder="e.g. DB" style={{ textTransform: "uppercase" }} /></div>
          <div><label className="cms-label">Full Dietary Text</label><input className="cms-input" value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Avoid sugar and fried food..." /></div>
        </div>
        <div><button type="submit" className="cms-btn-primary"><Utensils size={14} />Save to Library</button></div>
      </form>
      <div className="cms-card" style={{ flex: 1, padding: 18, maxHeight: 420, overflowY: "auto" }}>
        <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>Saved Entries ({items.length})</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((d) => (
            <div key={d.code} style={{ display: "flex", justifyContent: "space-between", gap: 10, padding: "9px 12px", borderRadius: 10, background: "var(--surface-alt)" }}>
              <div>
                <span className="font-mono cms-pill cms-badge-paid" style={{ marginRight: 8 }}>{d.code}</span>
                <span style={{ fontSize: 12.5 }}>{d.text}</span>
              </div>
              <button className="cms-btn-danger" style={{ flexShrink: 0 }} onClick={() => onDelete(d.code)}><Trash2 size={13} /></button>
            </div>
          ))}
          {items.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No dietary entries yet.</div>}
        </div>
      </div>
    </div>
  );
}

function RegisterView({ db, tab, setTab, onCreateFamily, onAddMember, presetFamId, presetRelation, clearPreset, focusRef, onAddDietary, onDeleteDietary }) {
  const families = Object.values(db.families).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const suggestions = useSuggestions(db);
  return (
    <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 20 }}>
      <Datalists s={suggestions} />
      <div style={{ display: "flex", gap: 8 }}>
        <button className={tab === "family" ? "cms-btn-primary" : "cms-btn-ghost"} onClick={() => setTab("family")}>New Family <span className="cms-kbd" style={{ marginLeft: 6 }}>F1</span></button>
        <button className={tab === "member" ? "cms-btn-primary" : "cms-btn-ghost"} onClick={() => setTab("member")}>Add Member <span className="cms-kbd" style={{ marginLeft: 6 }}>F2</span></button>
        <button className={tab === "dietary" ? "cms-btn-primary" : "cms-btn-ghost"} onClick={() => setTab("dietary")}><Utensils size={14} />Dietary Library</button>
      </div>
      {tab === "dietary" ? (
        <DietaryLibraryTab db={db} onAdd={onAddDietary} onDelete={onDeleteDietary} />
      ) : (
        <div style={{ display: "flex", gap: 20, alignItems: "flex-start" }}>
          <div style={{ flex: 1 }}>
            {tab === "family"
              ? <NewFamilyForm onCreate={onCreateFamily} autoFocusRef={focusRef} />
              : <AddMemberForm db={db} onAdd={onAddMember} presetFamId={presetFamId} defaultRelation={presetRelation} onDoneWithPreset={clearPreset} autoFocusRef={focusRef} />}
          </div>
          <div className="cms-card" style={{ flex: 1, padding: 18, maxHeight: 460, overflowY: "auto" }}>
            <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>All Families ({families.length})</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {families.map((f) => (
                <div key={f.id} style={{ padding: "10px 12px", borderRadius: 10, background: "var(--surface-alt)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between" }}><b style={{ fontSize: 13.5 }}>{f.headName}</b><span className="font-mono" style={{ fontSize: 12, color: "var(--primary-dark)", fontWeight: 700 }}>{f.id}</span></div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{Object.keys(f.patients).length} member(s)</div>
                </div>
              ))}
              {families.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No families registered yet.</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Case Entry — grid-style inline visit entry                          */
/* ------------------------------------------------------------------ */
const BLANK_ROW = () => ({ date: todayISO(), time: nowTime(), weight: "", bp: "", refDr: "", diagnosis: "", complaint: "", charge: "", received: "" });

function CaseEntryView({ db, selection, setSelection, onAddVisit, onCollectPayment, onOpenPrint, onAddMember, actionsRef }) {
  const suggestions = useSuggestions(db);
  const [famQuery, setFamQuery] = useState("");
  const [famHighlight, setFamHighlight] = useState(0);
  const [entryOpen, setEntryOpen] = useState(false);
  const [row, setRow] = useState(BLANK_ROW());
  const [treatment, setTreatment] = useState([{ name: "", qty: "" }]);
  const [prescription, setPrescription] = useState([{ name: "", qty: "", mor: "", noon: "", eve: "", ngt: "" }]);
  const [payingVisit, setPayingVisit] = useState(null);
  const [payAmt, setPayAmt] = useState("");
  const [quickAdd, setQuickAdd] = useState(false);
  const [qName, setQName] = useState("");
  const [qRelation, setQRelation] = useState("");

  const results = famQuery.trim() ? searchFamilies(db, famQuery) : [];
  const family = selection.familyId ? db.families[selection.familyId] : null;
  const patient = family && selection.patientId ? family.patients[selection.patientId] : null;
  const totalDue = patient ? patient.visits.reduce((s, v) => s + (Number(v.due) || 0), 0) : 0;
  const due = Math.max(0, (Number(row.charge) || 0) - (Number(row.received) || 0));

  const openEntry = useCallback(() => {
    setRow(BLANK_ROW());
    setTreatment([{ name: "", qty: "" }]);
    setPrescription([{ name: "", qty: "", mor: "", noon: "", eve: "", ngt: "" }]);
    setEntryOpen(true);
  }, []);

  useEffect(() => {
    if (!actionsRef) return;
    actionsRef.current.newVisit = patient ? openEntry : null;
    actionsRef.current.print = patient && patient.visits.length > 0 ? () => onOpenPrint(family, patient, patient.visits[patient.visits.length - 1]) : null;
    return () => { actionsRef.current.newVisit = null; actionsRef.current.print = null; };
  }, [actionsRef, patient, family, onOpenPrint, openEntry]);

  // Reset the entry panel whenever the selected patient changes.
  useEffect(() => { setEntryOpen(false); }, [selection.patientId]);

  const pickFamily = (famId) => {
    const fam = db.families[famId];
    const firstPatientId = Object.keys(fam.patients)[0];
    setSelection({ familyId: famId, patientId: firstPatientId || null });
    setFamQuery(""); setFamHighlight(0);
  };

  const handleFamKeyDown = (e) => {
    if (results.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setFamHighlight((h) => Math.min(h + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setFamHighlight((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); pickFamily(results[famHighlight].id); }
    else if (e.key === "Escape") { setFamQuery(""); }
  };

  const submitPayment = () => {
    const amt = Number(payAmt) || 0;
    if (amt <= 0 || !payingVisit) return;
    onCollectPayment(selection.familyId, selection.patientId, payingVisit, amt);
    setPayingVisit(null); setPayAmt("");
  };

  const submitQuickAdd = (e) => {
    e.preventDefault();
    if (!qName.trim()) return;
    onAddMember(selection.familyId, { name: qName.trim(), relation: qRelation.trim(), age: "", bloodGroup: "", allergy: "" });
    setQName(""); setQRelation(""); setQuickAdd(false);
  };

  const updateItem = (list, setList, idx, field, val) => { const next = [...list]; next[idx] = { ...next[idx], [field]: val }; setList(next); };
  const addItem = (list, setList, blank) => setList([...list, blank]);
  const removeItem = (list, setList, idx) => setList(list.filter((_, i) => i !== idx));

  const saveEntry = () => {
    onAddVisit(family.id, patient.id, {
      ...row,
      treatment: treatment.filter((t) => t.name.trim()),
      prescription: prescription.filter((p) => p.name.trim()),
      charge: Number(row.charge) || 0,
      received: Number(row.received) || 0,
      due,
    });
    setEntryOpen(false);
  };

  return (
    <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 18 }}>
      <Datalists s={suggestions} />
      <div className="cms-card" style={{ padding: 16 }}>
        <label className="cms-label">Find Family by Head Name or Family ID</label>
        <div style={{ position: "relative" }}>
          <input id="cms-case-search" className="cms-input" value={famQuery} onChange={(e) => { setFamQuery(e.target.value); setFamHighlight(0); }} onKeyDown={handleFamKeyDown} placeholder="Type family head name or FAM ID... (arrows + Enter)" />
          {results.length > 0 && (
            <div className="cms-card" style={{ position: "absolute", top: 42, left: 0, right: 0, zIndex: 20, maxHeight: 220, overflowY: "auto" }}>
              {results.map((f, i) => (
                <div key={f.id} onClick={() => pickFamily(f.id)} onMouseEnter={() => setFamHighlight(i)} style={{ padding: "9px 12px", cursor: "pointer", borderBottom: "1px solid var(--border)", background: i === famHighlight ? "var(--surface-alt)" : "transparent" }}>
                  <b style={{ fontSize: 13.5 }}>{f.headName}</b> <span className="font-mono" style={{ fontSize: 11.5, color: "var(--primary-dark)" }}>&middot; {f.id}</span>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{Object.keys(f.patients).length} member(s)</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {!family && <div className="cms-card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Search and select a family above to begin a case entry.</div>}

      {family && (
        <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
          <div className="cms-card" style={{ width: 240, padding: 14, flexShrink: 0 }}>
            <div className="font-display" style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 8 }}>{family.headName}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 10 }}>{family.id} &middot; {Object.keys(family.patients).length} member(s)</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {Object.values(family.patients).map((p) => (
                <div key={p.id} onClick={() => setSelection({ familyId: family.id, patientId: p.id })} style={{ padding: "8px 10px", borderRadius: 9, cursor: "pointer", fontSize: 13, background: selection.patientId === p.id ? "var(--primary)" : "var(--surface-alt)", color: selection.patientId === p.id ? "white" : "var(--text)" }}>
                  <div style={{ fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 10.5, opacity: 0.8 }}>{p.relation || "Member"} &middot; {p.id}</div>
                </div>
              ))}
            </div>
            {!quickAdd ? (
              <button className="cms-btn-ghost" style={{ width: "100%", justifyContent: "center", marginTop: 10, fontSize: 12.5 }} onClick={() => setQuickAdd(true)}><UserPlus size={13} />Add Member</button>
            ) : (
              <form onSubmit={submitQuickAdd} style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 6 }}>
                <input className="cms-input" placeholder="Name" value={qName} onChange={(e) => setQName(e.target.value)} />
                <input className="cms-input" list="dl-relation" placeholder="Relation" value={qRelation} onChange={(e) => setQRelation(e.target.value)} />
                <div style={{ display: "flex", gap: 6 }}>
                  <button type="submit" className="cms-btn-primary" style={{ flex: 1, justifyContent: "center", fontSize: 12.5 }}>Save</button>
                  <button type="button" className="cms-btn-ghost" style={{ fontSize: 12.5 }} onClick={() => setQuickAdd(false)}><X size={13} /></button>
                </div>
              </form>
            )}
          </div>

          {!patient ? (
            <div className="cms-card" style={{ flex: 1, padding: 40, textAlign: "center", color: "var(--text-muted)" }}>
              This family has no members yet. Use "Add Member" on the left (or press <span className="cms-kbd">F2</span>) to add the first one.
            </div>
          ) : (
            <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
              <div className="cms-card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div className="font-display" style={{ fontWeight: 800, fontSize: 16 }}>{patient.name}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                    {patient.relation || "Head"} &middot; <span className="font-mono">{patient.id}</span>
                    {patient.age ? ` \u00b7 Age ${patient.age}` : ""}{patient.bloodGroup ? ` \u00b7 ${patient.bloodGroup}` : ""}{patient.allergy ? ` \u00b7 Allergy: ${patient.allergy}` : ""}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  {totalDue > 0 && <span className="cms-pill cms-badge-due" style={{ fontSize: 13, padding: "6px 12px" }}>Total Due {fmtMoney(totalDue)}</span>}
                  {!entryOpen && <button className="cms-btn-primary" onClick={openEntry}><Plus size={14} />New Visit Row<span className="cms-kbd" style={{ marginLeft: 4 }}>F6</span></button>}
                </div>
              </div>

              <div className="cms-card" style={{ padding: 16 }}>
                <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>
                  Visit History {entryOpen && <span style={{ fontWeight: 500, fontSize: 12, color: "var(--text-muted)" }}>&mdash; type the new case directly into the highlighted row below; older visits stay visible for reference.</span>}
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="cms-table" style={{ width: "100%", borderCollapse: "collapse", minWidth: 760 }}>
                    <thead>
                      <tr><th>Case</th><th>Date</th><th>Weight</th><th>BP</th><th>Ref Dr</th><th>Diagnosis</th><th>Complaint</th><th>Charge</th><th>Received</th><th>Due</th><th></th></tr>
                    </thead>
                    <tbody>
                      {entryOpen && (
                        <tr className="cms-entry-row">
                          <td className="font-mono" style={{ fontSize: 11.5 }}>new</td>
                          <td><input type="date" className="cms-input-sm" value={row.date} onChange={(e) => setRow({ ...row, date: e.target.value })} /></td>
                          <td><input className="cms-input-sm" list="dl-weight" style={{ width: 52 }} value={row.weight} onChange={(e) => setRow({ ...row, weight: e.target.value })} /></td>
                          <td><input className="cms-input-sm" list="dl-bp" style={{ width: 60 }} value={row.bp} onChange={(e) => setRow({ ...row, bp: e.target.value })} placeholder="120/80" /></td>
                          <td><input className="cms-input-sm" list="dl-refdr" value={row.refDr} onChange={(e) => setRow({ ...row, refDr: e.target.value })} /></td>
                          <td><input className="cms-input-sm" list="dl-diagnosis" value={row.diagnosis} onChange={(e) => setRow({ ...row, diagnosis: e.target.value })} /></td>
                          <td><input className="cms-input-sm" list="dl-complaint" value={row.complaint} onChange={(e) => setRow({ ...row, complaint: e.target.value })} placeholder="e.g. PROD. COUGH" /></td>
                          <td><input className="cms-input-sm" style={{ width: 56 }} value={row.charge} onChange={(e) => setRow({ ...row, charge: e.target.value })} placeholder="0" /></td>
                          <td><input className="cms-input-sm" style={{ width: 56 }} value={row.received} onChange={(e) => setRow({ ...row, received: e.target.value })} placeholder="0" /></td>
                          <td className="font-mono" style={{ fontWeight: 700, color: due > 0 ? "var(--danger)" : "var(--primary-dark)" }}>{fmtMoney(due)}</td>
                          <td>
                            <div style={{ display: "flex", gap: 4 }}>
                              <button className="cms-btn-icon" style={{ background: "var(--primary)", color: "white" }} title="Save visit" onClick={saveEntry}><Check size={14} /></button>
                              <button className="cms-btn-icon" style={{ background: "var(--danger-soft)", color: "var(--danger)" }} title="Cancel" onClick={() => setEntryOpen(false)}><X size={14} /></button>
                            </div>
                          </td>
                        </tr>
                      )}
                      {[...patient.visits].reverse().map((v) => (
                        <React.Fragment key={v.id}>
                          <tr>
                            <td className="font-mono">#{v.caseNo}</td>
                            <td className="font-mono">{fmtDate(v.date)} {v.time}</td>
                            <td>{v.weight || "-"}</td>
                            <td>{v.bp || "-"}</td>
                            <td>{v.refDr || "-"}</td>
                            <td>{v.diagnosis || "-"}</td>
                            <td>{v.complaint || "-"}</td>
                            <td className="font-mono">{fmtMoney(v.charge)}</td>
                            <td className="font-mono">{fmtMoney(v.received)}</td>
                            <td>{v.due > 0 ? <span className="cms-pill cms-badge-due">{fmtMoney(v.due)}</span> : <span className="cms-pill cms-badge-paid">Paid</span>}</td>
                            <td>
                              <div style={{ display: "flex", gap: 6 }}>
                                <button className="cms-btn-ghost" style={{ padding: "5px 8px" }} title="Print prescription (F9)" onClick={() => onOpenPrint(family, patient, v)}><Printer size={13} /></button>
                                {v.due > 0 && (payingVisit === v.id ? (
                                  <>
                                    <input className="cms-input" style={{ width: 70, padding: "5px 8px" }} placeholder="\u20B9" value={payAmt} onChange={(e) => setPayAmt(e.target.value)} />
                                    <button className="cms-btn-primary" style={{ padding: "5px 9px" }} onClick={submitPayment}><Save size={12} /></button>
                                  </>
                                ) : (
                                  <button className="cms-btn-ghost" style={{ padding: "5px 8px" }} title="Collect payment" onClick={() => { setPayingVisit(v.id); setPayAmt(""); }}><Receipt size={13} /></button>
                                ))}
                              </div>
                            </td>
                          </tr>
                          {(v.treatment.length > 0 || v.prescription.length > 0) && (
                            <tr>
                              <td colSpan={11} style={{ background: "var(--surface-alt)", fontSize: 12 }}>
                                {v.treatment.length > 0 && <div style={{ marginBottom: v.prescription.length ? 4 : 0 }}><b>Treatment:</b> {v.treatment.map((t) => `${t.name} (${t.qty})`).join(", ")}</div>}
                                {v.prescription.length > 0 && <div><b>Prescription:</b> {v.prescription.map((p) => `${p.name} x${p.qty}`).join(", ")}</div>}
                              </td>
                            </tr>
                          )}
                        </React.Fragment>
                      ))}
                      {patient.visits.length === 0 && !entryOpen && <tr><td colSpan={11} style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>No visits yet for this patient.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </div>

              {entryOpen && (
                <div className="cms-card" style={{ padding: 16, display: "flex", gap: 20 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <label className="cms-label" style={{ margin: 0 }}>Treatment (given at clinic)</label>
                      <button type="button" className="cms-btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => addItem(treatment, setTreatment, { name: "", qty: "" })}><Plus size={13} />Row</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {treatment.map((r, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 8 }}>
                          <input className="cms-input" list="dl-treatment-names" placeholder="Item name" style={{ flex: 3 }} value={r.name} onChange={(e) => updateItem(treatment, setTreatment, idx, "name", e.target.value)} />
                          <input className="cms-input" placeholder="Qty" style={{ flex: 1 }} value={r.qty} onChange={(e) => updateItem(treatment, setTreatment, idx, "qty", e.target.value)} />
                          <button type="button" className="cms-btn-danger" onClick={() => removeItem(treatment, setTreatment, idx)}><Trash2 size={13} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ flex: 1.4 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <label className="cms-label" style={{ margin: 0 }}>Prescription (from medical store)</label>
                      <button type="button" className="cms-btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => addItem(prescription, setPrescription, { name: "", qty: "", mor: "", noon: "", eve: "", ngt: "" })}><Plus size={13} />Row</button>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", gap: 8, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", paddingLeft: 2 }}>
                        <div style={{ flex: 3 }}>MEDICINE</div><div style={{ flex: 1 }}>QTY</div><div style={{ flex: 1, textAlign: "center" }}>MOR</div><div style={{ flex: 1, textAlign: "center" }}>NOON</div><div style={{ flex: 1, textAlign: "center" }}>EVE</div><div style={{ flex: 1, textAlign: "center" }}>NGT</div><div style={{ width: 30 }} />
                      </div>
                      {prescription.map((r, idx) => (
                        <div key={idx} style={{ display: "flex", gap: 8 }}>
                          <input className="cms-input" list="dl-prescription-names" placeholder="e.g. L-DIO-1 M TAB" style={{ flex: 3 }} value={r.name} onChange={(e) => updateItem(prescription, setPrescription, idx, "name", e.target.value)} />
                          <input className="cms-input" placeholder="5" style={{ flex: 1 }} value={r.qty} onChange={(e) => updateItem(prescription, setPrescription, idx, "qty", e.target.value)} />
                          <input className="cms-input" style={{ flex: 1, textAlign: "center" }} value={r.mor} onChange={(e) => updateItem(prescription, setPrescription, idx, "mor", e.target.value)} />
                          <input className="cms-input" style={{ flex: 1, textAlign: "center" }} value={r.noon} onChange={(e) => updateItem(prescription, setPrescription, idx, "noon", e.target.value)} />
                          <input className="cms-input" style={{ flex: 1, textAlign: "center" }} value={r.eve} onChange={(e) => updateItem(prescription, setPrescription, idx, "eve", e.target.value)} />
                          <input className="cms-input" style={{ flex: 1, textAlign: "center" }} value={r.ngt} onChange={(e) => updateItem(prescription, setPrescription, idx, "ngt", e.target.value)} />
                          <button type="button" className="cms-btn-danger" style={{ width: 30, justifyContent: "center" }} onClick={() => removeItem(prescription, setPrescription, idx)}><Trash2 size={13} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Print modal — minimal patient-facing prescription, 3 languages      */
/* ------------------------------------------------------------------ */
function PrescriptionPrintModal({ data, dietary, onClose }) {
  const [lang, setLang] = useState("en");
  const [dietQuery, setDietQuery] = useState("");
  const [selectedDietary, setSelectedDietary] = useState([]);

  useEffect(() => { setLang("en"); setDietQuery(""); setSelectedDietary([]); }, [data]);

  if (!data) return null;
  const { pat, visit } = data;
  const t = PRINT_I18N[lang];
  const dietList = Object.values(dietary || {});
  const matches = dietQuery.trim() ? dietList.filter((d) => d.code.toLowerCase().includes(dietQuery.trim().toLowerCase()) || d.text.toLowerCase().includes(dietQuery.trim().toLowerCase())).slice(0, 6) : [];

  const addDiet = (d) => { if (!selectedDietary.some((x) => x.code === d.code)) setSelectedDietary([...selectedDietary, d]); setDietQuery(""); };
  const removeDiet = (code) => setSelectedDietary(selectedDietary.filter((x) => x.code !== code));

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(20,30,28,.55)", zIndex: 100, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="cms-card" style={{ width: 560, maxHeight: "88vh", overflowY: "auto", padding: 0 }}>
        <div className="no-print" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
          <div className="font-display" style={{ fontWeight: 800 }}>Prescription Preview</div>
          <button className="cms-btn-ghost" onClick={onClose}><X size={14} /></button>
        </div>

        <div className="no-print" style={{ padding: "14px 18px", borderBottom: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label className="cms-label">Printout Language (patient's preference)</label>
            <div style={{ display: "flex", gap: 6 }}>
              {[["en", "English"], ["hi", "\u0939\u093f\u0902\u0926\u0940 Hindi"], ["gu", "\u0a97\u0941\u0a9c\u0930\u093e\u0924\u0940 Gujarati"]].map(([code, label]) => (
                <button key={code} type="button" className={lang === code ? "cms-btn-primary" : "cms-btn-ghost"} style={{ fontSize: 12.5, padding: "6px 12px" }} onClick={() => setLang(code)}>{label}</button>
              ))}
            </div>
          </div>
          <div style={{ position: "relative" }}>
            <label className="cms-label">Add Dietary Note (for this printout only, not saved to history)</label>
            <input className="cms-input" value={dietQuery} onChange={(e) => setDietQuery(e.target.value)} placeholder="Type a shortcut code, e.g. DB" />
            {matches.length > 0 && (
              <div className="cms-card" style={{ marginTop: 6, overflow: "hidden" }}>
                {matches.map((d) => (
                  <div key={d.code} onClick={() => addDiet(d)} style={{ padding: "8px 12px", fontSize: 12.5, cursor: "pointer", borderBottom: "1px solid var(--border)" }}>
                    <span className="font-mono cms-pill cms-badge-paid" style={{ marginRight: 8 }}>{d.code}</span>{d.text}
                  </div>
                ))}
              </div>
            )}
            {selectedDietary.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                {selectedDietary.map((d) => (
                  <span key={d.code} className="cms-pill cms-badge-due" style={{ cursor: "pointer" }} onClick={() => removeDiet(d.code)}>{d.code} &nbsp;&times;</span>
                ))}
              </div>
            )}
          </div>
          <button className="cms-btn-primary" style={{ justifyContent: "center" }} onClick={() => window.print()}><Printer size={14} />Print Now</button>
        </div>

        <div id="cms-print-area" style={{ padding: 28 }}>
          <div style={{ textAlign: "center", borderBottom: "2px solid var(--primary)", paddingBottom: 12, marginBottom: 16 }}>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 800, color: "var(--primary-dark)" }}>{t.clinic}</div>
            <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{t.sub}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13.5, marginBottom: 16 }}>
            <div><b>{t.patient}:</b> {pat.name}</div>
            <div className="font-mono"><b>{t.date}:</b> {fmtDate(visit.date)}</div>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ borderBottom: "1.5px solid var(--border)" }}>
                <th style={{ textAlign: "left", padding: "6px 4px" }}>{t.medicine}</th>
                <th style={{ padding: "6px 4px" }}>{t.qty}</th>
                <th style={{ padding: "6px 4px" }}>{t.mor}</th>
                <th style={{ padding: "6px 4px" }}>{t.noon}</th>
                <th style={{ padding: "6px 4px" }}>{t.eve}</th>
                <th style={{ padding: "6px 4px" }}>{t.ngt}</th>
              </tr>
            </thead>
            <tbody>
              {visit.prescription.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 12, color: "var(--text-muted)" }}>No prescription items.</td></tr>}
              {visit.prescription.map((p, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "6px 4px" }}>{p.name}</td>
                  <td style={{ padding: "6px 4px", textAlign: "center" }}>{p.qty}</td>
                  <td style={{ padding: "6px 4px", textAlign: "center" }}>{p.mor || "-"}</td>
                  <td style={{ padding: "6px 4px", textAlign: "center" }}>{p.noon || "-"}</td>
                  <td style={{ padding: "6px 4px", textAlign: "center" }}>{p.eve || "-"}</td>
                  <td style={{ padding: "6px 4px", textAlign: "center" }}>{p.ngt || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {selectedDietary.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <div style={{ fontSize: 13, fontWeight: 800, color: "var(--primary-dark)", marginBottom: 6 }}>{t.dietary}</div>
              <ul style={{ fontSize: 12.5, paddingLeft: 18, margin: 0 }}>
                {selectedDietary.map((d) => <li key={d.code}>{d.text}</li>)}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Reports                                                              */
/* ------------------------------------------------------------------ */
function ReportsView({ db }) {
  const [tab, setTab] = useState("collection");
  const [date, setDate] = useState(todayISO());
  const rows = useMemo(() => allPatientsFlat(db), [db]);
  const allVisits = [];
  rows.forEach(({ fam, pat }) => pat.visits.forEach((v) => allVisits.push({ ...v, famHead: fam.headName, famId: fam.id, patId: pat.id, patName: pat.name })));
  const dayVisits = allVisits.filter((v) => v.date === date);
  const dayTotal = dayVisits.reduce((s, v) => s + (Number(v.received) || 0), 0);
  const duesRows = rows.filter((r) => r.totalDue > 0).sort((a, b) => b.totalDue - a.totalDue);
  const medTally = {};
  allVisits.forEach((v) => v.prescription.forEach((p) => { const qty = Number(p.qty) || 0; medTally[p.name] = (medTally[p.name] || 0) + qty; }));
  const medList = Object.entries(medTally).sort((a, b) => b[1] - a[1]).slice(0, 12);
  const maxQty = medList.length ? medList[0][1] : 1;
  const tabs = [{ id: "collection", label: "Daily Collection" }, { id: "dues", label: "Outstanding Dues" }, { id: "medicine", label: "Medicine Usage" }];

  return (
    <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 18 }}>
      <div style={{ display: "flex", gap: 8 }}>{tabs.map((tb) => <button key={tb.id} className={tab === tb.id ? "cms-btn-primary" : "cms-btn-ghost"} onClick={() => setTab(tb.id)}>{tb.label}</button>)}</div>
      {tab === "collection" && (
        <div className="cms-card" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
            <CalendarDays size={16} color="var(--primary)" />
            <input type="date" className="cms-input" style={{ width: 180 }} value={date} onChange={(e) => setDate(e.target.value)} />
            <div className="font-mono" style={{ marginLeft: "auto", fontSize: 18, fontWeight: 800 }}>{fmtMoney(dayTotal)}</div>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>total collected</div>
          </div>
          <table className="cms-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th>Case</th><th>Patient</th><th>Family</th><th>Charge</th><th>Received</th><th>Due</th></tr></thead>
            <tbody>
              {dayVisits.length === 0 && <tr><td colSpan={6} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No visits on this date.</td></tr>}
              {dayVisits.map((v) => (
                <tr key={v.id}><td className="font-mono">#{v.caseNo}</td><td>{v.patName}</td><td>{v.famHead}</td><td className="font-mono">{fmtMoney(v.charge)}</td><td className="font-mono">{fmtMoney(v.received)}</td><td className="font-mono">{fmtMoney(v.due)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {tab === "dues" && (
        <div className="cms-card" style={{ padding: 18 }}>
          <div style={{ fontSize: 13, color: "var(--text-muted)", marginBottom: 10 }}>{duesRows.length} patient(s) with pending balance &middot; Total {fmtMoney(duesRows.reduce((s, r) => s + r.totalDue, 0))}</div>
          <table className="cms-table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead><tr><th>Patient</th><th>Family Head</th><th>Family ID</th><th>Last Visit</th><th>Due</th></tr></thead>
            <tbody>
              {duesRows.map(({ fam, pat, totalDue, lastVisit }) => (
                <tr key={pat.id}><td>{pat.name}</td><td>{fam.headName}</td><td className="font-mono">{fam.id}</td><td className="font-mono">{lastVisit ? fmtDate(lastVisit.date) : "-"}</td><td><span className="cms-pill cms-badge-due">{fmtMoney(totalDue)}</span></td></tr>
              ))}
              {duesRows.length === 0 && <tr><td colSpan={5} style={{ textAlign: "center", padding: 20, color: "var(--text-muted)" }}>No outstanding dues.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {tab === "medicine" && (
        <div className="cms-card" style={{ padding: 18 }}>
          <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 12 }}>Most Prescribed Medicines</div>
          {medList.length === 0 && <div style={{ color: "var(--text-muted)", fontSize: 13 }}>No prescription data yet.</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {medList.map(([name, qty]) => (
              <div key={name}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, marginBottom: 3 }}><span style={{ fontWeight: 600 }}>{name}</span><span className="font-mono" style={{ color: "var(--text-muted)" }}>{qty}</span></div>
                <div style={{ height: 8, borderRadius: 6, background: "var(--surface-alt)" }}><div style={{ height: 8, borderRadius: 6, background: "var(--primary)", width: `${(qty / maxQty) * 100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Root App                                                             */
/* ------------------------------------------------------------------ */
export default function ClinicApp() {
  const [db, setDb] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("dashboard");
  const [selection, setSelection] = useState({ familyId: null, patientId: null });
  const [topQuery, setTopQuery] = useState("");
  const [printData, setPrintData] = useState(null);
  const [toast, setToast] = useState(null);
  const [registerTab, setRegisterTab] = useState("family");
  const [presetMember, setPresetMember] = useState(null);
  const registerFocusRef = useRef(null);
  const caseEntryActionsRef = useRef({ newVisit: null, print: null });

  const flash = (msg, type = "ok") => { setToast({ msg, type }); setTimeout(() => setToast(null), 2600); };

  const persist = useCallback(async (next) => {
    setDb(next);
    try { await window.storage.set("clinic-db", JSON.stringify(next), false); }
    catch (err) { flash("Saved in this session, but could not write to persistent storage.", "error"); }
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const res = await window.storage.get("clinic-db", false);
        if (res && res.value) setDb(JSON.parse(res.value));
        else { const seed = seedDB(); setDb(seed); await window.storage.set("clinic-db", JSON.stringify(seed), false); }
      } catch (e) { setDb(seedDB()); }
      finally { setLoading(false); }
    })();
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      const tag = (e.target && e.target.tagName) || "";
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if (e.key === "F1") { e.preventDefault(); setView("register"); setRegisterTab("family"); setPresetMember(null); return; }
      if (e.key === "F2") { e.preventDefault(); setView("register"); setRegisterTab("member"); return; }
      if (e.key === "F3") { e.preventDefault(); setView("case"); return; }
      if (e.key === "F4") { e.preventDefault(); setView("dashboard"); return; }
      if (e.key === "F5") { e.preventDefault(); setView("reports"); return; }
      if (e.key === "Escape") { if (printData) setPrintData(null); return; }
      if ((e.key === "/" && !typing) || (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey))) {
        e.preventDefault();
        const el = document.getElementById("cms-top-search");
        if (el) el.focus();
        return;
      }
      if (e.key === "F6" && view === "case" && caseEntryActionsRef.current.newVisit) { e.preventDefault(); caseEntryActionsRef.current.newVisit(); }
      if (e.key === "F9" && view === "case" && caseEntryActionsRef.current.print) { e.preventDefault(); caseEntryActionsRef.current.print(); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [view, printData]);

  useEffect(() => {
    if (view === "register") {
      const tmr = setTimeout(() => registerFocusRef.current && registerFocusRef.current.focus(), 30);
      return () => clearTimeout(tmr);
    }
  }, [view, registerTab, presetMember]);

  const goToPatient = (famId, patId) => { setSelection({ familyId: famId, patientId: patId }); setView("case"); };

  const handleTopSearch = (q) => {
    if (!q.trim()) return;
    const found = searchFamilies(db, q)[0];
    if (found) { const firstPatientId = Object.keys(found.patients)[0]; goToPatient(found.id, firstPatientId); setTopQuery(""); }
    else flash("No family found for that name or ID.", "error");
  };

  const handleCreateFamily = (headName) => {
    const famNum = db.counters.family;
    const famId = `FAM${pad(famNum, 4)}`;
    const next = { ...db, counters: { ...db.counters, family: famNum + 1 }, families: { ...db.families, [famId]: { id: famId, headName, area: "", phone: "", createdAt: todayISO(), patients: {} } } };
    persist(next);
    flash(`Family Code ${famId} generated for ${headName}`);
    setRegisterTab("member");
    setPresetMember({ famId, relation: "Head" });
  };

  const handleAddMember = (famId, form) => {
    const fam = db.families[famId];
    const count = Object.keys(fam.patients).length;
    const patId = `${famId}-${count + 1}`;
    const next = { ...db, families: { ...db.families, [famId]: { ...fam, patients: { ...fam.patients, [patId]: { id: patId, name: form.name, relation: form.relation, age: form.age, bloodGroup: form.bloodGroup, allergy: form.allergy, visits: [] } } } } };
    persist(next);
    flash(`Member added — ID ${patId}`);
    setSelection({ familyId: famId, patientId: patId });
  };

  const handleAddVisit = (famId, patId, visitForm) => {
    const caseNo = db.counters.visitCase + 1;
    const fam = db.families[famId];
    const pat = fam.patients[patId];
    const newVisit = { id: uid(), caseNo, ...visitForm };
    const next = { ...db, counters: { ...db.counters, visitCase: caseNo }, families: { ...db.families, [famId]: { ...fam, patients: { ...fam.patients, [patId]: { ...pat, visits: [...pat.visits, newVisit] } } } } };
    persist(next);
    flash(`Visit saved — Case #${caseNo}`);
  };

  const handleCollectPayment = (famId, patId, visitId, amount) => {
    const fam = db.families[famId];
    const pat = fam.patients[patId];
    const visits = pat.visits.map((v) => {
      if (v.id !== visitId) return v;
      const received = (Number(v.received) || 0) + amount;
      const due = Math.max(0, (Number(v.charge) || 0) - received);
      return { ...v, received, due };
    });
    const next = { ...db, families: { ...db.families, [famId]: { ...fam, patients: { ...fam.patients, [patId]: { ...pat, visits } } } } };
    persist(next);
    flash(`Payment of ${fmtMoney(amount)} recorded`);
  };

  const handleAddDietary = (code, text) => {
    const next = { ...db, dietary: { ...db.dietary, [code]: { code, text } } };
    persist(next);
    flash(`Dietary entry "${code}" saved`);
  };

  const handleDeleteDietary = (code) => {
    const nextDietary = { ...db.dietary };
    delete nextDietary[code];
    persist({ ...db, dietary: nextDietary });
  };

  if (loading || !db) {
    return (
      <div className="cms-root" style={{ height: 560, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 18 }}>
        <GlobalStyle />
        <Loader2 size={22} color="var(--primary)" />
      </div>
    );
  }

  return (
    <div className="cms-root" style={{ height: 660, display: "flex", borderRadius: 18, overflow: "hidden", border: "1px solid var(--border)", boxShadow: "0 1px 3px rgba(0,0,0,.04)" }}>
      <GlobalStyle />
      <Sidebar view={view} setView={setView} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <TopBar query={topQuery} setQuery={setTopQuery} onSearchSubmit={handleTopSearch} />
        <div style={{ flex: 1, overflowY: "auto" }} className="cms-scrollbar">
          {view === "dashboard" && <Dashboard db={db} goToPatient={goToPatient} />}
          {view === "register" && (
            <RegisterView
              db={db} tab={registerTab}
              setTab={(t) => { setRegisterTab(t); if (t === "family") setPresetMember(null); }}
              onCreateFamily={handleCreateFamily} onAddMember={handleAddMember}
              presetFamId={presetMember?.famId} presetRelation={presetMember?.relation}
              clearPreset={() => setPresetMember(null)} focusRef={registerFocusRef}
              onAddDietary={handleAddDietary} onDeleteDietary={handleDeleteDietary}
            />
          )}
          {view === "case" && (
            <CaseEntryView
              db={db} selection={selection} setSelection={setSelection}
              onAddVisit={handleAddVisit} onCollectPayment={handleCollectPayment} onAddMember={handleAddMember}
              onOpenPrint={(fam, pat, visit) => setPrintData({ fam, pat, visit })}
              actionsRef={caseEntryActionsRef}
            />
          )}
          {view === "reports" && <ReportsView db={db} />}
        </div>
        <StatusBar view={view} />
      </div>
      <PrescriptionPrintModal data={printData} dietary={db.dietary} onClose={() => setPrintData(null)} />
      <Toast toast={toast} />
    </div>
  );
}
