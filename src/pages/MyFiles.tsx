import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useFileTracking } from '@/contexts/FileTrackingContext';
import { useGetFileByEmployeeQuery, useGetFileMovementsQuery } from '@/features/employeeFile/employeeFileApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useEmployees } from '@/contexts/EmployeesContext';

const MyFilesPage: React.FC = () => {
  const { user } = useAuth();
  const { employees } = useEmployees();

  // ensure hooks are called in the same order (use skip when user is not available)
  const { data: myFile } = useGetFileByEmployeeQuery(String(user?.id), { skip: !user });
  const { data: movements = [] } = useGetFileMovementsQuery(String(user?.id), { skip: !user });

  if (!user) return null;
  const emp = employees.find(e => e.id === myFile?.employee_id);
  const empNo = emp?.employeeNumber || myFile?.employee_id;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">My Files</h1>
        <p className="text-muted-foreground">Read-only access to your employee file and its movement history.</p>
      </div>

      <Tabs defaultValue="file">
        <TabsList className="grid w-full grid-cols-1">
          <TabsTrigger value="file">My File</TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>My Employee File</CardTitle>
            </CardHeader>
            <CardContent>
              {!myFile ? (
                <div className="text-sm text-muted-foreground">Your employee file is not available yet.</div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">Employee File: {empNo}</div>
                      <div className="text-xs text-muted-foreground">Current Location: {myFile.current_location} {myFile.assigned_user_name ? `• Holder: ${myFile.assigned_user_name}` : ''}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">File</Badge>
                    </div>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-sm font-medium mb-1">Default Documents</div>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                      {(myFile.default_documents || []).map((d) => (
                        <li key={d}>{empNo}_{d}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 border rounded">
                    <div className="text-sm font-medium mb-1">Movement History</div>
                    <ul className="text-xs text-muted-foreground space-y-1">
                      {movements.map((m, idx) => (
                        <li key={idx}>
                          {new Date(m.timestamp || '').toLocaleString()}: {m.by_user_name} moved from {m.from_location} to {m.to_location}
                          {m.to_assignee_name ? ` • New Holder: ${m.to_assignee_name}` : ''}
                          {m.remarks ? ` • Remarks: ${m.remarks}` : ''}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyFilesPage;

