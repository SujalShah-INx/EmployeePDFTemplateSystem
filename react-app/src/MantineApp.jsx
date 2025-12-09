import { useState, useEffect } from 'react';
import { 
  MantineProvider, 
  AppShell, 
  Title, 
  Group, 
  Button, 
  Card,
  Text,
  Stack,
  Badge,
  ScrollArea,
  Loader,
  Center,
  Alert,
  Modal
} from '@mantine/core';
import { IconDownload, IconPrinter, IconAlertCircle, IconUpload } from '@tabler/icons-react';
import '@mantine/core/styles.css';
import '@mantine/tiptap/styles.css';
import DocumentEditor from './components/MantineDocumentEditor';
import DocumentUpload from './components/DocumentUpload';
import { replacePlaceholders, loadTemplate } from './utils/templateProcessor';
import { exportToPDF, printDocument } from './utils/pdfExport';
import employeesData from './data/employees.json';
import templatesData from './data/templates.json';

function App() {
  const [employees] = useState(employeesData);
  const [templates, setTemplates] = useState(templatesData);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [documentContent, setDocumentContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [uploadedTemplates, setUploadedTemplates] = useState({});

  // Load uploaded templates from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('uploadedTemplates');
    if (saved) {
      try {
        setUploadedTemplates(JSON.parse(saved));
      } catch (err) {
        console.error('Error loading uploaded templates:', err);
      }
    }
  }, []);

  // Load and populate template when employee or template changes
  useEffect(() => {
    async function loadAndPopulateTemplate() {
      if (!selectedEmployee || !selectedTemplate) {
        setDocumentContent('');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        let templateHtml;
        
        // Check if this is an uploaded template
        if (selectedTemplate.isUploaded && uploadedTemplates[selectedTemplate.name]) {
          templateHtml = uploadedTemplates[selectedTemplate.name].htmlContent;
          console.log('Using uploaded template:', selectedTemplate.name);
        } else {
          templateHtml = await loadTemplate(selectedTemplate.fileName);
        }
        
        // Validate that templateHtml is actually HTML/text
        if (!templateHtml || typeof templateHtml !== 'string') {
          throw new Error('Invalid template format');
        }
        
        // Check for binary/corrupted content
        if (templateHtml.includes('\ufffd') || /[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(templateHtml)) {
          throw new Error('Template appears to be corrupted or in binary format');
        }
        
        const populatedHtml = replacePlaceholders(templateHtml, selectedEmployee);
        
        console.log('Template loaded successfully');
        console.log('- Template HTML length:', templateHtml.length);
        console.log('- Populated HTML length:', populatedHtml.length);
        console.log('- Populated HTML preview:', populatedHtml.substring(0, 300));
        
        setDocumentContent(populatedHtml);
      } catch (err) {
        console.warn('Template loading error:', err);
        setError(err.message || 'Template file not found, using sample template.');
        
        const sampleTemplate = createSampleTemplate(selectedEmployee, selectedTemplate);
        console.log('Sample template created, length:', sampleTemplate.length);
        setDocumentContent(sampleTemplate);
      } finally {
        setIsLoading(false);
      }
    }

    loadAndPopulateTemplate();
  }, [selectedEmployee, selectedTemplate, uploadedTemplates]);

  const handleExportPDF = async () => {
    if (!documentContent || !selectedEmployee || !selectedTemplate) {
      alert('Please select an employee and template first.');
      return;
    }

    // Check if content is essentially empty
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = documentContent;
    const textContent = tempDiv.textContent || tempDiv.innerText || '';
    
    console.log('Exporting PDF:');
    console.log('- Content length:', documentContent.length);
    console.log('- Text content length:', textContent.trim().length);
    console.log('- Content preview:', documentContent.substring(0, 300));

    if (textContent.trim().length === 0) {
      alert('Cannot export PDF: Document appears to be empty. Please load a template first.');
      return;
    }

    const filename = `${selectedTemplate.name} - ${selectedEmployee.naam_voornaam_werknemer}.pdf`
      .replace(/[^a-z0-9\s\-\.]/gi, '_');
    
    setIsLoading(true);
    try {
      const result = await exportToPDF(documentContent, filename);
      if (result.success) {
        console.log('PDF exported successfully');
      } else {
        console.error('PDF export failed:', result.error);
        alert('Failed to export PDF: ' + result.error);
      }
    } catch (err) {
      console.error('Error exporting PDF:', err);
      alert('Failed to export PDF. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePrint = () => {
    if (!documentContent) {
      alert('Please select an employee and template first.');
      return;
    }
    printDocument(documentContent);
  };

  const handleUploadSuccess = (uploadedTemplate) => {
    console.log('Template uploaded:', uploadedTemplate);
    
    // Add to uploaded templates state
    setUploadedTemplates(prev => ({
      ...prev,
      [uploadedTemplate.name]: uploadedTemplate
    }));
    
    // Add to templates list
    const newTemplate = {
      id: templates.length + 1,
      name: uploadedTemplate.name,
      fileName: uploadedTemplate.fileName,
      isPlanning: false,
      category: 'Uploaded',
      isUploaded: true
    };
    
    setTemplates(prev => [...prev, newTemplate]);
    setUploadModalOpen(false);
    
    // Auto-select the uploaded template
    setSelectedTemplate(newTemplate);
  };

  // Group templates by category
  const groupedTemplates = templates.reduce((acc, template) => {
    const category = template.category || 'Other';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(template);
    return acc;
  }, {});

  return (
    <MantineProvider>
      <AppShell
        header={{ height: 70 }}
        navbar={{ width: 320, breakpoint: 'sm' }}
        padding="md"
      >
        <AppShell.Header>
          <Group h="100%" px="md" justify="space-between">
            <Title order={2}>Employee PDF Template System</Title>
            <Group gap="xs">
              {selectedEmployee && (
                <Badge size="lg" variant="light" color="blue">
                  {selectedEmployee.naam_voornaam_werknemer}
                </Badge>
              )}
              {selectedTemplate && (
                <Badge size="lg" variant="light" color="orange">
                  {selectedTemplate.name.substring(0, 30)}...
                </Badge>
              )}
              <Button 
                leftSection={<IconUpload size={18} />}
                variant="outline"
                onClick={() => setUploadModalOpen(true)}
              >
                Upload Template
              </Button>
              <Button 
                leftSection={<IconPrinter size={18} />}
                variant="light"
                onClick={handlePrint}
                disabled={!documentContent || isLoading}
              >
                Print
              </Button>
              <Button 
                leftSection={<IconDownload size={18} />}
                onClick={handleExportPDF}
                disabled={!documentContent || isLoading}
              >
                Export PDF
              </Button>
            </Group>
          </Group>
        </AppShell.Header>

        <AppShell.Navbar p="md">
          <ScrollArea h="calc(50vh - 100px)" >
            <Title order={4} mb="md">Employees</Title>
            <Stack gap="xs">
              {employees.map(employee => (
                <Card
                  key={employee.id}
                  padding="sm"
                  shadow={selectedEmployee?.id === employee.id ? "md" : "xs"}
                  withBorder
                  style={{
                    cursor: 'pointer',
                    backgroundColor: selectedEmployee?.id === employee.id ? '#e3f2fd' : 'white'
                  }}
                  onClick={() => setSelectedEmployee(employee)}
                >
                  <Text fw={600} size="sm">{employee.naam_voornaam_werknemer}</Text>
                  <Text size="xs" c="dimmed">{employee.postcode_gemeente_werknemer}</Text>
                </Card>
              ))}
            </Stack>
          </ScrollArea>

          <ScrollArea h="calc(57vh - 100px)" mt="md">
            <Title order={4} mb="md">Templates</Title>
            <Stack gap="md">
              {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
                <div key={category}>
                  <Text size="xs" fw={600} c="dimmed" mb="xs" tt="uppercase">
                    {category}
                  </Text>
                  <Stack gap="xs">
                    {categoryTemplates.map(template => (
                      <Card
                        key={template.id}
                        padding="sm"
                        shadow={selectedTemplate?.id === template.id ? "md" : "xs"}
                        withBorder
                        style={{
                          cursor: 'pointer',
                          backgroundColor: selectedTemplate?.id === template.id ? '#fff3e0' : 'white'
                        }}
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <Group justify="space-between">
                          <Text size="xs" style={{ flex: 1 }}>{template.name}</Text>
                          {template.isPlanning && (
                            <Badge size="xs" color="grape">Planning</Badge>
                          )}
                        </Group>
                      </Card>
                    ))}
                  </Stack>
                </div>
              ))}
            </Stack>
          </ScrollArea>
        </AppShell.Navbar>

        <AppShell.Main>
          {error && (
            <Alert icon={<IconAlertCircle size={16} />} title="Note" color="yellow" mb="md">
              {error}
            </Alert>
          )}

          {!selectedEmployee && !selectedTemplate && (
            <Center h="calc(100vh - 140px)">
              <Stack align="center" gap="md">
                <Title order={2}>👋 Welcome!</Title>
                <Text size="lg" c="dimmed">Select an employee and template to get started</Text>
                <Stack gap="xs" align="flex-start">
                  <Text size="sm">1. Choose an employee from the sidebar</Text>
                  <Text size="sm">2. Select a document template</Text>
                  <Text size="sm">3. Edit and export as PDF</Text>
                </Stack>
              </Stack>
            </Center>
          )}

          {(selectedEmployee || selectedTemplate) && !isLoading && (
            <DocumentEditor
              content={documentContent}
              onChange={setDocumentContent}
            />
          )}

          {isLoading && (
            <Center h="calc(100vh - 140px)">
              <Stack align="center" gap="md">
                <Loader size="xl" />
                <Text>Loading template...</Text>
              </Stack>
            </Center>
          )}
        </AppShell.Main>
      </AppShell>

      <Modal
        opened={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        title="Upload Document Template"
        size="lg"
      >
        <DocumentUpload onUploadSuccess={handleUploadSuccess} />
      </Modal>
    </MantineProvider>
  );
}

// Helper function to create sample template
function createSampleTemplate(employee, template) {
  return `
    <div style="font-family: Calibri, Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 40px;">
        <h2>${employee.bedrijfsnaam}</h2>
      </div>
      
      <h1 style="text-align: center; font-size: 16px; text-transform: uppercase; margin-bottom: 30px;">
        ${template.name}
      </h1>
      
      <p><strong>Between the undersigned parties:</strong></p>
      
      <p>On the one hand: <strong>${employee.bedrijfsnaam}</strong></p>
      <p>Located at: <strong>${employee.adres_bedrijf}, ${employee.postcode_gemeente_bedrijf}</strong></p>
      <p>Recognition number: <strong>${employee.erkenning_nr}</strong></p>
      <p>Represented by: <strong>${employee.request_user}</strong></p>
      <p><em>hereinafter referred to as the employer,</em></p>
      
      <p>And on the other hand:</p>
      <p><strong>${employee.naam_voornaam_werknemer}</strong></p>
      <p>Residing at: <strong>${employee.complete_adres_werknemer}</strong></p>
      <p><em>hereinafter referred to as the employee,</em></p>
      
      <p>The following is agreed:</p>
      
      <p><strong>Article 1 - Employment Details</strong></p>
      <ul>
        <li>Starting hourly wage: €${employee.start_uurloon}</li>
        <li>Current hourly wage: €${employee.huidige_uurloon}</li>
        ${employee.contractual_hours ? `<li>Contractual hours: ${employee.contractual_hours} hours/week</li>` : ''}
      </ul>
      
      <p style="margin-top: 60px;">Drafted in duplicate on <strong>${employee.current_date_time}</strong></p>
      
      <div style="display: flex; justify-content: space-between; margin-top: 80px;">
        <div style="text-align: center;">
          <p>...............................................</p>
          <p><em>(Read and approved)</em></p>
          <p>The employer</p>
        </div>
        
        <div style="text-align: center;">
          <p>...............................................</p>
          <p><em>(Read and approved)</em></p>
          <p>The employee</p>
          <p style="margin-top: 20px;">${employee.naam_voornaam_werknemer}</p>
        </div>
      </div>
    </div>
  `;
}

export default App;
