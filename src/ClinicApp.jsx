import React, { useState, useEffect, useCallback, useRef } from "react";
import { uid, seedDB, pad, makeCaseId } from "./helpers";
import { GlobalStyle } from "./theme";
import { Sidebar, TopBar, StatusBar, Toast } from "./components";
import Dashboard from "./Dashboard";
import RegisterView from "./RegisterView";
import CaseEntryView from "./CaseEntryView";
import ReportsView from "./ReportsView";
import PrescriptionPrintModal from "./PrintModal";

export default function ClinicApp() {
  const [db, setDb] = useState(null);
  const [view, setView] = useState("dashboard"); // dashboard, register, case, reports
  const [toast, setToast] = useState(null);
  const [printData, setPrintData] = useState(null); // { pat, visit }
  const [topQuery, setTopQuery] = useState("");

  // Global selection and context state
  const [selection, setSelection] = useState({ familyId: null, patientId: null });
  const [regTab, setRegTab] = useState("family"); // family, member, dietary
  const actionsRef = useRef({ newVisit: null, print: null });

  // Persistence (localStorage)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("clinic-db");
      if (stored) { setDb(JSON.parse(stored)); }
      else { const init = seedDB(); setDb(init); localStorage.setItem("clinic-db", JSON.stringify(init)); }
    } catch (e) {
      console.error("Storage error:", e);
      setDb(seedDB());
    }
  }, []);

  const saveDb = (newDb) => { setDb(newDb); localStorage.setItem("clinic-db", JSON.stringify(newDb)); };
  const showToast = (msg, type = "success") => { setToast({ msg, type }); setTimeout(() => setToast(null), 3000); };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is typing in an input/textarea
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
    const matches = Object.values(db.families).filter(f => f.headName.toLowerCase().includes(query) || f.id.toLowerCase().includes(query) || (f.area || "").toLowerCase().includes(query));
    if (matches.length > 0) {
      setSelection({ familyId: matches[0].id, patientId: Object.keys(matches[0].patients)[0] || null });
      setView("case");
      setTopQuery("");
    } else {
      showToast("No family found matching search.", "error");
    }
  };

  /* ---- Data Actions ---- */
  const createFamily = (headName, area, phone) => {
    const nextId = pad(db.counters.family, 4); // "0002"
    const fam = { id: nextId, headName, area, phone, createdAt: new Date().toISOString(), patients: {} };
    saveDb({ ...db, counters: { ...db.counters, family: db.counters.family + 1 }, families: { ...db.families, [nextId]: fam } });
    showToast(`Family ID ${nextId} generated for ${headName}`);
    setRegTab("member");
    setSelection({ familyId: nextId, patientId: null });
  };

  const addMember = (famId, data) => {
    const nextPatId = pad(db.counters.patient, 4);
    const pat = { id: nextPatId, name: data.name, relation: data.relation, age: data.age, bloodGroup: data.bloodGroup, allergy: data.allergy, visits: [] };
    const fam = db.families[famId];
    fam.patients[nextPatId] = pat;
    saveDb({ ...db, counters: { ...db.counters, patient: db.counters.patient + 1 }, families: { ...db.families, [famId]: fam } });
    showToast(`${data.name} added to family ${famId}`);
    // Auto-select and go to case view on first member creation if from quick-add flow, otherwise stay on member creation
    if (Object.keys(fam.patients).length === 1 && view === "case") {
      setSelection({ familyId: famId, patientId: nextPatId });
    }
  };

  const addVisit = (famId, patId, visitData) => {
    const fam = db.families[famId];
    const pat = fam.patients[patId];
    // Next visit count for this patient
    const vCount = pat.visits.length + 1;
    const caseId = makeCaseId(famId, patId, vCount); // 6 digits

    const visit = { id: uid(), caseId, visitNum: vCount, ...visitData };
    pat.visits = [...pat.visits, visit];

    saveDb({ ...db, counters: { ...db.counters, visit: db.counters.visit + 1 }, families: { ...db.families, [famId]: fam } });
    showToast(`Visit saved for ${pat.name}! Case ${caseId}`);
  };

  const updateVisit = (famId, patId, visitId, updateData) => {
    const fam = db.families[famId];
    const pat = fam.patients[patId];
    const idx = pat.visits.findIndex(v => v.id === visitId);
    if (idx !== -1) {
      pat.visits[idx] = { ...pat.visits[idx], ...updateData };
      saveDb({ ...db, families: { ...db.families, [famId]: fam } });
      showToast("Visit updated.");
    }
  };

  const updatePatient = (famId, patId, data) => {
    const fam = db.families[famId];
    fam.patients[patId] = { ...fam.patients[patId], ...data };
    saveDb({ ...db, families: { ...db.families, [famId]: fam } });
    showToast("Patient record updated.");
  };

  const addDietary = (code, text) => {
    saveDb({ ...db, dietary: { ...db.dietary, [code]: { code, text } } });
    showToast(`Added dietary advice ${code}`);
  };

  const deleteDietary = (code) => {
    const next = { ...db.dietary };
    delete next[code];
    saveDb({ ...db, dietary: next });
    showToast("Deleted dietary advice", "error");
  };

  const deleteFamily = (famId) => {
    if (window.confirm(`Are you sure you want to permanently delete Family ID ${famId} and all its members and visits?`)) {
      const nextDb = { ...db, families: { ...db.families } };
      delete nextDb.families[famId];
      saveDb(nextDb);
      if (selection.familyId === famId) setSelection({ familyId: null, patientId: null });
      showToast(`Deleted Family ${famId}`, "error");
    }
  };

  const deletePatient = (famId, patId) => {
    if (window.confirm(`Are you sure you want to permanently delete Patient ID ${patId} and all their visits?`)) {
      const nextDb = { ...db, families: { ...db.families } };
      const fam = { ...nextDb.families[famId], patients: { ...nextDb.families[famId].patients } };
      delete fam.patients[patId];
      nextDb.families[famId] = fam;
      saveDb(nextDb);
      if (selection.patientId === patId) setSelection({ ...selection, patientId: Object.keys(fam.patients)[0] || null });
      showToast(`Deleted Patient ${patId}`, "error");
    }
  };

  if (!db) return <div style={{ padding: 40, fontFamily: "Inter, sans-serif" }}>Loading Clinic DB...</div>;

  return (
    <div className="cms-root" style={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      <GlobalStyle />
      <Sidebar view={view} setView={setView} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
        <TopBar query={topQuery} setQuery={setTopQuery} onSearchSubmit={handleGlobalSearch} db={db} />

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
    </div>
  );
}
