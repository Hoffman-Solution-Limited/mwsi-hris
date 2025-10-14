import React, { useMemo, useState } from 'react';
import { Search, Plus, Download, List } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useSystemCatalog } from '@/contexts/SystemCatalogContext';
import { useEmployees } from '@/contexts/EmployeesContext';

// Types for table rendering
type StationRow = {
  id: string;
  name: string;
  employeeCount: number;
};

const WorkStationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newStation, setNewStation] = useState('');
  const { stations, addStation } = useSystemCatalog();
  const { employees } = useEmployees();

  const allStations: StationRow[] = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(e => {
      const s = e.stationName || 'Unassigned';
      counts[s] = (counts[s] || 0) + 1;
    });
    return stations.map((name, index) => ({ id: `st-${index + 1}`, name, employeeCount: counts[name] || 0 }));
  }, [stations, employees]);

  const filtered = allStations.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAdd = () => {
    if (!newStation.trim()) return;
    addStation(newStation.trim());
    setNewStation('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Work Stations</h1>
          <p className="text-muted-foreground">Manage work stations and view employee counts</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Work Station
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Station</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Enter station name..." value={newStation} onChange={e => setNewStation(e.target.value)} />
                <Button onClick={handleAdd}>Save</Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search stations..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Showing {filtered.length} of {allStations.length} stations</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><List className="w-4 h-4" /> Station List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Station</th>
                  <th>Employee Count</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.employeeCount}</td>
                    <td>
                      <Badge variant={s.employeeCount > 0 ? 'default' : 'secondary'}>
                        {s.employeeCount > 0 ? 'Active' : 'Unassigned'}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkStationsPage;
