import React, { useState, useEffect } from "react";
import { X, Printer } from "lucide-react";
import { fmtDate, PRINT_I18N } from "./helpers";

export default function PrescriptionPrintModal({ data, dietary, onClose }) {
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
        <div className="cms-overlay" onClick={onClose}>
            <div className="cms-modal" style={{ width: 560, padding: 0 }} onClick={(e) => e.stopPropagation()}>
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

                {/* Printable area — only patient name + prescription */}
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
