import { useEffect, useState, useCallback } from 'react';
import { io } from 'socket.io-client';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { MOCK_STATUS, mockSpendSeries } from './lib/mockCredits.js';
import { mapGatewayCreditStatus } from './lib/mapCredits.js';

const GW = () => (import.meta.env.VITE_GATEWAY_URL || 'http://localhost:9797').replace(/\/$/, '');
const COLORS = ['#8b5cf6', '#22c55e', '#f97316', '#38bdf8', '#ec4899'];

export default function App() {
  const [status, setStatus] = useState(MOCK_STATUS);
  const [series, setSeries] = useState(() => mockSpendSeries());
  const [source, setSource] = useState('mock');
  const [err, setErr] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setErr('');
    try {
      const r = await fetch(`${GW()}/api/credits/status`, { credentials: 'include' });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j && typeof j.balance === 'number') {
        const m = mapGatewayCreditStatus(j);
        setSource('gateway');
        setStatus({
          balance_usd: m.balance_usd,
          monthly_cap_usd: m.monthly_cap_usd,
          month_spend_usd: m.month_spend_usd,
          agents: m.agents,
          queue: m.queue
        });
        setSeries(m.series.some((d) => d.usd > 0) ? m.series : mockSpendSeries());
        return;
      }
      setSource('mock');
      setSeries(mockSpendSeries());
      setStatus(MOCK_STATUS);
      if (!r.ok) setErr(`Gateway ${r.status} — pakai mock.`);
    } catch (e) {
      setSource('mock');
      setSeries(mockSpendSeries());
      setStatus(MOCK_STATUS);
      setErr(String(e.message || e));
    }
  }, []);

  useEffect(() => {
    load();
    const id = setInterval(load, 10000);
    const s = io(GW(), { transports: ['websocket', 'polling'] });
    s.on('credits:updated', () => load());
    return () => {
      clearInterval(id);
      s.off('credits:updated');
      s.close();
    };
  }, [load]);

  const approve = async (approvalId) => {
    setBusyId(approvalId);
    try {
      const r = await fetch(`${GW()}/api/credits/approve/${encodeURIComponent(approvalId)}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: '{}'
      });
      if (!r.ok) {
        const t = await r.text();
        setErr(`Approve gagal: ${r.status} ${t.slice(0, 120)}`);
      }
      await load();
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusyId(null);
    }
  };

  const reject = async (approvalId) => {
    setBusyId(approvalId);
    try {
      const r = await fetch(`${GW()}/api/credits/reject/${encodeURIComponent(approvalId)}`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Ditolak dari dashboard' })
      });
      if (!r.ok) {
        const t = await r.text();
        setErr(`Tolak gagal: ${r.status} ${t.slice(0, 120)}`);
      }
      await load();
    } catch (e) {
      setErr(String(e.message || e));
    } finally {
      setBusyId(null);
    }
  };

  const capPct = Math.min(
    100,
    Math.round(
      status.monthly_cap_usd > 0 ? (status.month_spend_usd / status.monthly_cap_usd) * 100 : 0
    )
  );

  return (
    <div className="min-h-screen p-4 space-y-4 max-w-6xl mx-auto">
      <header className="flex flex-wrap justify-between gap-3 items-end">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Credit &amp; Cost</h1>
          <p className="text-sm text-slate-500">
            by Cursor · <code className="text-emerald-400/90">{GW()}</code> · sumber: {source}
          </p>
        </div>
        <button
          type="button"
          onClick={load}
          className="text-sm px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800"
        >
          Refresh
        </button>
      </header>

      {err && <div className="text-sm text-amber-300 bg-amber-950/40 border border-amber-900/50 rounded-lg px-3 py-2">{err}</div>}

      <section className="grid md:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <p className="text-xs uppercase text-slate-500">Saldo</p>
          <p className="text-3xl font-bold text-white mt-1">${Number(status.balance_usd).toFixed(2)}</p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 md:col-span-2">
          <p className="text-xs uppercase text-slate-500 mb-2">Pemakaian bulan ini</p>
          <div className="h-3 rounded-full bg-slate-800 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-violet-600 to-fuchsia-500" style={{ width: `${capPct}%` }} />
          </div>
          <p className="text-sm text-slate-400 mt-2">
            ${Number(status.month_spend_usd).toFixed(2)} / ${Number(status.monthly_cap_usd).toFixed(2)} ({capPct}%)
          </p>
        </div>
      </section>

      <section className="grid lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-xl border border-slate-800 bg-slate-900/30 p-3 h-72">
          <p className="text-xs uppercase text-slate-500 mb-2">Estimasi harian (dari transaksi terbaru)</p>
          <ResponsiveContainer width="100%" height="90%">
            <LineChart data={series}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={11} />
              <YAxis stroke="#94a3b8" fontSize={11} />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
              <Line type="monotone" dataKey="usd" stroke="#a78bfa" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/30 p-3 h-72">
          <p className="text-xs uppercase text-slate-500 mb-2">Per layanan (coins)</p>
          <ResponsiveContainer width="100%" height="90%">
            <PieChart>
              <Pie
                data={status.agents}
                dataKey="value"
                nameKey="label"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={2}
              >
                {status.agents.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900/30 p-4">
        <h2 className="text-sm font-medium text-slate-400 uppercase tracking-wide mb-3">Antrian persetujuan</h2>
        {status.queue.length === 0 ? (
          <p className="text-sm text-slate-500">Tidak ada antrian.</p>
        ) : (
          <ul className="space-y-2">
            {status.queue.map((q) => (
              <li
                key={q.id}
                className="flex flex-wrap gap-3 justify-between items-center text-sm border border-slate-800 rounded-lg px-3 py-2"
              >
                <span className="text-slate-300">{q.requester}</span>
                <span className="text-slate-500 flex-1 min-w-[120px]">{q.reason}</span>
                <span className="font-mono text-amber-200">${Number(q.amount_usd).toFixed(2)}</span>
                <span className="text-xs text-slate-600">{q.coins != null ? `${q.coins} coins` : ''}</span>
                <span className="flex gap-2">
                  <button
                    type="button"
                    disabled={busyId === q.id}
                    onClick={() => approve(q.id)}
                    className="px-2 py-1 rounded bg-emerald-900/50 text-emerald-200 text-xs border border-emerald-800 disabled:opacity-40"
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    disabled={busyId === q.id}
                    onClick={() => reject(q.id)}
                    className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-xs border border-slate-700 disabled:opacity-40"
                  >
                    Tolak
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
        <p className="text-xs text-slate-600 mt-3">
          REST: <code className="text-slate-500">POST /api/credits/approve/:id</code> ·{' '}
          <code className="text-slate-500">POST /api/credits/reject/:id</code> · socket <code className="text-slate-500">credits:updated</code>
        </p>
      </section>
    </div>
  );
}
