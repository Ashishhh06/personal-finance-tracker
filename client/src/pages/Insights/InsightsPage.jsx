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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>AI Insights</h1>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {insights.map((insight) => (
            <Card key={insight._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span
                  style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: '#4f46e5',
                    textTransform: 'uppercase',
                  }}
                >
                  {insight.relatedModule}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#9ca3af' }}>
                  {new Date(insight.createdAt).toLocaleString()}
                </span>
              </div>
              <p style={{ whiteSpace: 'pre-line', margin: 0, lineHeight: 1.6 }}>{insight.message}</p>
            </Card>
          ))}
        </div>
      )}

      <Card style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>💬 Ask a Question</h3>

        {qaHistory.length > 0 && (
          <div style={{ marginBottom: '1rem', maxHeight: '300px', overflowY: 'auto' }}>
            {qaHistory.map((qa, idx) => (
              <div key={idx} style={{ marginBottom: '1rem' }}>
                <p style={{ fontWeight: 600, margin: '0 0 0.25rem 0' }}>You: {qa.question}</p>
                <p style={{ margin: 0, color: '#374151', background: '#f5f3ff', padding: '0.6rem 0.8rem', borderRadius: '8px' }}>
                  {qa.answer}
                </p>
              </div>
            ))}
          </div>
        )}

        <form onSubmit={handleAskQuestion} style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. How much did I spend on food last month?"
            style={{ flex: 1, padding: '0.6rem' }}
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