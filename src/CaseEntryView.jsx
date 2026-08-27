import React, { useState, useEffect, useCallback } from "react";
import { Plus, X, Check, Trash2, Printer, Save, Edit3 } from "lucide-react";
import { todayISO, nowTime, fmtDate, fmtMoney, searchFamilies } from "./helpers";
import { useSuggestions, Datalists } from "./components";

const BLANK_ROW = () => ({ date: todayISO(), time: nowTime(), weight: "", bp: "", refDr: "", diagnosis: "", complaint: "", charge: "", received: "" });

/* ---- Visit Detail Popup ---- */
function VisitDetailModal({ visit, family, patient, onClose, onEdit, onOpenPrint }) {
    if (!visit) return null;
    const v = visit;
    return (
        <div className="cms-overlay" onClick={onClose}>
            <div className="cms-modal" style={{ width: 640, padding: 0 }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                    <div className="font-display" style={{ fontWeight: 800 }}>Visit Detail &mdash; Case {v.caseId}</div>
                    <div style={{ display: "flex", gap: 8 }}>
                        <button className="cms-btn-ghost" style={{ fontSize: 12.5, padding: "6px 12px" }} onClick={() => onEdit(v)}><Edit3 size={13} />Edit</button>
                        <button className="cms-btn-primary" style={{ fontSize: 12.5, padding: "6px 12px" }} onClick={() => onOpenPrint(family, patient, v)}><Printer size={13} />Print</button>
                        <button className="cms-btn-ghost" style={{ padding: "6px 8px" }} onClick={onClose}><X size={14} /></button>
                    </div>
                </div>
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        <div><span className="cms-label">Date</span><div className="font-mono" style={{ fontSize: 14 }}>{fmtDate(v.date)} {v.time}</div></div>
                        <div><span className="cms-label">Weight</span><div style={{ fontSize: 14 }}>{v.weight || "—"}</div></div>
                        <div><span className="cms-label">BP</span><div style={{ fontSize: 14 }}>{v.bp || "—"}</div></div>
                        <div><span className="cms-label">Ref. Doctor</span><div style={{ fontSize: 14 }}>{v.refDr || "—"}</div></div>
                        <div><span className="cms-label">Diagnosis</span><div style={{ fontSize: 14, fontWeight: 600 }}>{v.diagnosis || "—"}</div></div>
                        <div><span className="cms-label">Complaint</span><div style={{ fontSize: 14, fontWeight: 600 }}>{v.complaint || "—"}</div></div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, padding: "10px 14px", borderRadius: 10, background: "var(--surface-alt)" }}>
                        <div><span className="cms-label">Charge</span><div className="font-mono" style={{ fontSize: 15, fontWeight: 700 }}>{fmtMoney(v.charge)}</div></div>
                        <div><span className="cms-label">Received</span><div className="font-mono" style={{ fontSize: 15, fontWeight: 700 }}>{fmtMoney(v.received)}</div></div>
                        <div><span className="cms-label">Due</span><div className="font-mono" style={{ fontSize: 15, fontWeight: 700, color: v.due > 0 ? "var(--danger)" : "var(--primary-dark)" }}>{fmtMoney(v.due)}</div></div>
                    </div>
                    {(v.treatment || []).length > 0 && (
                        <div>
                            <div className="cms-label">Treatment (given at clinic)</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                                {v.treatment.map((t, i) => <div key={i} style={{ fontSize: 13, padding: "5px 10px", background: "var(--surface-alt)", borderRadius: 8 }}>{t.name} <span className="font-mono" style={{ color: "var(--text-muted)" }}>× {t.qty}</span></div>)}
                            </div>
                        </div>
                    )}
                    {(v.prescription || []).length > 0 && (
                        <div>
                            <div className="cms-label">Prescription (from medical store)</div>
                            <table className="cms-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                                <thead><tr><th>Medicine</th><th>Qty</th><th>Mor</th><th>Noon</th><th>Eve</th><th>Ngt</th></tr></thead>
                                <tbody>
                                    {v.prescription.map((p, i) => (
                                        <tr key={i}><td>{p.name}</td><td className="font-mono">{p.qty}</td><td className="font-mono">{p.mor || "-"}</td><td className="font-mono">{p.noon || "-"}</td><td className="font-mono">{p.eve || "-"}</td><td className="font-mono">{p.ngt || "-"}</td></tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ---- Edit Visit Modal ---- */
function EditVisitModal({ visit, onSave, onClose, suggestions }) {
    const [row, setRow] = useState({ ...visit });
    const [treatment, setTreatment] = useState([...(visit.treatment || [])]);
    const [prescription, setPrescription] = useState([...(visit.prescription || [])]);
    const due = Math.max(0, (Number(row.charge) || 0) - (Number(row.received) || 0));

    const updateItem = (list, setList, idx, field, val) => { const next = [...list]; next[idx] = { ...next[idx], [field]: val }; setList(next); };
    const save = () => { onSave({ ...row, treatment: treatment.filter(t => t.name.trim()), prescription: prescription.filter(p => p.name.trim()), charge: Number(row.charge) || 0, received: Number(row.received) || 0, due }); };

    return (
        <div className="cms-overlay" onClick={onClose}>
            <div className="cms-modal" style={{ width: 720, padding: 0 }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                    <div className="font-display" style={{ fontWeight: 800 }}>Edit Visit &mdash; Case {visit.caseId}</div>
                    <button className="cms-btn-ghost" style={{ padding: "6px 8px" }} onClick={onClose}><X size={14} /></button>
                </div>
                <div style={{ padding: 18, display: "flex", flexDirection: "column", gap: 14, maxHeight: "70vh", overflowY: "auto" }}>
                    <Datalists s={suggestions} />
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
                        <div><label className="cms-label">Date</label><input type="date" className="cms-input" value={row.date} onChange={(e) => setRow({ ...row, date: e.target.value })} /></div>
                        <div><label className="cms-label">Weight</label><input className="cms-input" list="dl-weight" value={row.weight} onChange={(e) => setRow({ ...row, weight: e.target.value })} /></div>
                        <div><label className="cms-label">BP</label><input className="cms-input" list="dl-bp" value={row.bp} onChange={(e) => setRow({ ...row, bp: e.target.value })} placeholder="120/80" /></div>
                        <div><label className="cms-label">Ref. Doctor</label><input className="cms-input" list="dl-refdr" value={row.refDr} onChange={(e) => setRow({ ...row, refDr: e.target.value })} /></div>
                        <div><label className="cms-label">Diagnosis</label><input className="cms-input" list="dl-diagnosis" value={row.diagnosis} onChange={(e) => setRow({ ...row, diagnosis: e.target.value })} /></div>
                        <div><label className="cms-label">Complaint</label><input className="cms-input" list="dl-complaint" value={row.complaint} onChange={(e) => setRow({ ...row, complaint: e.target.value })} /></div>
                        <div><label className="cms-label">Charge</label><input className="cms-input" value={row.charge} onChange={(e) => setRow({ ...row, charge: e.target.value })} /></div>
                        <div><label className="cms-label">Received</label><input className="cms-input" value={row.received} onChange={(e) => setRow({ ...row, received: e.target.value })} /></div>
                        <div><label className="cms-label">Due</label><div className="font-mono" style={{ fontSize: 16, fontWeight: 700, padding: "8px 0", color: due > 0 ? "var(--danger)" : "var(--primary-dark)" }}>{fmtMoney(due)}</div></div>
                    </div>
                    {/* Treatment */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <label className="cms-label" style={{ margin: 0 }}>Treatment (clinic)</label>
                            <button type="button" className="cms-btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => setTreatment([...treatment, { name: "", qty: "" }])}><Plus size={13} />Row</button>
                        </div>
                        {treatment.map((r, idx) => (
                            <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                <input className="cms-input" list="dl-treatment-names" placeholder="Item name" style={{ flex: 3 }} value={r.name} onChange={(e) => updateItem(treatment, setTreatment, idx, "name", e.target.value)} />
                                <input className="cms-input" placeholder="Qty" style={{ flex: 1 }} value={r.qty} onChange={(e) => updateItem(treatment, setTreatment, idx, "qty", e.target.value)} />
                                <button type="button" className="cms-btn-ghost" style={{ color: "var(--danger)" }} onClick={() => setTreatment(treatment.filter((_, i) => i !== idx))}><X size={14} /></button>
                            </div>
                        ))}
                    </div>
                    {/* Prescription */}
                    <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                            <label className="cms-label" style={{ margin: 0 }}>Prescription (medical store)</label>
                            <button type="button" className="cms-btn-ghost" style={{ padding: "4px 10px", fontSize: 12 }} onClick={() => setPrescription([...prescription, { name: "", qty: "", mor: "", noon: "", eve: "", ngt: "" }])}><Plus size={13} />Row</button>
                        </div>
                        <div style={{ display: "flex", gap: 8, fontSize: 10, fontWeight: 700, color: "var(--text-muted)", paddingLeft: 2, marginBottom: 4 }}>
                            <div style={{ flex: 3 }}>MEDICINE</div><div style={{ flex: 1 }}>QTY</div><div style={{ flex: 1, textAlign: "center" }}>MOR</div><div style={{ flex: 1, textAlign: "center" }}>NOON</div><div style={{ flex: 1, textAlign: "center" }}>EVE</div><div style={{ flex: 1, textAlign: "center" }}>NGT</div><div style={{ width: 30 }} />
                        </div>
                        {prescription.map((r, idx) => (
                            <div key={idx} style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                <input className="cms-input" list="dl-prescription-names" placeholder="Medicine" style={{ flex: 3 }} value={r.name} onChange={(e) => updateItem(prescription, setPrescription, idx, "name", e.target.value)} />
                                <input className="cms-input" placeholder="5" style={{ flex: 1 }} value={r.qty} onChange={(e) => updateItem(prescription, setPrescription, idx, "qty", e.target.value)} />
                                <input className="cms-input" style={{ flex: 1, textAlign: "center" }} value={r.mor} onChange={(e) => updateItem(prescription, setPrescription, idx, "mor", e.target.value)} />
                                <input className="cms-input" style={{ flex: 1, textAlign: "center" }} value={r.noon} onChange={(e) => updateItem(prescription, setPrescription, idx, "noon", e.target.value)} />
                                <input className="cms-input" style={{ flex: 1, textAlign: "center" }} value={r.eve} onChange={(e) => updateItem(prescription, setPrescription, idx, "eve", e.target.value)} />
                                <input className="cms-input" style={{ flex: 1, textAlign: "center" }} value={r.ngt} onChange={(e) => updateItem(prescription, setPrescription, idx, "ngt", e.target.value)} />
                                <button type="button" className="cms-btn-ghost" style={{ width: 30, color: "var(--danger)" }} onClick={() => setPrescription(prescription.filter((_, i) => i !== idx))}><X size={14} /></button>
                            </div>
                        ))}
                    </div>
                </div>
                <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button className="cms-btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="cms-btn-primary" onClick={save}><Save size={14} />Save Changes</button>
                </div>
            </div>
        </div>
    );
}

/* ---- Edit Patient Modal ---- */
function EditPatientModal({ patient, onSave, onClose }) {
    const [form, setForm] = useState({ name: patient.name, relation: patient.relation, age: patient.age, bloodGroup: patient.bloodGroup, allergy: patient.allergy });
    return (
        <div className="cms-overlay" onClick={onClose}>
            <div className="cms-modal" style={{ width: 480, padding: 0 }} onClick={(e) => e.stopPropagation()}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 18px", borderBottom: "1px solid var(--border)" }}>
                    <div className="font-display" style={{ fontWeight: 800 }}>Edit Patient &mdash; ID {patient.id}</div>
                    <button className="cms-btn-ghost" style={{ padding: "6px 8px" }} onClick={onClose}><X size={14} /></button>
                </div>
                <div style={{ padding: 18, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <div style={{ gridColumn: "1 / -1" }}><label className="cms-label">Name</label><input className="cms-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                    <div><label className="cms-label">Relation</label><input className="cms-input" list="dl-relation" value={form.relation} onChange={(e) => setForm({ ...form, relation: e.target.value })} /></div>
                    <div><label className="cms-label">Age</label><input className="cms-input" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} /></div>
                    <div><label className="cms-label">Blood Group</label><input className="cms-input" list="dl-bloodgroup" value={form.bloodGroup} onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })} /></div>
                    <div><label className="cms-label">Allergy</label><input className="cms-input" list="dl-allergy" value={form.allergy} onChange={(e) => setForm({ ...form, allergy: e.target.value })} /></div>
                </div>
                <div style={{ padding: "12px 18px", borderTop: "1px solid var(--border)", display: "flex", justifyContent: "flex-end", gap: 8 }}>
                    <button className="cms-btn-ghost" onClick={onClose}>Cancel</button>
                    <button className="cms-btn-primary" onClick={() => onSave(form)}><Save size={14} />Save</button>
                </div>
            </div>
        </div>
    );
}

/* ---- Main Case Entry View ---- */
export default function CaseEntryView({ db, selection, setSelection, onAddVisit, onUpdateVisit, onUpdatePatient, onOpenPrint, actionsRef, onDeletePatient }) {
    const suggestions = useSuggestions(db);
    const [famQuery, setFamQuery] = useState("");
    const [famHighlight, setFamHighlight] = useState(0);
    const [entryOpen, setEntryOpen] = useState(false);
    const [row, setRow] = useState(BLANK_ROW());
    const [treatment, setTreatment] = useState([{ name: "", qty: "" }]);
    const [prescription, setPrescription] = useState([{ name: "", qty: "", mor: "", noon: "", eve: "", ngt: "" }]);
    const [selectedVisit, setSelectedVisit] = useState(null);
    const [editingVisit, setEditingVisit] = useState(null);
    const [editingPatient, setEditingPatient] = useState(false);
    const [showDeletes, setShowDeletes] = useState(false);

    const results = famQuery.trim() ? searchFamilies(db, famQuery) : [];
    const family = selection.familyId ? db.families[selection.familyId] : null;
    const patient = family && selection.patientId ? family.patients[selection.patientId] : null;
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

    useEffect(() => { setEntryOpen(false); setSelectedVisit(null); }, [selection.patientId]);

    const pickFamily = (famId) => {
        const fam = db.families[famId];
        let matchedPatientId = null;
        const q = famQuery.trim().toLowerCase();

        if (q) {
            for (const [pId, p] of Object.entries(fam.patients)) {
                if (p.name.toLowerCase().includes(q)) {
                    matchedPatientId = pId;
                    break;
                }
            }
        }

        const targetPatientId = matchedPatientId || Object.keys(fam.patients)[0] || null;
        setSelection({ familyId: famId, patientId: targetPatientId });
        setFamQuery(""); setFamHighlight(0);
    };

    const handleFamKeyDown = (e) => {
        if (results.length === 0) return;
        if (e.key === "ArrowDown") { e.preventDefault(); setFamHighlight((h) => Math.min(h + 1, results.length - 1)); }
        else if (e.key === "ArrowUp") { e.preventDefault(); setFamHighlight((h) => Math.max(h - 1, 0)); }
        else if (e.key === "Enter") { e.preventDefault(); pickFamily(results[famHighlight].id); }
        else if (e.key === "Escape") { setFamQuery(""); }
    };

    const updateItem = (list, setList, idx, field, val) => { const next = [...list]; next[idx] = { ...next[idx], [field]: val }; setList(next); };

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

    const handleSaveEditVisit = (updated) => {
        onUpdateVisit(selection.familyId, selection.patientId, editingVisit.id, updated);
        setEditingVisit(null);
        setSelectedVisit(null);
    };

    const handleSaveEditPatient = (form) => {
        onUpdatePatient(selection.familyId, selection.patientId, form);
        setEditingPatient(false);
    };

    return (
        <div style={{ padding: 26, display: "flex", flexDirection: "column", gap: 18 }}>
            <Datalists s={suggestions} />
            {/* Family search */}
            <div className="cms-card" style={{ padding: 16 }}>
                <label className="cms-label">Find Family by Head Name or Family ID</label>
                <div style={{ position: "relative" }}>
                    <input id="cms-case-search" className="cms-input" value={famQuery} onChange={(e) => { setFamQuery(e.target.value); setFamHighlight(0); }} onKeyDown={handleFamKeyDown} placeholder="Type family head name or Family ID..." />
                    {results.length > 0 && (
                        <div className="cms-card" style={{ position: "absolute", top: 42, left: 0, right: 0, zIndex: 20, maxHeight: 220, overflowY: "auto" }}>
                            {results.map((f, i) => (
                                <div key={f.id} onClick={() => pickFamily(f.id)} onMouseEnter={() => setFamHighlight(i)} style={{ padding: "9px 12px", cursor: "pointer", borderBottom: "1px solid var(--border)", background: i === famHighlight ? "var(--surface-alt)" : "transparent" }}>
                                    <b style={{ fontSize: 13.5 }}>{f.headName}</b> <span className="font-mono" style={{ fontSize: 11.5, color: "var(--primary-dark)" }}>&middot; ID {f.id}</span>
                                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{f.area || "—"} &middot; {Object.keys(f.patients).length} member(s)</div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {!family && <div className="cms-card" style={{ padding: 40, textAlign: "center", color: "var(--text-muted)" }}>Search and select a family above to begin.</div>}

            {family && (
                <div style={{ display: "flex", gap: 18, alignItems: "flex-start" }}>
                    {/* Family member sidebar */}
                    <div className="cms-card" style={{ width: 220, padding: 14, flexShrink: 0 }}>
                        <div className="font-display" style={{ fontWeight: 800, fontSize: 13.5, marginBottom: 4 }}>
                            {family.headName} <span className="cms-pill cms-badge-paid" style={{ marginLeft: 6, fontSize: 10 }}>FAM {family.id}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 10 }}>{family.area || "—"}</div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                            {Object.values(family.patients).map((p) => (
                                <div key={p.id} onClick={() => setSelection({ familyId: family.id, patientId: p.id })} style={{ padding: "8px 10px", borderRadius: 9, cursor: "pointer", fontSize: 13, background: selection.patientId === p.id ? "var(--primary)" : "var(--surface-alt)", color: selection.patientId === p.id ? "white" : "var(--text)" }}>
                                    <div style={{ fontWeight: 700 }}>{p.name}</div>
                                    <div style={{ fontSize: 10.5, opacity: 0.8, display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                                        <span>{p.relation || "Member"}</span>
                                        <span className="cms-pill" style={{ fontSize: 9, padding: "2px 6px", background: selection.patientId === p.id ? "rgba(255,255,255,0.2)" : "var(--primary-soft)", color: selection.patientId === p.id ? "white" : "var(--primary-dark)" }}>PT {p.id}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Patient record area */}
                    {!patient ? (
                        <div className="cms-card" style={{ flex: 1, padding: 40, textAlign: "center", color: "var(--text-muted)" }}>No members in this family. Go to Family Reg. (F1) to add members.</div>
                    ) : (
                        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 16 }}>
                            {/* Patient header with edit button */}
                            <div className="cms-card" style={{ padding: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <div>
                                    <div className="font-display" style={{ fontWeight: 800, fontSize: 16 }}>
                                        {patient.name} <span className="cms-pill cms-badge-due" style={{ marginLeft: 8, fontSize: 11 }}>PT {patient.id}</span>
                                    </div>
                                    <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 4 }}>
                                        {patient.relation || "Head"}
                                        {patient.age ? ` · Age ${patient.age}` : ""}{patient.bloodGroup ? ` · ${patient.bloodGroup}` : ""}
                                        {patient.allergy && <span className="cms-pill cms-badge-due" style={{ marginLeft: 8, padding: "2px 6px", fontSize: 10 }}>ALLERGY: {patient.allergy}</span>}
                                    </div>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <button className="cms-btn-danger" style={{ fontSize: 12.5, padding: "7px 12px" }} onClick={() => onDeletePatient(selection.familyId, selection.patientId)}><Trash2 size={13} />Delete Patient</button>
                                    <button className="cms-btn-ghost" style={{ fontSize: 12.5, padding: "7px 12px" }} onClick={() => setEditingPatient(true)}><Edit3 size={13} />Edit Patient</button>
                                    {!entryOpen && <button className="cms-btn-primary" onClick={openEntry}><Plus size={14} />New Visit<span className="cms-kbd" style={{ marginLeft: 4 }}>F6</span></button>}
                                </div>
                            </div>

                            {/* Visit history table — no charge/received/due columns */}
                            <div className="cms-card" style={{ padding: 16 }}>
                                <div className="font-display" style={{ fontWeight: 800, fontSize: 14.5, marginBottom: 10 }}>
                                    Visit History ({patient.visits.length})
                                    {entryOpen && <span style={{ fontWeight: 500, fontSize: 12, color: "var(--text-muted)" }}> — enter new visit in the highlighted row</span>}
                                </div>
                                <div style={{ overflowX: "auto" }}>
                                    <table className="cms-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                                        <thead>
                                            <tr><th>Case</th><th>Date</th><th>Weight</th><th>BP</th><th>Ref Dr</th><th>Diagnosis</th><th>Complaint</th><th></th></tr>
                                        </thead>
                                        <tbody>
                                            {/* New visit entry row */}
                                            {entryOpen && (
                                                <>
                                                    <tr className="cms-entry-row">
                                                        <td className="font-mono" style={{ fontSize: 11.5 }}>new</td>
                                                        <td><input type="date" className="cms-input-sm" value={row.date} onChange={(e) => setRow({ ...row, date: e.target.value })} /></td>
                                                        <td><input className="cms-input-sm" list="dl-weight" style={{ width: 52 }} value={row.weight} onChange={(e) => setRow({ ...row, weight: e.target.value })} /></td>
                                                        <td><input className="cms-input-sm" list="dl-bp" style={{ width: 60 }} value={row.bp} onChange={(e) => setRow({ ...row, bp: e.target.value })} placeholder="120/80" /></td>
                                                        <td><input className="cms-input-sm" list="dl-refdr" value={row.refDr} onChange={(e) => setRow({ ...row, refDr: e.target.value })} /></td>
                                                        <td><input className="cms-input-sm" list="dl-diagnosis" value={row.diagnosis} onChange={(e) => setRow({ ...row, diagnosis: e.target.value })} /></td>
                                                        <td><input className="cms-input-sm" list="dl-complaint" value={row.complaint} onChange={(e) => setRow({ ...row, complaint: e.target.value })} /></td>
                                                        <td>
                                                            {/* Bottom buttons removed from here. Placed below. */}
                                                        </td>
                                                    </tr>
                                                    {/* Treatment & Prescription entry below the row */}
                                                    <tr className="cms-entry-row">
                                                        <td colSpan={8} style={{ padding: "16px", borderBottom: "2px solid var(--border)" }}>
                                                            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                                                                {/* Treatment Section */}
                                                                <div onFocus={() => setShowDeletes(false)}>
                                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                                                        <span className="cms-label" style={{ margin: 0, fontSize: 11 }}>Treatment (clinic)</span>
                                                                    </div>
                                                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                                        {treatment.map((r, idx) => {
                                                                            const isLast = idx === treatment.length - 1;
                                                                            return (
                                                                                <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                                                                    <input className="cms-input" list="dl-treatment-names" placeholder="Item" style={{ flex: 3 }} value={r.name} onChange={(e) => updateItem(treatment, setTreatment, idx, "name", e.target.value)} />
                                                                                    <input className="cms-input" placeholder="Qty" style={{ flex: 1 }} value={r.qty} onChange={(e) => updateItem(treatment, setTreatment, idx, "qty", e.target.value)} />
                                                                                    {isLast && !showDeletes ? (
                                                                                        <button type="button" className="cms-btn-ghost" style={{ padding: "4px 8px" }} onClick={() => setTreatment([...treatment, { name: "", qty: "" }])}><Plus size={14} /></button>
                                                                                    ) : (
                                                                                        showDeletes && (treatment.length > 1 || r.name || r.qty) && <button type="button" className="cms-btn-ghost" style={{ color: "var(--danger)", padding: "4px" }} onMouseDown={(e) => { e.preventDefault(); if (window.confirm("Delete this treatment row?")) setTreatment(treatment.filter((_, i) => i !== idx)); }}><X size={14} /></button>
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </div>

                                                                {/* Prescription Section */}
                                                                <div style={{ borderTop: "1px dashed var(--border)", paddingTop: 16 }} onFocus={() => setShowDeletes(false)}>
                                                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                                                                        <span className="cms-label" style={{ margin: 0, fontSize: 11 }}>Prescription (medical store)</span>
                                                                    </div>
                                                                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                                                                        {prescription.map((r, idx) => {
                                                                            const isLast = idx === prescription.length - 1;
                                                                            return (
                                                                                <div key={idx} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                                                                                    <input className="cms-input" list="dl-prescription-names" placeholder="Medicine" style={{ flex: 3 }} value={r.name} onChange={(e) => updateItem(prescription, setPrescription, idx, "name", e.target.value)} />
                                                                                    <input className="cms-input" placeholder="Qty" style={{ flex: 1 }} value={r.qty} onChange={(e) => updateItem(prescription, setPrescription, idx, "qty", e.target.value)} />
                                                                                    <input className="cms-input" style={{ flex: 0.7, textAlign: "center" }} placeholder="M" value={r.mor} onChange={(e) => updateItem(prescription, setPrescription, idx, "mor", e.target.value)} />
                                                                                    <input className="cms-input" style={{ flex: 0.7, textAlign: "center" }} placeholder="N" value={r.noon} onChange={(e) => updateItem(prescription, setPrescription, idx, "noon", e.target.value)} />
                                                                                    <input className="cms-input" style={{ flex: 0.7, textAlign: "center" }} placeholder="E" value={r.eve} onChange={(e) => updateItem(prescription, setPrescription, idx, "eve", e.target.value)} />
                                                                                    <input className="cms-input" style={{ flex: 0.7, textAlign: "center" }} placeholder="Ng" value={r.ngt} onChange={(e) => updateItem(prescription, setPrescription, idx, "ngt", e.target.value)} />
                                                                                    {isLast && !showDeletes ? (
                                                                                        <button type="button" className="cms-btn-ghost" style={{ padding: "4px 8px" }} onClick={() => setPrescription([...prescription, { name: "", qty: "", mor: "", noon: "", eve: "", ngt: "" }])}><Plus size={14} /></button>
                                                                                    ) : (
                                                                                        showDeletes && (prescription.length > 1 || r.name || r.qty) && <button type="button" className="cms-btn-ghost" style={{ color: "var(--danger)", padding: "4px" }} onMouseDown={(e) => { e.preventDefault(); if (window.confirm("Delete this prescription row?")) setPrescription(prescription.filter((_, i) => i !== idx)); }}><X size={14} /></button>
                                                                                    )}
                                                                                </div>
                                                                            )
                                                                        })}
                                                                    </div>
                                                                </div>

                                                                {/* Footer (Charge and Buttons) */}
                                                                <div onFocus={() => setShowDeletes(true)} style={{ borderTop: "1px dashed var(--border)", paddingTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                                                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                                                                        <div><label className="cms-label" style={{ margin: 0, marginBottom: 4 }}>Charge</label><input className="cms-input-sm" style={{ width: 80 }} value={row.charge} onChange={(e) => setRow({ ...row, charge: e.target.value })} /></div>
                                                                        <div><label className="cms-label" style={{ margin: 0, marginBottom: 4 }}>Received</label><input className="cms-input-sm" style={{ width: 80 }} value={row.received} onChange={(e) => setRow({ ...row, received: e.target.value })} /></div>
                                                                        <div><label className="cms-label" style={{ margin: 0, marginBottom: 4 }}>Due</label><div className="font-mono" style={{ fontWeight: 700, fontSize: 16, color: due > 0 ? "var(--danger)" : "var(--primary-dark)" }}>{fmtMoney(due)}</div></div>
                                                                    </div>
                                                                    <div style={{ display: "flex", gap: 12 }}>
                                                                        <button className="cms-btn-ghost" onClick={() => setEntryOpen(false)}>Cancel</button>
                                                                        <button className="cms-btn-primary" onClick={saveEntry}><Check size={14} />Save Visit Record</button>
                                                                    </div>
                                                                </div>

                                                            </div>
                                                        </td>
                                                    </tr>
                                                </>
                                            )}
                                            {/* Existing visits — click to open detail popup */}
                                            {[...patient.visits].reverse().map((v) => (
                                                <tr key={v.id} className="cms-clickable" onClick={() => setSelectedVisit(v)}>
                                                    <td className="font-mono">{v.caseId}</td>
                                                    <td className="font-mono">{fmtDate(v.date)} {v.time}</td>
                                                    <td>{v.weight || "-"}</td>
                                                    <td>{v.bp || "-"}</td>
                                                    <td>{v.refDr || "-"}</td>
                                                    <td style={{ fontWeight: 600 }}>{v.diagnosis || "-"}</td>
                                                    <td>{v.complaint || "-"}</td>
                                                    <td><Printer size={12} style={{ color: "var(--text-muted)" }} /></td>
                                                </tr>
                                            ))}
                                            {patient.visits.length === 0 && !entryOpen && <tr><td colSpan={8} style={{ textAlign: "center", color: "var(--text-muted)", padding: 20 }}>No visits yet.</td></tr>}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            {selectedVisit && !editingVisit && (
                <VisitDetailModal visit={selectedVisit} family={family} patient={patient} onClose={() => setSelectedVisit(null)} onEdit={(v) => setEditingVisit(v)} onOpenPrint={onOpenPrint} />
            )}
            {editingVisit && (
                <EditVisitModal visit={editingVisit} onSave={handleSaveEditVisit} onClose={() => setEditingVisit(null)} suggestions={suggestions} />
            )}
            {editingPatient && patient && (
                <EditPatientModal patient={patient} onSave={handleSaveEditPatient} onClose={() => setEditingPatient(false)} />
            )}
        </div>
    );
}
