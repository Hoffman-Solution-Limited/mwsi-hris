import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, List, Plus, Search } from "lucide-react";
import { useSystemCatalog } from "@/contexts/SystemCatalogContext";
import { useEmployees } from "@/contexts/EmployeesContext";

type Counts = Record<string, { total: number; byStatus: Record<string, number> }>;
const Section: React.FC<{
  title: string;
  items: { value: string; active: boolean }[];
  onAdd: (name: string) => void;
  onEdit?: (oldName: string, newName: string) => void;
  onToggleActive?: (name: string) => void;
  onDelete?: (name: string) => void;
  placeholder: string;
  normalize?: (v: string) => string;
  counts?: Counts;
  defaultCollapsed?: boolean;
}> = ({ title, items, onAdd, onEdit, onToggleActive, onDelete, placeholder, normalize, counts, defaultCollapsed }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newItem, setNewItem] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingValue, setEditingValue] = useState("");
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<boolean>(!!defaultCollapsed);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.value.toLowerCase().includes(q));
  }, [items, searchQuery]);

  const handleAdd = () => {
    const v = (normalize ? normalize(newItem) : newItem).trim();
    if (!v) return;
    onAdd(v);
    setNewItem("");
    setIsAddOpen(false);
  };

  const openEdit = (value: string) => {
    setEditingKey(value);
    setEditingValue(value);
    setIsEditOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingKey) return;
    const next = (normalize ? normalize(editingValue) : editingValue).trim();
    if (!next || next === editingKey) {
      setIsEditOpen(false);
      return;
    }
    onEdit && onEdit(editingKey, next);
    setIsEditOpen(false);
    setEditingKey(null);
    setEditingValue("");
  };

  return (
    <>
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="p-0 h-auto" onClick={() => setCollapsed(c => !c)}>
              {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </Button>
            <List className="w-4 h-4" /> {title}
          </CardTitle>
          {counts && (
            <div className="text-sm text-muted-foreground">
              Total: {Object.values(counts).reduce((a, b) => a + (b?.total || 0), 0)}
            </div>
          )}
        </div>
      </CardHeader>
      {!collapsed && (
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder={`Search ${title.toLowerCase()}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Add
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New {title.slice(0, -1)}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input placeholder={placeholder} value={newItem} onChange={(e) => setNewItem(e.target.value)} />
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

          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>{title.slice(0, -1)}</th>
                  <th className="w-24 text-right">Total</th>
                  <th>Status Breakdown</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => {
                  const c = counts?.[i.value];
                  const statuses = c ? Object.entries(c.byStatus) : [];
                  return (
                    <tr key={i.value} className={i.active ? '' : 'opacity-60'}>
                      <td>{i.value}</td>
                      <td className="text-right font-medium">{c?.total ?? 0}</td>
                      <td>
                        <div className="flex flex-wrap gap-1">
                          {statuses.length > 0 ? (
                            statuses.map(([status, n]) => (
                              <Badge key={status} variant={status === 'active' ? 'default' : 'outline'} className="capitalize">
                                {status}: {n}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </td>
                      <td className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(i.value)}>Edit</Button>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={i.active && (c?.total ?? 0) > 0}
                          title={i.active && (c?.total ?? 0) > 0 ? 'Cannot deactivate: in use by employees' : (i.active ? 'Deactivate' : 'Reactivate')}
                          onClick={() => {
                            if (!onToggleActive) return;
                            if (i.active && (c?.total ?? 0) > 0) {
                              alert('You cannot deactivate an item that is assigned to employees.');
                              return;
                            }
                            onToggleActive(i.value);
                          }}
                        >
                          {i.active ? 'Deactivate' : 'Reactivate'}
                        </Button>
                        {onDelete && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={(c?.total ?? 0) > 0}
                            title={(c?.total ?? 0) > 0 ? 'Cannot delete: in use by employees' : `Delete ${title.slice(0, -1)}`}
                            onClick={() => {
                              if ((c?.total ?? 0) > 0) return;
                              if (window.confirm(`Delete ${title.slice(0, -1)} "${i.value}"? This cannot be undone.`)) {
                                onDelete(i.value);
                              }
                            }}
                          >
                            Delete
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={4} className="text-sm text-muted-foreground">No results</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
    {/* Edit Dialog shared by sections */}
    <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit {title.slice(0, -1)}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input value={editingValue} onChange={(e) => setEditingValue(e.target.value)} />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" onClick={() => setIsEditOpen(false)}>Cancel</Button>
          </DialogClose>
          <Button onClick={handleSaveEdit}>Save</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};

const EmploymentAttributesPage: React.FC = () => {
  const {
    jobGroups,
    engagementTypes,
    ethnicities,
    addJobGroup,
    addEngagementType,
    addEthnicity,
    editJobGroup,
    deactivateJobGroup,
    reactivateJobGroup,
    editEngagementType,
    deactivateEngagementType,
    reactivateEngagementType,
    editEthnicity,
    deactivateEthnicity,
    reactivateEthnicity,
    removeJobGroup,
    removeEngagementType,
    removeEthnicity,
  } = useSystemCatalog();
  const { employees, renameJobGroupAcrossEmployees, renameEngagementTypeAcrossEmployees, renameEthnicityAcrossEmployees } = useEmployees();

  // Build counts for each attribute type (items are Item[] with .value)
  const engagementCounts: Counts = useMemo(() => {
    const map: Counts = {};
    for (const key of engagementTypes.map((x) => x.value)) {
      map[key] = { total: 0, byStatus: {} };
    }
    employees.forEach((e: any) => {
      const key = (e.engagementType || e.employmentType || '').toString();
      if (!key) return;
      if (!map[key]) map[key] = { total: 0, byStatus: {} };
      map[key].total += 1;
      const st = (e.status || 'unknown').toString();
      map[key].byStatus[st] = (map[key].byStatus[st] || 0) + 1;
    });
    return map;
  }, [employees, engagementTypes]);

  const jobGroupCounts: Counts = useMemo(() => {
    const map: Counts = {};
    for (const key of jobGroups.map((x) => x.value)) {
      map[key] = { total: 0, byStatus: {} };
    }
    employees.forEach((e: any) => {
      const key = (e.jobGroup || '').toString();
      if (!key) return;
      if (!map[key]) map[key] = { total: 0, byStatus: {} };
      map[key].total += 1;
      const st = (e.status || 'unknown').toString();
      map[key].byStatus[st] = (map[key].byStatus[st] || 0) + 1;
    });
    return map;
  }, [employees, jobGroups]);

  const ethnicityCounts: Counts = useMemo(() => {
    const map: Counts = {};
    for (const key of ethnicities.map((x) => x.value)) {
      map[key] = { total: 0, byStatus: {} };
    }
    employees.forEach((e: any) => {
      const key = (e.ethnicity || '').toString();
      if (!key) return;
      if (!map[key]) map[key] = { total: 0, byStatus: {} };
      map[key].total += 1;
      const st = (e.status || 'unknown').toString();
      map[key].byStatus[st] = (map[key].byStatus[st] || 0) + 1;
    });
    return map;
  }, [employees, ethnicities]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Employment Attributes</h1>
        <p className="text-muted-foreground">Manage job groups, engagement types, and ethnicities used in employee records.</p>
      </div>

      <Section
        title="Engagement Types"
        items={engagementTypes}
        onAdd={addEngagementType}
        onEdit={(oldName, newName) => {
          editEngagementType(oldName, newName);
          if (renameEngagementTypeAcrossEmployees) renameEngagementTypeAcrossEmployees(oldName, newName);
        }}
        onToggleActive={(name) => {
          const it = engagementTypes.find(x => x.value === name);
          if (!it) return;
          if (it.active) deactivateEngagementType(name); else reactivateEngagementType(name);
        }}
        onDelete={(name) => {
          removeEngagementType(name);
        }}
        placeholder="e.g., Permanent, Extended Service, Local Contract"
        counts={engagementCounts}
        defaultCollapsed={false}
      />

      <Section
        title="Job Groups"
        items={jobGroups}
        onAdd={addJobGroup}
        onEdit={(oldName, newName) => {
          editJobGroup(oldName, newName);
          if (renameJobGroupAcrossEmployees) renameJobGroupAcrossEmployees(oldName, newName);
        }}
        onToggleActive={(name) => {
          const it = jobGroups.find(x => x.value === name);
          if (!it) return;
          if (it.active) deactivateJobGroup(name); else reactivateJobGroup(name);
        }}
        onDelete={(name) => {
          removeJobGroup(name);
        }}
        placeholder="Enter job group (e.g., A, B, C...)"
        normalize={(v) => v.toUpperCase()}
        counts={jobGroupCounts}
        defaultCollapsed={true}
      />

      <Section
        title="Ethnicities"
        items={ethnicities}
        onAdd={addEthnicity}
        onEdit={(oldName, newName) => {
          editEthnicity(oldName, newName);
          if (renameEthnicityAcrossEmployees) renameEthnicityAcrossEmployees(oldName, newName);
        }}
        onToggleActive={(name) => {
          const it = ethnicities.find(x => x.value === name);
          if (!it) return;
          if (it.active) deactivateEthnicity(name); else reactivateEthnicity(name);
        }}
        onDelete={(name) => {
          removeEthnicity(name);
        }}
        placeholder="Enter ethnicity"
        counts={ethnicityCounts}
        defaultCollapsed={true}
      />
    </div>
  );
};

export default EmploymentAttributesPage;
