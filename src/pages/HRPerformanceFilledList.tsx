import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePerformance } from '@/contexts/PerformanceContext';
import { useAuth } from '@/contexts/AuthContext';
import { mockEmployees } from '@/data/mockData';

const HRPerformanceFilledList: React.FC = () => {
  const { reviews } = usePerformance();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState(null);

  // Only show reviews that have been filled (not draft)
  const filledReviews = reviews.filter(r => r.status !== 'draft' && r.employeeName.toLowerCase().includes(searchQuery.toLowerCase()));

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
                          const emp = mockEmployees.find(e => e.name === review.employeeName);
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
                    <Button size="sm" variant="outline" onClick={() => { setSelectedReview(review); setViewModalOpen(true); }}>
                      View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
        {/* View Modal */}
        {selectedReview && (
          <div>
            <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40 ${viewModalOpen ? '' : 'hidden'}`}>
              <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6">
                <h2 className="text-xl font-bold mb-2">Performance Review Details</h2>
                <div className="mb-2"><strong>Employee:</strong> {selectedReview.employeeName}</div>
                <div className="mb-2"><strong>Review Period:</strong> {selectedReview.reviewPeriod}</div>
                <div className="mb-2"><strong>Status:</strong> <Badge>{selectedReview.status}</Badge></div>
                <div className="mb-2"><strong>Assigned To:</strong> {
                  selectedReview.status === 'manager_review'
                    ? (() => {
                        const emp = mockEmployees.find(e => e.name === selectedReview.employeeName);
                        return emp && emp.manager ? emp.manager : 'Manager';
                      })()
                    : selectedReview.status === 'hr_review'
                    ? 'HR'
                    : selectedReview.status === 'completed'
                    ? 'Completed'
                    : 'Unassigned'
                }</div>
                <div className="mb-2"><strong>Manager Comments:</strong> {selectedReview.managerComments || '-'}</div>
                <div className="mb-2"><strong>HR Comments:</strong> {selectedReview.hrComments || '-'}</div>
                <div className="mb-2"><strong>Next Review Date:</strong> {selectedReview.nextReviewDate}</div>
                <div className="mb-2"><strong>Goals:</strong> {selectedReview.goals ? selectedReview.goals.join(', ') : '-'}</div>
                <div className="mb-2"><strong>Feedback:</strong> {selectedReview.feedback || '-'}</div>
                <div className="flex justify-end mt-4">
                  <Button variant="outline" onClick={() => setViewModalOpen(false)}>Close</Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default HRPerformanceFilledList;
