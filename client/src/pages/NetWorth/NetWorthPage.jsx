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
  const totalAssets = breakdown.bankTotal + breakdown.investmentTotal + breakdown.propertyTotal + breakdown.receivablesTotal;

  const rowCls = 'flex justify-between py-2 border-b border-surface-container-high text-body-md text-on-surface';

  return (
    <div>
      <h1 className="text-headline-lg font-headline-lg text-on-surface mb-md">Net Worth</h1>

      <Card className="mb-md text-center py-lg px-md">
        <p className="text-label-md font-label-md text-secondary">Your Current Net Worth</p>
        <p className={`text-display-lg font-display-lg my-sm ${netWorth >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}`}>
          ₹{netWorth.toLocaleString()}
        </p>
        <p className="text-label-sm font-label-sm text-secondary">Bank Balance + Investments + Properties − Loans</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-md mb-md">
        <Card>
          <h3 className="text-headline-md font-headline-md text-[#16a34a] mb-sm">Assets</h3>
          <div className={rowCls}>
            <span>Bank Accounts</span>
            <span>₹{breakdown.bankTotal.toLocaleString()}</span>
          </div>
          <div className={rowCls}>
            <span>Investments</span>
            <span>₹{breakdown.investmentTotal.toLocaleString()}</span>
          </div>
          <div className={rowCls}>
            <span>Properties</span>
            <span>₹{breakdown.propertyTotal.toLocaleString()}</span>
          </div>
          {breakdown.receivablesTotal > 0 && (
            <div className={rowCls}>
              <span>Money Owed to You</span>
              <span>₹{breakdown.receivablesTotal.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between pt-sm font-bold text-body-lg text-on-surface">
            <span>Total Assets</span>
            <span>₹{totalAssets.toLocaleString()}</span>
          </div>
        </Card>

        <Card>
          <h3 className="text-headline-md font-headline-md text-[#dc2626] mb-sm">Liabilities</h3>
          <div className={rowCls}>
            <span>Outstanding Loans</span>
            <span>₹{breakdown.loanTotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between pt-sm font-bold text-body-lg text-on-surface">
            <span>Total Liabilities</span>
            <span>₹{breakdown.loanTotal.toLocaleString()}</span>
          </div>
        </Card>
      </div>

      <Card>
        <div className="flex justify-between items-center text-body-lg font-bold">
          <span className="text-on-surface">Net Worth (Assets − Liabilities)</span>
          <span className={netWorth >= 0 ? 'text-[#16a34a]' : 'text-[#dc2626]'}>₹{netWorth.toLocaleString()}</span>
        </div>
      </Card>
    </div>
  );
};

export default NetWorthPage;