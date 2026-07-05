import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io } from 'socket.io-client';

const GW = () => (import.meta.env.VITE_GATEWAY_URL || 'http://localhost:9797').replace(/\/$/, '');

function entrySummary(e) {
  if (e.toolName) return e.toolName;
  if (e.result === 'no_discoveries') return 'Tidak ada discovery';
  if (e.description) return String(e.description).slice(0, 120);
  return e.type || '—';
}

function TypeBadge({ type }) {
  const map = {
    adoption: 'bg-emerald-900/50 text-emerald-200 border-emerald-700/40',
    proposal: 'bg-amber-900/40 text-amber-100 border-amber-700/40',
    rejection: 'bg-rose-900/40 text-rose-100 border-rose-700/40',
    revert: 'bg-violet-900/40 text-violet-100 border-violet-700/40',
    cycle: 'bg-slate-800 text-slate-300 border-slate-600/40'
  };
  const cls = map[type] || 'bg-slate-800 text-slate-400 border-slate-700';
  return (
    <span className={`text-[10px] uppercase px-1.5 py-0.5 rounded border ${cls}`}>{type || '?'}</span>
  );
}

export default function App() {
  const [entries, setEntries] = useState([]);
  const [pending, setPending] = useState([]);
  const [total, setTotal] = useState(0);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [agentFilter, setAgentFilter] = useState('');
  const [connected, setConnected] = useState(false);
  const [toast, setToast] = useState('');
  const [busyId, setBusyId] = useState(null);
  const socketRef = useRef(null);

  const load = useCallback(async () => {
    setErr('');
    const base = GW();
    try {
      const [rLog, rPen] = await Promise.all([
        fetch(`${base}/api/learning/log?limit=200`, { credentials: 'include' }),
        fetch(`${base}/api/learning/pending`, { credentials: 'include' })
      ]);
      const jLog = await rLog.json().catch(() => ({}));
      const jPen = await rPen.json().catch(() => ({}));
      if (!rLog.ok) {
        setErr(jLog.error || `log HTTP ${rLog.status}`);
        setEntries([]);
        setTotal(0);
      } else {
        setEntries(Array.isArray(jLog.entries) ? jLog.entries : []);
        setTotal(typeof jLog.total === 'number' ? jLog.total : (jLog.entries || []).length);
      }
      if (rPen.ok) {
        setPending(Array.isArray(jPen.pending) ? jPen.pending : []);
      } else {
        setPending([]);
      }
    } catch (e) {
      setErr(String(e.message || e));
      setEntries([]);
      setPending([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 15000);
    return () => clearInterval(id);
  }, [load]);

  useEffect(() => {
    const s = io(GW(), { transports: ['websocket', 'polling'], withCredentials: true });
    socketRef.current = s;
    s.on('connect', () => setConnected(true));
    s.on('disconnect', () => setConnected(false));
    const bump = (label) => {
      setToast(`${label} · ${new Date().toLocaleTimeString()}`);
      load();
    };
    s.on('learning:adopted', () => bump('learning:adopted'));
    s.on('agent:learned', () => bump('agent:learned'));
    s.on('agent:learning:proposal', () => bump('agent:learning:proposal'));
    return () => {
      s.removeAllListeners();
      s.close();
    };
  }, [load]);

  const agents = useMemo(() => {
    const ids = new Set();
    entries.forEach((e) => {
      if (e.agentId) ids.add(e.agentId);
    });
    pending.forEach((p) => {
      if (p.agentId) ids.add(p.agentId);
    });
    return [...ids].sort();
  }, [entries, pending]);

  const filtered = useMemo(() => {
    if (!agentFilter) return entries;
    return entries.filter((e) => e.agentId === agentFilter);
  }, [entries, agentFilter]);

  const approve = async (p) => {
    setBusyId(p.id);
    try {
      const r = await fetch(`${GW()}/api/learning/approve`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingId: p.id, agentId: p.agentId })
      });
      const j = await r.json().catch(() => ({}));
      setToast(j.message || (r.ok ? 'Disetujui' : j.error || r.statusText));
      await load();
    } catch (e) {
      setToast(String(e.message || e));
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (p) => {
    setBusyId(p.id);
    try {
      const r = await fetch(`${GW()}/api/learning/reject`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingId: p.id, agentId: p.agentId })
      });
      const j = await r.json().catch(() => ({}));
      setToast(j.message || (r.ok ? 'Ditolak' : j.error || r.statusText));
      await load();
    } catch (e) {
      setToast(String(e.message || e));
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className="min-h-screen p-4 max-w-6xl mx-auto space-y-4">
      <header className="flex flex-wrap justify-between gap-3 items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Agent learning log</h1>
          <p className="text-sm text-slate-500">
            by Cursor · <code className="text-cyan-400/90">{GW()}</code>
            <span className="ml-2">
              socket:{' '}
              <span className={connected ? 'text-emerald-400' : 'text-amber-400'}>{connected ? 'on' : 'off'}</span>
            </span>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <select
            value={agentFilter}
            onChange={(e) => setAgentFilter(e.target.value)}
            className="text-sm bg-slate-900 border border-slate-700 rounded-lg px-2 py-2 text-slate-200"
          >
            <option value="">Semua agen</option>
            {agents.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={load}
            className="text-sm px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800"
          >
            Refresh
          </button>
        </div>
      </header>

      {toast && (
        <p className="text-xs text-slate-400 border border-slate-800 rounded-lg px-3 py-2 bg-slate-900/50">{toast}</p>
      )}

      {err && (
        <div className="rounded-lg border border-rose-800/50 bg-rose-950/20 text-rose-100 px-4 py-3 text-sm">
          {err}
        </div>
      )}

      <div className="grid lg:grid-cols-5 gap-4">
        <section className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/30 p-4 min-h-[280px]">
          <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">
            Menunggu persetujuan ({pending.length})
          </h2>
          {loading ? (
            <p className="text-slate-500 text-sm">Memuat…</p>
          ) : pending.length === 0 ? (
            <p className="text-slate-600 text-sm">Tidak ada proposal tertunda.</p>
          ) : (
            <ul className="space-y-3">
              {pending.map((p) => (
                <li key={p.id} className="rounded-lg border border-slate-800 bg-slate-950/50 p-3 text-sm">
                  <div className="font-mono text-xs text-cyan-500/90">{p.agentId}</div>
                  <div className="font-medium text-white mt-1">{p.toolName}</div>
                  <p className="text-slate-400 text-xs mt-1 line-clamp-3">{p.description}</p>
                  <div className="text-[11px] text-slate-500 mt-1">
                    {p.cost && <span>cost: {p.cost} · </span>}
                    {p.createdAt && <span>{p.createdAt.slice(0, 19)}</span>}
                  </div>
                  <div className="flex gap-2 mt-3">
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => approve(p)}
                      className="text-xs px-2 py-1.5 rounded bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40"
                    >
                      Setuju
                    </button>
                    <button
                      type="button"
                      disabled={busyId === p.id}
                      onClick={() => reject(p)}
                      className="text-xs px-2 py-1.5 rounded bg-slate-800 border border-slate-600 hover:bg-rose-900/40 disabled:opacity-40"
                    >
                      Tolak
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="lg:col-span-3 rounded-xl border border-slate-800 overflow-hidden flex flex-col min-h-[400px]">
          <div className="px-4 py-2 border-b border-slate-800 bg-slate-900/50 flex justify-between items-center">
            <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide">Log ({filtered.length}/{total})</h2>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full text-sm">
              <thead className="text-left text-xs text-slate-500 uppercase sticky top-0 bg-slate-950/95 backdrop-blur">
                <tr>
                  <th className="px-3 py-2 w-36">Waktu</th>
                  <th className="px-3 py-2">Agen</th>
                  <th className="px-3 py-2">Tipe</th>
                  <th className="px-3 py-2">Ringkas</th>
                  <th className="px-3 py-2 w-24">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e, i) => (
                  <tr key={e.id || `${e.timestamp}-${i}`} className="border-t border-slate-800/80 hover:bg-slate-900/40">
                    <td className="px-3 py-2 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {(e.timestamp || '').slice(0, 19).replace('T', ' ')}
                    </td>
                    <td className="px-3 py-2 font-mono text-xs text-cyan-600/90">{e.agentId || '—'}</td>
                    <td className="px-3 py-2">
                      <TypeBadge type={e.type} />
                    </td>
                    <td className="px-3 py-2 text-slate-300 max-w-[240px] truncate" title={entrySummary(e)}>
                      {entrySummary(e)}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-500">{e.status || e.decision || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {!loading && filtered.length === 0 && (
              <p className="p-6 text-slate-600 text-sm">Belum ada entri untuk filter ini.</p>
            )}
          </div>
        </section>
      </div>

      <p className="text-[11px] text-slate-600">
        Realtime: <code className="text-slate-500">agent:learned</code>, <code className="text-slate-500">agent:learning:proposal</code>,{' '}
        <code className="text-slate-500">learning:adopted</code> memicu refresh.
      </p>
    </div>
  );
}
