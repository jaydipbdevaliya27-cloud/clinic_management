import React, { useMemo } from "react";
import { Users, ClipboardList, IndianRupee, AlertCircle, Activity } from "lucide-react";
import { todayISO, fmtDate, fmtMoney, allPatientsFlat } from "./helpers";
import { StatCard } from "./components";

export default function Dashboard({ db, goToPatient }) {
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
                            <thead><tr><th>Date</th><th>Case</th><th>Patient</th><th>Complaint</th><th>Diagnosis</th></tr></thead>
                            <tbody>
                                {recent.length === 0 && <tr><td colSpan={5} style={{ color: "var(--text-muted)", textAlign: "center", padding: 20 }}>No visits recorded yet.</td></tr>}
                                {recent.map((v) => (
                                    <tr key={v.id} onClick={() => goToPatient(v.famId, v.patId)} style={{ cursor: "pointer" }} className="cms-clickable">
                                        <td className="font-mono">{fmtDate(v.date)}</td>
                                        <td className="font-mono">{v.caseId}</td>
                                        <td>{v.patName}<div style={{ fontSize: 11, color: "var(--text-muted)" }}>{v.famHead}</div></td>
                                        <td>{v.complaint || "-"}</td>
                                        <td>{v.diagnosis || "-"}</td>
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
                                <div><div style={{ fontSize: 13, fontWeight: 700 }}>{pat.name}</div><div style={{ fontSize: 11, color: "var(--text-muted)" }}>{fam.headName} &middot; Fam {fam.id}</div></div>
                                <span className="cms-pill cms-badge-due">{fmtMoney(totalDue)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
