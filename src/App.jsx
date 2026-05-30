import React, { useMemo, useState } from 'react';

const styles = {
  page: {
    minHeight: '100vh',
    background: '#f1f5f9',
    padding: 20,
    fontFamily: 'Arial, sans-serif',
    color: '#0f172a',
  },
  phone: {
    maxWidth: 430,
    margin: '0 auto',
    background: 'white',
    borderRadius: 32,
    overflow: 'hidden',
    boxShadow: '0 20px 45px rgba(15, 23, 42, 0.25)',
    border: '1px solid #e2e8f0',
  },
  header: {
    background: '#dc2626',
    color: 'white',
    padding: 20,
  },
  headerTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  logoBox: {
    width: 42,
    height: 42,
    borderRadius: 16,
    background: 'rgba(255,255,255,0.18)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 24,
  },
  main: {
    minHeight: 680,
    padding: 20,
  },
  title: {
    fontSize: 26,
    margin: '4px 0 8px',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
    marginTop: 18,
  },
  card: {
    background: 'white',
    borderRadius: 20,
    padding: 16,
    boxShadow: '0 5px 18px rgba(15, 23, 42, 0.08)',
    border: '1px solid #f1f5f9',
  },
  statValue: {
    fontSize: 30,
    fontWeight: 'bold',
    marginTop: 6,
  },
  small: {
    fontSize: 12,
    color: '#64748b',
  },
  button: {
    width: '100%',
    border: 0,
    borderRadius: 18,
    padding: '14px 16px',
    background: '#dc2626',
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
    cursor: 'pointer',
  },
  outlineButton: {
    width: '100%',
    border: '1px solid #fecaca',
    borderRadius: 18,
    padding: '14px 16px',
    background: 'white',
    color: '#b91c1c',
    fontWeight: 'bold',
    fontSize: 15,
    cursor: 'pointer',
  },
  jobCard: {
    background: 'white',
    borderRadius: 20,
    padding: 16,
    boxShadow: '0 5px 18px rgba(15, 23, 42, 0.08)',
    marginTop: 12,
  },
  badge: {
    background: '#fee2e2',
    color: '#b91c1c',
    padding: '5px 9px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 'bold',
  },
  row: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: 12,
    alignItems: 'center',
  },
  progressBack: {
    width: '100%',
    height: 12,
    background: '#e2e8f0',
    borderRadius: 999,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: '#dc2626',
    borderRadius: 999,
  },
  task: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    marginTop: 8,
    background: 'white',
    border: '1px solid #f1f5f9',
    borderRadius: 18,
    cursor: 'pointer',
    textAlign: 'left',
    fontSize: 14,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 8,
    border: '1px solid #cbd5e1',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checked: {
    background: '#dc2626',
    color: 'white',
    border: '1px solid #dc2626',
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: 14,
    padding: 11,
    marginTop: 6,
    fontSize: 14,
  },
  textarea: {
    width: '100%',
    boxSizing: 'border-box',
    border: '1px solid #cbd5e1',
    borderRadius: 14,
    padding: 11,
    marginTop: 6,
    minHeight: 100,
    fontSize: 14,
  },
  photoBox: {
    border: '1px dashed #cbd5e1',
    borderRadius: 18,
    background: '#f8fafc',
    padding: 18,
    textAlign: 'center',
  },
  footer: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr',
    borderTop: '1px solid #e2e8f0',
  },
  footerButton: {
    padding: 12,
    border: 0,
    background: 'white',
    color: '#64748b',
    cursor: 'pointer',
    fontSize: 12,
  },
  activeFooter: {
    color: '#dc2626',
    fontWeight: 'bold',
  },
};

const initialJobs = [
  {
    id: 'FA-2026-001',
    client: 'ABC Building',
    address: '123 Main Street, Laval',
    type: 'Annual Inspection',
    status: 'In progress',
    technician: 'Carlos Martinez',
    scheduled: 'Today, 10:00 AM',
  },
  {
    id: 'FA-2026-002',
    client: 'Saint-Laurent Clinic',
    address: '245 Saint-Laurent Blvd, Montreal',
    type: 'Service / Repair',
    status: 'Pending',
    technician: 'Carlos Martinez',
    scheduled: 'Today, 2:00 PM',
  },
];

