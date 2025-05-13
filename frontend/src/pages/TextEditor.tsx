import './styles.css';
import { BubbleMenu, EditorContent, FloatingMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import React, { useEffect, useRef, useState } from 'react';

export default function Tiptap({ onChange,preview }: { onChange: (content: string) => void ,preview:(url:string|null)=>void}) {
  const [height, setHeight] = useState('auto');
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lineHeight = 24; // 

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Click to get started...',
      }),
    ],
    content: ``,
    editable: true,
    onUpdate: ({ editor }) => {
      adjustHeight();
      onChange(editor.getHTML());
    },
  });

  useEffect(() => {
    if (editor) {
      editor.setEditable(true);
      adjustHeight(); 
    }
  }, [editor]);

  function adjustHeight() {
    if (!editorRef.current) return;

    const computedHeight = editorRef.current.scrollHeight;
    const lines = Math.ceil(computedHeight / lineHeight);
    setHeight(`${lines * lineHeight}px`);
  }

  if (!editor) return null;

  return (
    <div className={`p-4 rounded-lg text-white w-auto ${preview&&preview.length>0?"mt-[100px]":""}`}>
      {/* Bubble Menu */}
      {editor && (
        <BubbleMenu className="bubble-menu bg-white text-black p-2 rounded shadow-md" tippyOptions={{ duration: 100 }} editor={editor}>
          <button onClick={() => editor.chain().focus().toggleBold().run()} className={editor.isActive('bold') ? 'text-blue-400' : ''}>
            Bold
          </button>
          <button onClick={() => editor.chain().focus().toggleItalic().run()} className={editor.isActive('italic') ? 'text-blue-400' : ''}>
            Italic
          </button>
          <button onClick={() => editor.chain().focus().toggleStrike().run()} className={editor.isActive('strike') ? 'text-blue-400' : ''}>
            Strike
          </button>
        </BubbleMenu>
      )}

      {/* Floating Menu */}
      {editor && (
        <FloatingMenu
  className="floating-menu bg-white text-black rounded shadow-md p-2 w-64"
  tippyOptions={{ duration: 100 }}
  editor={editor}
>
  <button
    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
    className={`flex flex-col text-left p-2 hover:bg-gray-100 rounded ${
      editor.isActive('heading', { level: 1 }) ? 'text-blue-600 font-semibold' : ''
    } border-b border-gray-300`}
  >
    <span className="font-semibold">H1</span>
    <span className="text-sm text-slate-600">Big Heading</span>
  </button>

  <button
    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
    className={`flex flex-col text-left p-2 hover:bg-gray-100 rounded ${
      editor.isActive('heading', { level: 2 }) ? 'text-blue-600 font-semibold' : ''
    } border-b border-gray-300`}
  >
    <span className="font-semibold">H2</span>
    <span className="text-sm text-slate-600">Medium Heading</span>
  </button>

  <button
    onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
    className={`flex flex-col text-left p-2 hover:bg-gray-100 rounded ${
      editor.isActive('heading', { level: 3 }) ? 'text-blue-600 font-semibold' : ''
    } border-b border-gray-300`}
  >
    <span className="font-semibold">H3</span>
    <span className="text-sm text-slate-600">Small Heading</span>
  </button>

  <button
    onClick={() => editor.chain().focus().toggleBulletList().run()}
    className={`flex flex-col text-left p-2 hover:bg-gray-100 rounded ${
      editor.isActive('bulletList') ? 'text-blue-600 font-semibold' : ''
    } border-b border-gray-300`}
  >
    <span className="font-semibold">Bullet List</span>
    <span className="text-sm text-slate-600">Create simple bullet list</span>
  </button>

  <button
    onClick={() => editor.chain().focus().toggleCodeBlock().run()}
    className={`flex flex-col text-left p-2 hover:bg-gray-100 rounded ${
      editor.isActive('codeBlock') ? 'text-blue-600 font-semibold' : ''
    } border-b border-gray-300`}
  >
    <span className="font-semibold">Code Block</span>
    <span className="text-sm text-slate-600">Manual code block</span>
  </button>

  <button
    onClick={() => editor.chain().focus().toggleBlockquote().run()}
    className={`flex flex-col text-left p-2 hover:bg-gray-100 rounded ${
      editor.isActive('blockquote') ? 'text-blue-600 font-semibold' : ''
    }`}
  >
    <span className="font-semibold">Blockquote</span>
    <span className="text-sm text-slate-600">For quotes</span>
  </button>
</FloatingMenu>

      )}

      {/* Editor */}
      <div className="w-full ">
        <EditorContent
          editor={editor}
          ref={editorRef}
          className="w-full overflow-hidden resize-none ml-[-50px]"
          style={{ height, lineHeight: `${lineHeight}px` }}
        />
      </div>
    </div>
  );
}
