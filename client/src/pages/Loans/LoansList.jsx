import { useState, useEffect } from 'react';
import { getLoans, deleteLoan, payEmi, getLoansSummary } from '../../services/loanService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import LoanForm from '../../components/forms/LoanForm';

const TYPE_LABELS = { home: 'Home', car: 'Car', personal: 'Personal', education: 'Education', debt: 'Personal Debt', other: 'Other' };

const LoansList = () => {
  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [payingId, setPayingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(false);
    try {
      const [loansRes, summaryRes] = await Promise.all([getLoans(), getLoansSummary()]);
      setLoans(loansRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = () => { setEditingLoan(null); setIsModalOpen(true); };
  const handleEdit = (loan) => { setEditingLoan(loan); setIsModalOpen(true); };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this entry?')) return;
    await deleteLoan(id);
    fetchData();
  };
  const handleSuccess = () => { setIsModalOpen(false); fetchData(); };

  const handlePayEmi = async (loan) => {
    const isDebt = loan.loanType === 'debt';
    const actionLabel = isDebt
      ? (loan.direction === 'owed_by_me' ? 'Log a repayment to them' : 'Log a repayment from them')
      : 'Log an EMI payment';
    if (!window.confirm(`${actionLabel} for ₹${(loan.emiAmount || loan.outstandingAmount).toLocaleString()}? This will create a transaction and reduce the outstanding balance.`)) return;
    setPayingId(loan._id);
    try {
      await payEmi(loan._id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process payment');
    } finally {
      setPayingId(null);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState onRetry={fetchData} />;
  if (!summary) return null;

  const activeLoans = loans.filter((l) => l.status === 'active');
  const closedLoans = loans.filter((l) => l.status === 'closed');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Loans & Debts</h1>
        <Button onClick={handleAdd}>+ Add</Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
        <Card>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>You Owe</p>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#dc2626' }}>₹{summary.totalOwedByMe.toLocaleString()}</p>
        </Card>
        <Card>
          <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Owed to You</p>
          <p style={{ fontSize: '1.6rem', fontWeight: 700, color: '#16a34a' }}>₹{summary.totalOwedToMe.toLocaleString()}</p>
        </Card>
      </div>

      {activeLoans.length === 0 && closedLoans.length === 0 ? (
        <EmptyState message="Nothing here yet." actionLabel="Add your first loan or debt" onAction={handleAdd} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {activeLoans.map((loan) => {
            const paidPercent = loan.principalAmount > 0
              ? Math.round(((loan.principalAmount - loan.outstandingAmount) / loan.principalAmount) * 100)
              : 0;
            const isDebt = loan.loanType === 'debt';
            const isReceivable = loan.direction === 'owed_to_me';

            return (
              <Card key={loan._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <h4 style={{ margin: 0 }}>{loan.lenderName}</h4>
                  {isDebt && (
                    <span style={{
                      background: isReceivable ? '#dcfce7' : '#fee2e2',
                      color: isReceivable ? '#16a34a' : '#dc2626',
                      padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600,
                    }}>
                      {isReceivable ? 'Owes You' : 'You Owe'}
                    </span>
                  )}
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.25rem 0' }}>
                  {TYPE_LABELS[loan.loanType]}{loan.emiAmount ? ` · EMI ₹${loan.emiAmount.toLocaleString()}` : ''}
                </p>
                {loan.note && <p style={{ color: '#9ca3af', fontSize: '0.8rem', fontStyle: 'italic', margin: '0.25rem 0' }}>{loan.note}</p>}

                <div style={{ background: '#e5e7eb', borderRadius: '8px', height: '10px', overflow: 'hidden', margin: '0.5rem 0' }}>
                  <div style={{ width: `${paidPercent}%`, background: isReceivable ? '#16a34a' : '#4f46e5', height: '100%' }} />
                </div>
                <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  ₹{loan.outstandingAmount.toLocaleString()} remaining of ₹{loan.principalAmount.toLocaleString()} ({paidPercent}% settled)
                </p>
                {loan.nextDueDate && (
                  <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
                    Next due: {new Date(loan.nextDueDate).toLocaleDateString()}
                  </p>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button onClick={() => handlePayEmi(loan)} disabled={payingId === loan._id}>
                    {payingId === loan._id ? 'Processing...' : isDebt ? 'Log Repayment' : 'Pay EMI'}
                  </Button>
                  <Button variant="secondary" onClick={() => handleEdit(loan)}>Edit</Button>
                  <Button variant="danger" onClick={() => handleDelete(loan._id)}>Delete</Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {closedLoans.length > 0 && (
        <div style={{ marginTop: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Settled / Closed</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {closedLoans.map((loan) => (
              <Card key={loan._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: 0 }}>{loan.lenderName}</h4>
                  <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600 }}>
                    ✓ Settled
                  </span>
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.25rem 0' }}>{TYPE_LABELS[loan.loanType]}</p>
                <Button variant="danger" onClick={() => handleDelete(loan._id)} style={{ marginTop: '0.5rem' }}>Delete</Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLoan ? 'Edit' : 'Add Loan or Debt'}>
        <LoanForm existingLoan={editingLoan} onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default LoansList;