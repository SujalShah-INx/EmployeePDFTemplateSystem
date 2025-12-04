import { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import EmployeeList from './components/EmployeeList';
import TemplateList from './components/TemplateList';
import Toolbar from './components/Toolbar';
import DocumentEditor from './components/DocumentEditor';
import { replacePlaceholders, loadTemplate } from './utils/templateProcessor';
import { exportToPDF, printDocument } from './utils/pdfExport';
import employeesData from './data/employees.json';
import templatesData from './data/templates.json';
import './App.css';

function App() {
  const [employees] = useState(employeesData);
  const [templates] = useState(templatesData);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // When employee or template changes, load and populate the template
  useEffect(() => {
    async function loadAndPopulateTemplate() {
      if (!selectedEmployee || !selectedTemplate) {
        setDocumentContent('');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        // Try to load template HTML
        const templateHtml = await loadTemplate(selectedTemplate.fileName);
        
        // Replace placeholders with employee data
        const populatedHtml = replacePlaceholders(templateHtml, selectedEmployee);
        
        console.log('Template loaded successfully');
        setDocumentContent(populatedHtml);
      } catch (err) {
        console.warn('Template file not found, using sample template:', err);
        setError('Using sample template. To use actual templates, copy HTML files to public/templates/');
        
        // Create a sample template for demonstration
        const sampleTemplate = createSampleTemplate(selectedEmployee, selectedTemplate);
        setDocumentContent(sampleTemplate);
      } finally {
        setIsLoading(false);
      }
    }

    loadAndPopulateTemplate();
  }, [selectedEmployee, selectedTemplate]);

  const handleEmployeeSelect = (employee) => {
    setSelectedEmployee(employee);
  };

  const handleTemplateSelect = (template) => {
    setSelectedTemplate(template);
  };

  const handleContentChange = (newContent) => {
    setDocumentContent(newContent);
  };

  const handleExportPDF = async () => {
    if (!documentContent || !selectedEmployee || !selectedTemplate) {
      alert('Please select an employee and template first.');
      return;
    }

    const filename = `${selectedTemplate.name} - ${selectedEmployee.naam_voornaam_werknemer}.pdf`
      .replace(/[^a-z0-9\s\-\.]/gi, '_'); // Sanitize filename
    
    setIsLoading(true);
    try {
      await exportToPDF(documentContent, filename);
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (!documentContent) return;
    printDocument(documentContent);
  };

  return (
    <div className="app">
      <Toolbar
        selectedEmployee={selectedEmployee}
        selectedTemplate={selectedTemplate}
        onExportPDF={handleExportPDF}
        onPrint={handlePrint}
        isLoading={isLoading}
      />
      
      <div className="app-content">
        <Sidebar>
          <EmployeeList
            employees={employees}
            selectedEmployee={selectedEmployee}
            onSelectEmployee={handleEmployeeSelect}
          />
          
          <TemplateList
            templates={templates}
            selectedTemplate={selectedTemplate}
            onSelectTemplate={handleTemplateSelect}
          />
        </Sidebar>
        
        <main className="main-content">
          {error && (
            <div className="error-banner">
              <strong>Note:</strong> {error}
            </div>
          )}
          
          {!selectedEmployee && !selectedTemplate && (
            <div className="welcome-message">
              <h2>👋 Welcome to Employee PDF Template System</h2>
              <p>Get started by:</p>
              <ol>
                <li>Select an employee from the left sidebar</li>
                <li>Choose a document template</li>
                <li>Edit and export as PDF</li>
              </ol>
            </div>
          )}
          
          {(selectedEmployee || selectedTemplate) && (
            <DocumentEditor
              content={documentContent}
              onChange={handleContentChange}
              readOnly={isLoading}
            />
          )}
          
          {isLoading && (
            <div className="loading-overlay">
              <div className="spinner"></div>
              <p>Loading template...</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

// Helper function to create a sample template when real templates aren't available
function createSampleTemplate(employee, template) {
  return `
    <div style="font-family: Calibri, Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 40px;">
        ${employee.company_logo_image_tag || '<h2>' + employee.bedrijfsnaam + '</h2>'}
      </div>
      
      <h1 style="text-align: center; font-size: 16px; text-transform: uppercase; margin-bottom: 30px;">
        ${template.name}
      </h1>
      
      <div style="margin-bottom: 20px;">
        <p><strong>Between the undersigned parties:</strong></p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p>On the one hand: <strong>${employee.bedrijfsnaam}</strong></p>
        <p>Located at: <strong>${employee.adres_bedrijf}, ${employee.postcode_gemeente_bedrijf}</strong></p>
        <p>Recognition number: <strong>${employee.erkenning_nr}</strong></p>
        <p>Represented by: <strong>${employee.request_user}</strong></p>
        <p><em>hereinafter referred to as the employer,</em></p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p>And on the other hand:</p>
        <p><strong>${employee.naam_voornaam_werknemer}</strong></p>
        <p>Residing at: <strong>${employee.complete_adres_werknemer}</strong></p>
        <p><em>hereinafter referred to as the employee,</em></p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p>The following is agreed:</p>
      </div>
      
      <div style="margin-bottom: 20px;">
        <p><strong>Article 1</strong></p>
        <p>Employment details:</p>
        <ul>
          <li>Starting hourly wage: €${employee.start_uurloon}</li>
          <li>Current hourly wage: €${employee.huidige_uurloon}</li>
          ${employee.contractual_hours ? `<li>Contractual hours: ${employee.contractual_hours} hours/week</li>` : ''}
        </ul>
      </div>
      
      <div style="margin-top: 60px;">
        <p>Drafted in duplicate on <strong>${employee.current_date_time}</strong></p>
      </div>
      
      <div style="display: flex; justify-content: space-between; margin-top: 80px;">
        <div style="text-align: center;">
          <p>...............................................</p>
          <p><em>(Read and approved)</em></p>
          <p>The employer</p>
          <p style="margin-top: 40px;">...............................................</p>
          <p><em>(signature)</em></p>
        </div>
        
        <div style="text-align: center;">
          <p>...............................................</p>
          <p><em>(Read and approved)</em></p>
          <p>The employee</p>
          <p style="margin-top: 40px;">...............................................</p>
          <p><em>(signature)</em></p>
          <p style="margin-top: 20px;">${employee.naam_voornaam_werknemer}</p>
        </div>
      </div>
    </div>
  `;
}

export default App;
