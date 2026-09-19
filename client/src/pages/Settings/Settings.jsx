import { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../services/categoryService';
import { getTransactions } from '../../services/transactionService';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Modal from '../../components/common/Modal';
import Spinner from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import ErrorState from '../../components/common/ErrorState';

// ─── shared input styles (same tokens used across all pages) ─────────────────
const inputCls =
  'w-full rounded-lg border border-outline-variant bg-surface px-3 py-2 text-body-md font-body-md text-on-surface placeholder:text-secondary focus:outline-none focus:ring-2 focus:ring-primary-container transition';
const labelCls = 'block text-label-md font-label-md text-on-surface-variant mb-1';
const groupCls = 'flex flex-col gap-1';

// ─── tiny feedback banner ────────────────────────────────────────────────────
const Feedback = ({ msg, isError }) => {
  if (!msg) return null;
  return (
    <p
      className={`text-label-sm font-label-sm mt-2 ${
        isError ? 'text-[#dc2626]' : 'text-[#16a34a]'
      }`}
    >
      {msg}
    </p>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION A — Profile
// ═══════════════════════════════════════════════════════════════════════════════
const ProfileSection = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const [name, setName] = useState(user?.name ?? '');
  const [currency, setCurrency] = useState(user?.currency ?? 'INR');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ msg: '', isError: false });

  // keep fields in sync if user object changes (e.g. on first load)
  useEffect(() => {
    setName(user?.name ?? '');
    setCurrency(user?.currency ?? 'INR');
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFeedback({ msg: '', isError: false });
    try {
      await updateProfile({ name: name.trim(), currency });
      setFeedback({ msg: 'Profile updated successfully.', isError: false });
    } catch (err) {
      setFeedback({
        msg: err?.response?.data?.message ?? 'Failed to update profile.',
        isError: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <h2 className="text-headline-md font-headline-md text-on-surface mb-md">Profile</h2>
      <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-[480px]">
        <div className={groupCls}>
          <label className={labelCls}>Name</label>
          <input
            className={inputCls}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            required
          />
        </div>
        <div className={groupCls}>
          <label className={labelCls}>Email</label>
          <input
            className={`${inputCls} opacity-60 cursor-not-allowed`}
            value={user?.email ?? ''}
            disabled
          />
        </div>
        <div className={groupCls}>
          <label className={labelCls}>Currency</label>
          <select
            className={inputCls}
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
          >
            <option value="INR">INR — Indian Rupee</option>
            <option value="USD">USD — US Dollar</option>
            <option value="EUR">EUR — Euro</option>
          </select>
        </div>
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save Changes'}
          </Button>
          <Feedback msg={feedback.msg} isError={feedback.isError} />
        </div>
      </form>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION B — Change Password
// ═══════════════════════════════════════════════════════════════════════════════
const PasswordSection = () => {
  const { changePassword } = useContext(AuthContext);
  const [old, setOld] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState({ msg: '', isError: false });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (next !== confirm) {
      setFeedback({ msg: 'New passwords do not match.', isError: true });
      return;
    }
    setSaving(true);
    setFeedback({ msg: '', isError: false });
    try {
      await changePassword(old, next);
      setFeedback({ msg: 'Password changed successfully.', isError: false });
      setOld('');
      setNext('');
      setConfirm('');
    } catch (err) {
      setFeedback({
        msg: err?.response?.data?.message ?? 'Failed to change password.',
        isError: true,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <h2 className="text-headline-md font-headline-md text-on-surface mb-md">Change Password</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-w-[480px]">
        <div className={groupCls}>
          <label className={labelCls}>Current Password</label>
          <input
            type="password"
            className={inputCls}
            value={old}
            onChange={(e) => setOld(e.target.value)}
            required
            autoComplete="current-password"
          />
        </div>
        <div className={groupCls}>
          <label className={labelCls}>New Password</label>
          <input
            type="password"
            className={inputCls}
            value={next}
            onChange={(e) => setNext(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div className={groupCls}>
          <label className={labelCls}>Confirm New Password</label>
          <input
            type="password"
            className={inputCls}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            required
            autoComplete="new-password"
          />
        </div>
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Updating…' : 'Update Password'}
          </Button>
          <Feedback msg={feedback.msg} isError={feedback.isError} />
        </div>
      </form>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION C — Category Management
// ═══════════════════════════════════════════════════════════════════════════════
const CategorySection = () => {
  const [expenses, setExpenses] = useState([]);
  const [incomes, setIncomes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null); // null = add, object = edit
  const [modalForm, setModalForm] = useState({ name: '', type: 'expense' });
  const [modalSaving, setModalSaving] = useState(false);
  const [modalError, setModalError] = useState('');

  const fetchAll = async () => {
    setLoading(true);
    setError(null);
    try {
      const [expRes, incRes] = await Promise.all([
        getCategories('expense'),
        getCategories('income'),
      ]);
      setExpenses(expRes.data ?? []);
      setIncomes(incRes.data ?? []);
    } catch {
      setError('Failed to load categories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAll();
  }, []);

  const openAdd = () => {
    setEditing(null);
    setModalForm({ name: '', type: 'expense' });
    setModalError('');
    setModalOpen(true);
  };

  const openEdit = (cat) => {
    setEditing(cat);
    setModalForm({ name: cat.name, type: cat.type });
    setModalError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditing(null);
  };

  const handleModalSubmit = async (e) => {
    e.preventDefault();
    if (!modalForm.name.trim()) {
      setModalError('Name is required.');
      return;
    }
    setModalSaving(true);
    setModalError('');
    try {
      if (editing) {
        await updateCategory(editing._id, { name: modalForm.name.trim(), type: modalForm.type });
      } else {
        await createCategory({ name: modalForm.name.trim(), type: modalForm.type });
      }
      closeModal();
      await fetchAll();
    } catch (err) {
      setModalError(err?.response?.data?.message ?? 'Save failed.');
    } finally {
      setModalSaving(false);
    }
  };

  const handleDelete = async (cat) => {
    if (!window.confirm(`Delete category "${cat.name}"? This cannot be undone.`)) return;
    try {
      await deleteCategory(cat._id);
      await fetchAll();
    } catch (err) {
      alert(err?.response?.data?.message ?? 'Delete failed.');
    }
  };

  const CategoryList = ({ cats, label }) => (
    <div className="flex-1 min-w-0">
      <h3 className="text-label-md font-label-md text-secondary uppercase tracking-wide mb-3">
        {label}
      </h3>
      {cats.length === 0 ? (
        <EmptyState message={`No ${label.toLowerCase()} yet.`} />
      ) : (
        <ul className="flex flex-col gap-2">
          {cats.map((cat) => (
            <li
              key={cat._id}
              className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-surface-container-low"
            >
              <span className="text-body-md font-body-md text-on-surface truncate">{cat.name}</span>
              {cat.isBuiltIn ? (
                <span className="shrink-0 text-label-sm font-label-sm bg-surface-container-high text-secondary px-2 py-0.5 rounded-full">
                  Built-in
                </span>
              ) : (
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-1 rounded hover:bg-surface-container-high text-secondary hover:text-on-surface transition-colors"
                    title="Edit"
                  >
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button
                    onClick={() => handleDelete(cat)}
                    className="p-1 rounded hover:bg-[#dc2626]/10 text-secondary hover:text-[#dc2626] transition-colors"
                    title="Delete"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );

  return (
    <Card>
      <div className="flex items-center justify-between mb-md">
        <h2 className="text-headline-md font-headline-md text-on-surface">Categories</h2>
        <Button onClick={openAdd}>
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add Category
        </Button>
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={fetchAll} />
      ) : (
        <div className="flex flex-col md:flex-row gap-6">
          <CategoryList cats={expenses} label="Expense Categories" />
          <div className="w-px bg-surface-container-high hidden md:block" />
          <CategoryList cats={incomes} label="Income Categories" />
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editing ? 'Edit Category' : 'Add Category'}
      >
        <form onSubmit={handleModalSubmit} className="flex flex-col gap-4">
          <div className={groupCls}>
            <label className={labelCls}>Name</label>
            <input
              className={inputCls}
              value={modalForm.name}
              onChange={(e) => setModalForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="e.g. Freelance"
              required
            />
          </div>
          <div className={groupCls}>
            <label className={labelCls}>Type</label>
            <select
              className={inputCls}
              value={modalForm.type}
              onChange={(e) => setModalForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
          </div>
          {modalError && (
            <p className="text-label-sm font-label-sm text-[#dc2626]">{modalError}</p>
          )}
          <div className="flex justify-end gap-3 pt-1">
            <Button type="button" variant="secondary" onClick={closeModal}>
              Cancel
            </Button>
            <Button type="submit" disabled={modalSaving}>
              {modalSaving ? 'Saving…' : editing ? 'Save Changes' : 'Add Category'}
            </Button>
          </div>
        </form>
      </Modal>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// SECTION D — Export as CSV
// ═══════════════════════════════════════════════════════════════════════════════
const csvField = (val) => {
  const str = val == null ? '' : String(val);
  return str.includes(',') || str.includes('"') || str.includes('\n')
    ? `"${str.replace(/"/g, '""')}"`
    : str;
};

const ExportSection = () => {
  const [exporting, setExporting] = useState(false);
  const [feedback, setFeedback] = useState({ msg: '', isError: false });

  const handleExport = async () => {
    setExporting(true);
    setFeedback({ msg: '', isError: false });
    try {
      const res = await getTransactions();
      const rows = res.data ?? [];

      const header = ['Date', 'Type', 'Category', 'Note', 'Payment Method', 'Amount'];
      const lines = [
        header.join(','),
        ...rows.map((t) =>
          [
            csvField(t.date ? new Date(t.date).toLocaleDateString() : ''),
            csvField(t.type),
            csvField(t.categoryId?.name ?? t.categoryId ?? ''),
            csvField(t.note),
            csvField(t.paymentMethod),
            csvField(t.amount),
          ].join(',')
        ),
      ];

      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'transactions.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setFeedback({ msg: `Exported ${rows.length} transactions.`, isError: false });
    } catch {
      setFeedback({ msg: 'Export failed. Please try again.', isError: true });
    } finally {
      setExporting(false);
    }
  };

  return (
    <Card>
      <h2 className="text-headline-md font-headline-md text-on-surface mb-2">Export Data</h2>
      <p className="text-body-md font-body-md text-secondary mb-md">
        Download all your transactions as a CSV file you can open in Excel or Google Sheets.
      </p>
      <div className="flex items-center gap-4">
        <Button onClick={handleExport} disabled={exporting}>
          <span className="material-symbols-outlined text-[18px]">
            {exporting ? 'hourglass_empty' : 'download'}
          </span>
          {exporting ? 'Exporting…' : 'Export as CSV'}
        </Button>
        <Feedback msg={feedback.msg} isError={feedback.isError} />
      </div>
    </Card>
  );
};

// ═══════════════════════════════════════════════════════════════════════════════
// ROOT PAGE
// ═══════════════════════════════════════════════════════════════════════════════
const Settings = () => (
  <div className="flex flex-col gap-6">
    <h1 className="text-headline-lg font-headline-lg text-on-surface">Settings</h1>
    <ProfileSection />
    <PasswordSection />
    <CategorySection />
    <ExportSection />
  </div>
);

export default Settings;