import React, { useState, useMemo, useEffect } from 'react';
import { Search, Plus, List, Pencil, Trash2 } from 'lucide-react';
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
import {
  useGetAllDocumentTypesQuery,
  useCreateDocumentTypeMutation,
  useUpdateDocumentTypeMutation,
  useDeleteDocumentTypeMutation,
} from '@/features/document/documentTypeApi';
import { useAuth } from '@/contexts/AuthContext';
import { useFileTracking } from '@/contexts/FileTrackingContext';

type DocRow = { id: string; name: string; count: number };

const DocumentTypesPage: React.FC = () => {
  const { user } = useAuth();
  const userId = String(user?.id);

  // Queries & Mutations
  const { data: apiDocTypes = [] } = useGetAllDocumentTypesQuery();
  const [createDocumentType] = useCreateDocumentTypeMutation();
  const [updateDocumentType] = useUpdateDocumentTypeMutation();
  const [deleteDocumentTypeApi] = useDeleteDocumentTypeMutation();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [addOpen, setAddOpen] = useState(false);
  const [editModal, setEditModal] = useState<{ open: boolean; original?: string; name: string }>({ open: false, name: '' });
  const [deleteModal, setDeleteModal] = useState<{ open: boolean; name?: string }>({ open: false });
  const [confirm, setConfirm] = useState<{ open: boolean; title: string; description: string }>({ open: false, title: '', description: '' });
  const [alert, setAlert] = useState<{ open: boolean; title: string; description: string }>({ open: false, title: '', description: '' });

  // Validation schema
  const schema = yup.object({
    name: yup.string().required('Name is required').min(1).max(100),
  });

 const { register, handleSubmit, formState: { errors }, reset } = useForm<{ name?: string }>({ resolver: yupResolver(schema) });
  const { register: registerEdit, handleSubmit: handleSubmitEdit, formState: { errors: editErrors }, reset: resetEdit } = useForm<{ name?: string }>({ resolver: yupResolver(schema) });
  // Utility: normalize document name
  const normalizeName = (s: string) =>
    s.trim()
      .replace(/\s+/g, '_')
      .replace(/__+/g, '_')
      .replace(/[^A-Za-z0-9_]/g, '_')
      .replace(/^_+|_+$/g, '');

  // Utility: extract error messages
  const getErrorMessage = (err: unknown): string => {
    if (typeof err === 'string') return err;
    if (err && typeof err === 'object' && 'message' in err) return String((err as any).message);
    return 'Unknown error';
  };


console.log("apiDocTypes types",apiDocTypes);

  // Handle create
  const onSubmit = async ({ name }: { name: string }) => {
    const normalized = normalizeName(name);
    if (!normalized) return;
    if (apiDocTypes.some(dt => dt.name === normalized)) {
      setAlert({ open: true, title: 'Already exists', description: `${normalized} is already listed.` });
      return;
    }
    try {
      await createDocumentType({ name: normalized, created_by: userId }).unwrap();
      reset();
      setAddOpen(false);
      setConfirm({ open: true, title: 'Added', description: normalized });
    } catch (err) {
      setAlert({ open: true, title: 'Error', description: getErrorMessage(err) });
    }
  };

  // Handle edit
  useEffect(() => {
    if (editModal.open) resetEdit({ name: editModal.name });
  }, [editModal.open, editModal.name, resetEdit]);

  const onEditSubmit = async ({ name }: { name: string }) => {
    const normalized = normalizeName(name);
    const original = editModal.original || '';
    if (!original || !normalized) return;

    if (apiDocTypes.some(dt => dt.name === normalized) && original !== normalized) {
      setAlert({ open: true, title: 'Duplicate name', description: `${normalized} already exists.` });
      return;
    }

    try {
      const doc = apiDocTypes.find(dt => dt.name === original);
      if (!doc) throw new Error('Original document not found');
      await updateDocumentType({ id: doc.id, name: normalized, updated_by: userId }).unwrap();
      setEditModal({ open: false, original: undefined, name: '' });
      setConfirm({ open: true, title: 'Updated', description: `${original} → ${normalized}` });
    } catch (err) {
      setAlert({ open: true, title: 'Error', description: getErrorMessage(err) });
    }
  };

  // Handle delete
  const submitDelete = async () => {
    const n = deleteModal.name;
    if (!n) return;
    try {
      const doc = apiDocTypes.find(dt => dt.name === n);
      if (!doc) throw new Error('Document not found');
      await deleteDocumentTypeApi(doc.id).unwrap();
      setDeleteModal({ open: false, name: undefined });
      setConfirm({ open: true, title: 'Deleted', description: n });
    } catch (err) {
      setAlert({ open: true, title: 'Error', description: getErrorMessage(err) });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Document Types</h1>
          <p className="text-muted-foreground">
            Manage document names required in every employee’s physical file
          </p>
        </div>
        <Dialog open={addOpen} onOpenChange={setAddOpen}>
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" /> Add Document
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader><DialogTitle>Add Document Type</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input placeholder="e.g. Birth_Certificate" {...register('name')} />
              {errors.name && <p className="text-destructive text-sm">{errors.name.message}</p>}
              <div className="flex justify-end"><Button type="submit">Save</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <p className="text-sm text-muted-foreground">
        Showing {apiDocTypes.length} of {apiDocTypes.length} document types
      </p>

      {/* Table */}
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
                {apiDocTypes.map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.name}</td>
                    <td>{doc.employee_count}</td>
                    <td>
                      <Badge variant={doc.employee_count > 0 ? 'default' : 'secondary'}>{doc.employee_count > 0 ? 'Present' : 'Missing'}</Badge>
                    </td>
                    <td>
                      <div className="flex items-center gap-2 justify-end">
                        <Button size="sm" variant="outline" onClick={() => setEditModal({ open: true, original: doc.name, name: doc.name })}>
                          <Pencil className="w-4 h-4 mr-1" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setDeleteModal({ open: true, name: doc.name })}>
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

      {/* === Dialogs === */}
      {/* Edit */}
      <Dialog open={editModal.open} onOpenChange={o => setEditModal(prev => ({ ...prev, open: o }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Edit Document Type</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmitEdit(onEditSubmit)} className="space-y-4">
            <Input {...registerEdit('name')} />
            {editErrors.name && <p className="text-destructive text-sm">{editErrors.name.message}</p>}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setEditModal({ open: false, name: '' })}>Cancel</Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete */}
      <Dialog open={deleteModal.open} onOpenChange={o => setDeleteModal(prev => ({ ...prev, open: o }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader><DialogTitle>Delete Document Type</DialogTitle></DialogHeader>
          <p>Are you sure you want to remove “{deleteModal.name}”? This will no longer appear by default on new employee files.</p>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => setDeleteModal({ open: false, name: undefined })}>Cancel</Button>
            <Button variant="destructive" onClick={submitDelete}>Remove</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm */}
      <AlertDialog open={confirm.open} onOpenChange={o => setConfirm(prev => ({ ...prev, open: o }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
            <AlertDialogDescription>{confirm.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Alert */}
      <AlertDialog open={alert.open} onOpenChange={o => setAlert(prev => ({ ...prev, open: o }))}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{alert.title}</AlertDialogTitle>
            <AlertDialogDescription>{alert.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentTypesPage;
