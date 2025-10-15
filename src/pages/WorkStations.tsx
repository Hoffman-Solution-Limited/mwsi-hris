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
import { DialogFooter, DialogClose } from '@/components/ui/dialog';
import { useSystemCatalog, StationItem } from '@/contexts/SystemCatalogContext';
import { useEmployees } from '@/contexts/EmployeesContext';

// Types for table rendering
type StationRow = {
  id: string;
  name: string;
  employeeCount: number;
  active: boolean;
};

const WorkStationsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [newStation, setNewStation] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<string | null>(null);
  const [editingStationValue, setEditingStationValue] = useState('');
  const { stations, addStation, removeStation, editStation, deactivateStation, reactivateStation } = useSystemCatalog();
  const { employees, renameStationAcrossEmployees } = useEmployees();

  const allStations: StationRow[] = useMemo(() => {
    const counts: Record<string, number> = {};
    employees.forEach(e => {
      const s = e.stationName || 'Unassigned';
      counts[s] = (counts[s] || 0) + 1;
    });
    return stations.map((st: StationItem, index: number) => ({ id: `st-${index + 1}`, name: st.name, employeeCount: counts[st.name] || 0, active: st.active }));
  }, [stations, employees]);

  const filtered = allStations.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAdd = () => {
    if (!newStation.trim()) return;
    addStation(newStation.trim());
    setNewStation('');
    setIsAddOpen(false);
  };

  const openEditDialog = (name: string) => {
    setEditingStation(name);
    setEditingStationValue(name);
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingStation) return;
    const oldName = editingStation;
    const next = editingStationValue.trim();
    if (!next || next === oldName) {
      setIsEditOpen(false);
      return;
    }
    editStation(oldName, next);
    try { renameStationAcrossEmployees?.(oldName, next); } catch {}
    setIsEditOpen(false);
    setEditingStation(null);
    setEditingStationValue('');
  };

  const handleToggleActive = (name: string) => {
    const st = stations.find((s: StationItem) => s.name === name);
    if (!st) return;
    const count = employees.filter(e => (e.stationName || 'Unassigned') === name).length;
    if (st.active && count > 0) {
      alert('You cannot deactivate a station that has employees assigned.');
      return;
    }
    if (st.active) {
      if (!window.confirm(`Deactivate station "${name}"?`)) return;
      deactivateStation(name);
    } else {
      reactivateStation(name);
    }
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
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
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
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" onClick={() => setIsAddOpen(false)}>Cancel</Button>
                </DialogClose>
                <Button onClick={handleAdd}>Save</Button>
              </DialogFooter>
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
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{s.employeeCount}</td>
                    <td>
                      <Badge variant={s.active ? 'default' : 'secondary'}>
                        {s.active ? (s.employeeCount > 0 ? 'In Use' : 'Active') : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="flex items-center gap-2">
                      <Button size="sm" variant="outline" onClick={() => openEditDialog(s.name)}>Edit</Button>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={s.active && s.employeeCount > 0}
                        title={s.active && s.employeeCount > 0 ? 'Cannot deactivate: has employees' : (s.active ? 'Deactivate' : 'Reactivate')}
                        onClick={() => handleToggleActive(s.name)}
                      >
                        {s.active ? 'Deactivate' : 'Reactivate'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        disabled={s.employeeCount > 0}
                        onClick={() => {
                          if (s.employeeCount > 0) return;
                          if (window.confirm(`Delete station "${s.name}"? This cannot be undone.`)) {
                            removeStation(s.name);
                          }
                        }}
                        title={s.employeeCount > 0 ? 'Cannot delete: has employees' : 'Delete station'}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

        {/* Edit Dialog */}
        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Station</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input value={editingStationValue} onChange={e => setEditingStationValue(e.target.value)} />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
              </DialogClose>
              <Button onClick={handleSaveEdit}>Save</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
    </div>
  );
};

export default WorkStationsPage;
