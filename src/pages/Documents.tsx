import React, { useState } from 'react';
import { Upload, Search, Filter, FileText, Download, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { mockDocuments } from '@/data/mockData';
import { useAuth } from '@/contexts/AuthContext';

export const Documents: React.FC = () => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Filter documents based on user role
  const baseDocuments = user?.role === 'employee' 
    ? mockDocuments.filter(doc => doc.uploadedBy === user.name)
    : mockDocuments;
    
  const filteredDocuments = baseDocuments.filter(doc =>
    doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {user?.role === 'employee' ? 'My Documents' : 'Document Registry'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'employee' 
              ? 'View and manage your personal documents' 
              : 'Centralized document management and file storage'
            }
          </p>
        </div>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Document
        </Button>
      </div>

      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="grid gap-4">
        {filteredDocuments.map((document) => (
          <Card key={document.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="bg-primary/10 p-2 rounded">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium">{document.name}</h4>
                    <p className="text-sm text-muted-foreground">
                      {document.category} • Uploaded by {document.uploadedBy}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {document.uploadDate} • {document.size}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={`status-${document.status}`}>
                    {document.status}
                  </Badge>
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};