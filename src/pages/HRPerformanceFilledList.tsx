import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { usePerformance } from '@/contexts/PerformanceContext';
import { TemplateCriteriaList } from '@/components/performance/TemplateCriteriaList';
import { useAuth } from '@/contexts/AuthContext';
import { mockEmployees } from '@/data/mockData';

const HRPerformanceFilledList: React.FC = () => {
  const { reviews, templates } = usePerformance();
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
              <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full p-6">
                <h2 className="text-xl font-bold mb-2">Performance Review Details</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="mb-2"><strong>Employee:</strong> {selectedReview.employeeName}</div>
                      <div className="mb-2"><strong>Employee Number:</strong> {selectedReview.employeeNumber || 'N/A'}</div>
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
                      <div className="mb-2"><strong>Next Review Date:</strong> {selectedReview.nextReviewDate}</div>
                      {selectedReview.overallScore && (
                        <div className="mb-2"><strong>Overall Score:</strong> {selectedReview.overallScore}/5</div>
                      )}
                    </div>

                    {(() => {
                      const template = templates.find(t => t.id === selectedReview.templateId);
                      return (
                        <div className="space-y-3">
                          {template && (
                            <details className="rounded border bg-muted/20">
                              <summary className="cursor-pointer px-3 py-2 font-medium">Template Criteria</summary>
                              <div className="p-3">
                                <TemplateCriteriaList template={template} />
                              </div>
                            </details>
                          )}

                          {selectedReview.employeeTargets && selectedReview.employeeTargets.length > 0 && (
                            <details className="rounded border bg-blue-50">
                              <summary className="cursor-pointer px-3 py-2 font-medium">1. Employee Targets</summary>
                              <div className="space-y-2 p-3">
                                {selectedReview.employeeTargets.map((t, idx) => {
                                  const c = template?.criteria.find(c => c.id === t.criteriaId);
                                  return (
                                    <div key={idx} className="bg-white p-3 rounded border">
                                      <div className="flex justify-between text-sm">
                                        <span className="font-medium">{c?.name || t.criteriaId}</span>
                                      </div>
                                      <p className="text-sm mt-1"><strong>Target:</strong> {t.target}</p>
                                      {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                                    </div>
                                  );
                                })}
                              </div>
                            </details>
                          )}

                          {selectedReview.employeeScores && selectedReview.employeeScores.length > 0 && (
                            <details className="rounded border bg-green-50">
                              <summary className="cursor-pointer px-3 py-2 font-medium">2. Employee Self-Appraisal</summary>
                              <div className="space-y-2 p-3">
                                {selectedReview.employeeScores.map((s, idx) => {
                                  const c = template?.criteria.find(c => c.id === s.criteriaId);
                                  return (
                                    <div key={idx} className="p-3 border rounded bg-white">
                                      <div className="flex justify-between text-sm">
                                        <span className="font-medium">{c?.name || s.criteriaId}</span>
                                        <span className="font-bold text-green-600">{s.score}/5</span>
                                      </div>
                                      {s.comments && <p className="text-xs text-muted-foreground mt-1">{s.comments}</p>}
                                    </div>
                                  );
                                })}
                                {selectedReview.employeeSelfComments && (
                                  <div className="p-3 border rounded bg-white mt-2">
                                    <p className="text-sm font-medium">Overall Comments:</p>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedReview.employeeSelfComments}</p>
                                  </div>
                                )}
                              </div>
                            </details>
                          )}

                          {selectedReview.managerScores && selectedReview.managerScores.length > 0 && (
                            <details open className="rounded border bg-purple-50">
                              <summary className="cursor-pointer px-3 py-2 font-medium">3. Manager Review</summary>
                              <div className="space-y-2 p-3">
                                {selectedReview.managerScores.map((s, idx) => {
                                  const c = template?.criteria.find(c => c.id === s.criteriaId);
                                  return (
                                    <div key={idx} className="p-3 border rounded bg-white">
                                      <div className="flex justify-between text-sm">
                                        <span className="font-medium">{c?.name || s.criteriaId}</span>
                                        <span className="font-bold text-purple-600">{s.score}/5</span>
                                      </div>
                                      {s.comments && <p className="text-xs text-muted-foreground mt-1">{s.comments}</p>}
                                    </div>
                                  );
                                })}
                                {selectedReview.managerComments && (
                                  <div className="p-3 border rounded bg-white mt-2">
                                    <p className="text-sm font-medium">Manager Comments:</p>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedReview.managerComments}</p>
                                  </div>
                                )}
                              </div>
                            </details>
                          )}

                          {(selectedReview.employeeAckStatus || selectedReview.employeeAckComments) && (
                            <details className="rounded border bg-yellow-50">
                              <summary className="cursor-pointer px-3 py-2 font-medium">4. Employee Acknowledgment</summary>
                              <div className="p-3 space-y-2">
                                {selectedReview.employeeAckStatus && (
                                  <div className="p-3 border rounded bg-white">
                                    <p className="text-sm font-medium">Status: 
                                      <Badge className="ml-2" variant={selectedReview.employeeAckStatus === 'accepted' ? 'default' : 'destructive'}>
                                        {selectedReview.employeeAckStatus}
                                      </Badge>
                                    </p>
                                    {selectedReview.employeeAckDate && (
                                      <p className="text-xs text-muted-foreground mt-1">Date: {selectedReview.employeeAckDate}</p>
                                    )}
                                  </div>
                                )}
                                {selectedReview.employeeAckComments && (
                                  <div className="p-3 border rounded bg-white">
                                    <p className="text-sm font-medium">Employee Comments:</p>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedReview.employeeAckComments}</p>
                                  </div>
                                )}
                              </div>
                            </details>
                          )}

                          {selectedReview.hrScores && selectedReview.hrScores.length > 0 && (
                            <details open className="rounded border bg-orange-50">
                              <summary className="cursor-pointer px-3 py-2 font-medium">5. HR Final Review</summary>
                              <div className="space-y-2 p-3">
                                {selectedReview.hrScores.map((s, idx) => {
                                  const c = template?.criteria.find(c => c.id === s.criteriaId);
                                  return (
                                    <div key={idx} className="p-3 border rounded bg-white">
                                      <div className="flex justify-between text-sm">
                                        <span className="font-medium">{c?.name || s.criteriaId}</span>
                                        <span className="font-bold text-orange-600">{s.score}/5</span>
                                      </div>
                                      {s.comments && <p className="text-xs text-muted-foreground mt-1">{s.comments}</p>}
                                    </div>
                                  );
                                })}
                                {selectedReview.hrComments && (
                                  <div className="p-3 border rounded bg-white mt-2">
                                    <p className="text-sm font-medium">HR Comments:</p>
                                    <p className="text-sm text-muted-foreground mt-1">{selectedReview.hrComments}</p>
                                  </div>
                                )}
                              </div>
                            </details>
                          )}

                          {selectedReview.feedback && (
                            <div className="p-3 border rounded bg-muted/20">
                              <p className="text-sm font-medium">Legacy Feedback:</p>
                              <p className="text-sm text-muted-foreground mt-1">{selectedReview.feedback}</p>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
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
