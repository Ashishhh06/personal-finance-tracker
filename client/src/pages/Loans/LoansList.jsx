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
      <div className="flex flex-wrap justify-between items-center gap-sm mb-md">
        <h1 className="text-headline-lg font-headline-lg text-on-surface">Loans & Debts</h1>
        <Button onClick={handleAdd}>
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm mb-md">
        <Card>
          <p className="text-label-md font-label-md text-secondary">You Owe</p>
          <p className="text-stat-lg font-stat-lg text-[#dc2626]">₹{summary.totalOwedByMe.toLocaleString()}</p>
        </Card>
        <Card>
          <p className="text-label-md font-label-md text-secondary">Owed to You</p>
          <p className="text-stat-lg font-stat-lg text-[#16a34a]">₹{summary.totalOwedToMe.toLocaleString()}</p>
        </Card>
      </div>

      {activeLoans.length === 0 && closedLoans.length === 0 ? (
        <EmptyState message="Nothing here yet." actionLabel="Add your first loan or debt" onAction={handleAdd} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {activeLoans.map((loan) => {
            const paidPercent = loan.principalAmount > 0
              ? Math.round(((loan.principalAmount - loan.outstandingAmount) / loan.principalAmount) * 100)
              : 0;
            const isDebt = loan.loanType === 'debt';
            const isReceivable = loan.direction === 'owed_to_me';

            return (
              <Card key={loan._id}>
                <div className="flex justify-between items-start gap-xs mb-xs">
                  <h4 className="text-headline-md font-headline-md text-on-surface">{loan.lenderName}</h4>
                  {isDebt && (
                    <span className={`px-2 py-0.5 rounded-full text-label-sm font-semibold shrink-0 ${
                      isReceivable ? 'bg-[#16a34a]/10 text-[#16a34a]' : 'bg-[#dc2626]/10 text-[#dc2626]'
                    }`}>
                      {isReceivable ? 'Owes You' : 'You Owe'}
                    </span>
                  )}
                </div>
                <p className="text-label-sm font-label-sm text-secondary mb-xs">
                  {TYPE_LABELS[loan.loanType]}{loan.emiAmount ? ` · EMI ₹${loan.emiAmount.toLocaleString()}` : ''}
                </p>
                {loan.note && <p className="text-label-sm font-label-sm text-secondary italic mb-xs">{loan.note}</p>}

                <div className="bg-surface-container-high rounded-full h-2.5 overflow-hidden my-sm">
                  <div
                    className={`h-full transition-all duration-300 ${isReceivable ? 'bg-[#16a34a]' : 'bg-primary-container'}`}
                    style={{ width: `${Math.min(100, paidPercent)}%` }}
                  />
                </div>
                <p className="text-body-md font-body-md text-on-surface mb-xs">
                  ₹{loan.outstandingAmount.toLocaleString()} remaining of ₹{loan.principalAmount.toLocaleString()} ({paidPercent}% settled)
                </p>
                {loan.nextDueDate && (
                  <p className="text-label-sm font-label-sm text-secondary mb-sm">
                    Next due: {new Date(loan.nextDueDate).toLocaleDateString()}
                  </p>
                )}

                <div className="flex gap-xs flex-wrap mt-sm">
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
        <div className="mt-lg">
          <h3 className="text-headline-md font-headline-md text-on-surface mb-sm">Settled / Closed</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
            {closedLoans.map((loan) => (
              <Card key={loan._id}>
                <div className="flex justify-between items-start gap-xs mb-xs">
                  <h4 className="text-headline-md font-headline-md text-on-surface">{loan.lenderName}</h4>
                  <span className="bg-[#16a34a]/10 text-[#16a34a] px-2 py-0.5 rounded-full text-label-sm font-semibold">
                    ✓ Settled
                  </span>
                </div>
                <p className="text-label-sm font-label-sm text-secondary mb-sm">{TYPE_LABELS[loan.loanType]}</p>
                <Button variant="danger" onClick={() => handleDelete(loan._id)}>Delete</Button>
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