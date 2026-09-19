import { useState } from 'react';
import { createProperty, updateProperty } from '../../services/propertyService';
import Button from '../common/Button';

const PropertyForm = ({ existingProperty, onSuccess, onCancel }) => {
  const [propertyType, setPropertyType] = useState(existingProperty?.propertyType || 'house');
  const [name, setName] = useState(existingProperty?.name || '');
  const [purchasePrice, setPurchasePrice] = useState(existingProperty?.purchasePrice || '');
  const [currentEstimatedValue, setCurrentEstimatedValue] = useState(existingProperty?.currentEstimatedValue || '');
  const [purchaseDate, setPurchaseDate] = useState(
    existingProperty?.purchaseDate ? existingProperty.purchaseDate.slice(0, 10) : new Date().toISOString().slice(0, 10)
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const payload = {
      propertyType,
      name,
      purchasePrice: Number(purchasePrice),
      currentEstimatedValue: Number(currentEstimatedValue),
      purchaseDate,
    };

    try {
      if (existingProperty) {
        await updateProperty(existingProperty._id, payload);
      } else {
        await createProperty(payload);
      }
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = 'w-full mt-xs px-3 py-2 border border-outline-variant rounded-lg text-body-md text-on-surface bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container';
  const labelCls = 'block text-label-md font-label-md text-on-surface-variant';
  const groupCls = 'mb-sm';

  return (
    <form onSubmit={handleSubmit}>
      <div className={groupCls}>
        <label className={labelCls}>Type</label>
        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} className={inputCls}>
          <option value="house">House</option>
          <option value="land">Land</option>
          <option value="gold">Gold</option>
          <option value="vehicle">Vehicle</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div className={groupCls}>
        <label className={labelCls}>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Flat 202, Whitefield" required className={inputCls} />
      </div>
      <div className={groupCls}>
        <label className={labelCls}>Purchase Price</label>
        <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required min="0" className={inputCls} />
      </div>
      <div className={groupCls}>
        <label className={labelCls}>Current Estimated Value</label>
        <input type="number" value={currentEstimatedValue} onChange={(e) => setCurrentEstimatedValue(e.target.value)} required min="0" className={inputCls} />
      </div>
      <div className={groupCls}>
        <label className={labelCls}>Purchase Date</label>
        <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required className={inputCls} />
      </div>

      {error && <p className="mt-xs text-label-sm font-label-sm text-[#dc2626]">{error}</p>}

      <div className="flex gap-sm mt-md">
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : existingProperty ? 'Update' : 'Add'} Property</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

export default PropertyForm;