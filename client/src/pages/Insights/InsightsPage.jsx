import { useState, useEffect } from 'react';
import { getInsights, generateInsight } from '../../services/insightService';
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
    </div>
  );
};

export default InsightsPage;