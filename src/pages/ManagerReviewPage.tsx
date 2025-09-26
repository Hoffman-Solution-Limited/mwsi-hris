import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { TemplateCriteriaList } from "@/components/performance/TemplateCriteriaList";
import { usePerformance } from "@/contexts/PerformanceContext";
import { ArrowLeft } from "lucide-react";

const ManagerReviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reviews, templates, submitManagerReview } = usePerformance();

  const review = useMemo(() => reviews.find(r => r.id === id), [reviews, id]);
  const template = useMemo(() => review ? templates.find(t => t.id === review.templateId) : undefined, [templates, review]);

  const [comments, setComments] = useState<string>("");
  const [scores, setScores] = useState<{ criteriaId: string; score: number; comments: string }[]>([]);

  useEffect(() => {
    if (!review) return;
    setComments(review.managerComments || "");
    if (template) {
      const existing = review.managerScores || [];
      setScores(template.criteria.map(c => {
        const m = existing.find(s => s.criteriaId === c.id);
        return { criteriaId: c.id, score: m?.score || 0, comments: m?.comments || "" };
      }));
    }
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
          <CardTitle>Manager Review: {review.employeeName} <span className="text-muted-foreground font-normal">• {review.reviewPeriod}</span></CardTitle>
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
            </div>
          </div>

          {template && (
            <div className="space-y-2">
              <p className="font-medium">Template Criteria</p>
              <TemplateCriteriaList template={template} />
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

          <div className="space-y-3">
            <p className="font-medium">Per-criteria Manager Scores</p>
            <div className="space-y-2">
              {template?.criteria.map((c, idx) => (
                <div key={c.id} className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-5">
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-muted-foreground">Weight: {c.weight}%</div>
                  </div>
                  <div className="col-span-2">
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={scores[idx]?.score ?? 0}
                      onChange={(e) => {
                        const v = Math.max(0, Math.min(5, Number(e.target.value) || 0));
                        setScores(prev => {
                          const copy = [...prev];
                          copy[idx] = { ...copy[idx], score: v };
                          return copy;
                        });
                      }}
                    />
                  </div>
                  <Textarea
                    className="col-span-5"
                    placeholder="Comments"
                    value={scores[idx]?.comments ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setScores(prev => {
                        const copy = [...prev];
                        copy[idx] = { ...copy[idx], comments: v };
                        return copy;
                      });
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <p className="font-medium">Manager Overall Comments</p>
            <Textarea value={comments} onChange={(e) => setComments(e.target.value)} placeholder="Overall manager comments" />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button onClick={() => { submitManagerReview(review.id, scores, comments); navigate(-1); }}>Submit Manager Review</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManagerReviewPage;
