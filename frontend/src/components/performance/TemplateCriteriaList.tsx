import React from 'react'
import { Badge } from '@/components/ui/badge'
import { PerformanceTemplate } from '@/contexts/PerformanceContext'

interface Props {
  template?: PerformanceTemplate | null
  title?: string
}

export const TemplateCriteriaList: React.FC<Props> = ({ template, title = 'Evaluation Criteria' }) => {
  if (!template) return null
  return (
    <div className="space-y-2">
      <h4 className="font-medium">{title} <span className="text-xs text-muted-foreground">(Total Weight: {template.criteria.reduce((s, c) => s + c.weight, 0)}%)</span></h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        {template.criteria.map((criteria) => (
          <div key={criteria.id} className="p-3 border rounded">
            <div className="flex items-center justify-between">
              <div className="font-medium text-sm">{criteria.name}</div>
              <Badge variant="secondary">{criteria.weight}%</Badge>
            </div>
            {criteria.description && (
              <div className="text-sm text-muted-foreground mt-1">{criteria.description}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
