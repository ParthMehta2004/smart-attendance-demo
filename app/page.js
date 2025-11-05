'use client';
import { useEffect, useState } from 'react';

const CLASSES = ["LHC 001", "LHC 002", "LHC003", "LHC004", "LHC101", "LHC102", "LHC103", "LHC104"];

export default function ProfessorPage() {
  const [classroom, setClassroom] = useState(CLASSES[0]);
  const [adminKey, setAdminKey] = useState('');
  const [activeSession, setActiveSession] = useState(null);
  const [logs, setLogs] = useState([]);

  async function openSession() {
    const res = await fetch('/api/sessions/open', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ classroom })
    });
    const data = await res.json();
    setActiveSession(data.session);
  }

  async function closeSession() {
    if (!activeSession) return;
    const res = await fetch('/api/sessions/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey },
      body: JSON.stringify({ sessionId: activeSession.id })
    });
    const data = await res.json();
    setActiveSession(null);
    setLogs([]);
  }

  async function fetchActive() {
    const res = await fetch('/api/sessions/active');
    const data = await res.json();
    setActiveSession(data.session || null);
  }

  async function fetchLogs() {
    if (!activeSession) return;
    const res = await fetch('/api/attendance?sessionId=' + activeSession.id);
    const data = await res.json();
    setLogs(data.rows || []);
  }

  useEffect(() => { fetchActive(); }, []);
  useEffect(() => {
    const t = setInterval(fetchLogs, 3000);
    return () => clearInterval(t);
  }, [activeSession]);

  return (
    <main className="p-6 max-w-3xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">Professor Panel</h1>
      <label className="block mb-2">Admin Key</label>
      <input value={adminKey} onChange={e=>setAdminKey(e.target.value)} className="border px-2 py-1 mb-4 w-full" placeholder="Enter admin key" />
      <label className="block mb-2">Choose Classroom</label>
      <select value={classroom} onChange={e=>setClassroom(e.target.value)} className="border px-2 py-1 mb-4 w-full">
        {CLASSES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <div className="flex gap-2 mb-6">
        <button onClick={openSession} className="border px-3 py-2">Activate Session</button>
        <button onClick={closeSession} className="border px-3 py-2">Close Session</button>
      </div>

      <div className="mb-4">
        <span className="font-medium">Active Session:</span> {activeSession ? activeSession.id + ' (' + activeSession.classroom + ')' : 'None'}
      </div>

      <h2 className="text-xl font-semibold mb-2">Live Attendance Logs</h2>
      <table className="w-full border">
        <thead><tr><th className="border px-2 py-1">Reg No</th><th className="border px-2 py-1">Name</th><th className="border px-2 py-1">Marked At</th></tr></thead>
        <tbody>
          {logs.map((r) => (
            <tr key={r.id}>
              <td className="border px-2 py-1">{r.reg_no}</td>
              <td className="border px-2 py-1">{r.name}</td>
              <td className="border px-2 py-1">{new Date(r.marked_at).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-sm mt-3">You can edit attendance after closing a session via the API (simple JSON endpoints).</p>
    </main>
  );
}
