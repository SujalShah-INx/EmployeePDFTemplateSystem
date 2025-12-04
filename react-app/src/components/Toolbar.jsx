import './Toolbar.css';

function Toolbar({ 
  onExportPDF, 
  onPrint, 
  selectedEmployee, 
  selectedTemplate,
  isLoading 
}) {
  const canExport = selectedEmployee && selectedTemplate && !isLoading;

  return (
    <div className="toolbar">
      <div className="toolbar-info">
        <div className="toolbar-title">
          <h2>Document Editor</h2>
        </div>
        <div className="toolbar-status">
          {selectedEmployee && (
            <span className="status-item">
              <strong>Employee:</strong> {selectedEmployee.naam_voornaam_werknemer}
            </span>
          )}
          {selectedTemplate && (
            <span className="status-item">
              <strong>Template:</strong> {selectedTemplate.name}
            </span>
          )}
        </div>
      </div>
      
      <div className="toolbar-actions">
        <button
          className="toolbar-btn btn-print"
          onClick={onPrint}
          disabled={!canExport}
          title="Print document"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 9V2h12v7M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/>
            <rect x="6" y="14" width="12" height="8"/>
          </svg>
          Print
        </button>
        
        <button
          className="toolbar-btn btn-export"
          onClick={onExportPDF}
          disabled={!canExport}
          title="Export to PDF"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          Export PDF
        </button>
      </div>
    </div>
  );
}

export default Toolbar;
