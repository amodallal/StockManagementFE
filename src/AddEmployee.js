import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './styles.css';

const AddEmployee = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        setLoading(true);
        const rolesRes = await axios.get('http://localhost:5257/api/Role');
        setRoles(rolesRes.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching roles:', error);
        setLoading(false);
      }
    };

    const fetchEmployees = async () => {
      try {
        const employeesRes = await axios.get('http://localhost:5257/api/employees');
        setEmployees(employeesRes.data);
      } catch (error) {
        console.error('Error fetching employees:', error);
      }
    };

    fetchRoles();
    fetchEmployees();
  }, []);

  const handleAddEmployee = async () => {
    if (!firstName || !lastName || !phoneNumber || !roleId) {
      alert('Please fill in all required fields before adding.');
      return;
    }

    const newEmployee = {
      firstName,
      lastName,
      phoneNumber,
      roleId,
      isActive: true, // Default to active
    };

    try {
      const response = await axios.post('http://localhost:5257/api/employees', newEmployee);
      setEmployees([...employees, response.data]);
      setFirstName('');
      setLastName('');
      setPhoneNumber('');
      setRoleId('');
    } catch (error) {
      console.error('Error adding employee:', error);
      alert('Failed to add employee.');
    }
  };

  const getRoleName = (id) => {
    const role = roles.find((r) => String(r.roleId) === String(id));
    return role ? role.roleName : 'Unknown Role';
  };

  // Sort employees with Active first
  const sortedEmployees = employees.sort((a, b) => {
    if (a.isActive === b.isActive) return 0;
    return a.isActive ? -1 : 1;
  });

  // Update employee status (isActive)
  const updateEmployeeStatus = async (employeeId, newStatus) => {
        // Ask the user for confirmation before updating
        const confirmMessage = newStatus ? 'Are you sure you want to activate this employee?' : 'Are you sure you want to deactivate this employee?';
        const userConfirmed = window.confirm(confirmMessage);
    
        if (!userConfirmed) {
          return; // Exit if the user cancels
        }
    // Ensure the newStatus is a boolean and log it
    console.log('Updating status for employee:', employeeId, 'New Status:', newStatus);
  
    try {
      const response = await axios.put(
        `http://localhost:5257/api/employees/${employeeId}/status`, 
        newStatus, // Send the boolean value directly
        {
          headers: {
            'Content-Type': 'application/json',  // Set Content-Type to JSON
          }
        }
      );
      console.log('API response:', response.data);
  
      // Update the employee status in the state after successful update
      setEmployees(
        employees.map((employee) =>
          employee.employeeId === employeeId
            ? { ...employee, isActive: newStatus }
            : employee
        )
      );
    } catch (error) {
      console.error('Error updating employee status:', error);
      alert('Failed to update employee status.');
    }
  };
  
  return (
    <div className="container">
      <h2 className="title">Add Employee</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <form onSubmit={(e) => e.preventDefault()} className="form">
            <div className="form-group">
              <label htmlFor="firstName">First Name:</label>
              <input
                type="text"
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="lastName">Last Name:</label>
              <input
                type="text"
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number:</label>
              <input
                type="text"
                id="phoneNumber"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
                autoComplete="off"
              />
            </div>
            <div className="form-group">
              <label htmlFor="roleId">Role:</label>
              <select
                id="roleId"
                value={roleId}
                onChange={(e) => setRoleId(e.target.value)}
                required
              >
                <option value="">Select a Role</option>
                {roles.map((role) => (
                  <option key={role.roleId} value={role.roleId}>
                    {role.roleName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group full-width">
              <button
                type="button"
                onClick={handleAddEmployee}
                className="btn btn-success"
              >
                Add Employee
              </button>
            </div>
          </form>

          <h3 className="subtitle">Added Employees</h3>
          {employees.length === 0 ? (
            <p>No employees added yet.</p>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>First Name</th>
                  <th>Last Name</th>
                  <th>Phone Number</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sortedEmployees.map((employee) => (
                  <tr key={employee.employeeId}>
                    <td>{employee.firstName}</td>
                    <td>{employee.lastName}</td>
                    <td>{employee.phoneNumber}</td>
                    <td>{employee.roleName}</td>
                    <td>
                      <span 
                        className={`status ${employee.isActive ? 'active' : 'inactive'}`}
                      >
                        {employee.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button 

                        onClick={() => updateEmployeeStatus(employee.employeeId, !employee.isActive)}
                        className="btn btn-success"
                      >
                        {employee.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default AddEmployee;
