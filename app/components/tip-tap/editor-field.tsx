import { type FieldMetadata } from '@conform-to/react'
import Editor from './editor'

export default function EditorField({
	meta,
	content,
	errors,
}: {
	meta: FieldMetadata<string>
	content?: string
	errors?: string[]
}) {
	return (
		<>
			<Editor meta={meta} content={content} errors={errors} />
			<div className="min-h-[32px] px-4 pb-3 text-[12px] text-destructive">
				{errors}
			</div>
		</>
	)
}
