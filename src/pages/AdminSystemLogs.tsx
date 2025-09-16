import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Filter, Download, RefreshCw, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useSystemLogs } from '@/contexts/SystemLogsContext';
import { Label } from '@/components/ui/label';

export default function AdminSystemLogs() {
  const navigate = useNavigate();
  const { logs, clearLogs, getLogsByDateRange, getLogsByActionType, getLogsByUser } = useSystemLogs();
  
  const [filters, setFilters] = useState({
    actionType: 'all',
    status: 'all',
    dateRange: 'all',
    searchQuery: '',
    startDate: '',
    endDate: ''
  });

  const filteredLogs = useMemo(() => {
    let filtered = [...logs];

    // Action type filter
    if (filters.actionType !== 'all') {
      filtered = filtered.filter(log => log.actionType === filters.actionType);
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(log => log.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const now = new Date();
      const startDate = new Date();
      
      switch (filters.dateRange) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'custom':
          if (filters.startDate && filters.endDate) {
            filtered = getLogsByDateRange(filters.startDate, filters.endDate);
          }
          break;
      }
      
      if (filters.dateRange !== 'custom') {
        filtered = filtered.filter(log => new Date(log.timestamp) >= startDate);
      }
    }

    // Search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(query) ||
        log.userName.toLowerCase().includes(query) ||
        log.details.toLowerCase().includes(query) ||
        log.userRole.toLowerCase().includes(query)
      );
    }

    return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [logs, filters, getLogsByDateRange]);

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'Type', 'User', 'Role', 'Details', 'Status', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        new Date(log.timestamp).toLocaleString(),
        `"${log.action}"`,
        log.actionType,
        log.userName,
        log.userRole,
        `"${log.details}"`,
        log.status,
        log.ipAddress || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionTypeColor = (actionType: string) => {
    switch (actionType) {
      case 'login': return 'bg-blue-100 text-blue-800';
      case 'logout': return 'bg-gray-100 text-gray-800';
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-yellow-100 text-yellow-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'assign': return 'bg-purple-100 text-purple-800';
      case 'approve': return 'bg-emerald-100 text-emerald-800';
      case 'reject': return 'bg-rose-100 text-rose-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const logStats = useMemo(() => {
    const total = logs.length;
    const success = logs.filter(l => l.status === 'success').length;
    const errors = logs.filter(l => l.status === 'error').length;
    const warnings = logs.filter(l => l.status === 'warning').length;
    
    const actionTypes = logs.reduce((acc, log) => {
      acc[log.actionType] = (acc[log.actionType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return { total, success, errors, warnings, actionTypes };
  }, [logs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/admin')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Admin Panel
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">System Activity Logs</h1>
          <p className="text-muted-foreground">Monitor system activities and user actions</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={exportLogs}
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            Export Logs
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => window.location.reload()}
            className="flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => {
              if (confirm('Are you sure you want to clear all logs? This action cannot be undone.')) {
                clearLogs();
              }
            }}
            className="flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear Logs
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{logStats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Success</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{logStats.success}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Errors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{logStats.errors}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Warnings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{logStats.warnings}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="space-y-2">
              <Label>Search</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={filters.searchQuery}
                  onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Action Type</Label>
              <Select
                value={filters.actionType}
                onValueChange={(value) => setFilters(prev => ({ ...prev, actionType: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="login">Login</SelectItem>
                  <SelectItem value="logout">Logout</SelectItem>
                  <SelectItem value="create">Create</SelectItem>
                  <SelectItem value="update">Update</SelectItem>
                  <SelectItem value="delete">Delete</SelectItem>
                  <SelectItem value="assign">Assign</SelectItem>
                  <SelectItem value="approve">Approve</SelectItem>
                  <SelectItem value="reject">Reject</SelectItem>
                  <SelectItem value="upload">Upload</SelectItem>
                  <SelectItem value="download">Download</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Date Range</Label>
              <Select
                value={filters.dateRange}
                onValueChange={(value) => setFilters(prev => ({ ...prev, dateRange: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">Last 7 days</SelectItem>
                  <SelectItem value="month">Last 30 days</SelectItem>
                  <SelectItem value="custom">Custom Range</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filters.dateRange === 'custom' && (
              <>
                <div className="space-y-2">
                  <Label>Start Date</Label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>End Date</Label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Logs ({filteredLogs.length} entries)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Action</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>IP Address</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      No logs found matching the current filters
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-sm">
                        {new Date(log.timestamp).toLocaleString()}
                      </TableCell>
                      <TableCell className="font-medium">{log.action}</TableCell>
                      <TableCell>
                        <Badge className={getActionTypeColor(log.actionType)} variant="secondary">
                          {log.actionType}
                        </Badge>
                      </TableCell>
                      <TableCell>{log.userName}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{log.userRole}</Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={log.details}>
                        {log.details}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(log.status)} variant="secondary">
                          {log.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {log.ipAddress || 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}