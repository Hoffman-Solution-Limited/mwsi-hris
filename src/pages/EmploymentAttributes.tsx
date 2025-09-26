import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronRight, List, Plus, Search } from "lucide-react";
import { useSystemCatalog } from "@/contexts/SystemCatalogContext";
import { useEmployees } from "@/contexts/EmployeesContext";

type Counts = Record<string, { total: number; byStatus: Record<string, number> }>;

const Section: React.FC<{
  title: string;
  items: string[];
  onAdd: (name: string) => void;
  placeholder: string;
  normalize?: (v: string) => string;
  counts?: Counts;
  defaultCollapsed?: boolean;
}> = ({ title, items, onAdd, placeholder, normalize, counts, defaultCollapsed }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newItem, setNewItem] = useState("");
  const [collapsed, setCollapsed] = useState<boolean>(!!defaultCollapsed);

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.toLowerCase().includes(q));
  }, [items, searchQuery]);

  const handleAdd = () => {
    const v = (normalize ? normalize(newItem) : newItem).trim();
    if (!v) return;
    onAdd(v);
    setNewItem("");
  };

  return (
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
            <Dialog>
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
                  <Input
                    placeholder={placeholder}
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                  />
                  <Button onClick={handleAdd}>Save</Button>
                </div>
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
                </tr>
              </thead>
              <tbody>
                {filtered.map((i) => {
                  const c = counts?.[i];
                  const statuses = c ? Object.entries(c.byStatus) : [];
                  return (
                    <tr key={i}>
                      <td>{i}</td>
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
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={3} className="text-sm text-muted-foreground">No results</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      )}
    </Card>
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
  } = useSystemCatalog();
  const { employees } = useEmployees();

  // Build counts for each attribute type
  const engagementCounts: Counts = useMemo(() => {
    const map: Counts = {};
    for (const key of engagementTypes) {
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
    for (const key of jobGroups) {
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
    for (const key of ethnicities) {
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
        placeholder="e.g., Permanent, Extended Service, Local Contract"
        counts={engagementCounts}
        defaultCollapsed={false}
      />

      <Section
        title="Job Groups"
        items={jobGroups}
        onAdd={addJobGroup}
        placeholder="Enter job group (e.g., A, B, C...)"
        normalize={(v) => v.toUpperCase()}
        counts={jobGroupCounts}
        defaultCollapsed={true}
      />

      <Section
        title="Ethnicities"
        items={ethnicities}
        onAdd={addEthnicity}
        placeholder="Enter ethnicity"
        counts={ethnicityCounts}
        defaultCollapsed={true}
      />
    </div>
  );
};

export default EmploymentAttributesPage;
