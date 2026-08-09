import { useState, useEffect } from 'react';
import { getNetWorth } from '../../services/netWorthService';
import Card from '../../components/common/Card';
import Spinner from '../../components/common/Spinner';

const NetWorthPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await getNetWorth();
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !data) return <Spinner />;

  const { netWorth, breakdown } = data;
  const totalAssets = breakdown.bankTotal + breakdown.investmentTotal + breakdown.propertyTotal;

  const rowStyle = { display: 'flex', justifyContent: 'space-between', padding: '0.6rem 0', borderBottom: '1px solid #f3f4f6' };

  return (
    <div>
      <h1 style={{ marginBottom: '1.5rem' }}>Net Worth</h1>

      <Card style={{ marginBottom: '1.5rem', textAlign: 'center', padding: '2.5rem' }}>
        <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Your Current Net Worth</p>
        <p style={{ fontSize: '2.5rem', fontWeight: 700, color: netWorth >= 0 ? '#16a34a' : '#dc2626', margin: '0.5rem 0' }}>
          ₹{netWorth.toLocaleString()}
        </p>
        <p style={{ color: '#9ca3af', fontSize: '0.85rem' }}>Bank Balance + Investments + Properties − Loans</p>
      </Card>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        <Card>
          <h3 style={{ marginBottom: '1rem', color: '#16a34a' }}>Assets</h3>
          <div style={rowStyle}>
            <span>Bank Accounts</span>
            <span>₹{breakdown.bankTotal.toLocaleString()}</span>
          </div>
          <div style={rowStyle}>
            <span>Investments</span>
            <span>₹{breakdown.investmentTotal.toLocaleString()}</span>
          </div>
          <div style={rowStyle}>
            <span>Properties</span>
            <span>₹{breakdown.propertyTotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', fontWeight: 700 }}>
            <span>Total Assets</span>
            <span>₹{totalAssets.toLocaleString()}</span>
          </div>
        </Card>

        <Card>
          <h3 style={{ marginBottom: '1rem', color: '#dc2626' }}>Liabilities</h3>
          <div style={rowStyle}>
            <span>Outstanding Loans</span>
            <span>₹{breakdown.loanTotal.toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '0.75rem', fontWeight: 700 }}>
            <span>Total Liabilities</span>
            <span>₹{breakdown.loanTotal.toLocaleString()}</span>
          </div>
        </Card>
      </div>

      <Card style={{ marginTop: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: 700 }}>
          <span>Net Worth (Assets − Liabilities)</span>
          <span style={{ color: netWorth >= 0 ? '#16a34a' : '#dc2626' }}>₹{netWorth.toLocaleString()}</span>
        </div>
      </Card>
    </div>
  );
};

export default NetWorthPage;