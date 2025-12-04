import { useRef, useEffect, useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './DocumentEditor.css';

function DocumentEditor({ content, onChange, readOnly = false }) {
  const quillRef = useRef(null);
  const [editorContent, setEditorContent] = useState('');
  const [isReady, setIsReady] = useState(false);

  const modules = {
    toolbar: !readOnly ? [
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'font': [] }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'align': [] }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      ['clean']
    ] : false
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike',
    'color', 'background',
    'script',
    'list', 'bullet', 'indent',
    'align',
    'blockquote', 'code-block',
    'link', 'image'
  ];

  // Initialize editor
  useEffect(() => {
    setIsReady(true);
  }, []);

  // Update editor content when content prop changes
  useEffect(() => {
    if (!content) {
      setEditorContent('');
      return;
    }

    try {
      if (content !== editorContent) {
        setEditorContent(content);
        
        // Force Quill to update with the new HTML content
        if (quillRef.current && isReady) {
          const editor = quillRef.current.getEditor();
          
          // Set the HTML content directly using clipboard API
          const delta = editor.clipboard.convert(content);
          editor.setContents(delta, 'silent');
        }
      }
    } catch (error) {
      console.error('Error setting editor content:', error);
      setEditorContent(content);
    }
  }, [content, isReady]);

  const handleChange = (value, delta, source, editor) => {
    try {
      const html = editor.getHTML();
      setEditorContent(html);
      
      if (onChange) {
        onChange(html);
      }
    } catch (error) {
      console.error('Error handling change:', error);
    }
  };

  if (!isReady) {
    return (
      <div className="document-editor">
        <div className="loading-editor">Loading editor...</div>
      </div>
    );
  }

  return (
    <div className="document-editor">
      <ReactQuill
        ref={quillRef}
        theme="snow"
        
        value={editorContent}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        readOnly={readOnly}
        placeholder="Select an employee and template to get started..."
      />
    </div>
  );
}

export default DocumentEditor;
