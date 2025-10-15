import React, { useState, useMemo } from 'react';
import { Search, Plus, List, Pencil, Trash2 } from 'lucide-react';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type DocRow = { id: string; name: string; count: number };

const DocumentTypesPage: React.FC = () => {
  const { knownDocumentTypes, addDocumentType, renameDocumentType, deleteDocumentType, files } = useFileTracking();
  const [searchQuery, setSearchQuery] = useState('');
  const [newDoc, setNewDoc] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string }>({ open: false, title: '', description: '' });
  const [alert, setAlert] = useState<{ open: boolean; title: string; description: string }>({ open: false, title: '', description: '' });
  const [editModal, setEditModal] = useState<{ open: boolean; original?: string; name: string }>({ open: false, name: '' });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; name?: string }>(() => ({ open: false }));
  // No toast; we use AlertDialog pop-ups for confirmations and errors

  const normalizeName = (s: string) =>
    s
      .replace(/\s+/g, '_') // spaces to underscores
      .replace(/__+/g, '_') // collapse multiple underscores
      .replace(/[^A-Za-z0-9_]/g, '_') // remove illegal chars
      .replace(/^_+|_+$/g, ''); // trim underscores

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
    const original = newDoc.trim();
    const v = normalizeName(original);
    if (!v) return;
    if (knownDocumentTypes.includes(v)) {
      setAlert({ open: true, title: 'Already exists', description: `${v} is already listed. Try a different name.` });
      return;
    }
    addDocumentType(v);
    setNewDoc('');
    setAddOpen(false);
    const normalizedNote = original !== v ? ` (normalized from "${original}")` : '';
    setConfirm({
      open: true,
      title: 'Document type added',
      description: `${v}${normalizedNote}. This will now appear by default on all employee files.`,
    });
  };

  const openEdit = (name: string) => setEditModal({ open: true, original: name, name });
  const submitEdit = () => {
    const o = editModal.original || '';
    const n = normalizeName(editModal.name.trim());
    if (!o || !n) return;
    if (o === n) { setEditModal({ open: false, original: undefined, name: '' }); return; }
    if (knownDocumentTypes.includes(n) && o !== n) {
      setAlert({ open: true, title: 'Name in use', description: `${n} already exists. Try a different name.` });
      return;
    }
    renameDocumentType(o, n);
    setEditModal({ open: false, original: undefined, name: '' });
    setConfirm({ open: true, title: 'Document type renamed', description: `${o} → ${n}` });
  };

  const openDelete = (name: string) => setDeleteModal({ open: true, name });
  const submitDelete = () => {
    const n = (deleteModal.name || '').trim();
    if (!n) return;
    deleteDocumentType(n);
    setDeleteModal({ open: false, name: undefined });
    setConfirm({ open: true, title: 'Document type removed', description: n });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Document Types</h1>
          <p className="text-muted-foreground">Manage document names that must exist in every employee physical file</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
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

      {/* Add confirmation pop-up */}
      <AlertDialog open={confirm.open} onOpenChange={(o) => setConfirm(prev => ({ ...prev, open: o }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirm.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setConfirm(prev => ({ ...prev, open: false }))}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Error pop-up for duplicates and other alerts */}
      <AlertDialog open={alert.open} onOpenChange={(o) => setAlert(prev => ({ ...prev, open: o }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alert.title}</AlertDialogTitle>
            <AlertDialogDescription>{alert.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setAlert(prev => ({ ...prev, open: false }))}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal */}
      <Dialog open={editModal.open} onOpenChange={(o) => setEditModal(prev => ({ ...prev, open: o }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Rename Document Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input autoFocus value={editModal.name} onChange={e => setEditModal(prev => ({ ...prev, name: e.target.value }))} />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditModal({ open: false, original: undefined, name: '' })}>Cancel</Button>
              <Button onClick={submitEdit}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete confirm */}
      <Dialog open={deleteModal.open} onOpenChange={(o) => setDeleteModal(prev => ({ ...prev, open: o }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Remove Document Type</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>Are you sure you want to remove "{deleteModal.name}"? This will stop showing it on employee files by default.</div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setDeleteModal({ open: false, name: undefined })}>Cancel</Button>
              <Button variant="destructive" onClick={submitDelete}>Remove</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
                  <th className="w-[140px]">Actions</th>
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
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => openEdit(d.name)}>
                          <Pencil className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => openDelete(d.name)}>
                          <Trash2 className="w-4 h-4 mr-1" /> Delete
                        </Button>
                      </div>
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
