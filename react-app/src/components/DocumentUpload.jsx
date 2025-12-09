import { useState } from 'react';
import { Group, Button, Text, FileInput, Alert, Loader, Stack } from '@mantine/core';
import { IconUpload, IconFile, IconCheck, IconAlertCircle } from '@tabler/icons-react';
import mammoth from 'mammoth';

function DocumentUpload({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleFileChange = (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    setSuccess(false);
  };

  const convertDocToHtml = async (docFile) => {
    try {
      console.log('Converting file:', docFile.name, 'Type:', docFile.type);
      
      // Check if it's an HTML file - can be processed directly
      if (docFile.name.endsWith('.html') || docFile.name.endsWith('.htm')) {
        const text = await docFile.text();
        return text;
      }
      
      // For Word documents (.docx), use mammoth for browser-based conversion
      if (docFile.name.endsWith('.docx')) {
        console.log('Converting DOCX file using mammoth...');
        
        const arrayBuffer = await docFile.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer: arrayBuffer });
        
        console.log('Conversion successful!');
        console.log('HTML length:', result.value.length);
        
        if (result.messages && result.messages.length > 0) {
          console.log('Conversion messages:', result.messages);
        }
        
        return result.value;
      }
      
      // For .doc files (older format)
      if (docFile.name.endsWith('.doc')) {
        throw new Error(
          'Old .doc format is not supported. Please save your document as .docx or .html:\n' +
          '1. Open in Word\n' +
          '2. File → Save As → Choose "Word Document (.docx)" or "Web Page (.html)"\n' +
          '3. Upload the new file'
        );
      }
      
      // For other formats, try reading as text
      const text = await docFile.text();
      if (text && text.length > 0) {
        return `
          <div style="font-family: Calibri, Arial, sans-serif; padding: 20px;">
            <h2>Uploaded Document: ${docFile.name}</h2>
            <div style="white-space: pre-wrap;">${text}</div>
          </div>
        `;
      }
      
      throw new Error('Unable to read file content');
      
    } catch (err) {
      console.error('Conversion error:', err);
      throw err;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      console.log('Converting document to HTML:', file.name);
      const htmlContent = await convertDocToHtml(file);
      
      console.log('Conversion successful, HTML length:', htmlContent.length);
      
      // Generate filename for the HTML file
      const htmlFileName = file.name.replace(/\.(docx?|html?)$/i, '') + '.html';
      
      // Save to localStorage for the session
      const templateName = file.name.replace(/\.[^/.]+$/, '');
      const savedTemplates = JSON.parse(localStorage.getItem('uploadedTemplates') || '{}');
      savedTemplates[templateName] = {
        name: templateName,
        fileName: htmlFileName,
        htmlContent: htmlContent,
        uploadedAt: new Date().toISOString(),
        originalFileName: file.name
      };
      localStorage.setItem('uploadedTemplates', JSON.stringify(savedTemplates));
      
      // Create a download link to save the HTML file to public/templates
      // Note: Browser can't directly write to filesystem, so we trigger a download
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = htmlFileName;
      a.style.display = 'none';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      console.log(`HTML file "${htmlFileName}" downloaded. Please move it to public/templates/ folder.`);
      
      setSuccess(true);
      setError(
        `HTML file "${htmlFileName}" has been downloaded. ` +
        `Please move it to the "public/templates/" folder to use it with all employees.`
      );
      
      // Pass the HTML content to parent component for immediate use
      if (onUploadSuccess) {
        onUploadSuccess({
          name: templateName,
          fileName: htmlFileName,
          htmlContent: htmlContent
        });
      }
      
    } catch (err) {
      console.error('Upload/conversion error:', err);
      setError(err.message || 'Failed to process document');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Stack gap="sm">
      <FileInput
        label="Upload Document Template"
        description="Upload DOCX or HTML files - will be converted to HTML automatically"
        placeholder="Click to select file"
        value={file}
        onChange={handleFileChange}
        accept=".html,.htm,.docx"
        leftSection={<IconFile size={18} />}
        disabled={isProcessing}
      />

      <Group gap="xs">
        <Button
          leftSection={isProcessing ? <Loader size={18} color="white" /> : <IconUpload size={18} />}
          onClick={handleUpload}
          disabled={!file || isProcessing}
          loading={isProcessing}
        >
          {isProcessing ? 'Converting...' : 'Upload & Convert'}
        </Button>
        
        {file && !isProcessing && (
          <Text size="sm" c="dimmed">
            Selected: {file.name}
          </Text>
        )}
      </Group>

      {error && (
        <Alert icon={<IconAlertCircle size={16} />} title="Note" color="blue">
          {error}
        </Alert>
      )}

      {success && (
        <Alert icon={<IconCheck size={16} />} title="Success!" color="green">
          Document converted to HTML successfully! You can now use it with employee data.
        </Alert>
      )}

      <Text size="xs" c="dimmed">
        <strong>How it works:</strong>
        <br />
        1. Upload a .docx or .html file
        <br />
        2. File is automatically converted to HTML
        <br />
        3. HTML file downloads - move it to public/templates/ folder for permanent use
        <br />
        4. Template is ready to use immediately with employee placeholders
      </Text>
    </Stack>
  );
}

export default DocumentUpload;
