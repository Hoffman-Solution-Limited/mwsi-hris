import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { usePerformance } from '@/contexts/PerformanceContext';
import { TemplateCriteriaList } from '@/components/performance/TemplateCriteriaList';
import { ArrowLeft } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';

const EmployeeSelfAppraisalPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { reviews, templates, updateReview } = usePerformance();

  const review = useMemo(() => reviews.find(r => r.id === id), [reviews, id]);
  const template = useMemo(() => review ? templates.find(t => t.id === review.templateId) : undefined, [templates, review]);

  const [targets, setTargets] = useState<{ criteriaId: string; target: string; description: string }[]>([]);
  const [selfScores, setSelfScores] = useState<{ criteriaId: string; score: number; comments: string }[]>([]);
  const [selfOverallComments, setSelfOverallComments] = useState<string>('');
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!review || !template) return;
    // Initialize targets from existing or blank per criteria
    const existingTargets = review.employeeTargets || [];
    const targetMap = new Map(existingTargets.map(t => [t.criteriaId, t]));
    setTargets(template.criteria.map(c => ({
      criteriaId: c.id,
      target: targetMap.get(c.id)?.target || '',
      description: targetMap.get(c.id)?.description || ''
    })));
    // Initialize selected flags: pre-select those that already exist as employeeTargets
    const selectedInit: Record<string, boolean> = {};
    template.criteria.forEach(c => { selectedInit[c.id] = !!targetMap.get(c.id); });
    setSelected(selectedInit);

    const existingScores = review.employeeScores || [];
    const scoreMap = new Map(existingScores.map(s => [s.criteriaId, s]));
    setSelfScores(template.criteria.map(c => ({
      criteriaId: c.id,
      score: scoreMap.get(c.id)?.score ?? 0,
      comments: scoreMap.get(c.id)?.comments || ''
    })));

    setSelfOverallComments(review.employeeSelfComments || '');
  }, [review, template]);

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

  const saveDraft = () => {
    const filteredTargets = targets.filter(t => selected[t.criteriaId]);
    const filteredScores = selfScores.filter(s => selected[s.criteriaId]);
    updateReview(review.id, {
      employeeTargets: filteredTargets,
      employeeScores: filteredScores,
      employeeSelfComments: selfOverallComments,
      status: 'draft'
    });
    navigate(-1);
  };

  const submitToManager = () => {
    const filteredTargets = targets.filter(t => selected[t.criteriaId]);
    const filteredScores = selfScores.filter(s => selected[s.criteriaId]);
    updateReview(review.id, {
      employeeTargets: filteredTargets,
      employeeScores: filteredScores,
      employeeSelfComments: selfOverallComments,
      status: 'manager_review'
    });
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
            Self Appraisal: {review.employeeName} <span className="text-muted-foreground font-normal">• {review.reviewPeriod}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
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
              {review.deadlineDate && (
                <>
                  <p className="font-medium">Deadline</p>
                  <p className="text-muted-foreground">{new Date(review.deadlineDate).toLocaleDateString()}</p>
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

          <div className="space-y-4">
            {template.criteria.map((c, index) => (
              <div key={c.id} className="space-y-2 p-3 border rounded">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">{c.name}</label>
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={!!selected[c.id]}
                      onCheckedChange={(v) => setSelected(prev => ({ ...prev, [c.id]: !!v }))}
                    />
                    <span className="text-xs text-muted-foreground">Select objective</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">{c.description}</p>
                <Input
                  placeholder="Your target for this criteria"
                  value={targets[index]?.target || ''}
                  onChange={(e) => {
                    const copy = [...targets];
                    copy[index] = { ...copy[index], criteriaId: c.id, target: e.target.value };
                    setTargets(copy);
                  }}
                  disabled={!selected[c.id]}
                />
                <Textarea
                  placeholder="Describe how you plan to achieve this target"
                  value={targets[index]?.description || ''}
                  onChange={(e) => {
                    const copy = [...targets];
                    copy[index] = { ...copy[index], criteriaId: c.id, description: e.target.value };
                    setTargets(copy);
                  }}
                  rows={2}
                  disabled={!selected[c.id]}
                />
                <div className="grid grid-cols-12 gap-2 items-center">
                  <div className="col-span-4 text-sm">Your self score (1-5)</div>
                  <Input
                    className="col-span-2"
                    type="number"
                    min={1}
                    max={5}
                    value={selfScores[index]?.score ?? 0}
                    onChange={(e) => {
                      const v = Math.max(0, Math.min(5, Number(e.target.value) || 0));
                      setSelfScores(prev => {
                        const copy = [...prev];
                        copy[index] = { ...copy[index], criteriaId: c.id, score: v, comments: copy[index]?.comments ?? '' } as any;
                        return copy;
                      });
                    }}
                    disabled={!selected[c.id]}
                  />
                  <Textarea
                    className="col-span-6"
                    placeholder="Your comments for this criteria"
                    rows={2}
                    value={selfScores[index]?.comments ?? ''}
                    onChange={(e) => {
                      const v = e.target.value;
                      setSelfScores(prev => {
                        const copy = [...prev];
                        copy[index] = { ...copy[index], criteriaId: c.id, comments: v, score: copy[index]?.score ?? 0 } as any;
                        return copy;
                      });
                    }}
                    disabled={!selected[c.id]}
                  />
                </div>
              </div>
            ))}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your overall comments</label>
              <Textarea
                rows={3}
                placeholder="Summarize your self-appraisal"
                value={selfOverallComments}
                onChange={(e) => setSelfOverallComments(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
            <Button variant="secondary" onClick={saveDraft}>Save Draft</Button>
            <Button onClick={submitToManager} className="bg-blue-600 text-white hover:bg-blue-700">Submit to Manager</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default EmployeeSelfAppraisalPage;
