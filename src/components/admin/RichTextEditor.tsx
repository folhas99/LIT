"use client";

import { useEditor, EditorContent, Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import { useEffect, useCallback } from "react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Link as LinkIcon,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  label?: string;
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  minHeight?: number;
};

export default function RichTextEditor({
  label,
  value,
  onChange,
  placeholder = "Escreve aqui...",
  minHeight = 180,
}: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-neon-green underline", rel: "noopener noreferrer" },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-invert prose-sm max-w-none focus:outline-none px-4 py-3 text-white leading-relaxed",
        style: `min-height:${minHeight}px`,
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      // Treat empty paragraphs as empty string
      onChange(html === "<p></p>" ? "" : html);
    },
  });

  // Sync external value changes (e.g. when switching sections)
  useEffect(() => {
    if (!editor) return;
    const current = editor.getHTML();
    const incoming = value || "";
    if (incoming !== current && !(incoming === "" && current === "<p></p>")) {
      editor.commands.setContent(incoming, { emitUpdate: false });
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="bg-jungle-900 border border-jungle-700/50 rounded-sm text-gray-500 text-sm px-4 py-3">
        A carregar editor...
      </div>
    );
  }

  return (
    <div>
      {label && <label className="block text-sm text-gray-300 mb-1.5">{label}</label>}
      <div className="bg-jungle-900 border border-jungle-700/50 rounded-sm focus-within:border-jungle-500 transition-colors">
        <Toolbar editor={editor} />
        <div className="relative">
          <EditorContent editor={editor} placeholder={placeholder} />
          {editor.isEmpty && (
            <span className="absolute top-3 left-4 text-gray-500 text-sm pointer-events-none">
              {placeholder}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  const addLink = useCallback(() => {
    const prev = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("URL:", prev || "https://");
    if (url === null) return;
    if (url === "") {
      editor.chain().focus().extendMarkRange("link").unsetLink().run();
      return;
    }
    editor.chain().focus().extendMarkRange("link").setLink({ href: url }).run();
  }, [editor]);

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-jungle-700/30 bg-jungle-900/60">
      <Btn
        active={editor.isActive("bold")}
        onClick={() => editor.chain().focus().toggleBold().run()}
        title="Negrito"
      >
        <Bold size={14} />
      </Btn>
      <Btn
        active={editor.isActive("italic")}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        title="Itálico"
      >
        <Italic size={14} />
      </Btn>
      <Btn
        active={editor.isActive("underline")}
        onClick={() => editor.chain().focus().toggleUnderline().run()}
        title="Sublinhado"
      >
        <UnderlineIcon size={14} />
      </Btn>
      <Btn
        active={editor.isActive("strike")}
        onClick={() => editor.chain().focus().toggleStrike().run()}
        title="Riscado"
      >
        <Strikethrough size={14} />
      </Btn>
      <Divider />
      <Btn
        active={editor.isActive("heading", { level: 2 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        title="Título H2"
      >
        <Heading2 size={14} />
      </Btn>
      <Btn
        active={editor.isActive("heading", { level: 3 })}
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        title="Subtítulo H3"
      >
        <Heading3 size={14} />
      </Btn>
      <Divider />
      <Btn
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        title="Lista"
      >
        <List size={14} />
      </Btn>
      <Btn
        active={editor.isActive("orderedList")}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        title="Lista numerada"
      >
        <ListOrdered size={14} />
      </Btn>
      <Btn
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
        title="Citação"
      >
        <Quote size={14} />
      </Btn>
      <Divider />
      <Btn active={editor.isActive("link")} onClick={addLink} title="Link">
        <LinkIcon size={14} />
      </Btn>
      <Divider />
      <Btn onClick={() => editor.chain().focus().undo().run()} title="Anular">
        <Undo size={14} />
      </Btn>
      <Btn onClick={() => editor.chain().focus().redo().run()} title="Refazer">
        <Redo size={14} />
      </Btn>
    </div>
  );
}

function Btn({
  children,
  onClick,
  active,
  title,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  title?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={cn(
        "p-1.5 rounded-sm text-gray-400 hover:text-white hover:bg-jungle-800/80 transition-colors",
        active && "bg-jungle-700/60 text-white"
      )}
    >
      {children}
    </button>
  );
}

function Divider() {
  return <div className="w-px h-4 bg-jungle-700/50 mx-0.5" />;
}
