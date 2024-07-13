import { type Editor as TipTapEditor } from '@tiptap/react'
import {
	Bold,
	ChevronDown,
	Heading1,
	Heading2,
	Italic,
	LinkIcon,
	List,
	ListOrdered,
	Pilcrow,
	Quote,
	Redo,
	Underline as UnderlineIcon,
	Undo,
} from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'
import { cn } from '#app/utils/misc'
import { Button } from '../ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover'

export const MenuBar = ({ editor }: { editor: TipTapEditor | null }) => {
	const [isApple, setIsApple] = useState(false)

	const blockTypeToBlockName = {
		h1: 'Heading 1',
		h2: 'Heading 2',
		paragraph: 'Normal',
	}

	const blockTypeToIcon = {
		h1: <Heading1 className="size-4" />,
		h2: <Heading2 className="size-4" />,
		paragraph: <Pilcrow className="size-4" />,
	}

	useEffect(() => {
		setIsApple(
			navigator.userAgent.includes(
				'Mac' || 'iPhone' || 'iPad' || 'iPod' || 'Apple',
			),
		)
	}, [])

	const setLink = useCallback(() => {
		const previousUrl = editor?.getAttributes('link').href
		const url = window.prompt('URL', previousUrl)

		if (url === null) {
			return
		}

		if (url === '') {
			editor?.chain().focus().extendMarkRange('link').unsetLink().run()

			return
		}

		editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
	}, [editor])

	if (!editor) {
		return null
	}

	const activeBlockType = editor.isActive('paragraph')
		? 'paragraph'
		: editor.isActive('heading', { level: 1 })
			? 'h1'
			: editor.isActive('heading', { level: 2 })
				? 'h2'
				: 'paragraph'

	return (
		<div className="flex flex-row justify-center space-x-0.5 border-b border-border px-2 py-1.5">
			<button
				type="button"
				title={isApple ? 'Undo (⌘Z)' : 'Undo (Ctrl+Z)'}
				onClick={() => editor.chain().focus().undo().run()}
				disabled={!editor.can().chain().focus().undo().run()}
				className="rounded bg-background p-2 transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground/50 max-sm:hidden"
				aria-label="Undo"
			>
				<Undo className="size-4" />
			</button>
			<button
				type="button"
				title={isApple ? 'Redo (⌘Y)' : 'Redo (Ctrl+Y)'}
				onClick={() => editor.chain().focus().redo().run()}
				disabled={!editor.can().chain().focus().redo().run()}
				className="rounded bg-background p-2 transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground/50 max-sm:hidden"
				aria-label="Redo"
			>
				<Redo className="size-4" />
			</button>
			<Popover>
				<PopoverTrigger className="!mx-2 flex flex-row items-center space-x-1 rounded bg-background px-2.5 py-1 text-sm ring-1 ring-inset ring-input/50 transition-colors hover:bg-muted">
					{blockTypeToIcon[activeBlockType]}
					<span className="w-20 text-left leading-4">
						{blockTypeToBlockName[activeBlockType]}
					</span>
					<ChevronDown className="size-4" />
				</PopoverTrigger>
				<PopoverContent className="flex w-auto flex-col p-1">
					<Button
						variant="ghost"
						className="h-auto justify-start space-x-1 p-2 font-sans text-sm font-normal normal-case tracking-normal"
						onClick={() => editor.chain().focus().setParagraph().run()}
						aria-label="Set paragraph"
					>
						<Pilcrow className="size-4" />
						<span className="leading-4">Normal</span>
					</Button>
					<Button
						variant="ghost"
						className="h-auto justify-start space-x-1 p-2 font-sans text-sm font-normal normal-case tracking-normal"
						onClick={() =>
							editor.chain().focus().toggleHeading({ level: 1 }).run()
						}
						aria-label="Set heading 1"
					>
						<Heading1 className="size-4" />
						<span className="leading-4">Heading 1</span>
					</Button>
					<Button
						variant="ghost"
						className="h-auto justify-start space-x-1 p-2 font-sans text-sm font-normal normal-case tracking-normal"
						onClick={() =>
							editor.chain().focus().toggleHeading({ level: 2 }).run()
						}
						aria-label="Set heading 2"
					>
						<Heading2 className="size-4" />
						<span className="leading-4">Heading 2</span>
					</Button>
				</PopoverContent>
			</Popover>
			<button
				type="button"
				title={isApple ? 'Bold (⌘B)' : 'Bold (Ctrl+B)'}
				onClick={() => editor.chain().focus().toggleBold().run()}
				disabled={!editor.can().chain().focus().toggleBold().run()}
				className={cn(
					'rounded bg-background p-2 transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground/50',
					editor.isActive('bold') && 'bg-card ring-1 ring-inset ring-input/20',
				)}
				aria-label={`Format text as bold. Shortcut: ${
					isApple ? '⌘B' : 'Ctrl+B'
				}`}
			>
				<Bold className="size-4" />
			</button>
			<button
				type="button"
				title={isApple ? 'Italic (⌘I)' : 'Italic (Ctrl+I)'}
				onClick={() => editor.chain().focus().toggleItalic().run()}
				disabled={!editor.can().chain().focus().toggleItalic().run()}
				className={cn(
					'rounded bg-background p-2 transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground/50',
					{
						'bg-card ring-1 ring-inset ring-input/20':
							editor.isActive('italic'),
					},
				)}
				aria-label={`Format text as italics. Shortcut: ${
					isApple ? '⌘I' : 'Ctrl+I'
				}`}
			>
				<Italic className="size-4" />
			</button>
			<button
				type="button"
				title={isApple ? 'Underline (⌘U)' : 'Underline (Ctrl+U)'}
				onClick={() => editor.chain().focus().toggleUnderline().run()}
				disabled={!editor.can().chain().focus().toggleUnderline().run()}
				className={cn(
					'rounded bg-background p-2 transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground/50',
					{
						'bg-card ring-1 ring-inset ring-input/20':
							editor.isActive('underline'),
					},
				)}
				aria-label={`Format text to underlined. Shortcut: ${
					isApple ? '⌘U' : 'Ctrl+U'
				}`}
			>
				<UnderlineIcon className="size-4" />
			</button>
			<button
				type="button"
				title="Link"
				onClick={() => {
					editor.isActive('link')
						? editor.chain().focus().unsetLink().run()
						: setLink()
				}}
				disabled={!editor.can().chain().focus().toggleUnderline().run()}
				className={cn(
					'rounded bg-background p-2 transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground/50 max-sm:hidden',
					{
						'bg-card ring-1 ring-inset ring-input/20': editor.isActive('link'),
					},
				)}
				aria-label="Insert or remove link"
			>
				<LinkIcon className="size-4" />
			</button>
			<div className="flex max-sm:hidden" aria-hidden={true}>
				<div className="mx-2 my-1 w-[1px] bg-border" />
			</div>
			<button
				type="button"
				title="Bullet list (* or - or +)"
				onClick={() => editor.chain().focus().toggleBulletList().run()}
				disabled={!editor.can().chain().focus().toggleBulletList().run()}
				className={cn(
					'rounded bg-background p-2 transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground/50 max-sm:hidden',
					{
						'bg-card ring-1 ring-inset ring-input/20':
							editor.isActive('bulletList'),
					},
				)}
				aria-label="Toggle bullet list. Shortcut: (* or - or +)"
			>
				<List className="size-4" />
			</button>
			<button
				type="button"
				title="Number list (1. or 1)"
				onClick={() => editor.chain().focus().toggleOrderedList().run()}
				disabled={!editor.can().chain().focus().toggleOrderedList().run()}
				className={cn(
					'rounded bg-background p-2 transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground/50 max-sm:hidden',
					{
						'bg-card ring-1 ring-inset ring-input/20':
							editor.isActive('orderedList'),
					},
				)}
				aria-label="Toggle number list. Shortcut: (1. or 1)"
			>
				<ListOrdered className="size-4" />
			</button>
			<button
				type="button"
				title="Quote (>)"
				onClick={() => editor.chain().focus().toggleBlockquote().run()}
				disabled={!editor.can().chain().focus().toggleBlockquote().run()}
				className={cn(
					'rounded bg-background p-2 transition-colors enabled:hover:bg-muted disabled:cursor-not-allowed disabled:text-muted-foreground/50 max-sm:hidden',
					{
						'bg-card ring-1 ring-inset ring-input/20':
							editor.isActive('blockquote'),
					},
				)}
				aria-label="Toggle quote. Shortcut: (>)"
			>
				<Quote className="size-4" />
			</button>
		</div>
	)
}
