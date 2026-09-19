import { useState, useEffect } from 'react';
import { getInsights, generateInsight, askQuestion } from '../../services/insightService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

const InsightsPage = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [question, setQuestion] = useState('');
  const [qaHistory, setQaHistory] = useState([]);
  const [asking, setAsking] = useState(false);

  const fetchInsights = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getInsights();
      setInsights(res.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateInsight();
      fetchInsights();
    } catch (err) {
      alert('Failed to generate insight. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const handleAskQuestion = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    setAsking(true);
    const currentQuestion = question;
    setQuestion('');

    try {
      const res = await askQuestion(currentQuestion);
      setQaHistory((prev) => [...prev, { question: currentQuestion, answer: res.data.answer }]);
    } catch (err) {
      setQaHistory((prev) => [
        ...prev,
        { question: currentQuestion, answer: "Sorry, I couldn't answer that. Please try rephrasing." },
      ]);
    } finally {
      setAsking(false);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-sm mb-md">
        <h1 className="text-headline-lg font-headline-lg text-on-surface">AI Insights</h1>
        <Button onClick={handleGenerate} disabled={generating}>
          {generating ? 'Generating...' : '✨ Refresh Insights'}
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState onRetry={fetchInsights} />
      ) : insights.length === 0 ? (
        <EmptyState
          message="No insights generated yet."
          actionLabel="Generate your first insight"
          onAction={handleGenerate}
        />
      ) : (
        <div className="flex flex-col gap-sm">
          {insights.map((insight) => (
            <Card key={insight._id}>
              <div className="flex justify-between items-center mb-xs">
                <span className="text-label-sm font-label-sm font-semibold text-primary-container uppercase tracking-wider">
                  {insight.relatedModule}
                </span>
                <span className="text-label-sm font-label-sm text-secondary">
                  {new Date(insight.createdAt).toLocaleString()}
                </span>
              </div>
              <p className="text-body-md font-body-md text-on-surface whitespace-pre-line leading-relaxed">{insight.message}</p>
            </Card>
          ))}
        </div>
      )}

      <Card className="mt-lg">
        <h3 className="text-headline-md font-headline-md text-on-surface mb-sm">💬 Ask a Question</h3>

        {qaHistory.length > 0 && (
          <div className="mb-md max-h-[300px] overflow-y-auto flex flex-col gap-sm">
            {qaHistory.map((qa, idx) => (
              <div key={idx}>
                <p className="text-label-md font-label-md font-semibold text-on-surface mb-xs">You: {qa.question}</p>
                <p className="text-body-md font-body-md text-on-surface bg-surface-container-low p-sm rounded-lg border border-surface-container-high leading-relaxed">
                  {qa.answer}
                </p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAskQuestion} className="flex gap-sm items-center">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. How much did I spend on food last month?"
            className="flex-1 px-3 py-2 border border-outline-variant rounded-lg text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container"
            disabled={asking}
          />
          <Button type="submit" disabled={asking || !question.trim()}>
            {asking ? 'Thinking...' : 'Ask'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default InsightsPage;