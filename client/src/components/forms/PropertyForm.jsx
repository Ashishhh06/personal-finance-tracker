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

  const inputStyle = { width: '100%', padding: '0.5rem', marginTop: '0.25rem' };
  const groupStyle = { marginBottom: '1rem' };

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

  return (
    <form onSubmit={handleSubmit}>
      <div style={groupStyle}>
        <label>Type</label>
        <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} style={inputStyle}>
          <option value="house">House</option>
          <option value="land">Land</option>
          <option value="gold">Gold</option>
          <option value="vehicle">Vehicle</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div style={groupStyle}>
        <label>Name</label>
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Flat 202, Whitefield" required style={inputStyle} />
      </div>
      <div style={groupStyle}>
        <label>Purchase Price</label>
        <input type="number" value={purchasePrice} onChange={(e) => setPurchasePrice(e.target.value)} required min="0" style={inputStyle} />
      </div>
      <div style={groupStyle}>
        <label>Current Estimated Value</label>
        <input type="number" value={currentEstimatedValue} onChange={(e) => setCurrentEstimatedValue(e.target.value)} required min="0" style={inputStyle} />
      </div>
      <div style={groupStyle}>
        <label>Purchase Date</label>
        <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} required style={inputStyle} />
      </div>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
        <Button type="submit" disabled={loading}>{loading ? 'Saving...' : existingProperty ? 'Update' : 'Add'} Property</Button>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  );
};

export default PropertyForm;