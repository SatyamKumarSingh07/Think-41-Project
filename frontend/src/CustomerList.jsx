
import { useState, useEffect } from 'react';
import axios from 'axios';
import './CustomerList.css';

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const limit = 10;

  useEffect(() => {
    fetchCustomers();
  }, [page]);

  useEffect(() => {
    setFilteredCustomers(
      customers.filter(customer =>
        customer.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
    );
  }, [searchTerm, customers]);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/customers`, {
        params: { page, limit }
      });
      setCustomers(response.data.data);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage > 0 && newPage <= totalPages) setPage(newPage);
  };

  return (
    <div className="customer-list">
      <h2>Customer List</h2>
      <input
        type="text"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-bar"
      />
      {loading && <p>Loading customers...</p>}
      {error && <p className="error-message">{error}</p>}
      {!loading && !error && filteredCustomers.length > 0 && (
        <>
          <div className="card-container">
            {filteredCustomers.map((customer) => (
              <div key={customer.id} className="customer-card">
                <h3>{`${customer.first_name} ${customer.last_name}`}</h3>
                <p>Email: {customer.email}</p>
                <p>Order Count: {customer.order_count}</p>
                <p>Age: {customer.age}</p>
                <p>Gender: {customer.gender}</p>
              </div>
            ))}
          </div>
          <div className="pagination">
            <button onClick={() => handlePageChange(page - 1)} disabled={page === 1}>
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button onClick={() => handlePageChange(page + 1)} disabled={page === totalPages}>
              Next
            </button>
          </div>
        </>
      )}
      {!loading && !error && filteredCustomers.length === 0 && <p>No customers found.</p>}
    </div>
  );
}

export default CustomerList;