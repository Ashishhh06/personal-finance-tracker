import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import {
  getInvestments,
  getInvestmentSummary,
  deleteInvestment,
} from '../../services/investmentService';
import { getProperties, deleteProperty } from '../../services/propertyService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import InvestmentForm from '../../components/forms/InvestmentForm';
import PropertyForm from '../../components/forms/PropertyForm';

const COLORS = ['#4f46e5', '#f59e0b', '#16a34a', '#dc2626', '#0891b2'];
const TYPE_LABELS = {
  mutual_fund: 'Mutual Funds',
  stock: 'Stocks',
  fd: 'Fixed Deposits',
  crypto: 'Crypto',
  bond: 'Bonds',
};
const FILTERS = ['all', 'mutual_fund', 'stock', 'fd', 'crypto', 'bond'];

const PortfolioOverview = () => {
  const [summary, setSummary] = useState(null);
  const [investments, setInvestments] = useState([]);
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedType, setExpandedType] = useState(null);
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [isPropModalOpen, setIsPropModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [summaryRes, investmentsRes, propertiesRes] = await Promise.all([
        getInvestmentSummary(),
        getInvestments(),
        getProperties(),
      ]);
      setSummary(summaryRes.data);
      setInvestments(investmentsRes.data);
      setProperties(propertiesRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const handleAddInvestment = () => { setEditingInvestment(null); setIsInvModalOpen(true); };
  const handleEditInvestment = (inv) => { setEditingInvestment(inv); setIsInvModalOpen(true); };
  const handleDeleteInvestment = async (id) => {
    if (!window.confirm('Delete this investment?')) return;
    await deleteInvestment(id);
    fetchAll();
  };
  const handleInvestmentSuccess = () => { setIsInvModalOpen(false); fetchAll(); };

  const handleAddProperty = () => { setEditingProperty(null); setIsPropModalOpen(true); };
  const handleEditProperty = (prop) => { setEditingProperty(prop); setIsPropModalOpen(true); };
  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Delete this property?')) return;
    await deleteProperty(id);
    fetchAll();
  };
  const handlePropertySuccess = () => { setIsPropModalOpen(false); fetchAll(); };

  if (loading || !summary) return <Spinner />;

  const chartData = summary.allocationBreakdown.map((item) => ({
    name: TYPE_LABELS[item.type] || item.type,
    value: item.value,
  }));

  const groupedInvestments = investments.reduce((acc, inv) => {
    if (!acc[inv.investmentType]) acc[inv.investmentType] = [];
    acc[inv.investmentType].push(inv);
    return acc;
  }, {});

  const typesToShow = activeFilter === 'all' ? Object.keys(groupedInvestments) : [activeFilter];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Investments & Properties</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Button variant="secondary" onClick={handleAddProperty}>+ Add Property</Button>
          <Button onClick={handleAddInvestment}>+ Add Investment</Button>
        </div>
      </div>

      {/* Top summary card */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1.5rem' }}>
        <Card>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Invested</p>
          <p style={{ fontSize: '1.6rem', fontWeight: 700 }}>₹{summary.totalInvested.toLocaleString()}</p>
        </Card>
        <Card>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Current Value</p>
          <p style={{ fontSize: '1.6rem', fontWeight: 700 }}>₹{summary.totalCurrentValue.toLocaleString()}</p>
        </Card>
        <Card>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Overall Return</p>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: summary.overallReturnPercent >= 0 ? '#16a34a' : '#dc2626' }}>
            {summary.overallReturnPercent >= 0 ? '+' : ''}{summary.overallReturnPercent}%
          </p>
        </Card>
      </div>

      {/* Allocation chart */}
      {chartData.length > 0 && (
        <Card style={{ marginBottom: '1.5rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Allocation</h3>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={85} label>
                {chartData.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `₹${value.toLocaleString()}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      )}

      {/* Filter chips */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '0.4rem 0.9rem',
              borderRadius: '999px',
              border: 'none',
              cursor: 'pointer',
              background: activeFilter === f ? '#4f46e5' : '#e5e7eb',
              color: activeFilter === f ? '#fff' : '#374151',
              fontSize: '0.85rem',
            }}
          >
            {f === 'all' ? 'All' : TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Grouped, collapsible investment list */}
      {investments.length === 0 ? (
        <EmptyState message="No investments yet." actionLabel="Add your first investment" onAction={handleAddInvestment} />
      ) : (
        <Card style={{ marginBottom: '1.5rem' }}>
          {typesToShow.map((type) => {
            const items = groupedInvestments[type] || [];
            if (items.length === 0) return null;
            const isExpanded = expandedType === type;

            return (
              <div key={type} style={{ marginBottom: '0.5rem' }}>
                <button
                  onClick={() => setExpandedType(isExpanded ? null : type)}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    background: '#f9fafb',
                    border: 'none',
                    padding: '0.75rem 1rem',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: 600,
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <span>{isExpanded ? '▼' : '▶'} {TYPE_LABELS[type]} ({items.length})</span>
                </button>

                {isExpanded && (
                  <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '0.5rem' }}>
                    <thead>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>
                        <th style={{ padding: '0.5rem' }}>Name</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Invested</th>
                        <th style={{ padding: '0.5rem', textAlign: 'right' }}>Current Value</th>
                        <th style={{ padding: '0.5rem' }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((inv) => {
                        const invested = inv.investmentType === 'fd'
                          ? inv.purchasePrice
                          : inv.purchasePrice * (inv.quantity || 0);
                        const current = inv.investmentType === 'fd'
                          ? inv.purchasePrice // simplified display; real growth calc happens in summary
                          : (inv.currentPrice ?? inv.purchasePrice) * (inv.quantity || 0);
                        const returnPct = invested > 0 ? Math.round(((current - invested) / invested) * 10000) / 100 : 0;

                        return (
                          <tr key={inv._id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                            <td style={{ padding: '0.5rem' }}>{inv.name}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right' }}>₹{invested.toLocaleString()}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'right', color: returnPct >= 0 ? '#16a34a' : '#dc2626' }}>
                              ₹{current.toLocaleString()} ({returnPct >= 0 ? '+' : ''}{returnPct}%)
                            </td>
                            <td style={{ padding: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                              <Button variant="secondary" onClick={() => handleEditInvestment(inv)}>Edit</Button>
                              <Button variant="danger" onClick={() => handleDeleteInvestment(inv._id)}>Delete</Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            );
          })}
        </Card>
      )}

      {/* Properties section */}
      <h3 style={{ marginBottom: '1rem' }}>Properties</h3>
      {properties.length === 0 ? (
        <EmptyState message="No properties added yet." actionLabel="Add a property" onAction={handleAddProperty} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {properties.map((p) => {
            const growth = p.currentEstimatedValue - p.purchasePrice;
            const growthPct = p.purchasePrice > 0 ? Math.round((growth / p.purchasePrice) * 10000) / 100 : 0;
            return (
              <Card key={p._id}>
                <h4 style={{ margin: 0, textTransform: 'capitalize' }}>{p.name}</h4>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.25rem 0' }}>{p.propertyType}</p>
                <p style={{ fontSize: '1.3rem', fontWeight: 700, margin: '0.5rem 0' }}>
                  ₹{p.currentEstimatedValue.toLocaleString()}
                </p>
                <p style={{ color: growthPct >= 0 ? '#16a34a' : '#dc2626', fontSize: '0.85rem' }}>
                  {growthPct >= 0 ? '+' : ''}{growthPct}% since purchase
                </p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                  <Button variant="secondary" onClick={() => handleEditProperty(p)}>Edit</Button>
                  <Button variant="danger" onClick={() => handleDeleteProperty(p._id)}>Delete</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Modal isOpen={isInvModalOpen} onClose={() => setIsInvModalOpen(false)} title={editingInvestment ? 'Edit Investment' : 'Add Investment'}>
        <InvestmentForm existingInvestment={editingInvestment} onSuccess={handleInvestmentSuccess} onCancel={() => setIsInvModalOpen(false)} />
      </Modal>

      <Modal isOpen={isPropModalOpen} onClose={() => setIsPropModalOpen(false)} title={editingProperty ? 'Edit Property' : 'Add Property'}>
        <PropertyForm existingProperty={editingProperty} onSuccess={handlePropertySuccess} onCancel={() => setIsPropModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default PortfolioOverview;