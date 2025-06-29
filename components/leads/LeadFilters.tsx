'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { LeadFilters as Filters } from '@/types/lead';
import { useAgents } from '@/hooks/useAgents';
import { budgetRanges } from '@/lib/mockData';
import { Search, Filter, X } from 'lucide-react';

interface LeadFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
  leadCounts: Record<string, number>;
}

const statusOptions = [
  'New', 'Contacted', 'Qualified', 'Nurturing', 'Site Visit Scheduled', 
  'Site Visited', 'Negotiation', 'Converted', 'Lost', 'Hold'
];

const sourceOptions = ['Website', 'Referral', 'Social Media', 'Walk-in', 'Advertisement', 'Other'];
const propertyTypeOptions = ['Residential', 'Commercial', 'Land'];
const leadScoreOptions = ['High', 'Medium', 'Low'];

export function LeadFilters({ filters, onFiltersChange, leadCounts }: LeadFiltersProps) {
  const { agents } = useAgents();
  const [isExpanded, setIsExpanded] = useState(false);

  const updateFilters = (updates: Partial<Filters>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const clearFilters = () => {
    onFiltersChange({});
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    Array.isArray(value) ? value.length > 0 : value !== undefined && value !== ''
  );

  const activeFilterCount = [
    filters.status?.length || 0,
    filters.assignedAgent ? 1 : 0,
    filters.source?.length || 0,
    filters.propertyType?.length || 0,
    filters.budgetRange ? 1 : 0,
    filters.leadScore?.length || 0,
    filters.search ? 1 : 0,
  ].reduce((sum, count) => sum + count, 0);

  return (
    <Card className="border-0 shadow-md mb-6">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <CardTitle className="text-lg font-semibold">Filters</CardTitle>
            {activeFilterCount > 0 && (
              <Badge variant="secondary" className="text-xs">
                {activeFilterCount} active
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm"
            >
              <Filter className="h-4 w-4 mr-1" />
              {isExpanded ? 'Less' : 'More'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search leads by name, email, or phone..."
            value={filters.search || ''}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10"
          />
        </div>

        {/* Quick Status Filters */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Status</Label>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map(status => (
              <Button
                key={status}
                variant={filters.status?.includes(status) ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  const currentStatuses = filters.status || [];
                  const newStatuses = currentStatuses.includes(status)
                    ? currentStatuses.filter(s => s !== status)
                    : [...currentStatuses, status];
                  updateFilters({ status: newStatuses });
                }}
                className="text-xs"
              >
                {status}
                {leadCounts[status] > 0 && (
                  <Badge variant="secondary" className="ml-1 text-xs">
                    {leadCounts[status]}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
        </div>

        {isExpanded && (
          <>
            {/* Agent Assignment */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Assigned Agent</Label>
                <Select
                  value={filters.assignedAgent || 'all-agents'}
                  onValueChange={(value) => updateFilters({ assignedAgent: value === 'all-agents' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All agents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-agents">All agents</SelectItem>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {agents.map(agent => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {agent.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Budget Range (INR)</Label>
                <Select
                  value={filters.budgetRange || 'all-budgets'}
                  onValueChange={(value) => updateFilters({ budgetRange: value === 'all-budgets' ? undefined : value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All budgets" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all-budgets">All budgets</SelectItem>
                    {budgetRanges.map(range => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Source */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Lead Source</Label>
              <div className="flex flex-wrap gap-2">
                {sourceOptions.map(source => (
                  <Button
                    key={source}
                    variant={filters.source?.includes(source) ? "default" : "outline"}
                    size="sm"
                    onClick={() => {
                      const currentSources = filters.source || [];
                      const newSources = currentSources.includes(source)
                        ? currentSources.filter(s => s !== source)
                        : [...currentSources, source];
                      updateFilters({ source: newSources });
                    }}
                    className="text-xs"
                  >
                    {source}
                  </Button>
                ))}
              </div>
            </div>

            {/* Property Type and Lead Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Property Type</Label>
                <div className="space-y-2">
                  {propertyTypeOptions.map(type => (
                    <div key={type} className="flex items-center space-x-2">
                      <Checkbox
                        id={`property-${type}`}
                        checked={filters.propertyType?.includes(type) || false}
                        onCheckedChange={(checked) => {
                          const currentTypes = filters.propertyType || [];
                          const newTypes = checked
                            ? [...currentTypes, type]
                            : currentTypes.filter(t => t !== type);
                          updateFilters({ propertyType: newTypes });
                        }}
                      />
                      <Label htmlFor={`property-${type}`} className="text-sm">
                        {type}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Lead Score</Label>
                <div className="space-y-2">
                  {leadScoreOptions.map(score => (
                    <div key={score} className="flex items-center space-x-2">
                      <Checkbox
                        id={`score-${score}`}
                        checked={filters.leadScore?.includes(score) || false}
                        onCheckedChange={(checked) => {
                          const currentScores = filters.leadScore || [];
                          const newScores = checked
                            ? [...currentScores, score]
                            : currentScores.filter(s => s !== score);
                          updateFilters({ leadScore: newScores });
                        }}
                      />
                      <Label htmlFor={`score-${score}`} className="text-sm">
                        {score} Priority
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}