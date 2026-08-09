import { useState, useEffect } from 'react';
import { getLoans, deleteLoan, payEmi, getLoansSummary } from '../../services/loanService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import LoanForm from '../../components/forms/LoanForm';

const TYPE_LABELS = { home: 'Home', car: 'Car', personal: 'Personal', education: 'Education', other: 'Other' };

const LoansList = () => {
  const [loans, setLoans] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLoan, setEditingLoan] = useState(null);
  const [payingId, setPayingId] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [loansRes, summaryRes] = await Promise.all([getLoans(), getLoansSummary()]);
      setLoans(loansRes.data);
      setSummary(summaryRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleAdd = () => { setEditingLoan(null); setIsModalOpen(true); };
  const handleEdit = (loan) => { setEditingLoan(loan); setIsModalOpen(true); };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this loan?')) return;
    await deleteLoan(id);
    fetchData();
  };
  const handleSuccess = () => { setIsModalOpen(false); fetchData(); };

  const handlePayEmi = async (id) => {
    if (!window.confirm('Log an EMI payment for this loan? This will create an expense transaction and reduce the outstanding balance.')) return;
    setPayingId(id);
    try {
      await payEmi(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process EMI payment');
    } finally {
      setPayingId(null);
    }
  };

  if (loading || !summary) return <Spinner />;

  const activeLoans = loans.filter((l) => l.status === 'active');
  const closedLoans = loans.filter((l) => l.status === 'closed');

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Loans</h1>
        <Button onClick={handleAdd}>+ Add Loan</Button>
      </div>

      <Card style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Outstanding ({summary.activeLoanCount} active loan{summary.activeLoanCount !== 1 ? 's' : ''})</p>
        <p style={{ fontSize: '1.8rem', fontWeight: 700, color: '#dc2626' }}>₹{summary.totalOutstanding.toLocaleString()}</p>
      </Card>

      {activeLoans.length === 0 && closedLoans.length === 0 ? (
        <EmptyState message="No loans added yet." actionLabel="Add your first loan" onAction={handleAdd} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {activeLoans.map((loan) => {
            const paidPercent = loan.principalAmount > 0
              ? Math.round(((loan.principalAmount - loan.outstandingAmount) / loan.principalAmount) * 100)
              : 0;
            return (
              <Card key={loan._id}>
                <h4 style={{ margin: 0 }}>{loan.lenderName}</h4>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.25rem 0' }}>
                  {TYPE_LABELS[loan.loanType]} Loan · EMI ₹{loan.emiAmount.toLocaleString()}
                </p>

                <div style={{ background: '#e5e7eb', borderRadius: '8px', height: '10px', overflow: 'hidden', margin: '0.5rem 0' }}>
                  <div style={{ width: `${paidPercent}%`, background: '#4f46e5', height: '100%' }} />
                </div>
                <p style={{ fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                  ₹{loan.outstandingAmount.toLocaleString()} remaining of ₹{loan.principalAmount.toLocaleString()} ({paidPercent}% paid)
                </p>
                <p style={{ fontSize: '0.85rem', color: '#6b7280', marginBottom: '1rem' }}>
                  Next due: {new Date(loan.nextDueDate).toLocaleDateString()}
                </p>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Button onClick={() => handlePayEmi(loan._id)} disabled={payingId === loan._id}>
                    {payingId === loan._id ? 'Processing...' : 'Pay EMI'}
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
          <h3 style={{ marginBottom: '1rem' }}>Closed Loans</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {closedLoans.map((loan) => (
              <Card key={loan._id}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <h4 style={{ margin: 0 }}>{loan.lenderName}</h4>
                  <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600 }}>
                    ✓ Paid Off
                  </span>
                </div>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.25rem 0' }}>{TYPE_LABELS[loan.loanType]} Loan</p>
                <Button variant="danger" onClick={() => handleDelete(loan._id)} style={{ marginTop: '0.5rem' }}>Delete</Button>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingLoan ? 'Edit Loan' : 'Add Loan'}>
        <LoanForm existingLoan={editingLoan} onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default LoansList;