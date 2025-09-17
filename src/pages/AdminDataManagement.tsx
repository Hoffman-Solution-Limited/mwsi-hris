import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';

type LogEntry = {
  id: number;
  action: string;
  timestamp: string;
};

const mockLogs: LogEntry[] = [
  { id: 1, action: 'User login: alice@company.com', timestamp: '2025-09-15 08:23' },
  { id: 2, action: 'Leave request submitted by Brian', timestamp: '2025-09-14 17:45' },
  { id: 3, action: 'Role updated: HR permissions changed', timestamp: '2025-09-13 10:12' },
];

export default function DataManagement() {
  const navigate = useNavigate();
  const [logs] = useState<LogEntry[]>(mockLogs);
  const [exporting, setExporting] = useState(false);
  const [backingUp, setBackingUp] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const hasLogs = logs && logs.length > 0;
  const formatWhen = (ts: string) => ts; // placeholder; timestamps already formatted

  const actionsDisabled = useMemo(() => exporting || backingUp, [exporting, backingUp]);

  const handleExport = async () => {
    try {
      setMessage(null);
      setExporting(true);
      // simulate async export
      await new Promise(r => setTimeout(r, 600));
      setMessage('User data export has been queued. You will receive an email when it is ready.');
    } finally {
      setExporting(false);
    }
  };

  const handleBackup = async () => {
    try {
      setMessage(null);
      setBackingUp(true);
      // simulate async backup
      await new Promise(r => setTimeout(r, 600));
      setMessage('System backup created successfully.');
    } finally {
      setBackingUp(false);
    }
  };

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/admin')}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition"
      >
        ← Back to Admin Panel
      </button>

      <h1 className="text-2xl font-semibold mb-2">Data Management</h1>
      <p className="text-sm text-muted-foreground mb-6">Export data and manage system backups. These operations may take a few minutes.</p>

      {message && (
        <div className="mb-4 p-3 rounded bg-blue-50 text-blue-700 text-sm">{message}</div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Exports</h2>
          <p className="text-sm text-muted-foreground mb-3">Download user and system data snapshots.</p>
          <button
            onClick={handleExport}
            disabled={actionsDisabled}
            className={`px-4 py-2 rounded text-white ${exporting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} transition`}
          >
            {exporting ? 'Exporting…' : 'Export User Data'}
          </button>
        </div>
        <div className="border rounded p-4">
          <h2 className="text-lg font-semibold mb-2">Backups</h2>
          <p className="text-sm text-muted-foreground mb-3">Create a secure backup of configuration and metadata.</p>
          <button
            onClick={handleBackup}
            disabled={actionsDisabled}
            className={`px-4 py-2 rounded text-white ${backingUp ? 'bg-green-400' : 'bg-green-600 hover:bg-green-700'} transition`}
          >
            {backingUp ? 'Backing up…' : 'Backup System'}
          </button>
        </div>
      </div>

      <div className="mt-2">
        <h2 className="text-lg font-bold mb-2">Recent Logs</h2>
        {!hasLogs ? (
          <div className="text-sm text-muted-foreground border rounded p-4">No logs available yet.</div>
        ) : (
          <ul className="space-y-2">
            {logs.map(log => (
              <li key={log.id} className="border p-3 rounded text-sm flex items-center justify-between">
                <span className="font-medium">{log.action}</span>
                <div className="text-muted-foreground">{formatWhen(log.timestamp)}</div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
