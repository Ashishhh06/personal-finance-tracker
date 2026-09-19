import { useState, useEffect } from 'react';
import { getBankAccounts, deleteBankAccount } from '../../services/bankAccountService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';
import BankAccountForm from '../../components/forms/BankAccountForm';

const TYPE_LABELS = { savings: 'Savings', current: 'Current', emergency_fund: 'Emergency Fund', salary: 'Salary', other: 'Other' };

const BankAccountsList = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);

  const fetchAccounts = async () => {
    setLoading(true);
    setError(false);
    try {
      const res = await getBankAccounts();
      setAccounts(res.data);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAccounts(); }, []);

  const handleAdd = () => { setEditingAccount(null); setIsModalOpen(true); };
  const handleEdit = (acc) => { setEditingAccount(acc); setIsModalOpen(true); };
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this account?')) return;
    await deleteBankAccount(id);
    fetchAccounts();
  };
  const handleSuccess = () => { setIsModalOpen(false); fetchAccounts(); };

  const total = accounts.reduce((sum, a) => sum + a.currentBalance, 0);

  if (loading) return <Spinner />;
  if (error) return <ErrorState onRetry={fetchAccounts} />;

  return (
    <div>
      <div className="flex flex-wrap justify-between items-center gap-sm mb-md">
        <h1 className="text-headline-lg font-headline-lg text-on-surface">Bank Accounts</h1>
        <Button onClick={handleAdd}>
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Account
        </Button>
      </div>

      <Card className="mb-md">
        <p className="text-label-md font-label-md text-secondary">Total Cash (across {accounts.length} account{accounts.length !== 1 ? 's' : ''})</p>
        <p className="text-stat-lg font-stat-lg text-on-surface">₹{total.toLocaleString()}</p>
      </Card>

      {accounts.length === 0 ? (
        <EmptyState message="No bank accounts added yet." actionLabel="Add your first account" onAction={handleAdd} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-md">
          {accounts.map((acc) => (
            <Card key={acc._id}>
              <div className="flex justify-between items-start gap-xs mb-xs">
                <h4 className="text-headline-md font-headline-md text-on-surface">{acc.accountName}</h4>
                {acc.isPrimary && (
                  <span className="bg-primary-container/10 text-primary-container px-2 py-0.5 rounded-full text-label-sm font-semibold shrink-0">
                    Primary
                  </span>
                )}
              </div>
              <p className="text-label-sm font-label-sm text-secondary mb-xs">{acc.bankName} · {TYPE_LABELS[acc.accountType]}</p>
              <p className="text-stat-lg font-stat-lg text-on-surface my-xs">₹{acc.currentBalance.toLocaleString()}</p>
              <div className="flex gap-xs mt-sm">
                <Button variant="secondary" onClick={() => handleEdit(acc)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(acc._id)}>Delete</Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingAccount ? 'Edit Account' : 'Add Account'}>
        <BankAccountForm existingAccount={editingAccount} onSuccess={handleSuccess} onCancel={() => setIsModalOpen(false)} />
      </Modal>
    </div>
  );
};

export default BankAccountsList;