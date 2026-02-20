import React, { useEffect, useRef } from 'react';

const QUILL_COLOR_OPTIONS: Array<string | false> = [
  false,
  '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff',
  '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff',
  '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff',
  '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2',
  '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466'
];

const QUILL_BACKGROUND_OPTIONS: Array<string | false> = [
  false,
  '#000000', '#e60000', '#ff9900', '#ffff00', '#008a00', '#0066cc', '#9933ff',
  '#ffffff', '#facccc', '#ffebcc', '#ffffcc', '#cce8cc', '#cce0f5', '#ebd6ff',
  '#bbbbbb', '#f06666', '#ffc266', '#ffff66', '#66b966', '#66a3e0', '#c285ff',
  '#888888', '#a10000', '#b26b00', '#b2b200', '#006100', '#0047b2', '#6b24b2',
  '#444444', '#5c0000', '#663d00', '#666600', '#003700', '#002966', '#3d1466'
];

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

// Access the global Quill object from CDN
declare const Quill: any;

export const Editor: React.FC<EditorProps> = ({ value, onChange, placeholder, className = '' }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillInstance = useRef<any>(null);
  const lastSelectionRef = useRef<{ index: number; length: number } | null>(null);

  useEffect(() => {
    if (editorRef.current && !quillInstance.current) {
      // Initialize Quill
      quillInstance.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder: placeholder || 'Start typing...',
        modules: {
          toolbar: [
            [{ 'header': [1, 2, 3, false] }],
            ['bold', 'italic', 'underline', 'strike'],
            [{ 'color': QUILL_COLOR_OPTIONS }, { 'background': QUILL_BACKGROUND_OPTIONS }],
            [{ 'align': [] }],
            [{ 'list': 'ordered'}, { 'list': 'bullet' }],
            ['link', 'blockquote', 'code-block'],
            ['clean']
          ]
        }
      });

      const updateColorIndicators = () => {
        const toolbar = quillInstance.current.getModule('toolbar')?.container as HTMLElement | undefined;
        if (!toolbar) return;

        const range = quillInstance.current.getSelection(false);
        if (!range) return;
        const formats = quillInstance.current.getFormat(range);

        const colorLabel = toolbar.querySelector('.ql-color .ql-picker-label') as HTMLElement | null;
        const backgroundLabel = toolbar.querySelector('.ql-background .ql-picker-label') as HTMLElement | null;

        if (colorLabel) {
          if (formats.color) {
            colorLabel.style.boxShadow = `inset 0 -3px 0 0 ${formats.color}`;
          } else {
            colorLabel.style.boxShadow = '';
          }
        }

        if (backgroundLabel) {
          if (formats.background) {
            backgroundLabel.style.boxShadow = `inset 0 -3px 0 0 ${formats.background}`;
          } else {
            backgroundLabel.style.boxShadow = '';
          }
        }
      };

      const keepMobileEditorFocus = () => {
        if (!window.matchMedia('(max-width: 768px)').matches) return;
        requestAnimationFrame(() => {
          const selection = lastSelectionRef.current;
          quillInstance.current.focus();
          if (selection) {
            quillInstance.current.setSelection(selection.index, selection.length, 'silent');
          }
        });
      };

      const toolbar = quillInstance.current.getModule('toolbar')?.container as HTMLElement | undefined;
      const handleToolbarPointerDown = (event: Event) => {
        const target = event.target as HTMLElement | null;
        const control = target?.closest('button, .ql-picker-item');
        if (!control) return;

        if (event.cancelable) {
          event.preventDefault();
        }

        keepMobileEditorFocus();
      };

      const handleToolbarClick = (event: Event) => {
        const target = event.target as HTMLElement | null;
        const control = target?.closest('button, .ql-picker-item');
        if (!control) return;
        keepMobileEditorFocus();
      };

      toolbar?.addEventListener('mousedown', handleToolbarPointerDown);
      toolbar?.addEventListener('touchstart', handleToolbarPointerDown, { passive: false });
      toolbar?.addEventListener('click', handleToolbarClick);

      // Handle changes
      quillInstance.current.on('text-change', () => {
        const html = quillInstance.current.root.innerHTML;
        onChange(html === '<p><br></p>' ? '' : html);
        updateColorIndicators();
      });

      quillInstance.current.on('selection-change', (range: { index: number; length: number } | null) => {
        if (range) {
          lastSelectionRef.current = range;
        }
        updateColorIndicators();
      });
      
      // Initial value
      if (value) {
         quillInstance.current.root.innerHTML = value;
      }

      return () => {
        toolbar?.removeEventListener('mousedown', handleToolbarPointerDown);
        toolbar?.removeEventListener('touchstart', handleToolbarPointerDown);
        toolbar?.removeEventListener('click', handleToolbarClick);
      };
    }
  }, []);

  return <div className={`prose prose-zinc max-w-none ${className}`}><div ref={editorRef} /></div>;
};