import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import {
  useGetFileByEmployeeQuery
} from '@/features/employeeFile/employeeFileApi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useGetFileMovementsByEmployeeQuery } from '@/features/fileRequest/fileRequestApi';

const MyFilesPage: React.FC = () => {
  const { user } = useAuth();
  const { employees } = useEmployees();

  // Avoid running queries before user is ready
  const { data: myFile, isLoading: isFileLoading } = useGetFileByEmployeeQuery(
    String(user?.id)
  );
  const { data: fileMovements = [], isLoading: isMovementsLoading } =
    useGetFileMovementsByEmployeeQuery(String(user?.id));

  if (!user) return null;
console.log("my fileMovements>>>>>>>>>",fileMovements);

  const employee = employees.find((e) => e.id === myFile?.employee_id);
  const employeeNumber = employee?.employeeNumber || myFile?.file_number;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold">My Files</h1>
        <p className="text-muted-foreground">
          Read-only access to your employee file and movement history.
        </p>
      </div>

      <Tabs defaultValue="file">
        <TabsList className="w-full grid grid-cols-1">
          <TabsTrigger value="file">My File</TabsTrigger>
        </TabsList>

        <TabsContent value="file">
          <Card>
            <CardHeader>
              <CardTitle>Employee File</CardTitle>
            </CardHeader>
            <CardContent>
              {isFileLoading ? (
                <div className="text-sm text-muted-foreground">Loading file details...</div>
              ) : !myFile ? (
                <div className="text-sm text-muted-foreground">
                  Your employee file is not available yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {/* File Summary */}
                  <div className="p-3 border rounded flex items-center justify-between">
                    <div>
                      <div className="font-medium">
                        File Number: {employeeNumber}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Current Location: {myFile.current_location}
                        {myFile.assigned_user_name && (
                          <> • Holder: {myFile.assigned_user_name}</>
                        )}
                      </div>
                    </div>
                    <Badge variant="outline">File</Badge>
                  </div>

                  {/* Default Documents */}
                  <div className="p-3 border rounded">
                    <div className="text-sm font-medium mb-1">
                      Default Documents
                    </div>
                    {myFile?.documents?.length ? (
                      <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                        {myFile?.documents?.map((doc: any) => (
                          <li key={doc.id}>
                            <a
                              href={`/documents/${doc.id}`}
                              className="text-blue-600 hover:underline hover:text-blue-800 transition-colors"
                            >
                              {employeeNumber}_{doc.document_name}
                            </a>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        No documents uploaded yet.
                      </div>
                    )}
                  </div>

                  {/* Movement History */}
                  <div className="p-3 border rounded">
                    <div className="text-sm font-medium mb-1">
                      Movement History
                    </div>
                    {isMovementsLoading ? (
                      <div className="text-xs text-muted-foreground">Loading history...</div>
                    ) : fileMovements?.movements?.length ? (
                      <ul className="text-xs text-muted-foreground space-y-1">
                        {fileMovements.movements?.map((mov: any) => (
                          <li key={mov.id}>
                            {new Date(mov.timestamp || '').toLocaleString()} —{' '}
                            {mov.by_user_name} moved from <strong>{mov.from_location}</strong> to{' '}
                            <strong>{mov.to_location}</strong>
                            {mov.to_assignee_name && (
                              <> • Holder: {mov.to_assignee_name}</>
                            )}
                            {mov.remarks && <> • Remarks: {mov.remarks}</>}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        No movement history yet.
                      </div>
                    )}
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
