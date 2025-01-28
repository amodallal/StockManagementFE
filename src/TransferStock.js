import React, { useState, useEffect } from 'react';
import './styles.css';
import { fetch_roles, fetch_statuses, fetch_employees } from './Functions';

const TransferStock = () => {
  const [statuses, setStatuses] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [roles, setRoles] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [inputText, setInputText] = useState(''); // State for input text
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statusesData, rolesData, employeesData] = await Promise.all([
          fetch_statuses(),
          fetch_roles(),
          fetch_employees(),
        ]);
        setStatuses(statusesData.statuses || []);
        setRoles(rolesData.roles || []);
        setEmployees(employeesData.employees || []);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data.');
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleEmployeeChange = (e) => {
    setSelectedEmployee(e.target.value);
  };

  const handleInputChange = (e) => {
    setInputText(e.target.value);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="container">
      <h2 className="title">Transfer Stock</h2>

      {/* Employee Dropdown */}
      <div className="form-group">
        <label htmlFor="employee-dropdown">Select Employee:</label>
        <select
          id="employee-dropdown"
          value={selectedEmployee}
          onChange={handleEmployeeChange}
          className="form-control"
        >
          <option value="" disabled>
            Select an employee
          </option>
          {employees
            .filter((employee) => employee.roleName === 'Salesman') // Filter employees by roleId
            .map((employee) => (
              <option key={employee.id} value={employee.id}>
                {`${employee.firstName} ${employee.lastName}`}
              </option>
            ))}
        </select>
      </div>

      {/* Input Text Field */}
      <div className="form-group">
        <label htmlFor="text-input">Input Text:</label>
        <input
          type="text"
          id="text-input"
          value={inputText}
          onChange={handleInputChange}
          className="form-control"
          placeholder=""
        />
      </div>

    </div>
  );
};

export default TransferStock;
