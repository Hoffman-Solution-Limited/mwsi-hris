import React, { useState, useMemo, useEffect } from 'react';
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
import { useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useGetAllDocumentTypesQuery, useCreateDocumentTypeMutation, useUpdateDocumentTypeMutation, useDeleteDocumentTypeMutation } from '@/features/document/documentTypeApi';
import { useAuth } from '@/contexts/AuthContext';

type DocRow = { id: string; name: string; count: number };

const DocumentTypesPage: React.FC = () => {
  const { user } = useAuth();
  const userId = String(user?.id);
  const { files } = useFileTracking();
  const { data: apiDocTypes = [] } = useGetAllDocumentTypesQuery();
  const [createDocumentType] = useCreateDocumentTypeMutation();
  const [updateDocumentType] = useUpdateDocumentTypeMutation();
  const [deleteDocumentTypeApi] = useDeleteDocumentTypeMutation();
  const [searchQuery, setSearchQuery] = useState('');
  // local name state removed; using react-hook-form for add/edit
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
      (f.defaultDocuments || []).forEach(d => {
        counts[d] = (counts[d] || 0) + 1;
      });
    });
    return apiDocTypes.map((d, i) => ({ id: d.id || `d-${i + 1}`, name: d.name, count: counts[d.name] || 0 }));
  }, [apiDocTypes, files]);

  function getErrorMessage(err: unknown): string {
    if (!err) return 'Unknown error';
    if (typeof err === 'string') return err;
    if (typeof err === 'object' && err !== null) {
      const e = err as Record<string, unknown>;
      if (typeof e.message === 'string') return e.message;
    }
    return String(err);
  }

  const filtered = allDocs.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()));

  // add flow handled by react-hook-form onSubmit below

  const openEdit = (name: string) => setEditModal({ open: true, original: name, name });
  // edit handled by form below

  const openDelete = (name: string) => setDeleteModal({ open: true, name });
  const submitDelete = () => {
    (async () => {
      const n = (deleteModal.name || '').trim();
      if (!n) return;
      try {
        const doc = apiDocTypes.find(dt => dt.name === n);
        if (!doc) throw new Error('Document type not found');
        await deleteDocumentTypeApi(doc.id).unwrap();
        setDeleteModal({ open: false, name: undefined });
        setConfirm({ open: true, title: 'Document type removed', description: n });
      } catch (err: unknown) {
        setAlert({ open: true, title: 'Error', description: getErrorMessage(err) || 'Failed to delete document type' });
      }
    })();
  };

  // Form validation using react-hook-form + yup for add/edit
  const schema = yup.object({
    name: yup.string().required('Name is required').min(1).max(100),
  }).required();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<{ name?: string }>({ resolver: yupResolver(schema) });
  const { register: registerEdit, handleSubmit: handleSubmitEdit, formState: { errors: editErrors }, reset: resetEdit } = useForm<{ name?: string }>({ resolver: yupResolver(schema) });

  // reset edit form when edit modal opens
  useEffect(() => {
    if (editModal.open) {
      resetEdit({ name: editModal.name });
    }
  }, [editModal.open, editModal.name, resetEdit]);

  const onSubmit = async (data: { name?: string }) => {
    const nameVal = (data.name || '').trim();
    const original = nameVal;
    const v = normalizeName(original);
    if (!v) return;
    if (apiDocTypes.some(dt => dt.name === v)) {
      setAlert({ open: true, title: 'Already exists', description: `${v} is already listed. Try a different name.` });
      return;
    }
    try {
      await createDocumentType({ name: v , created_by: userId }).unwrap();
      reset();
      setAddOpen(false);
      setConfirm({ open: true, title: 'Document type added', description: `${v}` });
    } catch (err: unknown) {
      setAlert({ open: true, title: 'Error', description: getErrorMessage(err) || 'Failed to add document type' });
    }
  };

  const onEditSubmit = async (data: { name?: string }) => {
    const newName = (data.name || '').trim();
    const normalized = normalizeName(newName);
    const original = editModal.original || '';
    if (!original || !normalized) return;
    if (original === normalized) {
      setEditModal({ open: false, original: undefined, name: '' });
      return;
    }
    if (apiDocTypes.some(dt => dt.name === normalized) && original !== normalized) {
      setAlert({ open: true, title: 'Name in use', description: `${normalized} already exists. Try a different name.` });
      return;
    }
    try {
      const doc = apiDocTypes.find(dt => dt.name === original);
      if (!doc) throw new Error('Original document type not found');
      await updateDocumentType({ id: doc.id, name: normalized, updated_by: userId }).unwrap();
      setEditModal({ open: false, original: undefined, name: '' });
      setConfirm({ open: true, title: 'Document type renamed', description: `${original} → ${normalized}` });
    } catch (err: unknown) {
      setAlert({ open: true, title: 'Error', description: getErrorMessage(err) || 'Failed to rename document type' });
    }
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
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  <div>
                    <Input placeholder="e.g. Birth_Certificate" {...register('name')} />
                    {errors.name && <div className="text-destructive text-sm mt-1">{String(errors.name.message)}</div>}
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Save</Button>
                  </div>
                </form>
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
          <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
            <div>
              <Input autoFocus {...registerEdit('name')} />
              {editErrors.name && <div className="text-destructive text-sm mt-1">{String(editErrors.name.message)}</div>}
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditModal({ open: false, original: undefined, name: '' })}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
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
