import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

const RichTextEditor = ({ value, onChange, placeholder = 'Write something...' }) => {
  const editorRef = useRef(null);
  const quillRef = useRef(null);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder,
        modules: {
          toolbar: [
            [{ header: [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ list: 'ordered' }, { list: 'bullet' }],
            ['link', 'clean'],
          ],
        },
      });

      quillRef.current.on('text-change', () => {
        const content = quillRef.current.root.innerHTML;
        if (onChange) {
          onChange(content);
        }
      });
    }

    if (quillRef.current && value !== quillRef.current.root.innerHTML) {
      quillRef.current.root.innerHTML = value || '';
    }
  }, [value, onChange, placeholder]);

  return (
    <div className="rich-text-editor">
      <div ref={editorRef} style={{ height: '200px' }} />
    </div>
  );
};

export default RichTextEditor;
