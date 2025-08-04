
import { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomerSummary.css';

function CustomerSummary() {
  const [customers, setCustomers] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/customers`, {
        params: { limit: 100 }
      });
      setCustomers(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerSummary = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/customers/${id}`);
      setSelectedCustomer(response.data.data);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch customer summary');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="customer-summary">
      <h2>Customer Summary</h2>
      <select onChange={(e) => fetchCustomerSummary(e.target.value)} className="customer-select" disabled={loading}>
        <option value="">Select a customer</option>
        {customers.map((customer) => (
          <option key={customer.id} value={customer.id}>
            {`${customer.first_name} ${customer.last_name}`}
          </option>
        ))}
      </select>
      {loading && <p>Loading...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && selectedCustomer && (
        <div className="summary-card">
          <h3>{`${selectedCustomer.first_name} ${selectedCustomer.last_name}`}</h3>
          <p>Email: {selectedCustomer.email}</p>
          <p>Order Count: {selectedCustomer.order_count}</p>
          <p>Age: {selectedCustomer.age}</p>
          <p>Gender: {selectedCustomer.gender}</p>
          <p>Joined: {new Date(selectedCustomer.created_at).toLocaleDateString()}</p>
        </div>
      )}
    </div>
  );
}

export default CustomerSummary;