const checklistTemplates = {
  'Annual Inspection': [
    'Verify main fire alarm panel',
    'Test smoke detectors',
    'Test manual pull stations',
    'Test horns/strobes',
    'Check backup batteries',
    'Record deficiencies found',
    'Take required photos',
    'Inform the client',
  ],
  'Service / Repair': [
    'Confirm reported issue',
    'Diagnose probable cause',
    'Repair or replace component',
    'Test system after repair',
    'Record materials used',
    'Take required photos',
    'Inform the client',
  ],
};

const blockers = [
  'No blocker',
  'Client did not provide access',
  'Missing material',
  'Drawing does not match site conditions',
  'Work area occupied',
  'Extra work requested',
  'Waiting for another contractor',
];

function StatCard({ icon, title, value, note }) {
  return (
    <div style={styles.card}>
      <div style={styles.row}>
        <div>
          <div style={styles.small}>{title}</div>
          <div style={styles.statValue}>{value}</div>
          <div style={styles.small}>{note}</div>
        </div>
        <div style={{ fontSize: 26 }}>{icon}</div>
      </div>
    </div>
  );
}

export default function FireAlarmChecklistMVP() {
  const [screen, setScreen] = useState('home');
  const [jobs] = useState(initialJobs);
  const [selectedJob, setSelectedJob] = useState(initialJobs[0]);
  const [arrivalTime, setArrivalTime] = useState('10:05 AM');
  const [departureTime, setDepartureTime] = useState('11:20 AM');
  const [checked, setChecked] = useState({
    'Verify main fire alarm panel': true,
    'Test smoke detectors': true,
    'Test manual pull stations': false,
    'Test horns/strobes': false,
    'Check backup batteries': false,
    'Record deficiencies found': false,
    'Take required photos': false,
    'Inform the client': false,
  });
  const [materials, setMaterials] = useState('Cleaning spray, 9V batteries x2');
  const [notes, setNotes] = useState(
    'System generally in good condition. Limited access was found on the 3rd floor.'
  );
  const [blocker, setBlocker] = useState('No blocker');
  const [needsReturn, setNeedsReturn] = useState('No');

  const tasks =
    checklistTemplates[selectedJob.type] ||
    checklistTemplates['Annual Inspection'];
  const completed = tasks.filter((task) => checked[task]).length;
  const progress = Math.round((completed / tasks.length) * 100);
  const isComplete = progress === 100;

  const report = useMemo(
    () => ({
      client: selectedJob.client,
      technician: selectedJob.technician,
      arrivalTime,
      departureTime,
      progress,
      blocker,
      needsReturn,
      materials,
      notes,
    }),
    [
      selectedJob,
      arrivalTime,
      departureTime,
      progress,
      blocker,
      needsReturn,
      materials,
      notes,
    ]
  );

  function startJob(job) {
    setSelectedJob(job);
    setScreen('checklist');
  }

  function toggleTask(task) {
    setChecked((current) => ({ ...current, [task]: !current[task] }));
  }

  return (
    <div style={styles.page}>
      <div style={styles.phone}>
        <header style={styles.header}>
          <div style={styles.headerTop}>
            <div style={styles.logo}>
              <div style={styles.logoBox}>🔥</div>
              <div>
                <h1 style={{ margin: 0, fontSize: 20 }}>FireCheck Field</h1>
                <div style={{ fontSize: 12, color: '#fee2e2' }}>
                  Field checklist system
                </div>
              </div>
            </div>
            <div>🔔</div>
          </div>
        </header>

        <main style={styles.main}>
          {screen === 'home' && (
            <div>
              <p style={styles.subtitle}>Welcome, Carlos</p>
              <h2 style={styles.title}>Today’s Jobs</h2>

              <div style={styles.grid}>
                <StatCard
                  icon="📅"
                  title="Assigned"
                  value="2"
                  note="For today"
                />
                <StatCard
                  icon="⏱️"
                  title="Pending"
                  value="1"
                  note="Not started"
                />
                <StatCard
                  icon="✅"
                  title="In progress"
                  value="1"
                  note="Open visit"
                />
                <StatCard icon="📄" title="Reports" value="0" note="To send" />
              </div>

              <div style={{ marginTop: 20 }}>
                {jobs.map((job) => (
                  <div key={job.id} style={styles.jobCard}>
                    <div style={styles.row}>
                      <div>
                        <h3 style={{ margin: '0 0 4px' }}>{job.client}</h3>
                        <div style={styles.small}>{job.type}</div>
                      </div>
                      <span style={styles.badge}>{job.status}</span>
                    </div>
                    <p style={styles.small}>📍 {job.address}</p>
                    <p style={styles.small}>🕒 {job.scheduled}</p>
                    <button style={styles.button} onClick={() => startJob(job)}>
                      Start / continue visit
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {screen === 'checklist' && (
            <div>
              <button
                style={{
                  ...styles.footerButton,
                  padding: 0,
                  marginBottom: 12,
                  color: '#b91c1c',
                }}
                onClick={() => setScreen('home')}
              >
                ← Back
              </button>
              <p style={styles.subtitle}>{selectedJob.id}</p>
              <h2 style={styles.title}>{selectedJob.client}</h2>
              <p style={styles.subtitle}>{selectedJob.type}</p>

              <div style={{ ...styles.card, marginTop: 16 }}>
                <div style={styles.row}>
                  <span style={styles.small}>Visit progress</span>
                  <strong style={{ color: '#dc2626' }}>{progress}%</strong>
                </div>
                <div style={{ marginTop: 12, ...styles.progressBack }}>
                  <div
                    style={{ ...styles.progressFill, width: `${progress}%` }}
                  />
                </div>
                <div style={styles.grid}>
                  <label style={styles.small}>
                    Arrival
                    <input
                      style={styles.input}
                      value={arrivalTime}
                      onChange={(e) => setArrivalTime(e.target.value)}
                    />
                  </label>
                  <label style={styles.small}>
                    Departure
                    <input
                      style={styles.input}
                      value={departureTime}
                      onChange={(e) => setDepartureTime(e.target.value)}
                    />
                  </label>
                </div>
              </div>

              <h3 style={{ marginTop: 20 }}>Technical checklist</h3>
              {tasks.map((task) => (
                <button
                  key={task}
                  style={styles.task}
                  onClick={() => toggleTask(task)}
                >
                  <span
                    style={
                      checked[task]
                        ? { ...styles.check, ...styles.checked }
                        : styles.check
                    }
                  >
                    {checked[task] ? '✓' : ''}
                  </span>
                  <span>{task}</span>
                </button>
              ))}

              <button
                style={{ ...styles.button, marginTop: 18 }}
                onClick={() => setScreen('evidence')}
              >
                Continue to evidence
              </button>
            </div>
          )}

          {screen === 'evidence' && (
            <div>
              <button
                style={{
                  ...styles.footerButton,
                  padding: 0,
                  marginBottom: 12,
                  color: '#b91c1c',
                }}
                onClick={() => setScreen('checklist')}
              >
                ← Back
              </button>
              <h2 style={styles.title}>Evidence and notes</h2>
              <p style={styles.subtitle}>
                Photos, materials, and visit blockers.
              </p>

              <div style={styles.grid}>
                {[
                  'Main panel',
                  'Detector',
                  'Horn/strobe',
                  'Manual pull station',
                ].map((item) => (
                  <div key={item} style={styles.photoBox}>
                    <div style={{ fontSize: 28 }}>📷</div>
                    <strong>{item}</strong>
                    <div style={styles.small}>Required photo</div>
                  </div>
                ))}
              </div>

              <button style={{ ...styles.outlineButton, marginTop: 16 }}>
                + Add photo
              </button>

              <div style={{ ...styles.card, marginTop: 16 }}>
                <label style={styles.small}>
                  Materials used
                  <input
                    style={styles.input}
                    value={materials}
                    onChange={(e) => setMaterials(e.target.value)}
                  />
                </label>
                <label
                  style={{ ...styles.small, display: 'block', marginTop: 12 }}
                >
                  Blocker / issue
                  <select
                    style={styles.input}
                    value={blocker}
                    onChange={(e) => setBlocker(e.target.value)}
                  >
                    {blockers.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </label>
                <label
                  style={{ ...styles.small, display: 'block', marginTop: 12 }}
                >
                  Return visit required?
                  <select
                    style={styles.input}
                    value={needsReturn}
                    onChange={(e) => setNeedsReturn(e.target.value)}
                  >
                    <option>No</option>
                    <option>Yes</option>
                  </select>
                </label>
                <label
                  style={{ ...styles.small, display: 'block', marginTop: 12 }}
                >
                  Notes
                  <textarea
                    style={styles.textarea}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </label>
              </div>

              <button
                style={{ ...styles.button, marginTop: 18 }}
                onClick={() => setScreen('summary')}
              >
                Generate summary
              </button>
            </div>
          )}

          {screen === 'summary' && (
            <div>
              <button
                style={{
                  ...styles.footerButton,
                  padding: 0,
                  marginBottom: 12,
                  color: '#b91c1c',
                }}
                onClick={() => setScreen('evidence')}
              >
                ← Back
              </button>
              <h2 style={styles.title}>Visit summary</h2>
              <p style={styles.subtitle}>Ready to review or send.</p>

              <div
                style={{ ...styles.card, textAlign: 'center', marginTop: 16 }}
              >
                <div style={{ fontSize: 56 }}>{isComplete ? '✅' : '⚠️'}</div>
                <h3>{isComplete ? 'Visit complete' : 'Visit incomplete'}</h3>
                <p style={styles.small}>
                  {completed} of {tasks.length} tasks completed.
                </p>
              </div>

              <div style={{ ...styles.card, marginTop: 16 }}>
                <div style={styles.row}>
                  <span style={styles.small}>Project</span>
                  <strong>{report.client}</strong>
                </div>
                <div style={styles.row}>
                  <span style={styles.small}>Technician</span>
                  <strong>{report.technician}</strong>
                </div>
                <div style={styles.row}>
                  <span style={styles.small}>Arrival</span>
                  <strong>{report.arrivalTime}</strong>
                </div>
                <div style={styles.row}>
                  <span style={styles.small}>Departure</span>
                  <strong>{report.departureTime}</strong>
                </div>
                <div style={styles.row}>
                  <span style={styles.small}>Progress</span>
                  <strong>{report.progress}%</strong>
                </div>
                <div style={styles.row}>
                  <span style={styles.small}>Return required</span>
                  <strong>{report.needsReturn}</strong>
                </div>
              </div>

              <div style={{ ...styles.card, marginTop: 16 }}>
                <strong>Materials used</strong>
                <p style={styles.small}>{report.materials}</p>
                <strong>Notes</strong>
                <p style={styles.small}>{report.notes}</p>
              </div>

              <div style={styles.grid}>
                <button
                  style={styles.outlineButton}
                  onClick={() => setScreen('home')}
                >
                  Save draft
                </button>
                <button style={styles.button}>Send</button>
              </div>
            </div>
          )}
        </main>

        <footer style={styles.footer}>
          <button
            style={
              screen === 'home'
                ? { ...styles.footerButton, ...styles.activeFooter }
                : styles.footerButton
            }
            onClick={() => setScreen('home')}
          >
            🏠
            <br />
            Home
          </button>
          <button
            style={
              screen === 'checklist'
                ? { ...styles.footerButton, ...styles.activeFooter }
                : styles.footerButton
            }
            onClick={() => setScreen('checklist')}
          >
            ✅<br />
            Checklist
          </button>
          <button
            style={
              screen === 'evidence'
                ? { ...styles.footerButton, ...styles.activeFooter }
                : styles.footerButton
            }
            onClick={() => setScreen('evidence')}
          >
            📷
            <br />
            Evidence
          </button>
          <button
            style={
              screen === 'summary'
                ? { ...styles.footerButton, ...styles.activeFooter }
                : styles.footerButton
            }
            onClick={() => setScreen('summary')}
          >
            📄
            <br />
            Summary
          </button>
        </footer>
      </div>
    </div>
  );
}
