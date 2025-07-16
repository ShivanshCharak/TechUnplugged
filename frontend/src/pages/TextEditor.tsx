import { BubbleMenu, EditorContent, FloatingMenu, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import  './styles.css'



export default function Tiptap({ onChange}: { onChange: (content: string) => void}) {
  const [height, setHeight] = useState('auto');
  const [isLoading, setIsLoading] = useState(true);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lineHeight = 28;

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Placeholder.configure({
        placeholder: ({ node }) => {
          if (node.type.name === 'heading') {
            return `What's the heading?`;
          }
          return 'Start writing your story...';
        },
        includeChildren: true,
      }),
    ],
    content: ``,
    editable: true,
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none focus:outline-none tiptap',
      },
    },
    onUpdate: ({ editor }) => {
      adjustHeight();
      onChange(editor.getHTML());
    },
    onCreate: () => {
      setIsLoading(false);
    },
  });

  const adjustHeight = useCallback(() => {
    if (!editorRef.current) return;

    const computedHeight = editorRef.current.scrollHeight;
    const lines = Math.ceil(computedHeight / lineHeight);
    setHeight(`${Math.max(lines * lineHeight, 100)}px`);
  }, [lineHeight]);

  useEffect(() => {
    if (editor && !isLoading) {
      editor.setEditable(true);
      adjustHeight();
    }
  }, [editor, isLoading, adjustHeight]);

  if (isLoading || !editor) {
    return (
      <div className="editor-container">
        <div className="w-full h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="editor-container">
        {/* Enhanced Bubble Menu */}
        {editor && (
          <BubbleMenu 
            className="bubble-menu" 
            tippyOptions={{ duration: 200, animation: 'shift-away' }} 
            editor={editor}
          >
            <button 
              onClick={() => editor.chain().focus().toggleBold().run()} 
              className={editor.isActive('bold') ? 'is-active' : ''}
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button 
              onClick={() => editor.chain().focus().toggleItalic().run()} 
              className={editor.isActive('italic') ? 'is-active' : ''}
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button 
              onClick={() => editor.chain().focus().toggleStrike().run()} 
              className={editor.isActive('strike') ? 'is-active' : ''}
              title="Strikethrough"
            >
              <s>S</s>
            </button>
            <button 
              onClick={() => editor.chain().focus().toggleCode().run()} 
              className={editor.isActive('code') ? 'is-active' : ''}
              title="Inline Code"
            >
              &lt;/&gt;
            </button>
          </BubbleMenu>
        )}

        {/* Enhanced Floating Menu */}
        {editor && (
          <FloatingMenu
            className="floating-menu"
            tippyOptions={{ duration: 200, animation: 'shift-away' }}
            editor={editor}
          >
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={editor.isActive('heading', { level: 1 }) ? 'is-active' : ''}
            >
              <span className="font-semibold">Heading 1</span>
              <span className="text-sm">Big section heading</span>
            </button>

            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={editor.isActive('heading', { level: 2 }) ? 'is-active' : ''}
            >
              <span className="font-semibold">Heading 2</span>
              <span className="text-sm">Medium section heading</span>
            </button>

            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={editor.isActive('heading', { level: 3 }) ? 'is-active' : ''}
            >
              <span className="font-semibold">Heading 3</span>
              <span className="text-sm">Small section heading</span>
            </button>

            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={editor.isActive('bulletList') ? 'is-active' : ''}
            >
              <span className="font-semibold">• Bullet List</span>
              <span className="text-sm">Create a simple bullet list</span>
            </button>

            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={editor.isActive('orderedList') ? 'is-active' : ''}
            >
              <span className="font-semibold">1. Numbered List</span>
              <span className="text-sm">Create a numbered list</span>
            </button>

            <button
              onClick={() => editor.chain().focus().toggleCodeBlock().run()}
              className={editor.isActive('codeBlock') ? 'is-active' : ''}
            >
              <span className="font-semibold">Code Block</span>
              <span className="text-sm">Insert a code block</span>
            </button>

            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={editor.isActive('blockquote') ? 'is-active' : ''}
            >
              <span className="font-semibold">Quote</span>
              <span className="text-sm">Insert a blockquote</span>
            </button>

            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
            >
              <span className="font-semibold">Divider</span>
              <span className="text-sm">Insert a horizontal rule</span>
            </button>
          </FloatingMenu>
        )}

        {/* Enhanced Editor */}
        <div className="w-full" style={{ minHeight: height }}>
          <EditorContent
            editor={editor}
            ref={editorRef}
            className="w-full"
            style={{ 
              minHeight: height,
              lineHeight: `${lineHeight}px`,
            }}
          />
        </div>
      </div>
    </>
  );
}