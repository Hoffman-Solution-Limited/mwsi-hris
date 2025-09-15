import { useState } from 'react';
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

  return (
    <div className="p-6">
      <button
        onClick={() => navigate('/admin')}
        className="mb-4 inline-flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800 transition"
      >
        ← Back to Admin Panel
      </button>

      <h1 className="text-2xl font-semibold mb-4">Data Management</h1>
      <div className="space-y-4">
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition">
          Export User Data
        </button>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition">
          Backup System
        </button>

        <div className="mt-6">
          <h2 className="text-lg font-bold mb-2">Recent Logs</h2>
          <ul className="space-y-2">
            {logs.map(log => (
              <li key={log.id} className="border p-3 rounded text-sm">
                <span className="font-medium">{log.action}</span>
                <div className="text-muted-foreground">{log.timestamp}</div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
