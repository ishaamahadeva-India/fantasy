'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  TrendingUp,
  MousePointerClick,
  Users,
  CheckCircle,
  Ticket,
  DollarSign,
  Eye,
  Calculator,
  Info,
  Sparkles,
} from 'lucide-react';
import {
  CampaignType,
  CAMPAIGN_BENCHMARKS,
  getCampaignTypeName,
  getCampaignTypeDescription,
} from '@/constants/campaignBenchmarks';
import {
  estimateResultsFromBudget,
  estimateResultsFromImpressions,
  estimateBudgetFromImpressions,
  getBestValueCampaignType,
  formatIndianCurrency,
  formatIndianNumber,
} from '@/lib/campaignEstimator';

type EstimatorMode = 'budget' | 'results';

export default function CampaignEstimatorPage() {
  const [mode, setMode] = useState<EstimatorMode>('budget');
  const [campaignType, setCampaignType] = useState<CampaignType>('branded_quiz');
  const [budget, setBudget] = useState<string>('100000');
  const [impressions, setImpressions] = useState<string>('100000');

  // Calculate results based on mode
  const results = useMemo(() => {
    if (mode === 'budget') {
      const budgetNum = parseFloat(budget) || 0;
      return estimateResultsFromBudget(budgetNum, campaignType);
    } else {
      const impressionsNum = parseFloat(impressions) || 0;
      return estimateResultsFromImpressions(impressionsNum, campaignType);
    }
  }, [mode, campaignType, budget, impressions]);

  // Calculate required budget for results mode
  const requiredBudget = useMemo(() => {
    if (mode === 'results') {
      const impressionsNum = parseFloat(impressions) || 0;
      return estimateBudgetFromImpressions(impressionsNum, campaignType);
    }
    return parseFloat(budget) || 0;
  }, [mode, campaignType, budget, impressions]);

  // Get best value campaign type
  const bestValueType = useMemo(() => {
    const budgetNum = mode === 'budget' ? parseFloat(budget) || 0 : requiredBudget;
    return getBestValueCampaignType(budgetNum);
  }, [mode, budget, requiredBudget]);

  const benchmark = CAMPAIGN_BENCHMARKS[campaignType];

  const StatCard = ({
    title,
    value,
    icon: Icon,
    description,
  }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
  }) => (
    <Card className="transition-all hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
          <Icon className="w-5 h-5 text-primary" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Calculator className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Campaign Estimator</h1>
        </div>
        <p className="text-muted-foreground">
          Estimate campaign results based on budget or calculate required budget for desired outcomes
        </p>
      </div>

      {/* Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle>Estimation Mode</CardTitle>
          <CardDescription>Choose how you want to estimate your campaign</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={mode === 'budget' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('budget')}
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Estimate by Budget
            </Button>
            <Button
              variant={mode === 'results' ? 'default' : 'outline'}
              className="flex-1"
              onClick={() => setMode('results')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              Estimate by Outcome
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Input Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Campaign Type Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Campaign Type</CardTitle>
            <CardDescription>Select your campaign type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={campaignType} onValueChange={(value) => setCampaignType(value as CampaignType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(CAMPAIGN_BENCHMARKS).map((type) => (
                  <SelectItem key={type} value={type}>
                    {getCampaignTypeName(type as CampaignType)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {getCampaignTypeDescription(campaignType)}
              </p>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPM:</span>
                <span className="font-medium">{formatIndianCurrency(benchmark.cpm)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CTR:</span>
                <span className="font-medium">{(benchmark.ctr * 100).toFixed(2)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Engagement Rate:</span>
                <span className="font-medium">{(benchmark.engagementRate * 100).toFixed(0)}%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Budget Input */}
        {mode === 'budget' && (
          <Card>
            <CardHeader>
              <CardTitle>Campaign Budget</CardTitle>
              <CardDescription>Enter your total campaign budget</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="budget">Budget (₹)</Label>
                <Input
                  id="budget"
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                  placeholder="100000"
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-muted-foreground">
                  Enter amount in Indian Rupees
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Impressions Input */}
        {mode === 'results' && (
          <Card>
            <CardHeader>
              <CardTitle>Desired Impressions</CardTitle>
              <CardDescription>Enter your target number of impressions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="impressions">Impressions</Label>
                <Input
                  id="impressions"
                  type="number"
                  value={impressions}
                  onChange={(e) => setImpressions(e.target.value)}
                  placeholder="100000"
                  min="0"
                  step="1000"
                />
                <p className="text-xs text-muted-foreground">
                  Estimated budget: <span className="font-semibold text-primary">
                    {formatIndianCurrency(requiredBudget)}
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Best Value Recommendation */}
        {parseFloat(mode === 'budget' ? budget : impressions) > 0 && (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <CardTitle>Best Value</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {bestValueType === campaignType ? (
                <div className="space-y-2">
                  <Badge variant="default" className="w-full justify-center py-2">
                    Current selection is best value!
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    This campaign type offers the lowest cost per engaged user.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Badge variant="outline" className="w-full justify-center py-2">
                    {getCampaignTypeName(bestValueType)} offers better value
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Consider switching to {getCampaignTypeName(bestValueType)} for better ROI.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results Dashboard */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Estimated Results</h2>
          {mode === 'budget' && (
            <Badge variant="secondary" className="text-lg px-4 py-1">
              Budget: {formatIndianCurrency(parseFloat(budget) || 0)}
            </Badge>
          )}
          {mode === 'results' && (
            <Badge variant="secondary" className="text-lg px-4 py-1">
              Required Budget: {formatIndianCurrency(requiredBudget)}
            </Badge>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Estimated Impressions"
            value={formatIndianNumber(results.impressions)}
            icon={Eye}
            description="Total ad views"
          />
          <StatCard
            title="Estimated Clicks"
            value={formatIndianNumber(results.clicks)}
            icon={MousePointerClick}
            description={`${benchmark.ctr * 100}% CTR`}
          />
          <StatCard
            title="Engaged Users"
            value={formatIndianNumber(results.engagedUsers)}
            icon={Users}
            description={`${benchmark.engagementRate * 100}% engagement rate`}
          />
          <StatCard
            title="Quiz Completions"
            value={formatIndianNumber(results.completions)}
            icon={CheckCircle}
            description={`${benchmark.completionRate * 100}% completion rate`}
          />
          <StatCard
            title="Coupon Redemptions"
            value={formatIndianNumber(results.redemptions)}
            icon={Ticket}
            description={`${benchmark.redemptionRate * 100}% redemption rate`}
          />
          <StatCard
            title="Cost per Engaged User"
            value={formatIndianCurrency(results.costPerEngagedUser)}
            icon={DollarSign}
            description="Average cost to acquire one engaged user"
          />
        </div>
      </div>

      {/* Disclaimer */}
      <Alert>
        <Info className="w-4 h-4" />
        <AlertDescription>
          <strong>Disclaimer:</strong> Estimates are indicative and based on historical averages.
          Actual results may vary based on campaign creative, targeting, timing, and market conditions.
          These estimates are for planning purposes only and do not guarantee specific outcomes.
        </AlertDescription>
      </Alert>

      {/* Additional Info */}
      <Card>
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold mb-2">Budget → Results Mode</h3>
            <p className="text-sm text-muted-foreground">
              Enter your campaign budget to see estimated impressions, clicks, engagements, completions,
              and redemptions based on industry benchmarks for your selected campaign type.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Results → Budget Mode</h3>
            <p className="text-sm text-muted-foreground">
              Enter your desired number of impressions to calculate the required budget and see
              estimated outcomes for your campaign.
            </p>
          </div>
          <div>
            <h3 className="font-semibold mb-2">Benchmarks</h3>
            <p className="text-sm text-muted-foreground">
              All calculations use industry-standard benchmarks for the Indian market. These values
              are based on historical performance data and can be updated with real analytics from
              your campaigns.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

