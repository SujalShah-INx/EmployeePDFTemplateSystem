import './EmployeeList.css';

function EmployeeList({ employees, selectedEmployee, onSelectEmployee }) {
  return (
    <div className="employee-list">
      <h3>Employees</h3>
      <div className="employee-list-items">
        {employees.map(employee => (
          <div
            key={employee.id}
            className={`employee-item ${selectedEmployee?.id === employee.id ? 'selected' : ''}`}
            onClick={() => onSelectEmployee(employee)}
          >
            <div className="employee-name">{employee.naam_voornaam_werknemer}</div>
            <div className="employee-details">
              <span>{employee.postcode_gemeente_werknemer}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EmployeeList;
