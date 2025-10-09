import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SystemSettings() {
  const navigate = useNavigate();
  const [workingHours, setWorkingHours] = useState({ start: '08:00', end: '17:00' });
  const [leavePolicy, setLeavePolicy] = useState('Standard (21 days/year)');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  return (
    <div className="p-6">

      <h1 className="text-2xl font-semibold mb-4">System Settings</h1>
      <div className="space-y-6 max-w-lg">
        <div>
          <label className="block font-medium mb-1">Working Hours</label>
          <div className="flex gap-4">
            <input
              type="time"
              value={workingHours.start}
              onChange={e => setWorkingHours({ ...workingHours, start: e.target.value })}
              className="border px-3 py-2 rounded"
            />
            <input
              type="time"
              value={workingHours.end}
              onChange={e => setWorkingHours({ ...workingHours, end: e.target.value })}
              className="border px-3 py-2 rounded"
            />
          </div>
        </div>

        <div>
          <label className="block font-medium mb-1">Leave Policy</label>
          <select
            value={leavePolicy}
            onChange={e => setLeavePolicy(e.target.value)}
            className="border px-3 py-2 rounded w-full"
          >
            <option value="Standard (21 days/year)">Standard (21 days/year)</option>
            <option value="Flexible (Accrual-based)">Flexible (Accrual-based)</option>
            <option value="Unlimited">Unlimited</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={notificationsEnabled}
            onChange={() => setNotificationsEnabled(!notificationsEnabled)}
          />
          <label className="font-medium">Enable Email Notifications</label>
        </div>
      </div>
    </div>
  );
}
