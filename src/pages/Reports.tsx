import React from 'react';
import { BarChart3, Download, Calendar, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export const Reports: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
          <p className="text-muted-foreground">
            Generate insights and analytics from HR data
          </p>
        </div>
        <Button>
          <Download className="w-4 h-4 mr-2" />
          Export All
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { title: 'Employee Report', icon: Users, description: 'Comprehensive employee data and statistics' },
          { title: 'Leave Analysis', icon: Calendar, description: 'Leave patterns and usage analytics' },
          { title: 'Performance Metrics', icon: BarChart3, description: 'Performance review trends and insights' },
          { title: 'Training Compliance', icon: BarChart3, description: 'Training completion and compliance status' },
          { title: 'Recruitment Analytics', icon: Users, description: 'Hiring trends and recruitment metrics' },
          { title: 'Department Overview', icon: BarChart3, description: 'Department-wise performance analysis' }
        ].map((report, index) => (
          <Card key={index}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <report.icon className="w-5 h-5" />
                {report.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{report.description}</p>
              <Button variant="outline" size="sm" className="w-full">
                Generate Report
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};