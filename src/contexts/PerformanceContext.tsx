import { mockPerformanceTemplates, mockPerformanceReviews } from '@/data/mockData';
import api from '@/lib/api';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface PerformanceTemplate {
  id: string;
  name: string;
  type: 'quarterly' | 'half-yearly' | 'yearly';
  description: string;
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
  employeeNumber?: string;
  templateId?: string;
  reviewPeriod: string;
  status:
    | 'new'
    | 'draft'
    | 'targets_set'
    | 'manager_review'
    | 'employee_ack'
    | 'hr_review'
    | 'in_review'
    | 'completed';

  employeeTargets?: {
    criteriaId: string;
    target: string;
    description: string;
  }[];

  // ✅ Added for self-appraisal
  employeeScores?: {
    criteriaId: string;
    score: number; // 1-5
    comments: string;
  }[];

  // ✅ Added for self-appraisal comments
  employeeSelfComments?: string;

  // ✅ Employee acknowledgment of manager review
  employeeAckStatus?: 'accepted' | 'declined';
  employeeAckComments?: string;
  employeeAckDate?: string;

  managerScores?: {
    criteriaId: string;
    score: number;
    comments: string;
  }[];

  overallScore?: number;
  score?: number;
  managerComments?: string;
  hrComments?: string;
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
  setEmployeeTargets: (
    reviewId: string,
    targets: PerformanceReview['employeeTargets']
  ) => void;
  submitManagerReview: (
    reviewId: string,
    scores: PerformanceReview['managerScores'],
    comments: string
  ) => void;
  submitHrReview: (
    reviewId: string,
    comments: string
  ) => void;
  submitEmployeeAcknowledgment: (
    reviewId: string,
    status: 'accepted' | 'declined',
    comments: string
  ) => void;
};

const STORAGE_KEY_TEMPLATES = 'hris-performance-templates';
const STORAGE_KEY_REVIEWS = 'hris-performance-reviews';

const PerformanceContext = createContext<PerformanceContextType | undefined>(undefined);

export const PerformanceProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { user } = useAuth();
  const [templates, setTemplates] = useState<PerformanceTemplate[]>(mockPerformanceTemplates);
  const [reviews, setReviews] = useState<PerformanceReview[]>(mockPerformanceReviews);

  // Load templates and reviews from backend on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const t = await api.get('/api/performance/templates');
        const r = await api.get('/api/performance/reviews');
        if (!mounted) return;
        if (Array.isArray(t)) setTemplates(t as PerformanceTemplate[]);
        if (Array.isArray(r)) setReviews(r as PerformanceReview[]);
      } catch (err) {
        // fall back to mock
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_TEMPLATES, JSON.stringify(templates));
  }, [templates]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_REVIEWS, JSON.stringify(reviews));
  }, [reviews]);

  const createTemplate = (
    template: Omit<PerformanceTemplate, 'id' | 'createdAt'>
  ) => {
    if (!user) return;
    (async () => {
      try {
        const payload = { ...template, createdBy: user.name, createdAt: new Date().toISOString() };
        const created = await api.post('/api/performance/templates', payload);
        setTemplates(prev => [created as PerformanceTemplate, ...prev]);
      } catch (err) {
        const newTemplate: PerformanceTemplate = {
          ...template,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        setTemplates((prev) => [newTemplate, ...prev]);
      }
    })();
  };

  const createReview = (review: Omit<PerformanceReview, 'id' | 'createdAt'>) => {
    if (!user) return;
    (async () => {
      try {
        const payload = { ...review, createdBy: user.name, createdAt: new Date().toISOString() };
        const created = await api.post('/api/performance/reviews', payload);
        setReviews(prev => [created as PerformanceReview, ...prev]);
      } catch (err) {
        const newReview: PerformanceReview = {
          ...review,
          id: crypto.randomUUID(),
          createdAt: new Date().toISOString(),
        };
        setReviews((prev) => [newReview, ...prev]);
      }
    })();
  };

  const updateReview = (id: string, updates: Partial<PerformanceReview>) => {
    (async () => {
      try {
        const updated = await api.put(`/api/performance/reviews/${id}`, updates);
        setReviews(prev => prev.map(r => (r.id === id ? { ...r, ...(updated as Partial<PerformanceReview>) } : r)));
      } catch (err) {
        setReviews((prev) => prev.map((review) => (review.id === id ? { ...review, ...updates } : review)));
      }
    })();
  };

  const setEmployeeTargets = (
    reviewId: string,
    targets: PerformanceReview['employeeTargets']
  ) => {
    updateReview(reviewId, {
      employeeTargets: targets,
      status: 'targets_set',
    });
  };

  const submitManagerReview = (
    reviewId: string,
    scores: PerformanceReview['managerScores'],
    comments: string
  ) => {
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return;

    const template = templates.find((t) => t.id === review.templateId);
    if (!template) return;

    let totalScore = 0;
    let totalWeight = 0;
    scores.forEach((score) => {
      const criteria = template.criteria.find((c) => c.id === score.criteriaId);
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
      status: 'employee_ack',
    });
  };

  const submitEmployeeAcknowledgment = (
    reviewId: string,
    status: 'accepted' | 'declined',
    comments: string
  ) => {
    updateReview(reviewId, {
      employeeAckStatus: status,
      employeeAckComments: comments,
      employeeAckDate: new Date().toISOString(),
      status: 'hr_review',
    });
  };

  const submitHrReview = (
    reviewId: string,
    comments: string
  ) => {
    const review = reviews.find((r) => r.id === reviewId);
    if (!review) return;

    const template = templates.find((t) => t.id === review.templateId);
    if (!template) return;

    let totalScore = 0;
    let totalWeight = 0;

    const overallScore = totalWeight > 0 ? totalScore / totalWeight : 0;

    updateReview(reviewId, {
      hrComments: comments,
      overallScore,
      status: 'completed',
    });
  };

  const value = useMemo(
    () => ({
      templates,
      reviews,
      createTemplate,
      createReview,
      updateReview,
      setEmployeeTargets,
      submitManagerReview,
      submitHrReview,
      submitEmployeeAcknowledgment,
    }),
    [templates, reviews]
  );

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