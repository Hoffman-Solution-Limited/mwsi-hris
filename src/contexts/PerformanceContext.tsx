import { mockPerformanceTemplates, mockPerformanceReviews } from '@/data/mockData';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface PerformanceTemplate {
  id: string;
  name: string;
  type: 'quarterly' | 'half-yearly' | 'yearly';
  description: string;
  // Optional: scope this template to a specific department
  department?: string;
  criteria: {
    id: string;
    name: string;
    weight: number;
    description: string;
  }[];
  createdBy: string;
  createdAt: string;
}

export interface PerformanceReview {
  id: string;
  employeeId: string;
  employeeName: string;
  // Optional: human employee number for cross-system linkage
  employeeNumber?: string;
  templateId?: string;
  reviewPeriod: string;
  status: 'new' | 'draft' | 'targets_set' | 'manager_review' | 'hr_review' | 'in_review' | 'completed' 
  employeeTargets?: {
    criteriaId: string;
    target: string;
    description: string;
  }[];
  managerScores?: {
    criteriaId: string;
    score: number; // 1-5
    comments: string;
  }[];
  hrScores?: {
    criteriaId: string;
    score: number;
    comments: string;
  }[];
  overallScore?: number;
  score?: number;
  managerComments?: string;
  hrComments?: string;
  // Optional deadline for completing the review (set by HR during assignment)
  deadlineDate?: string;
  nextReviewDate: string;
  createdBy: string;
  createdAt: string;
}

type PerformanceContextType = {
  templates: PerformanceTemplate[];
  reviews: PerformanceReview[];
  createTemplate: (template: Omit<PerformanceTemplate, 'id' | 'createdAt'>) => void;
  createReview: (review: Omit<PerformanceReview, 'id' | 'createdAt'>) => void;
  updateReview: (id: string, updates: Partial<PerformanceReview>) => void;
  setEmployeeTargets: (reviewId: string, targets: PerformanceReview['employeeTargets']) => void;
  submitManagerReview: (reviewId: string, scores: PerformanceReview['managerScores'], comments: string) => void;
  submitHrReview: (reviewId: string, scores: PerformanceReview['hrScores'], comments: string) => void;
};

const STORAGE_KEY_TEMPLATES = 'hris-performance-templates';
const STORAGE_KEY_REVIEWS = 'hris-performance-reviews';

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

// Default templates
const defaultTemplates: PerformanceTemplate[] = [
  {
    id: '1',
    name: 'Quarterly Performance Review',
    type: 'quarterly',
    description: 'Standard quarterly performance assessment',
    criteria: [
      { id: '1', name: 'Job Performance', weight: 30, description: 'Quality and efficiency of work output' },
      { id: '2', name: 'Communication', weight: 20, description: 'Effectiveness in communication' },
      { id: '3', name: 'Teamwork', weight: 20, description: 'Collaboration and team contribution' },
      { id: '4', name: 'Initiative', weight: 15, description: 'Proactive approach to tasks' },
      { id: '5', name: 'Learning & Development', weight: 15, description: 'Commitment to growth and learning' }
    ],
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Half-Yearly Performance Review',
    type: 'half-yearly',
    description: 'Comprehensive mid-year performance assessment',
    criteria: [
      { id: '1', name: 'Job Performance', weight: 25, description: 'Quality and efficiency of work output' },
      { id: '2', name: 'Communication', weight: 20, description: 'Effectiveness in communication' },
      { id: '3', name: 'Teamwork', weight: 20, description: 'Collaboration and team contribution' },
      { id: '4', name: 'Leadership', weight: 15, description: 'Leadership qualities and influence' },
      { id: '5', name: 'Innovation', weight: 10, description: 'Creative problem solving' },
      { id: '6', name: 'Learning & Development', weight: 10, description: 'Commitment to growth and learning' }
    ],
    createdBy: 'system',
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Yearly Performance Review',
    type: 'yearly',
    description: 'Comprehensive annual performance assessment',
    criteria: [
      { id: '1', name: 'Job Performance', weight: 20, description: 'Quality and efficiency of work output' },
      { id: '2', name: 'Communication', weight: 15, description: 'Effectiveness in communication' },
      { id: '3', name: 'Teamwork', weight: 15, description: 'Collaboration and team contribution' },
      { id: '4', name: 'Leadership', weight: 20, description: 'Leadership qualities and influence' },
      { id: '5', name: 'Innovation', weight: 15, description: 'Creative problem solving' },
      { id: '6', name: 'Learning & Development', weight: 10, description: 'Commitment to growth and learning' },
      { id: '7', name: 'Strategic Thinking', weight: 5, description: 'Long-term planning and vision' }
    ],
    createdBy: 'system',
    createdAt: new Date().toISOString()
  }
];

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<PerformanceTemplate[]>(mockPerformanceTemplates);
  const [reviews, setReviews] = useState<PerformanceReview[]>(mockPerformanceReviews);
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  const createTemplate = (template: Omit<PerformanceTemplate, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newTemplate: PerformanceTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setTemplates(prev => [newTemplate, ...prev]);
  };

  const createReview = (review: Omit<PerformanceReview, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newReview: PerformanceReview = {
      ...review,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [newReview, ...prev]);
  };

  const updateReview = (id: string, updates: Partial<PerformanceReview>) => {
    setReviews(prev => prev.map(review => 
      review.id === id ? { ...review, ...updates } : review
    ));
  };

  const setEmployeeTargets = (reviewId: string, targets: PerformanceReview['employeeTargets']) => {
    updateReview(reviewId, { 
      employeeTargets: targets, 
      status: 'targets_set' 
    });
  };

  const submitManagerReview = (reviewId: string, scores: PerformanceReview['managerScores'], comments: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    const template = templates.find(t => t.id === review.templateId);
    if (!template) return;

    let totalScore = 0;
    let totalWeight = 0;
    scores.forEach(score => {
      const criteria = template.criteria.find(c => c.id === score.criteriaId);
      if (criteria) {
        totalScore += score.score * criteria.weight;
        totalWeight += criteria.weight;
      }
    });

    const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    updateReview(reviewId, {
      managerScores: scores,
      managerComments: comments,
      overallScore,
      status: 'hr_review'
    });
  };

  const submitHrReview = (reviewId: string, scores: PerformanceReview['hrScores'], comments: string) => {
    const review = reviews.find(r => r.id === reviewId);
    if (!review) return;

    const template = templates.find(t => t.id === review.templateId);
    if (!template) return;

    let totalScore = 0;
    let totalWeight = 0;
    scores.forEach(score => {
      const criteria = template.criteria.find(c => c.id === score.criteriaId);
      if (criteria) {
        totalScore += score.score * criteria.weight;
        totalWeight += criteria.weight;
      }
    });

    const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    updateReview(reviewId, {
      hrScores: scores,
      hrComments: comments,
      overallScore,
      status: 'completed'
    });
  };

  const value = useMemo(() => ({
    templates,
    reviews,
    createTemplate,
    createReview,
    updateReview,
    setEmployeeTargets,
    submitManagerReview,
    submitHrReview
  }), [templates, reviews]);

  return (
    <PerformanceContext.Provider value={value}>
      {children}
    </PerformanceContext.Provider>
  );
};

export const usePerformance = () => {
  const context = useContext(PerformanceContext);
  if (!context) throw new Error('usePerformance must be used within PerformanceProvider');
  return context;
};
