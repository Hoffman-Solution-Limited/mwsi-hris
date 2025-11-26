import { useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { TemplateCriteriaList } from '@/components/performance/TemplateCriteriaList';
import { usePerformance } from '@/contexts/PerformanceContext';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const EmployeeAcknowledgmentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reviews, templates, submitEmployeeAcknowledgment } = usePerformance();

  const review = useMemo(() => reviews.find(r => r.id === id), [reviews, id]);
  const template = useMemo(() => review ? templates.find(t => t.id === review.templateId) : undefined, [templates, review]);

  const [comments, setComments] = useState<string>('');
  const [selectedAction, setSelectedAction] = useState<'accepted' | 'declined' | null>(null);

  if (!review || !template) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">Review not found.</CardContent>
        </Card>
      </div>
    );
  }

  const handleSubmit = (status: 'accepted' | 'declined') => {
    if (!comments.trim()) {
      alert('Please provide comments for your decision.');
      return;
    }
    submitEmployeeAcknowledgment(review.id, status, comments);
    navigate(-1);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Review Manager's Appraisal: {review.employeeName} <span className="text-muted-foreground font-normal">• {review.reviewPeriod}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertDescription>
              Your manager has completed your performance review. Please review the scores and comments below, then accept or decline with your feedback.
            </AlertDescription>
          </Alert>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Status</p>
              <Badge className="capitalize">{review.status.replace('_', ' ')}</Badge>
            </div>
            <div>
              <p className="font-medium">Template</p>
              <p className="text-muted-foreground">{template?.name || '-'}</p>
              {template?.type && <p className="text-xs text-muted-foreground">Type: {template.type}</p>}
            </div>
            <div>
              {review.overallScore !== undefined && (
                <>
                  <p className="font-medium">Manager Overall Score</p>
                  <p className="text-2xl font-bold text-primary">{review.overallScore.toFixed(1)}/5.0</p>
                </>
              )}
            </div>
          </div>

          <details className="rounded border bg-muted/20">
            <summary className="cursor-pointer px-3 py-2 font-medium">Template Criteria</summary>
            <div className="space-y-2 p-3">
              <TemplateCriteriaList template={template} />
            </div>
          </details>

          {review.employeeTargets && review.employeeTargets.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Your Targets</p>
              <div className="space-y-2">
                {review.employeeTargets.map((t, idx) => {
                  const c = template?.criteria.find(c => c.id === t.criteriaId);
                  return (
                    <div key={idx} className="bg-muted/30 p-3 rounded">
                      <p className="text-sm font-medium">{c?.name || 'Target'}</p>
                      <p className="text-sm">{t.target}</p>
                      {t.description && <p className="text-xs text-muted-foreground mt-1">{t.description}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {review.employeeScores && review.employeeScores.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Your Self-Appraisal Scores</p>
              <div className="space-y-2">
                {review.employeeScores.map((s, idx) => {
                  const c = template?.criteria.find(c => c.id === s.criteriaId);
                  return (
                    <div key={idx} className="p-3 border rounded bg-blue-50">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{c?.name || 'Criteria'}</span>
                        <span className="font-semibold text-blue-700">{s.score}/5</span>
                      </div>
                      {s.comments && <p className="text-xs text-muted-foreground mt-1">{s.comments}</p>}
                    </div>
                  );
                })}
                {review.employeeSelfComments && (
                  <div className="p-3 bg-blue-50 rounded">
                    <p className="text-sm font-medium">Your Overall Comments</p>
                    <p className="text-sm">{review.employeeSelfComments}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {review.managerScores && review.managerScores.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Manager's Scores</p>
              <div className="space-y-2">
                {review.managerScores.map((s, idx) => {
                  const c = template?.criteria.find(c => c.id === s.criteriaId);
                  const employeeScore = review.employeeScores?.find(es => es.criteriaId === s.criteriaId);
                  return (
                    <div key={idx} className="p-3 border rounded bg-green-50">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{c?.name || 'Criteria'}</span>
                        <div className="flex gap-4">
                          {employeeScore && (
                            <span className="text-blue-600">Your: {employeeScore.score}/5</span>
                          )}
                          <span className="font-semibold text-green-700">Manager: {s.score}/5</span>
                        </div>
                      </div>
                      {s.comments && (
                        <div className="mt-2">
                          <p className="text-xs font-medium">Manager's Comments:</p>
                          <p className="text-xs text-muted-foreground">{s.comments}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {review.managerComments && (
            <div className="space-y-2">
              <p className="font-medium">Manager's Overall Comments</p>
              <div className="p-3 bg-green-50 rounded">
                <p className="text-sm">{review.managerComments}</p>
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="font-medium">Your Response <span className="text-destructive">*</span></p>
            <Textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Provide your comments on the manager's appraisal. If you decline, please explain your concerns."
              rows={4}
              className={selectedAction === 'declined' ? 'border-destructive' : ''}
            />
          </div>

          <div className="flex gap-3 justify-end">
            <Button variant="outline" onClick={() => navigate(-1)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => handleSubmit('declined')}
              disabled={!comments.trim()}
              className="gap-2"
            >
              <XCircle className="w-4 h-4" />
              Decline & Request Review
            </Button>
            <Button
              onClick={() => handleSubmit('accepted')}
              disabled={!comments.trim()}
              className="bg-green-600 hover:bg-green-700 text-white gap-2"
            >
              <CheckCircle className="w-4 h-4" />
              Accept & Submit to HR
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeAcknowledgmentPage;