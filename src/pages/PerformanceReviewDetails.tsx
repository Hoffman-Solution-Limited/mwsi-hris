import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TemplateCriteriaList } from "@/components/performance/TemplateCriteriaList";
import { usePerformance } from "@/contexts/PerformanceContext";
import { ArrowLeft } from "lucide-react";

const PerformanceReviewDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reviews, templates } = usePerformance();

  const review = reviews.find((r) => r.id === id);
  const template = review ? templates.find((t) => t.id === review.templateId) : undefined;

  if (!review) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
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
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Review Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium">Employee: {review.employeeName}</p>
                  <p className="text-sm text-muted-foreground">Period: {review.reviewPeriod}</p>
                  <p className="text-sm text-muted-foreground capitalize">Status: {review.status.replace('_',' ')}</p>
                </div>
                <div>
                  <p className="font-medium">Template: {template?.name || '-'}</p>
                  <p className="text-sm text-muted-foreground">Type: {template?.type || '-'}</p>
                  {review.overallScore !== undefined && (
                    <p className="text-sm text-muted-foreground">Overall: {review.overallScore?.toFixed(1)}/5.0</p>
                  )}
                </div>
              </div>

              {template && <TemplateCriteriaList template={template} />}

              {review.employeeTargets && review.employeeTargets.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Employee Targets</p>
                  <div className="space-y-2">
                    {review.employeeTargets.map((t, idx) => {
                      const c = template?.criteria.find((c) => c.id === t.criteriaId);
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
            </div>

            <div className="space-y-4">
              {review.employeeScores && review.employeeScores.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Employee Self-Appraisal Scores</p>
                  <div className="space-y-2">
                    {review.employeeScores.map((s, idx) => {
                      const c = template?.criteria.find((c) => c.id === s.criteriaId);
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

              {review.managerScores && review.managerScores.length > 0 && (
                <div>
                  <p className="font-medium mb-2">Manager Scores</p>
                  <div className="space-y-2">
                    {review.managerScores.map((s, idx) => {
                      const c = template?.criteria.find((c) => c.id === s.criteriaId);
                      return (
                        <div key={idx} className="p-3 border rounded bg-green-50">
                          <div className="flex justify-between text-sm">
                            <span className="font-medium">{c?.name || 'Criteria'}</span>
                            <span className="font-semibold text-green-700">{s.score}/5</span>
                          </div>
                          {s.comments && <p className="text-xs text-muted-foreground mt-1">{s.comments}</p>}
                        </div>
                      );
                    })}
                    {review.managerComments && (
                      <div className="p-3 bg-green-50 rounded">
                        <p className="text-sm font-medium">Manager Overall Comments</p>
                        <p className="text-sm">{review.managerComments}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {review.employeeAckStatus && (
                <div className={`p-4 rounded border-2 ${review.employeeAckStatus === 'accepted' ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium">Employee Acknowledgment</p>
                    <Badge variant="outline" className={review.employeeAckStatus === 'accepted' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                      {review.employeeAckStatus === 'accepted' ? 'Accepted' : 'Declined'}
                    </Badge>
                  </div>
                  {review.employeeAckComments && (
                    <div className="text-sm mb-1">
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

              {review.hrComments && (
                <div>
                  <p className="font-medium mb-2">HR Comments</p>
                  <div className="p-3 border rounded">
                    <p className="text-sm">{review.hrComments}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceReviewDetails;