import { useCallback, useEffect, useState } from 'react';
import Editor from '@monaco-editor/react';

const GW = () => (import.meta.env.VITE_GATEWAY_URL || 'http://localhost:9797').replace(/\/$/, '');

function validateWorld(obj) {
  if (!obj || typeof obj !== 'object') return 'Bukan objek JSON.';
  if (!Array.isArray(obj.rooms)) return 'Field `rooms` harus berupa array (validasi gateway).';
  return null;
}

export default function App() {
  const [text, setText] = useState('{\n  "rooms": []\n}');
  const [dirty, setDirty] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [parseErr, setParseErr] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setMsg('');
    setParseErr('');
    try {
      const r = await fetch(`${GW()}/api/world`, { credentials: 'include' });
      const j = await r.json().catch(() => null);
      if (!r.ok) {
        setMsg(j?.error || `HTTP ${r.status}`);
        return;
      }
      setText(JSON.stringify(j, null, 2));
      setDirty(false);
      setMsg('Dimuat dari gateway.');
    } catch (e) {
      setMsg(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    setSaving(true);
    setMsg('');
    setParseErr('');
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      setParseErr(String(e.message || e));
      setSaving(false);
      return;
    }
    const v = validateWorld(data);
    if (v) {
      setParseErr(v);
      setSaving(false);
      return;
    }
    try {
      const r = await fetch(`${GW()}/api/world/save`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const j = await r.json().catch(() => ({}));
      if (r.ok && j.success) {
        setMsg(j.message || 'Tersimpan.');
        setDirty(false);
      } else {
        setMsg(j.error || `HTTP ${r.status}`);
      }
    } catch (e) {
      setMsg(String(e.message || e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="h-screen flex flex-col p-3 gap-2 max-w-[1800px] mx-auto">
      <header className="flex flex-wrap gap-3 justify-between items-center shrink-0">
        <div>
          <h1 className="text-lg font-semibold">World.json editor</h1>
          <p className="text-xs text-slate-500">
            by Cursor · <code className="text-cyan-500/90">{GW()}</code> ·{' '}
            <code className="text-slate-600">GET/POST /api/world</code>
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            disabled={loading}
            onClick={load}
            className="text-sm px-3 py-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 disabled:opacity-40"
          >
            {loading ? 'Memuat…' : 'Muat dari gateway'}
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={save}
            className="text-sm px-3 py-2 rounded-lg bg-emerald-800 hover:bg-emerald-700 disabled:opacity-40"
          >
            {saving ? 'Menyimpan…' : 'Simpan ke gateway'}
          </button>
          {dirty && <span className="text-xs text-amber-400 self-center">Belum disimpan</span>}
        </div>
      </header>

      {(msg || parseErr) && (
        <div
          className={`text-sm px-3 py-2 rounded-lg border shrink-0 ${
            parseErr ? 'border-rose-800/60 bg-rose-950/30 text-rose-100' : 'border-slate-800 bg-slate-900/50 text-slate-300'
          }`}
        >
          {parseErr || msg}
        </div>
      )}

      <div className="flex-1 min-h-0 rounded-xl border border-slate-800 overflow-hidden">
        <Editor
          height="100%"
          defaultLanguage="json"
          theme="vs-dark"
          value={text}
          onChange={(v) => {
            setText(v || '');
            setDirty(true);
            setParseErr('');
          }}
          options={{
            minimap: { enabled: true },
            fontSize: 13,
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true
          }}
        />
      </div>

      <p className="text-[11px] text-slate-600 shrink-0">
        Menulis langsung ke <code className="text-slate-500">config/world.json</code> di mesin gateway. Pastikan backup / git di repo utama sebelum eksperimen besar.
      </p>
    </div>
  );
}
