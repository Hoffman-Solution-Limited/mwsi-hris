import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { List, Plus, Search } from "lucide-react";
import { useSystemCatalog } from "@/contexts/SystemCatalogContext";

const Section: React.FC<{
  title: string;
  items: string[];
  onAdd: (name: string) => void;
  placeholder: string;
  normalize?: (v: string) => string;
}> = ({ title, items, onAdd, placeholder, normalize }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [newItem, setNewItem] = useState("");

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
        <CardTitle className="flex items-center gap-2">
          <List className="w-4 h-4" /> {title}
        </CardTitle>
      </CardHeader>
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
              </tr>
            </thead>
            <tbody>
              {filtered.map((i) => (
                <tr key={i}>
                  <td>{i}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="text-sm text-muted-foreground">No results</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Employment Attributes</h1>
        <p className="text-muted-foreground">Manage job groups, engagement types, and ethnicities used in employee records.</p>
      </div>

      <Section
        title="Job Groups"
        items={jobGroups}
        onAdd={addJobGroup}
        placeholder="Enter job group (e.g., A, B, C...)"
        normalize={(v) => v.toUpperCase()}
      />

      <Section
        title="Engagement Types"
        items={engagementTypes}
        onAdd={addEngagementType}
        placeholder="e.g., Permanent, Extended Service, Local Contract"
      />

      <Section
        title="Ethnicities"
        items={ethnicities}
        onAdd={addEthnicity}
        placeholder="Enter ethnicity"
      />
    </div>
  );
};

export default EmploymentAttributesPage;
