import React, { useEffect, useMemo, useState } from "react";

const STORAGE_KEY = "inspection_extincteurs_boyaux_v1";
const SAVED_INSPECTIONS_KEY = "inspection_extincteurs_boyaux_saved_list_v1";

const REMARK_OPTIONS = ["OK", "EH", "RE", "6 ANS", "EPA", "EP", "IR", "IE", "EM"];
const QUICK_LOCATIONS = ["entrée", "sortie", "corridor", "salle électrique", "près escalier"];

const REMARKS = [
  { code: "OK", label: "Inspection visuelle complétée" },
  { code: "EH", label: "Essai hydrostatique" },
  { code: "RE", label: "Remplissage" },
  { code: "6 ANS", label: "Entretien 6 ans" },
  { code: "EPA", label: "Extincteur non accessible" },
  { code: "EP", label: "Pas le bon type d’extincteur" },
  { code: "IR", label: "Installation requise" },
  { code: "IE", label: "Installation effectuée" },
  { code: "EM", label: "Extincteur manquant" },
];

const initialFloors = ["RDC", "1er étage", "2e étage", "3e étage", "4e étage"];

const initialRows = [];

function getEmplacement(row) {
  return [row.etage, row.localisation].filter(Boolean).join(" - ");
}

function emptyRow(etage = "RDC") {
  return {
    id: Date.now() + Math.random(),
    etage,
    localisation: "",
    taille: "",
    serie: "",
    fabrication: "",
    dernier: "",
    prochain12: "",
    prochain6: "",
    remarque: "OK",
    suivi: false,
    commentaire: "",
  };
}

function getNextFloorName(floors) {
  const numbers = floors
    .map((floor) => {
      const match = floor.match(/^(\d+)/);
      return match ? Number(match[1]) : null;
    })
    .filter((value) => value !== null);
  const next = numbers.length ? Math.max(...numbers) + 1 : 1;
  return `${next}e étage`;
}

