import React, { useState, useMemo } from 'react';
import { Search, Plus, List } from 'lucide-react';
import { useFileTracking } from '@/contexts/FileTrackingContext';
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

type DocRow = { id: string; name: string; count: number };

const DocumentTypesPage: React.FC = () => {
  const { knownDocumentTypes, addDocumentType, files } = useFileTracking();
  const [searchQuery, setSearchQuery] = useState('');
  const [newDoc, setNewDoc] = useState('');

  const allDocs: DocRow[] = useMemo(() => {
    const counts: Record<string, number> = {};
    files.forEach(f => {
      f.defaultDocuments.forEach(d => {
        counts[d] = (counts[d] || 0) + 1;
      });
    });
    return knownDocumentTypes.map((d, i) => ({ id: `d-${i + 1}`, name: d, count: counts[d] || 0 }));
  }, [knownDocumentTypes, files]);

  const filtered = allDocs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const handleAdd = () => {
    const v = newDoc.trim();
    if (!v) return;
    addDocumentType(v);
    setNewDoc('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Document Types</h1>
          <p className="text-muted-foreground">Manage document names that must exist in every employee physical file</p>
        </div>
        <div className="flex gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Document
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Document Name</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="e.g. Birth_Certificate" value={newDoc} onChange={e => setNewDoc(e.target.value)} />
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
            <Input placeholder="Search documents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="pl-10" />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">Showing {filtered.length} of {allDocs.length} document types</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><List className="w-4 h-4" /> Document Types</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="data-table w-full">
              <thead>
                <tr>
                  <th>Document</th>
                  <th>Present On Files</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td>{d.name}</td>
                    <td>{d.count}</td>
                    <td>
                      <Badge variant={d.count > 0 ? 'default' : 'secondary'}>{d.count > 0 ? 'Present' : 'Missing'}</Badge>
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

export default DocumentTypesPage;
