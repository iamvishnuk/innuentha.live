'use client';

import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { cn } from '@innuentha/ui/lib/utils';

type Props = {
  value: string | undefined;
  onChange: (value?: string) => void;
  placeholder?: string;
  className?: string;
};

export default function TextEditor({
  value = '',
  onChange,
  className,
  placeholder = 'Start writing...'
}: Props) {
  const editorRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);

  useEffect(() => {
    if (editorRef.current && !quillRef.current) {
      quillRef.current = new Quill(editorRef.current, {
        theme: 'snow',
        placeholder,
        modules: {
          toolbar: {
            container: [
              [{ font: [] }, { size: ['small', false, 'large', 'huge'] }],
              [{ header: [1, 2, 3, 4, 5, 6, false] }],
              [
                'bold',
                'italic',
                'underline',
                'strike',
                'blockquote',
                'code-block'
              ],
              [
                { list: 'ordered' },
                { list: 'bullet' },
                { indent: '-1' },
                { indent: '+1' }
              ],
              [{ align: [] }],
              [{ color: [] }, { background: [] }],
              ['link', 'image', 'video'],
              [{ script: 'sub' }, { script: 'super' }],
              [{ direction: 'rtl' }],
              ['clean']
            ]
          }
        }
      });

      quillRef.current.root.innerHTML = value;

      quillRef.current.on('text-change', () => {
        const htmlContent = quillRef?.current?.root.innerHTML;
        onChange?.(htmlContent);
      });
    }
  }, []);

  return (
    <div>
      <div
        ref={editorRef}
        className={cn(className, 'h-60!')}
      />
    </div>
  );
}
