import './TemplateList.css';

function TemplateList({ templates, selectedTemplate, onSelectTemplate }) {
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
    <div className="template-list">
      <h3>Document Templates</h3>
      <div className="template-list-items">
        {Object.entries(groupedTemplates).map(([category, categoryTemplates]) => (
          <div key={category} className="template-category">
            <div className="category-title">{category}</div>
            {categoryTemplates.map(template => (
              <div
                key={template.id}
                className={`template-item ${selectedTemplate?.id === template.id ? 'selected' : ''}`}
                onClick={() => onSelectTemplate(template)}
              >
                <div className="template-name">{template.name}</div>
                {template.isPlanning && (
                  <span className="template-badge">Planning</span>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default TemplateList;
