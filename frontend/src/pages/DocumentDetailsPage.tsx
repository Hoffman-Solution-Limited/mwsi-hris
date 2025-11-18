import React, { useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useGetSingleEmployeeDocumentQuery, useUploadEmployeeDocumentMutation } from '@/features/document/employeeDocumentApi';

const DocumentDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  console.log("documentId>>>>>>.",id);
  
  const { data: document, isLoading } = useGetSingleEmployeeDocumentQuery(id!);
  const [uploadEmployeeDocument, { isLoading: uploading }] = useUploadEmployeeDocumentMutation();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  console.log("document>>>>>>.",document);
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('employee_id', document?.employee_id || '');
    formData.append('document_type_id', document?.document_type_id || '');
    formData.append('uploaded_by_user_id', document?.uploaded_by_user_id || '');
    formData.append('uploaded_by_name', document?.uploaded_by_name || '');

    await uploadEmployeeDocument({ document_id: id!, formData });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <Skeleton className="h-10 w-1/3 mb-4" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!document) {
    return <div className="p-6 text-muted-foreground">Document not found.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>{document.document_name}</span>
            <Badge variant={document.file_url ? 'default' : 'outline'}>
              {document.file_url ? 'Uploaded' : 'Not Uploaded'}
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent className="grid md:grid-cols-2 gap-6">
          {/* Left Side: Document Info */}
          <div className="space-y-3 text-sm">
            <p><strong>Type:</strong> {document.document_type_name}</p>
            <p><strong>Owner:</strong> {document.employee_name}</p>
            <p><strong>Uploaded By:</strong> {document.uploaded_by_name || '—'}</p>
            <p><strong>Uploaded At:</strong> {document.uploaded_at ? new Date(document.uploaded_at).toLocaleString() : '—'}</p>
            <p><strong>Status:</strong> {document.is_verified ? 'Verified ✅' : 'Pending Verification'}</p>

            <div>
              <Button
                variant="default"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
              >
                {document.file_url ? 'Replace Document' : 'Upload Document'}
              </Button>
              <input
                type="file"
                accept=".pdf,image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Right Side: Preview */}
          <div className="border rounded-md p-3 bg-muted/30 flex flex-col items-center justify-center">
            {document.file_url ? (
              document.file_type === 'pdf' ? (
                <iframe src={document.file_url} className="w-full h-80 rounded-md" />
              ) : (
                <img src={document.file_url} alt={document.document_name} className="max-h-80 rounded-md object-contain" />
              )
            ) : (
              <div className="text-muted-foreground text-center text-sm">
                No file uploaded yet.  
                <br />
                <Button
                  variant="outline"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  Upload Now
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentDetailsPage;
