import React, { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";
import { usePerformance } from "@/contexts/PerformanceContext";
import { TemplateCriteriaList } from "@/components/performance/TemplateCriteriaList";
import { mockEmployees } from "@/data/mockData";

const ReviewDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reviews, templates } = usePerformance();

  const review = useMemo(() => reviews.find(r => r.id === id), [reviews, id]);
  const template = useMemo(
    () => review ? templates.find(t => t.id === review.templateId) : undefined,
    [review, templates]
  );

  if (!review) {
    return (
      <div className="space-y-6 p-6">
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

  const getAssignedTo = () => {
    const emp = mockEmployees.find(e => e.name === review.employeeName);
    if (review.status === "manager_review") return emp?.manager || "Manager";
    if (review.status === "hr_review") return "HR";
    if (review.status === "completed") return "Completed";
    return "Unassigned";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => navigate(-1)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            Performance Review:{" "}
            <span className="font-semibold">{review.employeeName}</span>{" "}
            <span className="text-muted-foreground font-normal">
              • {review.reviewPeriod}
            </span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">Status</p>
              <Badge className="capitalize">{review.status.replace("_", " ")}</Badge>
            </div>
            <div>
              <p className="font-medium">Assigned To</p>
              <p className="text-muted-foreground">{getAssignedTo()}</p>
            </div>
            <div>
              {review.nextReviewDate && (
                <>
                  <p className="font-medium">Next Review Date</p>
                  <p className="text-muted-foreground">
                    {review.nextReviewDate}
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Template */}
          {template && (
            <div className="space-y-2">
              <p className="font-medium">Template Criteria</p>
              <TemplateCriteriaList template={template} />
            </div>
          )}

          {/* Employee Targets */}
          {review.employeeTargets?.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Employee Targets</p>
              <div className="space-y-2">
                {review.employeeTargets.map((t, idx) => {
                  const c = template?.criteria.find(c => c.id === t.criteriaId);
                  return (
                    <div key={idx} className="bg-muted/30 p-3 rounded">
                      <p className="text-sm font-medium">{c?.name || "Target"}</p>
                      <p className="text-sm">{t.target}</p>
                      {t.description && (
                        <p className="text-xs text-muted-foreground mt-1">{t.description}</p>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Employee Self Appraisal */}
          {review.employeeScores?.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Employee Self-Appraisal</p>
              <div className="space-y-2">
                {review.employeeScores.map((s, idx) => {
                  const c = template?.criteria.find(c => c.id === s.criteriaId);
                  return (
                    <div key={idx} className="p-3 border rounded bg-blue-50">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{c?.name || "Criteria"}</span>
                        <span className="font-semibold text-blue-700">{s.score}/5</span>
                      </div>
                      {s.comments && (
                        <p className="text-xs text-muted-foreground mt-1">{s.comments}</p>
                      )}
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

          {/* Manager Review */}
          {review.managerScores?.length > 0 && (
            <div className="space-y-2">
              <p className="font-medium">Manager Review</p>
              <div className="space-y-2">
                {review.managerScores.map((s, idx) => {
                  const c = template?.criteria.find(c => c.id === s.criteriaId);
                  return (
                    <div key={idx} className="p-3 border rounded bg-purple-50">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">{c?.name || "Criteria"}</span>
                        <span className="font-semibold text-purple-700">{s.score}/5</span>
                      </div>
                      {s.comments && (
                        <p className="text-xs text-muted-foreground mt-1">{s.comments}</p>
                      )}
                    </div>
                  );
                })}
                {review.managerComments && (
                  <div className="p-3 bg-purple-50 rounded">
                    <p className="text-sm font-medium">Manager Comments</p>
                    <p className="text-sm">{review.managerComments}</p>
                  </div>
                )}
              </div>
            </div>
          )}
                        {/* HR Final Comments */}
                        {review.hrComments && (
                                        <div className="space-y-2">
                            <p className="font-medium">HR Final Comments</p>
                            <div className="p-3 border rounded bg-orange-50">
                            <p className="text-sm">
                                {review.hrComments}
                            </p>
                            </div>
                        </div>
                        )}

        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewDetailsPage;