function getSavedInspections() {
  try {
    const saved = localStorage.getItem(SAVED_INSPECTIONS_KEY);
    const parsed = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function getInspectionDisplayName(project) {
  const name = project.inspectionName?.trim();
  if (name) return name;
  const building = project.batiment?.trim() || "Inspection";
  const date = project.date || new Date().toISOString().slice(0, 10);
  return `${building} - ${date}`;
}

function getInitialData() {
  const defaultData = {
    project: {
      batiment: "",
      adresse: "",
      date: new Date().toISOString().slice(0, 10),
      technicien: "",
      email: "",
      inspectionName: "Inspection sans nom",
    },
    floors: initialFloors,
    selectedFloor: "RDC",
    rows: initialRows,
    printSettings: {
      paper: "letter",
      orientation: "landscape",
      margin: "6mm",
      fontSize: 8,
      includeEmptyFollowUp: false,
      browserLayout: false,
    },
  };

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return defaultData;
    const parsed = JSON.parse(saved);
    return {
      ...defaultData,
      ...parsed,
      project: { ...defaultData.project, ...(parsed.project || {}) },
      printSettings: { ...defaultData.printSettings, ...(parsed.printSettings || {}) },
      floors: parsed.floors?.length ? parsed.floors : defaultData.floors,
      rows: Array.isArray(parsed.rows) ? parsed.rows : defaultData.rows,
      selectedFloor: parsed.selectedFloor || defaultData.selectedFloor,
    };
  } catch {
    return defaultData;
  }
}

export default function App() {
  const initialData = useMemo(() => getInitialData(), []);
  const [project, setProject] = useState(initialData.project);
  const [floors, setFloors] = useState(initialData.floors);
  const [selectedFloor, setSelectedFloor] = useState(initialData.selectedFloor);
  const [rows, setRows] = useState(initialData.rows);
  const [query, setQuery] = useState("");
  const [view, setView] = useState("inspection");
  const [printSettings, setPrintSettings] = useState(initialData.printSettings);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [savedInspections, setSavedInspections] = useState(() => getSavedInspections());
  const [selectedSavedId, setSelectedSavedId] = useState("");

  const sortedRows = useMemo(() => {
    return [...rows].sort((a, b) => {
      const floorDiff = floors.indexOf(a.etage) - floors.indexOf(b.etage);
      if (floorDiff !== 0) return floorDiff;
      return a.localisation.localeCompare(b.localisation, "fr");
    });
  }, [rows, floors]);

  const filteredRows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return sortedRows.filter((row) => {
      const text = [getEmplacement(row), row.taille, row.serie, row.fabrication, row.dernier, row.prochain12, row.prochain6, row.remarque, row.commentaire]
        .join(" ")
        .toLowerCase();
      return row.etage === selectedFloor && (!q || text.includes(q));
    });
  }, [sortedRows, query, selectedFloor]);

  const suivis = useMemo(() => sortedRows.filter((row) => row.suivi), [sortedRows]);

  const buildInspectionPayload = () => ({
    project,
    floors,
    selectedFloor,
    rows,
    printSettings,
    savedAt: new Date().toISOString(),
  });

  const saveInspection = () => {
    const payload = buildInspectionPayload();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setLastSavedAt(new Date());
  };

  const saveInspectionToList = () => {
    const payload = buildInspectionPayload();
    const id = selectedSavedId || `inspection_${Date.now()}`;
    const name = getInspectionDisplayName(project);
    const item = { id, name, updatedAt: payload.savedAt, payload };
    const nextList = [item, ...savedInspections.filter((inspection) => inspection.id !== id)];
    localStorage.setItem(SAVED_INSPECTIONS_KEY, JSON.stringify(nextList));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setSavedInspections(nextList);
    setSelectedSavedId(id);
    setLastSavedAt(new Date());
  };

  const loadSavedInspection = (id) => {
    const item = savedInspections.find((inspection) => inspection.id === id);
    if (!item) return;
    const payload = item.payload;
    setProject(payload.project || {});
    setFloors(payload.floors?.length ? payload.floors : initialFloors);
    setSelectedFloor(payload.selectedFloor || "RDC");
    setRows(Array.isArray(payload.rows) ? payload.rows : []);
    setPrintSettings(payload.printSettings || initialData.printSettings);
    setSelectedSavedId(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
    setLastSavedAt(new Date());
    setView("inspection");
  };

  const deleteSavedInspection = (id) => {
    const confirmed = window.confirm("Supprimer cette inspection sauvegardée?");
    if (!confirmed) return;
    const nextList = savedInspections.filter((inspection) => inspection.id !== id);
    localStorage.setItem(SAVED_INSPECTIONS_KEY, JSON.stringify(nextList));
    setSavedInspections(nextList);
    if (selectedSavedId === id) setSelectedSavedId("");
  };

  const duplicateCurrentInspection = () => {
    setSelectedSavedId("");
    setProject((prev) => ({
      ...prev,
      inspectionName: `${getInspectionDisplayName(prev)} - copie`,
      date: new Date().toISOString().slice(0, 10),
    }));
    setRows((prev) => prev.map((row) => ({ ...row, id: Date.now() + Math.random(), suivi: false, commentaire: "" })));
    setLastSavedAt(null);
  };

  useEffect(() => {
    const timer = window.setTimeout(() => {
      saveInspection();
    }, 600);
    return () => window.clearTimeout(timer);
  }, [project, floors, selectedFloor, rows, printSettings]);

  const startNewInspection = () => {
    const confirmed = window.confirm("Créer une nouvelle inspection? Les données actuelles seront effacées de cet appareil.");
    if (!confirmed) return;
    localStorage.removeItem(STORAGE_KEY);
    setProject({
      batiment: "",
      adresse: "",
      date: new Date().toISOString().slice(0, 10),
      technicien: "",
      email: "",
      inspectionName: "Inspection sans nom",
    });
    setSelectedSavedId("");
    setFloors(initialFloors);
    setSelectedFloor("RDC");
    setRows([]);
    setPrintSettings({
      paper: "letter",
      orientation: "landscape",
      margin: "6mm",
      fontSize: 8,
      includeEmptyFollowUp: false,
      browserLayout: false,
    });
    setLastSavedAt(null);
    setView("inspection");
  };

  const updateProject = (field, value) => setProject((prev) => ({ ...prev, [field]: value }));
  const updateRow = (id, field, value) => setRows((prev) => prev.map((row) => (row.id === id ? { ...row, [field]: value } : row)));
  const addRow = () => setRows((prev) => [...prev, emptyRow(selectedFloor)]);
  const addRowWithLocation = (localisation) => {
    setRows((prev) => [...prev, { ...emptyRow(selectedFloor), localisation }]);
  };
  const deleteRow = (id) => setRows((prev) => prev.filter((row) => row.id !== id));
  const duplicateRow = (row) => {
    setRows((prev) => [
      ...prev,
      {
        ...row,
        id: Date.now() + Math.random(),
        serie: "",
        commentaire: "",
        suivi: false,
      },
    ]);
  };
  const addSimilarExtinguisher = (row) => {
    setRows((prev) => [
      ...prev,
      {
        ...emptyRow(row.etage),
        localisation: row.localisation,
        taille: row.taille,
        fabrication: row.fabrication,
        dernier: row.dernier,
        prochain12: row.prochain12,
        prochain6: row.prochain6,
        remarque: "OK",
      },
    ]);
  };
  const clearAllRows = () => setRows([]);

  const addFloor = () => {
    const nextFloor = getNextFloorName(floors);
    setFloors((prev) => [...prev, nextFloor]);
    setSelectedFloor(nextFloor);
  };

  const copyPreviousFloor = () => {
    const currentIndex = floors.indexOf(selectedFloor);
    if (currentIndex <= 0) return;
    const previousFloor = floors[currentIndex - 1];
    const previousRows = rows.filter((row) => row.etage === previousFloor);
    const copiedRows = previousRows.map((row) => ({
      ...row,
      id: Date.now() + Math.random(),
      etage: selectedFloor,
      serie: "",
      fabrication: "",
      dernier: "",
      prochain12: "",
      prochain6: "",
      remarque: "OK",
      suivi: false,
      commentaire: "",
    }));
    setRows((prev) => [...prev, ...copiedRows]);
  };

  const exportCSV = () => {
    const header = ["Étage", "Localisation", "Emplacement", "Taille/type", "No de série", "Année de fabrication", "Dernier essai", "Prochain essai 12 ans", "Prochain entretien 6 ans", "Remarques", "À suivre", "Commentaires"];
    const body = sortedRows.map((r) => [r.etage, r.localisation, getEmplacement(r), r.taille, r.serie, r.fabrication, r.dernier, r.prochain12, r.prochain6, r.remarque, r.suivi ? "Oui" : "Non", r.commentaire]);
    const csv = [header, ...body].map((line) => line.map((cell) => `"${String(cell ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "inspection_extincteurs_boyaux.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const generatePDF = () => window.setTimeout(() => window.print(), 100);

  const prepareEmail = () => {
    const subject = encodeURIComponent(`Rapport d'inspection - ${project.batiment}`);
    const body = encodeURIComponent(
      `Bonjour,

Veuillez trouver ci-joint le rapport d'inspection des extincteurs portatifs et boyaux pour :

Bâtiment : ${project.batiment}
Adresse : ${project.adresse}
Date : ${project.date}

Note : veuillez joindre le PDF généré avant l'envoi.

Merci.`
    );
    window.location.href = `mailto:${project.email}?subject=${subject}&body=${body}`;
  };

  const updatePrintSetting = (field, value) => {
    setPrintSettings((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <>
      <style>{`
        :root { font-family: Inter, Arial, sans-serif; color: #172033; background: #f3f5f7; }
        * { box-sizing: border-box; }
        body { margin: 0; }
        button, input, textarea { font: inherit; }
        .app-shell { min-height: 100vh; background: linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%); color: #172033; }
        .phone { width: min(100%, 430px); margin: 0 auto; padding: 14px 14px 96px; }
        .hero { position: sticky; top: 0; z-index: 5; margin: -14px -14px 14px; padding: 14px; background: rgba(248, 250, 252, 0.94); backdrop-filter: blur(10px); }
        .hero-card { border-radius: 26px; padding: 20px; color: white; background: linear-gradient(135deg, #0f766e, #0f172a); box-shadow: 0 18px 35px rgba(15, 23, 42, 0.18); }
        .kicker { margin: 0 0 6px; font-size: 11px; letter-spacing: .12em; text-transform: uppercase; opacity: .8; font-weight: 700; }
        .title { margin: 0; font-size: 22px; line-height: 1.05; letter-spacing: -0.03em; }
        .subtitle { margin: 10px 0 0; font-size: 13px; opacity: .82; }
        .tabs { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-bottom: 14px; }
        .tab, .btn { border: 0; cursor: pointer; border-radius: 999px; min-height: 42px; padding: 10px 13px; font-weight: 750; transition: .15s ease; }
        .tab { background: white; color: #334155; border: 1px solid #dbe3ec; }
        .tab.active { background: #0f172a; color: white; border-color: #0f172a; }
        .card { background: rgba(255, 255, 255, .98); border: 1px solid #e2e8f0; border-radius: 22px; box-shadow: 0 14px 28px rgba(15, 23, 42, 0.08); padding: 16px; margin-bottom: 14px; }
        .card-soft { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 18px; padding: 12px; }
        .section-title { margin: 0 0 12px; font-size: 17px; letter-spacing: -0.01em; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        .field { width: 100%; min-height: 44px; border-radius: 14px; border: 1px solid #cbd5e1; background: white; padding: 10px 12px; outline: none; color: #0f172a; }
        .field:focus { border-color: #0f766e; box-shadow: 0 0 0 3px rgba(15, 118, 110, .14); }
        textarea.field { min-height: 72px; resize: vertical; }
        .floor-scroll { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }
        .btn { background: #0f172a; color: white; }
        .btn.secondary { background: #e2e8f0; color: #0f172a; }
        .btn.outline { background: white; color: #0f172a; border: 1px solid #cbd5e1; }
        .btn.danger { background: #dc2626; color: white; }
        .btn.small { min-height: 36px; padding: 8px 11px; font-size: 13px; }
        .btn.full { width: 100%; }
        .btn.icon { width: 40px; padding: 0; }
        .row-actions { display: flex; gap: 10px; align-items: center; }
        .search-row { display: flex; gap: 8px; margin-bottom: 10px; }
        .search-wrap { position: relative; flex: 1; }
        .search-wrap span { position: absolute; left: 12px; top: 12px; color: #64748b; }
        .search-wrap input { padding-left: 35px; }
        .stats { display: flex; justify-content: space-between; color: #64748b; font-size: 13px; margin: 6px 2px 12px; }
        .item-head { display: flex; justify-content: space-between; gap: 10px; align-items: flex-start; }
        .item-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-bottom: 10px; }
        .meta-box { border-radius: 16px; background: #f8fafc; border: 1px solid #e2e8f0; padding: 9px 10px; }
        .meta-label { display: block; color: #64748b; font-size: 10px; font-weight: 900; letter-spacing: .08em; text-transform: uppercase; margin-bottom: 3px; }
        .meta-value { display: block; color: #0f172a; font-size: 14px; font-weight: 850; }
        .badge { display: inline-flex; border-radius: 999px; padding: 5px 9px; font-size: 11px; font-weight: 800; border: 1px solid #cbd5e1; color: #334155; background: white; }
        .badge.warning { background: #fef3c7; border-color: #fde68a; color: #92400e; }
        .quick-grid, .remark-grid { display: flex; flex-wrap: wrap; gap: 8px; }
        .quick-grid { margin: 10px 0 0; }
        .remark-label { margin: 0 0 8px; color: #64748b; text-transform: uppercase; font-size: 11px; font-weight: 900; letter-spacing: .08em; }
        .empty { display: flex; gap: 8px; align-items: center; color: #64748b; }
        .summary-line { margin: 6px 0; font-size: 14px; }
        .legend-row { display: flex; gap: 9px; align-items: center; margin-bottom: 8px; font-size: 14px; }
        .print-area { display: none; }
        @media (max-width: 360px) { .grid-2 { grid-template-columns: 1fr; } .title { font-size: 19px; } }
        @media print {
          .app-shell { display: none !important; }
          .print-area { display: block !important; }
          body { margin: 0; background: white; }
          ${printSettings.browserLayout
            ? `@page { margin: ${printSettings.margin}; }`
            : `@page { size: ${printSettings.paper} ${printSettings.orientation}; margin: ${printSettings.margin}; }`
          }
          .avoid-break { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <div className="app-shell">
        <div className="phone">
          <header className="hero">
            <div className="hero-card">
              <p className="kicker">MVP mobile</p>
              <h1 className="title">Inspection des extincteurs portatifs et boyaux</h1>
              <p className="subtitle">Saisie rapide sur téléphone · Rapport PDF à la fin</p>
            </div>
          </header>

          <section className="card-soft" style={{ marginBottom: 12 }}>
            <div style={{ color: "#64748b", fontSize: 13, lineHeight: 1.4 }}>
              {lastSavedAt
                ? `Sauvegarde automatique · ${lastSavedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Sauvegarde automatique activée"}
            </div>
            <div style={{ height: 10 }} />
            <input className="field" placeholder="Nom de l’inspection" value={project.inspectionName || ""} onChange={(e) => updateProject("inspectionName", e.target.value)} />
            <div style={{ height: 10 }} />
            <div className="grid-2">
              <button className="btn full" onClick={saveInspectionToList}>Enregistrer dans la liste</button>
              <button className="btn outline full" onClick={duplicateCurrentInspection}>Dupliquer inspection</button>
            </div>
            <div style={{ height: 10 }} />
            {savedInspections.length > 0 && (
              <>
                <select className="field" value={selectedSavedId} onChange={(e) => setSelectedSavedId(e.target.value)}>
                  <option value="">Choisir une inspection sauvegardée...</option>
                  {savedInspections.map((inspection) => (
                    <option key={inspection.id} value={inspection.id}>{inspection.name}</option>
                  ))}
                </select>
                <div style={{ height: 10 }} />
                <div className="grid-2">
                  <button className="btn secondary full" disabled={!selectedSavedId} onClick={() => loadSavedInspection(selectedSavedId)}>Ouvrir</button>
                  <button className="btn outline full" disabled={!selectedSavedId} onClick={() => deleteSavedInspection(selectedSavedId)}>Supprimer</button>
                </div>
                <div style={{ height: 10 }} />
              </>
            )}
            <button className="btn secondary full" onClick={startNewInspection}>Nouvelle inspection</button>
          </section>

          <nav className="tabs">
            <button className={`tab ${view === "inspection" ? "active" : ""}`} onClick={() => setView("inspection")}>Inspection</button>
            <button className={`tab ${view === "anomalies" ? "active" : ""}`} onClick={() => setView("anomalies")}>À suivre</button>
            <button className={`tab ${view === "rapport" ? "active" : ""}`} onClick={() => setView("rapport")}>Rapport</button>
          </nav>

          {view === "inspection" && (
            <>
              <section className="card">
                <h2 className="section-title">Projet</h2>
                <div className="grid-2">
                  <input className="field" placeholder="Nom du bâtiment" value={project.batiment} onChange={(e) => updateProject("batiment", e.target.value)} />
                  <input className="field" type="date" value={project.date} onChange={(e) => updateProject("date", e.target.value)} />
                </div>
                <div style={{ height: 10 }} />
                <input className="field" placeholder="Nom de l’inspection" value={project.inspectionName || ""} onChange={(e) => updateProject("inspectionName", e.target.value)} />
                <div style={{ height: 10 }} />
                <input className="field" placeholder="Adresse" value={project.adresse} onChange={(e) => updateProject("adresse", e.target.value)} />
                <div style={{ height: 10 }} />
                <input className="field" placeholder="Technicien" value={project.technicien} onChange={(e) => updateProject("technicien", e.target.value)} />
              </section>

              <section className="card">
                <div className="row-actions" style={{ justifyContent: "space-between", marginBottom: 12 }}>
                  <h2 className="section-title" style={{ margin: 0 }}>Étage</h2>
                  <button className="btn outline small" onClick={addFloor}>＋ Ajouter</button>
                </div>
                <div className="floor-scroll">
                  {floors.map((floor) => (
                    <button key={floor} className={`btn small ${selectedFloor === floor ? "" : "outline"}`} onClick={() => setSelectedFloor(floor)}>{floor}</button>
                  ))}
                </div>
                <div style={{ height: 10 }} />
                <button className="btn secondary full" onClick={copyPreviousFloor}>⧉ Copier l’étage précédent</button>
                <div style={{ height: 10 }} />
                <button className="btn outline full" onClick={clearAllRows}>Effacer tous les items</button>
              </section>

              <div className="search-row">
                <div className="search-wrap">
                  <span>⌕</span>
                  <input className="field" placeholder="Rechercher sur cet étage..." value={query} onChange={(e) => setQuery(e.target.value)} />
                </div>
                <button className="btn icon" onClick={addRow}>＋</button>
              </div>

              <section className="card-soft" style={{ marginBottom: 12 }}>
                <p className="remark-label">Ajouter rapidement une localisation</p>
                <div className="quick-grid">
                  {QUICK_LOCATIONS.map((localisation) => (
                    <button key={localisation} className="btn outline small" onClick={() => addRowWithLocation(localisation)}>
                      {localisation}
                    </button>
                  ))}
                </div>
              </section>

              <div className="stats">
                <span>{filteredRows.length} item(s) sur {selectedFloor}</span>
                <span>{suivis.length} à suivre</span>
              </div>

              {filteredRows.map((row) => (
                <section key={row.id} className="card">
                  <div className="item-head">
                    <div style={{ flex: 1 }}>
                      <div className="item-meta">
                        <div className="meta-box">
                          <span className="meta-label">Étage</span>
                          <span className="meta-value">{row.etage}</span>
                        </div>
                        <div className="meta-box">
                          <span className="meta-label">Statut</span>
                          <span className="meta-value">{row.remarque}</span>
                        </div>
                      </div>
                      {row.suivi && <span className="badge warning" style={{ marginBottom: 10 }}>À suivre</span>}
                      <input className="field" placeholder="Localisation: entrée, sortie, corridor..." value={row.localisation} onChange={(e) => updateRow(row.id, "localisation", e.target.value)} />
                    </div>
                    <button className="btn outline icon" onClick={() => deleteRow(row.id)}>×</button>
                  </div>

                  <div style={{ height: 12 }} />
                  <div className="grid-2">
                    <input className="field" placeholder="Taille/type" value={row.taille} onChange={(e) => updateRow(row.id, "taille", e.target.value)} />
                    <input className="field" placeholder="No de série" value={row.serie} onChange={(e) => updateRow(row.id, "serie", e.target.value)} />
                    <input className="field" placeholder="Année fabrication" value={row.fabrication} onChange={(e) => updateRow(row.id, "fabrication", e.target.value)} />
                    <input className="field" placeholder="Dernier essai" value={row.dernier} onChange={(e) => updateRow(row.id, "dernier", e.target.value)} />
                    <input className="field" placeholder="Prochain essai 12 ans" value={row.prochain12} onChange={(e) => updateRow(row.id, "prochain12", e.target.value)} />
                    <input className="field" placeholder="Entretien 6 ans" value={row.prochain6} onChange={(e) => updateRow(row.id, "prochain6", e.target.value)} />
                  </div>

                  <div style={{ height: 14 }} />
                  <p className="remark-label">Remarque</p>
                  <div className="remark-grid">
                    {REMARK_OPTIONS.map((code) => (
                      <button key={code} className={`btn small ${row.remarque === code ? "" : "outline"}`} onClick={() => updateRow(row.id, "remarque", code)}>{code}</button>
                    ))}
                  </div>

                  <div style={{ height: 12 }} />
                  <div className="grid-2">
                    <button className={`btn full ${row.suivi ? "danger" : "outline"}`} onClick={() => updateRow(row.id, "suivi", !row.suivi)}>{row.suivi ? "À suivre : Oui" : "À suivre : Non"}</button>
                    <button className="btn secondary full" onClick={() => updateRow(row.id, "commentaire", row.commentaire || row.remarque)}>Note rapide</button>
                    <button className="btn outline full" onClick={() => duplicateRow(row)}>Dupliquer cet item</button>
                    <button className="btn outline full" onClick={() => addSimilarExtinguisher(row)}>Ajouter extincteur similaire</button>
                  </div>
                  <div style={{ height: 10 }} />
                  <textarea className="field" placeholder="Commentaire optionnel..." value={row.commentaire} onChange={(e) => updateRow(row.id, "commentaire", e.target.value)} />
                </section>
              ))}
            </>
          )}

          {view === "anomalies" && (
            <>
              <section className="card">
                <h2 className="section-title">Éléments à suivre</h2>
                <p style={{ margin: 0, color: "#64748b" }}>Seuls les extincteurs marqués « À suivre : Oui » apparaissent ici.</p>
              </section>
              {suivis.length === 0 ? (
                <section className="card empty">✓ Aucun élément à suivre.</section>
              ) : (
                suivis.map((row) => (
                  <section key={row.id} className="card">
                    <div className="row-actions" style={{ justifyContent: "space-between" }}>
                      <strong>{getEmplacement(row) || "Sans emplacement"}</strong>
                      <span className="badge warning">{row.remarque}</span>
                    </div>
                    <p style={{ color: "#64748b", margin: "8px 0 10px" }}>{row.taille} · Série {row.serie}</p>
                    <textarea className="field" placeholder="Commentaire de suivi..." value={row.commentaire} onChange={(e) => updateRow(row.id, "commentaire", e.target.value)} />
                  </section>
                ))
              )}
            </>
          )}

          {view === "rapport" && (
            <>
              <section className="card">
                <h2 className="section-title">Résumé du rapport</h2>
                <p className="summary-line"><strong>Bâtiment :</strong> {project.batiment}</p>
                <p className="summary-line"><strong>Adresse :</strong> {project.adresse}</p>
                <p className="summary-line"><strong>Date :</strong> {project.date}</p>
                <p className="summary-line"><strong>Technicien :</strong> {project.technicien || "—"}</p>
                <p className="summary-line"><strong>Nombre d’étages :</strong> {floors.length}</p>
                <p className="summary-line"><strong>Nombre d’items :</strong> {rows.length}</p>
                <p className="summary-line"><strong>Éléments à suivre :</strong> {suivis.length}</p>
                <div className="card-soft" style={{ marginTop: 14 }}>
                  <h3 style={{ margin: "0 0 10px", fontSize: 14 }}>Mise en page du PDF</h3>
                  <div className="grid-2">
                    <label style={{ fontSize: 12, color: "#475569" }}>
                      Papier
                      <select className="field" value={printSettings.paper} onChange={(e) => updatePrintSetting("paper", e.target.value)}>
                        <option value="letter">Letter</option>
                        <option value="A4">A4</option>
                      </select>
                    </label>
                    <label style={{ fontSize: 12, color: "#475569" }}>
                      Orientation
                      <select className="field" value={printSettings.orientation} onChange={(e) => updatePrintSetting("orientation", e.target.value)}>
                        <option value="landscape">Paysage</option>
                        <option value="portrait">Portrait</option>
                      </select>
                    </label>
                    <label style={{ fontSize: 12, color: "#475569" }}>
                      Marges
                      <select className="field" value={printSettings.margin} onChange={(e) => updatePrintSetting("margin", e.target.value)}>
                        <option value="4mm">Très petites</option>
                        <option value="6mm">Petites</option>
                        <option value="8mm">Normales</option>
                        <option value="12mm">Grandes</option>
                      </select>
                    </label>
                    <label style={{ fontSize: 12, color: "#475569" }}>
                      Texte
                      <select className="field" value={printSettings.fontSize} onChange={(e) => updatePrintSetting("fontSize", Number(e.target.value))}>
                        <option value={7}>Compact</option>
                        <option value={8}>Normal</option>
                        <option value={9}>Grand</option>
                      </select>
                    </label>
                  </div>
                  <div style={{ height: 10 }} />
                  <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#475569" }}>
                    <input type="checkbox" checked={printSettings.browserLayout} onChange={(e) => updatePrintSetting("browserLayout", e.target.checked)} />
                    Laisser le navigateur gérer le format et l’orientation
                  </label>
                  <div style={{ height: 8 }} />
                  <label style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13, color: "#475569" }}>
                    <input type="checkbox" checked={printSettings.includeEmptyFollowUp} onChange={(e) => updatePrintSetting("includeEmptyFollowUp", e.target.checked)} />
                    Afficher « Éléments à suivre » même si la liste est vide
                  </label>
                </div>
                <div style={{ height: 12 }} />
                <button className="btn full" onClick={generatePDF}>⬇ Générer le PDF</button>
                <div style={{ height: 10 }} />
                <button className="btn outline full" onClick={exportCSV}>Exporter CSV</button>
              </section>

              <section className="card">
                <h2 className="section-title">Légende des remarques</h2>
                {REMARKS.map((item) => (
                  <div key={item.code} className="legend-row"><span className="badge">{item.code}</span><span>{item.label}</span></div>
                ))}
              </section>
            </>
          )}
        </div>
      </div>

      <div className="print-area" style={{ padding: 10, fontSize: printSettings.fontSize, color: "#0f172a" }}>
        <h1 style={{ background: "#b7d7a8", padding: 6, textAlign: "center", fontSize: 12, textTransform: "uppercase" }}>Inspection des extincteurs portatifs et boyaux</h1>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 30px", marginBottom: 10 }}>
          <div><strong>Bâtiment :</strong> {project.batiment}</div>
          <div><strong>Date :</strong> {project.date}</div>
          <div><strong>Adresse :</strong> {project.adresse}</div>
          <div><strong>Technicien :</strong> {project.technicien}</div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: printSettings.fontSize }}>
          <thead>
            <tr>{["Emplacement", "Taille/type", "No de série", "Année", "Dernier essai", "Prochain essai 12 ans", "Entretien 6 ans", "Rem.", "À suivre", "Commentaires"].map((h) => <th key={h} style={{ border: "1px solid #111", padding: 3 }}>{h}</th>)}</tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => (
              <tr key={row.id}>
                {[getEmplacement(row), row.taille, row.serie, row.fabrication, row.dernier, row.prochain12, row.prochain6, row.remarque, row.suivi ? "Oui" : "", row.commentaire].map((cell, idx) => <td key={idx} style={{ border: "1px solid #111", padding: 3 }}>{cell}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="avoid-break">
          <div style={{ background: "#b7d7a8", textAlign: "center", fontWeight: 700, padding: 4, marginTop: 10 }}>LÉGENDE DES REMARQUES</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "3px 18px", marginTop: 5, fontSize: printSettings.fontSize }}>{REMARKS.map((item) => <div key={item.code}><strong>{item.code} :</strong> {item.label}</div>)}</div>
        </div>
        {(suivis.length > 0 || printSettings.includeEmptyFollowUp) && (
          <div className="avoid-break">
            <h2 style={{ fontSize: printSettings.fontSize + 1, marginTop: 8, marginBottom: 4 }}>Éléments à suivre</h2>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: printSettings.fontSize }}>
              <thead><tr>{["Emplacement", "Dispositif", "Remarque", "Commentaire"].map((h) => <th key={h} style={{ border: "1px solid #111", padding: 3 }}>{h}</th>)}</tr></thead>
              <tbody>{suivis.length === 0 ? <tr><td style={{ border: "1px solid #111", padding: 3 }} colSpan={4}>Aucun élément à suivre.</td></tr> : suivis.map((row) => <tr key={row.id}>{[getEmplacement(row), row.taille, row.remarque, row.commentaire].map((cell, idx) => <td key={idx} style={{ border: "1px solid #111", padding: 3 }}>{cell}</td>)}</tr>)}</tbody>
            </table>
          </div>
        )}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40, marginTop: 12, fontSize: printSettings.fontSize }}>
          <div style={{ borderTop: "1px solid #111", paddingTop: 4 }}>Nom du technicien</div>
          <div style={{ borderTop: "1px solid #111", paddingTop: 4 }}>Signature</div>
        </div>
      </div>
    </>
  );
}
