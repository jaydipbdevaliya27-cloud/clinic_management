import React, { useState, useEffect, useCallback, useRef } from "react";
import { pad, makeCaseId } from "./helpers";
import { GlobalStyle } from "./theme";
import { Sidebar, TopBar, StatusBar, Toast } from "./components";
import Dashboard from "./Dashboard";
import RegisterView from "./RegisterView";
import CaseEntryView from "./CaseEntryView";
import ReportsView from "./ReportsView";
import PrescriptionPrintModal from "./PrintModal";
import {
    getClinicDB, getDietary,
    createFamily as apiCreateFamily,
    deleteFamily as apiDeleteFamily,
    addPatient as apiAddPatient,
    updatePatient as apiUpdatePatient,
    deletePatient as apiDeletePatient,
    addVisit as apiAddVisit,
    updateVisit as apiUpdateVisit,
    addDietary as apiAddDietary,
    deleteDietary as apiDeleteDietary,
} from "./api";

export default function ClinicApp({ doctorProfile, onLogout, onUpdateDoctorProfile, onBackToAdmin }) {
    const [db, setDb] = useState(null);
    const [view, setView] = useState("dashboard");
    const [theme, setTheme] = useState(() => localStorage.getItem("clinic_theme") || "light");
    const [toast, setToast] = useState(null);
    const [printData, setPrintData] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [topQuery, setTopQuery] = useState("");
    const [confirmDelete, setConfirmDelete] = useState(null);
    const [selection, setSelection] = useState({ familyId: null, patientId: null });
    const [regTab, setRegTab] = useState("family");
    const actionsRef = useRef({ newVisit: null, print: null });

    const clinicId = doctorProfile?.activeClinicId;

    // Load DB from API on mount
    useEffect(() => {
        if (!clinicId) return;

        Promise.all([getClinicDB(clinicId), getDietary(clinicId)])
            .then(([dbData, dietaryData]) => {
                setDb({
                    counters: dbData?.counters || { family: 1, patient: 1, visit: 1 },
                    families: dbData?.families || {},
                    dietary: dietaryData || {},
                });
            })
            .catch((err) => {
                console.error("Failed to load clinic DB:", err);
                setDb({
                    counters: { family: 1, patient: 1, visit: 1 },
                    families: {},
                    dietary: {
                        DB: { code: 'DB', text: 'Diabetic diet: avoid sugar, sweets and fried food.' },
                        CV: { code: 'CV', text: 'Low-salt, low-oil diet. Avoid red meat.' },
                        LQ: { code: 'LQ', text: 'Plenty of fluids and light, easily digestible food.' },
                    },
                });
                showToast("Failed to load clinic data. Is the backend running?", "error");
            });
    }, [clinicId]);

    const showToast = (msg, type = "success") => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            const tag = document.activeElement.tagName.toLowerCase();
            if (tag === "input" || tag === "textarea") {
                if (e.key === "Escape") document.activeElement.blur();
                return;
            }
            if (e.key === "F1") { e.preventDefault(); setView("register"); setRegTab("family"); }
            if (e.key === "F2") { e.preventDefault(); setView("register"); setRegTab("member"); }
            if (e.key === "F3") { e.preventDefault(); setView("case"); }
            if (e.key === "F4") { e.preventDefault(); setView("dashboard"); }
            if (e.key === "F5") { e.preventDefault(); setView("reports"); }
            if (e.key === "F6" && view === "case" && actionsRef.current.newVisit) { e.preventDefault(); actionsRef.current.newVisit(); }
            if (e.key === "F9" && view === "case" && actionsRef.current.print) { e.preventDefault(); actionsRef.current.print(); }
            if (e.key === "/") { e.preventDefault(); document.getElementById("cms-top-search")?.focus(); }
            if (e.key === "Escape" && printData) { e.preventDefault(); setPrintData(null); }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [view, printData]);

    const handleGlobalSearch = (q) => {
        if (!db || !q.trim()) return;
        const query = q.trim().toLowerCase();
        let found = null;
        const allFamilies = Object.values(db.families);
        for (const fam of allFamilies) {
            for (const p of Object.values(fam.patients)) {
                if (p.id.toLowerCase() === query || p.name.toLowerCase().includes(query)) {
                    found = { familyId: fam.id, patientId: p.id };
                    break;
                }
            }
            if (found) break;
            if (fam.id.toLowerCase() === query || fam.headName.toLowerCase().includes(query) || (fam.area || "").toLowerCase().includes(query)) {
                found = { familyId: fam.id, patientId: Object.keys(fam.patients)[0] || null };
            }
        }
        if (found) { setSelection(found); setView("case"); setTopQuery(""); }
        else showToast("No matching record found.", "error");
    };

    /* ---- Data Actions (API-backed) ---- */

    const createFamily = async (headName, area, phone) => {
        try {
            const result = await apiCreateFamily(clinicId, headName, area, phone);
            const { family: fam, patient: pat, counters } = result;
            setDb(prev => ({
                ...prev,
                counters,
                families: {
                    ...prev.families,
                    [fam.id]: { ...fam, patients: { [pat.id]: pat } },
                },
            }));
            showToast(`Family ID ${fam.id} generated, patient ${pat.id} added`);
            setSelection({ familyId: fam.id, patientId: pat.id });
            setView("case");
        } catch (err) {
            showToast("Failed to create family.", "error");
        }
    };

    const addMember = async (famCode, data) => {
        try {
            const result = await apiAddPatient({ clinicId, familyCode: famCode, ...data });
            const { patient: pat, counters } = result;
            setDb(prev => {
                const fam = prev.families[famCode];
                return {
                    ...prev,
                    counters,
                    families: {
                        ...prev.families,
                        [famCode]: { ...fam, patients: { ...fam.patients, [pat.id]: pat } },
                    },
                };
            });
            showToast(`${data.name} added to family ${famCode}`);
            setSelection({ familyId: famCode, patientId: pat.id });
            setView("case");
        } catch {
            showToast("Failed to add member.", "error");
        }
    };

    const addVisit = async (famCode, patCode, visitData) => {
        try {
            const result = await apiAddVisit({ clinicId, familyCode: famCode, patientCode: patCode, ...visitData });
            const { visit, counters } = result;
            setDb(prev => {
                const fam = prev.families[famCode];
                const pat = fam.patients[patCode];
                return {
                    ...prev,
                    counters,
                    families: {
                        ...prev.families,
                        [famCode]: {
                            ...fam,
                            patients: {
                                ...fam.patients,
                                [patCode]: { ...pat, visits: [...pat.visits, visit] },
                            },
                        },
                    },
                };
            });
            showToast(`Visit saved! Case ${visit.caseId}`);
            return visit;
        } catch {
            showToast("Failed to save visit.", "error");
        }
    };

    const updateVisit = async (famCode, patCode, visitId, updateData) => {
        try {
            await apiUpdateVisit(visitId, updateData);
            setDb(prev => {
                const fam = prev.families[famCode];
                const pat = fam.patients[patCode];
                const updatedVisits = pat.visits.map(v => v.id === visitId ? { ...v, ...updateData } : v);
                return {
                    ...prev,
                    families: {
                        ...prev.families,
                        [famCode]: { ...fam, patients: { ...fam.patients, [patCode]: { ...pat, visits: updatedVisits } } },
                    },
                };
            });
            showToast("Visit updated.");
        } catch {
            showToast("Failed to update visit.", "error");
        }
    };

    const updatePatient = async (famCode, patCode, data) => {
        try {
            await apiUpdatePatient(clinicId, patCode, data);
            setDb(prev => {
                const fam = prev.families[famCode];
                return {
                    ...prev,
                    families: {
                        ...prev.families,
                        [famCode]: { ...fam, patients: { ...fam.patients, [patCode]: { ...fam.patients[patCode], ...data } } },
                    },
                };
            });
            showToast("Patient record updated.");
        } catch {
            showToast("Failed to update patient.", "error");
        }
    };

    const addDietary = async (code, text) => {
        try {
            await apiAddDietary(clinicId, code, text);
            setDb(prev => ({ ...prev, dietary: { ...prev.dietary, [code]: { code, text } } }));
            showToast(`Added dietary advice ${code}`);
        } catch {
            showToast("Failed to add dietary advice.", "error");
        }
    };

    const deleteDietary = async (code) => {
        try {
            await apiDeleteDietary(clinicId, code);
            setDb(prev => { const d = { ...prev.dietary }; delete d[code]; return { ...prev, dietary: d }; });
            showToast("Deleted dietary advice", "error");
        } catch {
            showToast("Failed to delete dietary advice.", "error");
        }
    };

    const executeDelete = async () => {
        if (!confirmDelete) return;
        const { type, famId, patId } = confirmDelete;
        try {
            if (type === "family") {
                await apiDeleteFamily(clinicId, famId);
                setDb(prev => { const f = { ...prev.families }; delete f[famId]; return { ...prev, families: f }; });
                if (selection.familyId === famId) setSelection({ familyId: null, patientId: null });
                showToast(`Deleted Family ${famId}`, "error");
            } else if (type === "patient") {
                await apiDeletePatient(clinicId, patId);
                setDb(prev => {
                    const fam = { ...prev.families[famId], patients: { ...prev.families[famId].patients } };
                    delete fam.patients[patId];
                    return { ...prev, families: { ...prev.families, [famId]: fam } };
                });
                if (selection.patientId === patId) {
                    setDb(prev => {
                        const remaining = Object.keys(prev.families[famId]?.patients || {});
                        setSelection({ ...selection, patientId: remaining[0] || null });
                        return prev;
                    });
                }
                showToast(`Deleted Patient ${patId}`, "error");
            }
        } catch {
            showToast("Failed to delete.", "error");
        }
        setConfirmDelete(null);
    };

    const deleteFamily = (famId) => setConfirmDelete({ type: "family", famId });
    const deletePatient = (famId, patId) => setConfirmDelete({ type: "patient", famId, patId });

    if (!db) return <div style={{ padding: 40, fontFamily: "Inter, sans-serif" }}>Loading Clinic DB...</div>;

    return (
        <div className={`cms-root ${theme}`} style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
            <GlobalStyle />
            <Sidebar view={view} setView={setView} isOpen={sidebarOpen} />

            <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
                <TopBar query={topQuery} setQuery={setTopQuery} onSearchSubmit={handleGlobalSearch} db={db} toggleSidebar={() => setSidebarOpen(s => !s)} theme={theme} setTheme={(t) => { setTheme(t); localStorage.setItem("clinic_theme", t); }} doctorProfile={doctorProfile} onLogout={onLogout} onUpdateDoctorProfile={onUpdateDoctorProfile} onBackToAdmin={onBackToAdmin} />

                <div className="cms-scrollbar" style={{ flex: 1, overflowY: "auto", position: "relative" }}>
                    {view === "dashboard" && <Dashboard db={db} goToPatient={(famId, patId) => { setSelection({ familyId: famId, patientId: patId }); setView("case"); }} />}
                    {view === "register" && (
                        <RegisterView
                            db={db} tab={regTab} setTab={setRegTab}
                            onCreateFamily={createFamily} onAddMember={addMember}
                            onAddDietary={addDietary} onDeleteDietary={deleteDietary}
                            goToPatient={(famId, patId) => { setSelection({ familyId: famId, patientId: patId }); setView("case"); }}
                            onDeleteFamily={deleteFamily} onDeletePatient={deletePatient}
                        />
                    )}
                    {view === "case" && (
                        <CaseEntryView
                            db={db} selection={selection} setSelection={setSelection}
                            onAddVisit={addVisit} onUpdateVisit={updateVisit} onUpdatePatient={updatePatient}
                            onOpenPrint={(f, p, v) => setPrintData({ pat: p, visit: v })}
                            actionsRef={actionsRef}
                            onDeletePatient={deletePatient}
                        />
                    )}
                    {view === "reports" && <ReportsView db={db} />}
                </div>

                <StatusBar view={view} />
            </div>

            <Toast toast={toast} />

            {printData && (
                <PrescriptionPrintModal data={printData} dietary={db.dietary} onClose={() => setPrintData(null)} />
            )}

            {confirmDelete && (
                <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div className="cms-card" style={{ width: 400, padding: 24, boxShadow: "0 10px 40px rgba(0,0,0,0.2)" }}>
                        <div className="font-display" style={{ fontWeight: 800, fontSize: 18, color: "var(--danger)", marginBottom: 12 }}>Confirm Deletion</div>
                        <div style={{ fontSize: 14, color: "var(--text-muted)", marginBottom: 24, lineHeight: 1.5 }}>
                            {confirmDelete.type === "family"
                                ? `Are you absolutely sure you want to permanently delete Family ID ${confirmDelete.famId}? This will erase all associated members and visit histories forever.`
                                : `Are you sure you want to permanently delete Patient ID ${confirmDelete.patId}? This will erase all of their visit histories forever.`
                            }
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
                            <button type="button" className="cms-btn-ghost" onClick={() => setConfirmDelete(null)}>Cancel</button>
                            <button type="button" className="cms-btn-danger" onClick={executeDelete} style={{ padding: "9px 16px", borderRadius: 10 }}>Yes, Delete Now</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
