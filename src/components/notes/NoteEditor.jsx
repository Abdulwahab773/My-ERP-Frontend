import { useCallback, useEffect, useRef } from 'react';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Highlight } from '@tiptap/extension-highlight';
import { Placeholder } from '@tiptap/extension-placeholder';
import { TableKit } from '@tiptap/extension-table';
import { TaskItem } from '@tiptap/extension-task-item';
import { TaskList } from '@tiptap/extension-task-list';
import { TextAlign } from '@tiptap/extension-text-align';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import { clsx } from '../../utils/format';

const COLORS = ['#1a1916', '#1f6b5c', '#b54708', '#b42318', '#175cd3', '#7c3aed'];
const HIGHLIGHTS = ['#fef08a', '#bbf7d0', '#bae6fd', '#fecaca', '#e9d5ff'];

function ToolbarButton({ active, disabled, onClick, label, children }) {
  return (
    <button
      type="button"
      className={clsx('rte-btn', active && 'is-active')}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }) {
  const promptLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes('link').href || '';
    const href = window.prompt('Link URL', previous);
    if (href === null) return;
    if (!href) {
      editor.chain().focus().unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
  }, [editor]);

  if (!editor) return null;

  return (
    <div className="rte-toolbar" role="toolbar" aria-label="Text formatting">
      <ToolbarButton label="Undo" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
        ↶
      </ToolbarButton>
      <ToolbarButton label="Redo" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
        ↷
      </ToolbarButton>
      <span className="rte-sep" />
      <ToolbarButton label="Heading 1" active={editor.isActive('heading', { level: 1 })} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
        H1
      </ToolbarButton>
      <ToolbarButton label="Heading 2" active={editor.isActive('heading', { level: 2 })} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
        H2
      </ToolbarButton>
      <ToolbarButton label="Heading 3" active={editor.isActive('heading', { level: 3 })} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}>
        H3
      </ToolbarButton>
      <span className="rte-sep" />
      <ToolbarButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
        <strong>B</strong>
      </ToolbarButton>
      <ToolbarButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
        <em>I</em>
      </ToolbarButton>
      <ToolbarButton label="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()}>
        <u>U</u>
      </ToolbarButton>
      <ToolbarButton label="Strikethrough" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
        <s>S</s>
      </ToolbarButton>
      <ToolbarButton label="Inline code" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
        {'</>'}
      </ToolbarButton>
      <span className="rte-sep" />
      {COLORS.map((color) => (
        <button
          key={color}
          type="button"
          className={clsx('rte-swatch', editor.isActive('textStyle', { color }) && 'is-active')}
          style={{ background: color }}
          aria-label={`Text color ${color}`}
          onClick={() => editor.chain().focus().setColor(color).run()}
        />
      ))}
      {HIGHLIGHTS.map((color) => (
        <button
          key={color}
          type="button"
          className={clsx('rte-swatch is-highlight', editor.isActive('highlight', { color }) && 'is-active')}
          style={{ background: color }}
          aria-label={`Highlight ${color}`}
          onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
        />
      ))}
      <span className="rte-sep" />
      <ToolbarButton label="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
        •
      </ToolbarButton>
      <ToolbarButton label="Numbered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
        1.
      </ToolbarButton>
      <ToolbarButton label="Checklist" active={editor.isActive('taskList')} onClick={() => editor.chain().focus().toggleTaskList().run()}>
        ☑
      </ToolbarButton>
      <ToolbarButton label="Quote" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
        “
      </ToolbarButton>
      <ToolbarButton label="Code block" active={editor.isActive('codeBlock')} onClick={() => editor.chain().focus().toggleCodeBlock().run()}>
        {'{ }'}
      </ToolbarButton>
      <ToolbarButton label="Divider" onClick={() => editor.chain().focus().setHorizontalRule().run()}>
        ―
      </ToolbarButton>
      <ToolbarButton label="Link" active={editor.isActive('link')} onClick={promptLink}>
        ↗
      </ToolbarButton>
      <ToolbarButton label="Insert table" onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}>
        ⊞
      </ToolbarButton>
      <span className="rte-sep" />
      <ToolbarButton label="Align left" active={editor.isActive({ textAlign: 'left' })} onClick={() => editor.chain().focus().setTextAlign('left').run()}>
        ⬅
      </ToolbarButton>
      <ToolbarButton label="Align center" active={editor.isActive({ textAlign: 'center' })} onClick={() => editor.chain().focus().setTextAlign('center').run()}>
        ↔
      </ToolbarButton>
      <ToolbarButton label="Align right" active={editor.isActive({ textAlign: 'right' })} onClick={() => editor.chain().focus().setTextAlign('right').run()}>
        ➡
      </ToolbarButton>
    </div>
  );
}

export function NoteEditor({ noteId, body, onChange, placeholder = 'Start writing…' }) {
  const emitted = useRef(body || '');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true },
      }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Placeholder.configure({ placeholder }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TableKit.configure({ table: { resizable: true } }),
    ],
    content: body || '',
    immediatelyRender: false,
    shouldRerenderOnTransaction: true,
    editorProps: {
      attributes: {
        class: 'rte-content',
        spellcheck: 'true',
      },
    },
    onUpdate({ editor: instance }) {
      const html = instance.getHTML();
      emitted.current = html;
      onChange?.(html, instance.getText());
    },
  }, [noteId]);

  useEffect(() => {
    if (!editor) return;
    const incoming = body || '';
    if (incoming !== emitted.current && incoming !== editor.getHTML()) {
      editor.commands.setContent(incoming, false);
      emitted.current = incoming;
    }
  }, [body, editor, noteId]);

  return (
    <div className="rte">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}
