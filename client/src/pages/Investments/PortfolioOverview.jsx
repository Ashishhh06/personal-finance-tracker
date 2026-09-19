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
import ErrorState from '../../components/common/ErrorState';
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
  const [error, setError] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedType, setExpandedType] = useState(null);
  const [isInvModalOpen, setIsInvModalOpen] = useState(false);
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [isPropModalOpen, setIsPropModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);

  const fetchAll = async () => {
    setLoading(true);
    setError(false);
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
      setError(true);
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

  if (loading) return <Spinner />;
  if (error) return <ErrorState onRetry={fetchAll} />;
  if (!summary) return null;

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
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-sm mb-md">
        <h1 className="text-headline-lg font-headline-lg text-on-surface">Investments & Properties</h1>
        <div className="flex gap-sm">
          <Button variant="secondary" onClick={handleAddProperty}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Property
          </Button>
          <Button onClick={handleAddInvestment}>
            <span className="material-symbols-outlined text-[18px]">add</span>
            Add Investment
          </Button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-sm mb-md">
        <Card>
          <p className="text-label-md font-label-md text-secondary">Total Invested</p>
          <p className="text-stat-lg font-stat-lg text-on-surface">₹{summary.totalInvested.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-label-md font-label-md text-secondary">Current Value</p>
          <p className="text-stat-lg font-stat-lg text-on-surface">₹{summary.totalCurrentValue.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-label-md font-label-md text-secondary">Overall Return</p>
          <p className={`text-stat-lg font-stat-lg ${summary.overallReturnPercent >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
            {summary.overallReturnPercent >= 0 ? '+' : ''}{summary.overallReturnPercent}%
          </p>
        </Card>
      </div>

      {/* Allocation chart */}
      {chartData.length > 0 && (
        <Card className="mb-md">
          <h3 className="text-headline-md font-headline-md text-on-surface mb-sm">Allocation</h3>
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
      <div className="flex gap-xs mb-md flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1.5 rounded-full text-label-md font-label-md transition-colors cursor-pointer ${
              activeFilter === f
                ? 'bg-primary-container text-on-primary font-semibold shadow-sm'
                : 'bg-surface-container-high text-secondary hover:text-on-surface'
            }`}
          >
            {f === 'all' ? 'All' : TYPE_LABELS[f]}
          </button>
        ))}
      </div>

      {investments.length === 0 ? (
        <EmptyState message="No investments yet." actionLabel="Add your first investment" onAction={handleAddInvestment} />
      ) : (
        <Card className="mb-md">
          {typesToShow.map((type) => {
            const items = groupedInvestments[type] || [];
            if (items.length === 0) return null;
            const isExpanded = expandedType === type;

            return (
              <div key={type} className="mb-xs last:mb-0">
                <button
                  onClick={() => setExpandedType(isExpanded ? null : type)}
                  className="w-full text-left bg-surface-container-low hover:bg-surface-container-high/60 transition-colors px-sm py-2.5 rounded-lg font-semibold text-label-md flex justify-between items-center cursor-pointer mb-xs"
                >
                  <span className="text-on-surface">{isExpanded ? '▼' : '▶'} {TYPE_LABELS[type]} ({items.length})</span>
                </button>

                {isExpanded && (
                  <div className="overflow-x-auto mb-sm">
                    <table className="w-full text-body-md font-body-md">
                      <thead>
                        <tr className="border-b border-surface-container-high">
                          <th className="px-sm py-2 text-left text-label-sm font-label-sm text-secondary">Name</th>
                          <th className="px-sm py-2 text-right text-label-sm font-label-sm text-secondary">Invested</th>
                          <th className="px-sm py-2 text-right text-label-sm font-label-sm text-secondary">Current Value</th>
                          <th className="px-sm py-2"></th>
                        </tr>
                      </thead>
                      <tbody>
                        {items.map((inv) => {
                          const invested = inv.investmentType === 'fd'
                            ? inv.purchasePrice
                            : inv.purchasePrice * (inv.quantity || 0);
                          const current = inv.investmentType === 'fd'
                            ? inv.purchasePrice
                            : (inv.currentPrice ?? inv.purchasePrice) * (inv.quantity || 0);
                          const returnPct = invested > 0 ? Math.round(((current - invested) / invested) * 10000) / 100 : 0;

                          return (
                            <tr key={inv._id} className="border-b border-surface-container-low hover:bg-surface-container-low/50 transition-colors">
                              <td className="px-sm py-2.5 text-on-surface">{inv.name}</td>
                              <td className="px-sm py-2.5 text-right text-on-surface">₹{invested.toLocaleString()}</td>
                              <td className={`px-sm py-2.5 text-right font-semibold ${returnPct >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                                ₹{current.toLocaleString()} ({returnPct >= 0 ? '+' : ''}{returnPct}%)
                              </td>
                              <td className="px-sm py-2.5">
                                <div className="flex gap-xs justify-end">
                                  <button
                                    onClick={() => handleEditInvestment(inv)}
                                    className="p-1 rounded-lg text-secondary hover:text-primary-container hover:bg-primary-fixed/20 transition-colors"
                                    title="Edit"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">edit</span>
                                  </button>
                                  <button
                                    onClick={() => handleDeleteInvestment(inv._id)}
                                    className="p-1 rounded-lg text-secondary hover:text-[#dc2626] hover:bg-[#dc2626]/10 transition-colors"
                                    title="Delete"
                                  >
                                    <span className="material-symbols-outlined text-[20px]">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}
        </Card>
      )}

      {/* Properties section */}
      <h3 className="text-headline-md font-headline-md text-on-surface mb-sm">Properties</h3>
      {properties.length === 0 ? (
        <EmptyState message="No properties added yet." actionLabel="Add a property" onAction={handleAddProperty} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {properties.map((p) => {
            const growth = p.currentEstimatedValue - p.purchasePrice;
            const growthPct = p.purchasePrice > 0 ? Math.round((growth / p.purchasePrice) * 10000) / 100 : 0;
            return (
              <Card key={p._id}>
                <h4 className="text-headline-md font-headline-md text-on-surface capitalize">{p.name}</h4>
                <p className="text-label-sm font-label-sm text-secondary mb-xs capitalize">{p.propertyType}</p>
                <p className="text-stat-lg font-stat-lg text-on-surface my-xs">
                  ₹{p.currentEstimatedValue.toLocaleString()}
                </p>
                <p className={`text-label-md font-label-md font-semibold ${growthPct >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
                  {growthPct >= 0 ? '+' : ''}{growthPct}% since purchase
                </p>
                <div className="flex gap-xs mt-md">
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