import React, { useMemo, useState } from 'react';

import { Search, Filter, User, FileText, Calendar, Building } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import { useLeave } from '@/contexts/LeaveContext';
import { mapRole } from '@/lib/roles';
import { useNavigate } from 'react-router-dom';

export const GlobalSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const { user } = useAuth();
  const { employees } = useEmployees();
  const { leaveRequests } = useLeave();
  const navigate = useNavigate();

  // Determine role-based visibility scopes
  const { scopedEmployees, scopedLeaveRequests } = useMemo(() => {
    if (!user) {
      return { scopedEmployees: [] as typeof employees, scopedLeaveRequests: [] as typeof leaveRequests };
    }

  const isHR = mapRole(user.role) === 'hr' || mapRole(user.role) === 'admin';

    // HR/Admin see all
    if (isHR) {
      return {
        scopedEmployees: employees,
        scopedLeaveRequests: leaveRequests,
      };
    }

    // Manager sees self + direct reports (by matching employee.manager === manager.name)
  if (mapRole(user.role) === 'manager') {
  const teamEmployees = employees.filter(e => (e.managerId && String(e.managerId) === String(user.id)) || (e.manager && user?.name && String(e.manager).toLowerCase() === String(user.name).toLowerCase()) || e.id === user.id || e.email === user.email || e.name === user.name);
  const teamNames = new Set(teamEmployees.map(e => e.name).concat([user.name]));
  const teamIds = new Set(teamEmployees.map(e => e.id).concat([user.id]));

  const teamLeave = leaveRequests.filter(l => teamIds.has(l.employeeId) || teamNames.has(l.employeeName));

  return {
    scopedEmployees: teamEmployees,
    scopedLeaveRequests: teamLeave,
  };
    }

    // Default fallback: nothing
    return { scopedEmployees: [], scopedLeaveRequests: [] };
  }, [user]);

  // Filter results based on search query within scoped datasets
  const employeeResults = scopedEmployees.filter(emp => 
    emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (emp.position || '').toLowerCase().includes(searchQuery.toLowerCase())
  );



  const leaveResults = scopedLeaveRequests.filter(leave => 
    (leave.employeeName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (leave.type || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (leave.reason || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalResults = employeeResults.length + leaveResults.length;

  return (
    <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Global Search</h1>
        <p className="text-muted-foreground">
          Search across employees, and HR records
        </p>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search for employees, leave requests, or any HR record..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 text-base"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchQuery && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
              Search Results for "{searchQuery}"
            </h2>
            <Badge variant="outline">
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
            </Badge>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({totalResults})
              </TabsTrigger>
              <TabsTrigger value="employees">
                Employees ({employeeResults.length})
              </TabsTrigger>
              <TabsTrigger value="leave">
                Leave ({leaveResults.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4">
              {/* Employees */}
              {employeeResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Employees ({employeeResults.length})
                  </h3>
                  {employeeResults.map((employee) => (
                    <Card key={employee.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/employees/${employee.id}`)}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <Avatar>
                            <AvatarImage src={employee.avatar} />
                            <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <h4 className="font-medium">{employee.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {employee.position} • {employee.department}
                            </p>
                            <p className="text-xs text-muted-foreground">{employee.email}</p>
                          </div>
                          <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                            {employee.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {/* Leave Requests */}
              {leaveResults.length > 0 && (
                <div className="space-y-3">
                  <h3 className="font-semibold flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Leave Requests ({leaveResults.length})
                  </h3>
                  {leaveResults.map((leave) => (
                    <Card key={leave.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate('/leave')}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="bg-warning/10 p-2 rounded">
                            <Calendar className="w-5 h-5 text-warning" />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium">{leave.employeeName}</h4>
                            <p className="text-sm text-muted-foreground">
                              {leave.type.replace('_', ' ').toUpperCase()} • {leave.days} day{leave.days > 1 ? 's' : ''}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {leave.startDate} to {leave.endDate}
                            </p>
                          </div>
                          <Badge className={`status-${leave.status}`}>
                            {leave.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {totalResults === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No results found</h3>
                    <p className="text-muted-foreground">
                      Try adjusting your search terms or check for typos.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="employees" className="space-y-4">
              {employeeResults.map((employee) => (
                <Card key={employee.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate(`/employees/${employee.id}`)}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={employee.avatar} />
                        <AvatarFallback>{employee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h4 className="font-medium">{employee.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {employee.position} • {employee.department}
                        </p>
                        <p className="text-xs text-muted-foreground">{employee.email}</p>
                      </div>
                      <Badge variant={employee.status === 'active' ? 'default' : 'secondary'}>
                        {employee.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="leave" className="space-y-4">
              {leaveResults.map((leave) => (
                <Card key={leave.id} className="cursor-pointer hover:bg-muted/50" onClick={() => navigate('/leave')}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="bg-warning/10 p-2 rounded">
                        <Calendar className="w-5 h-5 text-warning" />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium">{leave.employeeName}</h4>
                        <p className="text-sm text-muted-foreground">
                          {leave.type.replace('_', ' ').toUpperCase()} • {leave.days} day{leave.days > 1 ? 's' : ''}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {leave.startDate} to {leave.endDate}
                        </p>
                      </div>
                      <Badge className={`status-${leave.status}`}>
                        {leave.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* Recent Searches */}
      {!searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Searches</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                {['Michael Davis', 'Performance Review', 'Annual Leave', 'Training Certificate', 'HR Policy'].map((term) => (
                  <Button
                    key={term}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(term)}
                    className="h-8"
                  >
                    {term}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};