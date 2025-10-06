import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// Removed HR per-criteria scoring inputs
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TemplateCriteriaList } from "@/components/performance/TemplateCriteriaList";
import { usePerformance } from "@/contexts/PerformanceContext";
import { ArrowLeft } from "lucide-react";

const HrReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reviews, templates, submitHrReview } = usePerformance();

  const review = useMemo(() => reviews.find(r => r.id === id), [reviews, id]);
  const template = useMemo(() => review ? templates.find(t => t.id === review.templateId) : undefined, [templates, review]);

  const [comments, setComments] = useState<string>("");

  useEffect(() => {
    if (!review) return;
    setComments(review.hrComments || "");
    // HR cannot score; no per-criteria state
  }, [review, template]);

  if (!review) {
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

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>HR Review: {review.employeeName} <span className="text-muted-foreground font-normal">• {review.reviewPeriod}</span></CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Status</p>
              <Badge className={`capitalize`}>{review.status.replace('_', ' ')}</Badge>
            </div>
            <div>
              <p className="font-medium">Template</p>
              <p className="text-muted-foreground">{template?.name || '-'}</p>
              {template?.type && <p className="text-xs text-muted-foreground">Type: {template.type}</p>}
            </div>
            <div>
              {review.deadlineDate && (
                <>
                  <p className="font-medium">Deadline</p>
                  <p className="text-muted-foreground">{new Date(review.deadlineDate).toLocaleDateString()}</p>
                </>
              )}
              {review.overallScore !== undefined && (
                <>
                  <p className="font-medium mt-2">Manager Overall Score</p>
                  <p className="text-muted-foreground">{review.overallScore.toFixed(1)}/5.0</p>
                </>
              )}
            </div>
          </div>

          {template && (
            <div className="space-y-2">
              <p className="font-medium">Template Criteria</p>
              <TemplateCriteriaList template={template} />
            </div>
          )}

          {review.managerScores && review.managerScores.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Manager Scores</p>
              <div className="space-y-2">
                {review.managerScores.map((s, idx) => {
                  const c = template?.criteria.find(c => c.id === s.criteriaId);
                  return (
                    <div key={idx} className="p-3 border rounded">
                      <div className="flex justify-between text-sm">
                        <span>{c?.name || 'Criteria'}</span>
                        <span>{s.score}/5</span>
                      </div>
                      {s.comments && <p className="text-xs text-muted-foreground mt-1">{s.comments}</p>}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {review.employeeTargets && review.employeeTargets.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Employee Targets</p>
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
              <p className="font-medium">Employee Self-Appraisal</p>
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
                    <p className="text-sm font-medium">Employee Overall Comments</p>
                    <p className="text-sm">{review.employeeSelfComments}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {review.employeeAckStatus && (
            <div className={`space-y-2 p-4 rounded border-2 ${review.employeeAckStatus === 'accepted' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <div className="flex items-center justify-between">
                <p className="font-medium">Employee Acknowledgment</p>
                <Badge variant="outline" className={review.employeeAckStatus === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {review.employeeAckStatus === 'accepted' ? 'Accepted' : 'Declined'}
                </Badge>
              </div>
              {review.employeeAckComments && (
                <div className="text-sm">
                  <strong>Employee Response:</strong> {review.employeeAckComments}
                </div>
              )}
              {review.employeeAckDate && (
                <div className="text-xs text-muted-foreground">
                  Responded on: {new Date(review.employeeAckDate).toLocaleDateString()}
                </div>
              )}
            </div>
          )}

          {/* HR scoring removed: HR can only provide overall comments */}

          <div className="space-y-2">
            <p className="font-medium">HR Overall Comments</p>
            <Textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Overall HR comments" />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button onClick={() => { submitHrReview(review.id, [], comments); navigate(-1); }}>Submit & Close</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HrReviewPage;
