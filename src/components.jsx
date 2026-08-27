import React, { useState, useEffect, useMemo } from "react";
import {
    Stethoscope, Search, AlertCircle, CheckCircle2, Home, UserPlus,
    ClipboardList, BarChart3,
} from "lucide-react";
import { todayISO, fmtDate, nowTime } from "./helpers";

/* ---- Datalist suggestions hook ---- */
export function useSuggestions(db) {
    return useMemo(() => {
        const sets = { diagnosis: new Set(), complaint: new Set(), refDr: new Set(), treatmentNames: new Set(), prescriptionNames: new Set(), weight: new Set(), bp: new Set(), relation: new Set(), bloodGroup: new Set(), allergy: new Set(), area: new Set(), globalSearch: new Set() };
        Object.values(db.families).forEach((fam) => {
            if (fam.area) sets.area.add(fam.area);
            sets.globalSearch.add(fam.headName);
            sets.globalSearch.add(fam.id);
            Object.values(fam.patients).forEach((pat) => {
                sets.globalSearch.add(pat.name);
                sets.globalSearch.add(pat.id);
                if (pat.relation) sets.relation.add(pat.relation);
                if (pat.bloodGroup) sets.bloodGroup.add(pat.bloodGroup);
                if (pat.allergy) sets.allergy.add(pat.allergy);
                pat.visits.forEach((v) => {
                    if (v.diagnosis) sets.diagnosis.add(v.diagnosis);
                    if (v.complaint) sets.complaint.add(v.complaint);
                    if (v.refDr) sets.refDr.add(v.refDr);
                    if (v.weight) sets.weight.add(v.weight);
                    if (v.bp) sets.bp.add(v.bp);
                    (v.treatment || []).forEach((t) => t.name && sets.treatmentNames.add(t.name));
                    (v.prescription || []).forEach((p) => p.name && sets.prescriptionNames.add(p.name));
                });
            });
        });
        const r = {};
        for (const k in sets) r[k] = Array.from(sets[k]).sort();
        return r;
    }, [db]);
}

export function Datalists({ s }) {
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
            <datalist id="dl-area">{s.area.map((v) => <option key={v} value={v} />)}</datalist>
            {s.globalSearch && <datalist id="dl-global-search">{s.globalSearch.map((v) => <option key={v} value={v} />)}</datalist>}
        </>
    );
}

/* ---- Stat Card ---- */
export function StatCard({ icon: Icon, label, value, tone = "primary" }) {
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

/* ---- Navigation ---- */
export const NAV_ITEMS = [
    { id: "dashboard", label: "Dashboard", icon: Home, key: "F4" },
    { id: "register", label: "Family / Patient Reg.", icon: UserPlus, key: "F1" },
    { id: "case", label: "Patient Record", icon: ClipboardList, key: "F3" },
    { id: "reports", label: "Reports", icon: BarChart3, key: "F5" },
];

export function Sidebar({ view, setView }) {
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
                <b>Keyboard:</b><br />
                F1 Family Reg &middot; F2 Add Member<br />
                F3 Patient Record &middot; F4 Dashboard<br />
                F5 Reports &middot; F6 New Visit<br />
                F9 Print &middot; / Search &middot; Esc Close
            </div>
        </div>
    );
}

export function TopBar({ query, setQuery, onSearchSubmit, db }) {
    const suggestions = db ? useSuggestions(db) : { globalSearch: [] };
    return (
        <div style={{ background: "var(--surface)", borderBottom: "1px solid var(--border)", padding: "14px 26px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 20 }}>
            {db && <Datalists s={suggestions} />}
            <div>
                <div className="font-display" style={{ fontWeight: 800, fontSize: 17 }}>Dhyey Clinic &middot; Patient Management</div>
                <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{fmtDate(todayISO())}</div>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); onSearchSubmit(query); }} style={{ display: "flex", alignItems: "center", gap: 8, width: 380 }}>
                <div style={{ position: "relative", flex: 1 }}>
                    <Search size={15} style={{ position: "absolute", left: 10, top: 10, color: "var(--text-muted)" }} />
                    <input id="cms-top-search" list="dl-global-search" className="cms-input" style={{ paddingLeft: 32, paddingRight: 46 }} placeholder="Search family name, patient ID, area..." value={query} onChange={(e) => setQuery(e.target.value)} />
                    <span className="cms-kbd" style={{ position: "absolute", right: 8, top: 8 }}>/</span>
                </div>
                <button type="submit" className="cms-btn-primary"><Search size={14} />Go</button>
            </form>
        </div>
    );
}

export function StatusBar({ view }) {
    const [clock, setClock] = useState(nowTime());
    useEffect(() => { const t = setInterval(() => setClock(nowTime()), 15000); return () => clearInterval(t); }, []);
    const contextHint = view === "case" ? "F6 New Visit · F9 Print" : view === "register" ? "F1 New Family · F2 New Member" : "";
    return (
        <div className="cms-statusbar">
            <span><b>Dhyey Clinic</b></span>
            <span>F1 Family Reg</span><span>F2 Patient Reg</span><span>F3 Record</span><span>F4 Dashboard</span><span>F5 Reports</span>
            {contextHint && <span style={{ color: "var(--accent-soft)" }}>{contextHint}</span>}
            <span style={{ marginLeft: "auto" }} className="font-mono">{clock}</span>
        </div>
    );
}

export function Toast({ toast }) {
    if (!toast) return null;
    const isErr = toast.type === "error";
    return (
        <div style={{ position: "fixed", bottom: 22, right: 26, zIndex: 200, background: isErr ? "var(--danger)" : "var(--primary)", color: "white", padding: "11px 18px", borderRadius: 12, fontSize: 13.5, fontWeight: 600, display: "flex", alignItems: "center", gap: 8, boxShadow: "0 8px 24px rgba(0,0,0,.18)" }}>
            {isErr ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
            {toast.msg}
        </div>
    );
}
