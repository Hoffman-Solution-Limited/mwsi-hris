import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePerformance } from '@/contexts/PerformanceContext';
import { TemplateCriteriaList } from '@/components/performance/TemplateCriteriaList';
import { useAuth } from '@/contexts/AuthContext';
import { useEmployees } from '@/contexts/EmployeesContext';
import { Navigate } from 'react-router-dom';
import { useNavigate } from "react-router-dom";


const HRPerformanceFilledList: React.FC = () => {
  const { reviews, templates } = usePerformance();
  const { user } = useAuth();
  const { employees } = useEmployees();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // Only show reviews that have been filled (not draft)
  const filledReviews = (reviews || []).filter(r => {
    const name = (r.employeeName || '').toLowerCase();
    const q = (searchQuery || '').toLowerCase();
    return r.status !== 'draft' && name.includes(q);
  });
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-4">
        <Input
          placeholder="Search by employee name..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="max-w-sm"
        />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Filled Performance Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-muted">
                <th className="text-left p-3">Employee</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Assigned To</th>
                <th className="text-left p-3">Review Period</th>
                <th className="text-left p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filledReviews.map(review => (
                <tr key={review.id} className="border-t">
                  <td className="p-3">{review.employeeName}</td>
                  <td className="p-3"><Badge>{review.status}</Badge></td>
                  <td className="p-3">{
                    review.status === 'manager_review'
                      ? (() => {
                          const emp = employees.find(e => e.name === review.employeeName);
                          return emp && emp.manager ? emp.manager : 'Manager';
                        })()
                      : review.status === 'hr_review'
                      ? 'HR'
                      : review.status === 'completed'
                      ? 'Completed'
                      : 'Unassigned'
                  }</td>
                  <td className="p-3">{review.reviewPeriod}</td>
                  <td className="p-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/performance/reviews/${review.id}`)}
                >
                  View
                </Button>


                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};

export default HRPerformanceFilledList;
