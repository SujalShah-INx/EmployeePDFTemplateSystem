# Document Upload & Conversion Feature

## Overview
Users can now upload their own document templates (.html, .doc, .docx) which will be converted to HTML and stored for use with employee data.

## How to Use

### 1. Upload Template
- Click the **"Upload Template"** button in the header
- Select a document file (.html, .htm, .doc, .docx)
- Click **"Upload & Convert"**

### 2. Use Uploaded Template
- After successful upload, the template appears in the sidebar under "Uploaded" category
- Select an employee and the uploaded template
- Edit and export as PDF like any other template

## File Format Support

### ✅ HTML Files (.html, .htm)
- **Works immediately** in the browser
- No backend required
- Recommended format

### ⚠️ Word Documents (.doc, .docx)
- **Requires backend API** with Spire.Doc
- See "Backend Setup" section below

## Storage
- Uploaded templates are stored in browser localStorage
- Persists across page refreshes
- Limited to ~5-10MB total storage

## Backend Setup for Word Documents

Since Spire.Doc is a .NET library, you need a backend API. Here are two options:

### Option 1: Node.js Backend (Recommended)

Create a simple Express server:

```bash
# In a new directory
mkdir document-converter-api
cd document-converter-api
npm init -y
npm install express multer mammoth cors
```

Create `server.js`:

```javascript
const express = require('express');
const multer = require('multer');
const mammoth = require('mammoth');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const upload = multer({ dest: 'uploads/' });

app.use(cors());
app.use(express.json());

app.post('/api/convert', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    
    // Convert DOCX to HTML using mammoth
    const result = await mammoth.convertToHtml({ path: filePath });
    const html = result.value;
    
    // Clean up uploaded file
    fs.unlinkSync(filePath);
    
    res.json({
      success: true,
      html: html,
      fileName: req.file.originalname
    });
  } catch (error) {
    console.error('Conversion error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.listen(3001, () => {
  console.log('Document converter API running on http://localhost:3001');
});
```

Run the server:
```bash
node server.js
```

### Option 2: Python Backend with Spire.Doc

```bash
pip install spire.doc Flask flask-cors
```

Create `app.py`:

```python
from flask import Flask, request, jsonify
from flask_cors import CORS
from spire.doc import *
import os

app = Flask(__name__)
CORS(app)

@app.route('/api/convert', methods=['POST'])
def convert_document():
    try:
        file = request.files['file']
        temp_path = f"temp_{file.filename}"
        file.save(temp_path)
        
        # Load document
        document = Document()
        document.LoadFromFile(temp_path)
        
        # Convert to HTML
        html_path = temp_path.replace('.docx', '.html').replace('.doc', '.html')
        document.SaveToFile(html_path, FileFormat.Html)
        
        # Read HTML content
        with open(html_path, 'r', encoding='utf-8') as f:
            html_content = f.read()
        
        # Cleanup
        os.remove(temp_path)
        os.remove(html_path)
        
        return jsonify({
            'success': True,
            'html': html_content,
            'fileName': file.filename
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(port=3001, debug=True)
```

Run:
```bash
python app.py
```

## Update Frontend to Use Backend

Update `DocumentUpload.jsx` to call the API:

```javascript
const convertDocToHtml = async (docFile) => {
  if (docFile.name.endsWith('.html') || docFile.name.endsWith('.htm')) {
    return await docFile.text();
  }
  
  // For Word documents, call backend API
  const formData = new FormData();
  formData.append('file', docFile);
  
  const response = await fetch('http://localhost:3001/api/convert', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    throw new Error('Backend conversion failed');
  }
  
  const data = await response.json();
  
  if (!data.success) {
    throw new Error(data.error || 'Conversion failed');
  }
  
  return data.html;
};
```

## Features

✅ Upload HTML templates directly (no backend needed)
✅ Upload Word documents (requires backend)
✅ Templates stored in localStorage
✅ Auto-categorized as "Uploaded"
✅ Use uploaded templates with employee data
✅ Edit and export to PDF

## Limitations

- localStorage has ~5-10MB limit
- Word conversion requires backend API
- Uploaded templates not shared between browsers/devices
- For production, use a database instead of localStorage
