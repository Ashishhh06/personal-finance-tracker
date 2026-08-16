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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1>Bank Accounts</h1>
        <Button onClick={handleAdd}>+ Add Account</Button>
      </div>

      <Card style={{ marginBottom: '1.5rem' }}>
        <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Total Cash (across {accounts.length} account{accounts.length !== 1 ? 's' : ''})</p>
        <p style={{ fontSize: '1.8rem', fontWeight: 700 }}>₹{total.toLocaleString()}</p>
      </Card>

      {accounts.length === 0 ? (
        <EmptyState message="No bank accounts added yet." actionLabel="Add your first account" onAction={handleAdd} />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1rem' }}>
          {accounts.map((acc) => (
            <Card key={acc._id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <h4 style={{ margin: 0 }}>{acc.accountName}</h4>
                {acc.isPrimary && (
                  <span style={{ background: '#e0e7ff', color: '#4f46e5', padding: '0.15rem 0.5rem', borderRadius: '999px', fontSize: '0.7rem', fontWeight: 600 }}>
                    Primary
                  </span>
                )}
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '0.25rem 0' }}>{acc.bankName} · {TYPE_LABELS[acc.accountType]}</p>
              <p style={{ fontSize: '1.4rem', fontWeight: 700, margin: '0.5rem 0' }}>₹{acc.currentBalance.toLocaleString()}</p>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
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