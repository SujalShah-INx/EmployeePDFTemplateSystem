# Employee PDF Template System

A complete React-based document template system for generating employee PDF documents with WYSIWYG editing capabilities.

## 🎯 Features

- **Employee Management**: Select from a list of employees with their complete data
- **Template Selection**: Choose from 12+ document templates organized by category
- **Auto-Population**: Automatically fills templates with employee data using `{{placeholder}}` syntax
- **WYSIWYG Editor**: Full-featured rich text editor powered by React Quill
- **Real-time Editing**: Modify any part of the document before export
- **PDF Export**: High-quality PDF generation with preserved styling
- **Print Support**: Direct printing capability
- **Responsive UI**: Clean, modern interface with sidebar navigation

## 📋 Requirements

- Node.js 16+ and npm 7+
- Modern web browser (Chrome, Firefox, Safari, Edge)

## 🚀 Quick Start

### 1. Installation

```bash
cd react-app
npm install
```

### 2. Setup Template Files

Copy your HTML template files to the `public/templates` directory:

```bash
# Create the templates directory
mkdir -p public/templates

# Copy your HTML templates from the parent directory
cp ../*.html public/templates/
```

### 3. Run Development Server

```bash
npm run dev
```

The application will open at `http://localhost:3000`

## 📁 Project Structure

```
react-app/
├── public/
│   └── templates/          # HTML template files go here
├── src/
│   ├── components/         # React components
│   │   ├── DocumentEditor.jsx
│   │   ├── EmployeeList.jsx
│   │   ├── TemplateList.jsx
│   │   ├── Toolbar.jsx
│   │   └── Sidebar.jsx
│   ├── data/              # JSON data files
│   │   ├── employees.json
│   │   └── templates.json
│   ├── utils/             # Utility functions
│   │   ├── templateProcessor.js
│   │   └── pdfExport.js
│   ├── App.jsx            # Main application
│   └── main.jsx           # Entry point
├── package.json
└── vite.config.js
```

## 🔧 Configuration

### Adding Employees

Edit `src/data/employees.json`:

```json
[
  {
    "id": 1,
    "naam_voornaam_werknemer": "John Doe",
    "bedrijfsnaam": "Company Name",
    "adres_bedrijf": "Street 123",
    "postcode_gemeente_bedrijf": "1000 Brussels",
    // ... other fields
  }
]
```

### Adding Templates

1. Add the HTML file to `public/templates/`
2. Register it in `src/data/templates.json`:

```json
[
  {
    "id": 15,
    "name": "New Template Name",
    "fileName": "new-template.html",
    "isPlanning": false,
    "category": "Category Name"
  }
]
```

## 🎨 Template Syntax

### Placeholders

Use double curly braces for variable replacement:

```html
<p>Employee: {{naam_voornaam_werknemer}}</p>
<p>Address: {{complete_adres_werknemer}}</p>
<p>Hourly wage: €{{huidige_uurloon}}</p>
```

### HTML Content

For HTML content like images or dropdowns, use the `|safe` filter:

```html
<div>{{company_logo_image_tag|safe}}</div>
<select>{{morning_hour_options|safe}}</select>
```

### Available Variables

**Company Fields:**
- `bedrijfsnaam` - Company name
- `adres_bedrijf` - Company address
- `gemeente_bedrijf` - Company city
- `postcode_gemeente_bedrijf` - Postal code + city
- `erkenning_nr` - Recognition number
- `company_logo_image_tag` - Logo HTML

**Employee Fields:**
- `naam_voornaam_werknemer` - Full name
- `volledig_adres_werknemer` - Street address
- `complete_adres_werknemer` - Complete address
- `postcode_gemeente_werknemer` - Postal code + city
- `start_uurloon` - Starting hourly wage
- `huidige_uurloon` - Current hourly wage

**Date Fields:**
- `current_date` - Current date (DD/MM/YYYY)
- `current_date_time` - Current date (Dutch format)
- `van_date` - Start date
- `request_user` - User who generated document

**Planning Fields** (for planning templates only):
- `contractual_hours` - Hours per week
- `weekly_hour_difference` - Hour difference
- `e_mo_morn_start`, `e_mo_morn_end` - Even week, Monday morning
- `e_mo_eve_start`, `e_mo_eve_end` - Even week, Monday evening
- And similar for: `tu`, `we`, `th`, `fr`, `sa`, `su`
- `o_*` fields for odd weeks

## 🖨️ Using the Application

### Step 1: Select an Employee
- Click on an employee from the left sidebar
- Employee details will be highlighted when selected

### Step 2: Choose a Template
- Select a document template from the template list
- Templates are grouped by category
- Planning templates are marked with a badge

### Step 3: Edit the Document
- The template will auto-populate with employee data
- Use the rich text editor toolbar to make changes
- Format text, add images, adjust styling as needed

### Step 4: Export or Print
- Click **Export PDF** to download the document
- Click **Print** to open the print dialog
- The filename will automatically include employee name and template

## 📦 Building for Production

```bash
# Build the application
npm run build

# Preview the production build
npm run preview
```

The build output will be in the `dist/` directory.

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Adding New Features

**Add a new component:**
```bash
# Create component file
touch src/components/NewComponent.jsx
touch src/components/NewComponent.css
```

**Add new utility function:**
```bash
touch src/utils/newUtility.js
```

## 🔍 Troubleshooting

### Templates not loading
- Ensure HTML files are in `public/templates/`
- Check that filenames in `templates.json` match exactly
- Verify the development server is running

### PDF export issues
- Check browser console for errors
- Ensure html2pdf.js is installed: `npm list html2pdf.js`
- Try updating: `npm update html2pdf.js`

### Styling not preserved in PDF
- Make sure styles are inline or in `<style>` tags within the HTML
- Avoid external CSS files for PDF export
- Use standard CSS properties supported by html2canvas

### Employee data not showing
- Verify placeholder syntax: `{{variableName}}`
- Check that the field exists in `employees.json`
- Use browser DevTools to inspect the populated HTML

## 📝 Template Development Tips

1. **Use Inline Styles**: For better PDF rendering, use inline styles
2. **Test Placeholders**: Use descriptive placeholder names
3. **Keep it Simple**: Avoid complex CSS that might not render well in PDF
4. **Standard Fonts**: Use web-safe fonts (Arial, Calibri, Times New Roman)
5. **Page Breaks**: Use `page-break-after: always` for multi-page documents

## 🔐 Security Notes

- HTML content is sanitized before rendering
- User input is escaped to prevent XSS attacks
- Use the `|safe` filter only for trusted content

## 📄 License

This project is provided as-is for internal use.

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section above
2. Review the browser console for errors
3. Ensure all dependencies are installed correctly

## 🎓 Learning Resources

- [React Documentation](https://react.dev/)
- [Vite Guide](https://vitejs.dev/guide/)
- [React Quill](https://github.com/zenoamaro/react-quill)
- [html2pdf.js](https://github.com/eKoopmans/html2pdf.js)

---

**Built with React + Vite + React Quill + html2pdf.js**
