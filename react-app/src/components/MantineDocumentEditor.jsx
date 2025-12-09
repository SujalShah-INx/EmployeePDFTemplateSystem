import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import { RichTextEditor } from '@mantine/tiptap';
import { useEffect } from 'react';

function DocumentEditor({ content, onChange }) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
    ],
    content: '', // Start with empty content
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      if (onChange) {
        onChange(html);
      }
    },
  });

  // Update editor content when content prop changes
  useEffect(() => {
    if (editor && content) {
      // Check if content is valid HTML/text
      const isValidContent = typeof content === 'string' && 
                            content.length > 0 && 
                            !content.includes('\ufffd') && // Check for replacement character
                            !/[\x00-\x08\x0B\x0C\x0E-\x1F]/.test(content); // Check for control characters
      
      if (isValidContent && editor.getHTML() !== content) {
        try {
          editor.commands.setContent(content, false);
        } catch (error) {
          console.error('Error setting editor content:', error);
          // If content is invalid, set a clean error message
          editor.commands.setContent('<p>Error: Unable to display this content. The template may be corrupted or in an unsupported format.</p>');
        }
      } else if (!isValidContent && content.length > 0) {
        console.warn('Invalid content detected, displaying error message');
        editor.commands.setContent('<p><strong>Error:</strong> The content appears to be corrupted or in binary format. Please upload an HTML file or ensure the template is properly formatted.</p>');
      }
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  return (
    <RichTextEditor editor={editor} style={{ height: '88vh', display: 'flex', flexDirection: 'column' }}>
      <RichTextEditor.Toolbar sticky stickyOffset={0}>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
          <RichTextEditor.Strikethrough />
          <RichTextEditor.ClearFormatting />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.H1 />
          <RichTextEditor.H2 />
          <RichTextEditor.H3 />
          <RichTextEditor.H4 />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Blockquote />
          <RichTextEditor.Hr />
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Link />
          <RichTextEditor.Unlink />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignJustify />
          <RichTextEditor.AlignRight />
        </RichTextEditor.ControlsGroup>

        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Undo />
          <RichTextEditor.Redo />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>

      <RichTextEditor.Content style={{ flex: 1, overflow: 'auto' }} />
    </RichTextEditor>
  );
}

export default DocumentEditor;
