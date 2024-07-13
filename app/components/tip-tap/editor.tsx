import { useInputControl, type FieldMetadata } from '@conform-to/react'
import Blockquote from '@tiptap/extension-blockquote'
import BulletList from '@tiptap/extension-bullet-list'
import Link from '@tiptap/extension-link'
import OrderedList from '@tiptap/extension-ordered-list'
import Underline from '@tiptap/extension-underline'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { ClientOnly } from 'remix-utils/client-only'
import { cn } from '#app/utils/misc'
import { MenuBar } from './menu-bar'

export default function Editor({
	meta,
	content,
	errors,
}: {
	meta: FieldMetadata<string>
	content?: string
	errors?: string[]
}) {
	const control = useInputControl(meta)

	const editor = useEditor({
		extensions: [
			StarterKit,
			Underline,
			BulletList,
			Link.configure({
				openOnClick: false,
				autolink: true,
			}),
			OrderedList,
			Blockquote,
		],
		content: content,
		onUpdate({ editor }) {
			// control.change(JSON.stringify(editor.getJSON()))
			control.change(editor.getHTML())
		},
	})

	return (
		<ClientOnly>
			{() => (
				<div
					className={cn(
						'max-w-full rounded border border-input bg-background has-[:focus-visible]:outline-none has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-ring has-[:focus-visible]:ring-offset-2 has-[:focus-visible]:ring-offset-background',
						{
							'ring-2 ring-destructive ring-offset-2 has-[:focus-visible]:ring-destructive':
								errors,
						},
					)}
				>
					<input
						name={meta.name}
						defaultValue={meta.initialValue}
						className="sr-only"
						aria-hidden
						tabIndex={-1}
						onFocus={() => editor?.chain().focus().run()}
					/>
					<MenuBar editor={editor} />
					<div className="[&_.ProseMirror]:min-h-64 focus-visible:[&_.ProseMirror]:outline-none [&_.ProseMirror]:sm:min-h-96">
						{/* prettier-ignore */}
						<div
              className={`
                prose prose-sm max-w-full
                prose-p:leading-7
                prose-blockquote:border-l-2 prose-blockquote:pl-6 prose-blockquote:italic
                prose-h1:uppercase prose-h1:font-bold prose-h1:font-display prose-h1:tracking-widest prose-h1:text-xl
                prose-h2:scroll-m-20 prose-h2:text-2xl prose-h2:font-display prose-h2:font-semibold prose-h2:tracking-tight
                prose-ol:my-2 prose-ol:list-decimal
                prose-ul:my-2 prose-ul:list-disc
                prose-link:text-blue-500 prose-link:cursor-pointer prose-link:hover:underline
                dark:prose-text:text-primary-foreground
                [&_*:not(:first-child)]:mt-2 [&_*]:mt-0 [&_*]:!text-foreground [&_*]:dark:!text-primary-foreground
              `}
            >
              <EditorContent
                editor={editor}
                className="p-3"
              />
            </div>
					</div>
				</div>
			)}
		</ClientOnly>
	)
}
