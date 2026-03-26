'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, ChevronLeft, Save } from 'lucide-react';

interface Result {
  id: string;
  promptId: string;
  promptContent: string;
  response: string;
  evalModelId: string;
  modelLabel: string;
  aiScore: number | null;
  humanScore: number | null;
  feedback?: string;
  criteria?: any[];
}

export default function EvalScoringPage() {
  const params = useParams();
  const evalId = params.id as string;

  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [feedbacks, setFeedbacks] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await fetch(`/api/evals/${evalId}`);
        if (!res.ok) {
          throw new Error('Failed to fetch evaluation');
        }
        const data = await res.json();

        // Format results for scoring
        const formattedResults: Result[] = data.evaluation.results.map((result: any) => ({
          id: result.id,
          promptId: result.promptId,
          promptContent: result.prompt?.content || '',
          response: result.response,
          evalModelId: result.evalModelId,
          modelLabel: result.evalModel?.label || result.evalModel?.modelId || 'Unknown',
          aiScore: result.aiScore,
          humanScore: result.humanScore,
          criteria: result.evaluation?.criteria || [],
        }));

        setResults(formattedResults);

        // Initialize scores from existing human scores
        const initialScores: Record<string, number> = {};
        formattedResults.forEach((result) => {
          if (result.humanScore !== null) {
            initialScores[result.id] = result.humanScore;
          }
        });
        setScores(initialScores);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load results');
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [evalId]);

  const handleScoreChange = (resultId: string, value: number) => {
    setScores({ ...scores, [resultId]: value });
  };

  const handleFeedbackChange = (resultId: string, value: string) => {
    setFeedbacks({ ...feedbacks, [resultId]: value });
  };

  const handleSaveScore = async () => {
    if (!results[currentIndex]) return;

    const currentResult = results[currentIndex];
    const score = scores[currentResult.id];

    if (score === undefined) {
      setError('Please provide a score before saving');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/evals/${evalId}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resultId: currentResult.id,
          score,
          comment: feedbacks[currentResult.id] || undefined,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to save score');
      }

      // Move to next unscored result
      setCurrentIndex(currentIndex + 1);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save score');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-zinc-400 mr-2" />
          <span className="text-zinc-500">Loading results...</span>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="w-full">
        <Link
          href={`/dashboard/evals/${evalId}`}
          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium mb-4"
        >
          <ArrowLeft size={18} />
          Back to Evaluation
        </Link>
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
          <p className="text-zinc-600 text-lg">No results available for scoring</p>
        </div>
      </div>
    );
  }

  if (currentIndex >= results.length) {
    return (
      <div className="w-full">
        <Link
          href={`/dashboard/evals/${evalId}`}
          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium mb-4"
        >
          <ArrowLeft size={18} />
          Back to Evaluation
        </Link>
        <div className="bg-white rounded-lg border border-zinc-200 p-12 text-center">
          <div className="text-5xl font-bold text-orange-500 mb-4">✓</div>
          <h3 className="text-2xl font-semibold text-zinc-900 mb-2">Scoring Complete</h3>
          <p className="text-zinc-600 mb-6">You have scored all {results.length} results</p>
          <Link
            href={`/dashboard/evals/${evalId}`}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg px-6 py-3 font-semibold transition-colors"
          >
            View Evaluation
          </Link>
        </div>
      </div>
    );
  }

  const currentResult = results[currentIndex];
  const currentScore = scores[currentResult.id];
  const scoredCount = Object.keys(scores).length;
  const progressPercent = (scoredCount / results.length) * 100;

  return (
    <div className="w-full max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/dashboard/evals/${evalId}`}
          className="inline-flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium mb-4"
        >
          <ArrowLeft size={18} />
          Back to Evaluation
        </Link>
        <h1 className="text-3xl font-bold text-zinc-900 mb-2">Human Scoring</h1>
        <p className="text-zinc-500">Evaluate model responses blindly</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Progress */}
      <div className="bg-white rounded-lg border border-zinc-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-zinc-900">Progress</p>
          <p className="text-sm text-zinc-600">
            {currentIndex + 1} of {results.length}
          </p>
        </div>
        <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-orange-500 transition-all"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg border border-zinc-200 p-6 space-y-6">
        {/* Blind Mode Notice */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            <strong>Blind Mode:</strong> Model information is hidden to ensure unbiased scoring.
          </p>
        </div>

        {/* Prompt */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">Prompt</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <p className="text-sm text-zinc-900 whitespace-pre-wrap">
              {currentResult.promptContent}
            </p>
          </div>
        </div>

        {/* Response */}
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-3">Response</h3>
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 max-h-64 overflow-y-auto">
            <p className="text-sm text-zinc-900 whitespace-pre-wrap">
              {currentResult.response}
            </p>
          </div>
        </div>

        {/* Score */}
        <div>
          <label className="block text-sm font-semibold text-zinc-900 mb-3">
            Your Score
          </label>
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    onClick={() => handleScoreChange(currentResult.id, value)}
                    className={`w-12 h-12 rounded-lg font-semibold transition-all ${
                      currentScore === value
                        ? 'bg-orange-500 text-white'
                        : 'bg-zinc-100 text-zinc-900 hover:bg-zinc-200'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-600">Scale: 1-5</p>
                {currentScore && (
                  <p className="text-lg font-semibold text-orange-500">
                    {currentScore}/5
                  </p>
                )}
              </div>
            </div>

            {/* Slider alternative */}
            <div>
              <input
                type="range"
                min="1"
                max="10"
                value={currentScore || 5}
                onChange={(e) => handleScoreChange(currentResult.id, parseInt(e.target.value))}
                className="w-full h-2 bg-zinc-200 rounded-lg appearance-none cursor-pointer"
              />
              <div className="flex justify-between text-xs text-zinc-600 mt-1">
                <span>Poor</span>
                <span>Excellent</span>
              </div>
            </div>
          </div>
        </div>

        {/* Feedback */}
        <div>
          <label className="block text-sm font-semibold text-zinc-900 mb-2">
            Feedback (optional)
          </label>
          <textarea
            value={feedbacks[currentResult.id] || ''}
            onChange={(e) => handleFeedbackChange(currentResult.id, e.target.value)}
            placeholder="Add any comments or notes about this response..."
            rows={3}
            className="w-full px-4 py-2 border border-zinc-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent resize-none"
          />
        </div>

        {/* AI Score Reference */}
        {currentResult.aiScore !== null && (
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-4">
            <p className="text-xs text-zinc-600 mb-2">AI Judge Score</p>
            <p className="text-lg font-semibold text-zinc-900">
              {(currentResult.aiScore * 100).toFixed(1)}%
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center justify-between">
        <button
          onClick={() => setCurrentIndex(Math.max(0, currentIndex - 1))}
          disabled={currentIndex === 0}
          className="inline-flex items-center gap-2 border border-zinc-300 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed text-zinc-900 rounded-lg px-4 py-2 font-semibold transition-colors"
        >
          <ChevronLeft size={18} />
          Previous
        </button>

        <div className="flex gap-4">
          <button
            onClick={handleSaveScore}
            disabled={currentScore === undefined || submitting}
            className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-zinc-400 text-white rounded-lg px-6 py-2 font-semibold transition-colors disabled:cursor-not-allowed"
          >
            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save size={18} />}
            {submitting ? 'Saving...' : 'Save & Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
