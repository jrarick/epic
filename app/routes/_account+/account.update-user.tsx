import { getFormProps, getInputProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { type ActionFunctionArgs, redirect } from '@remix-run/node'

import { Form, Link, json, useActionData } from '@remix-run/react'
import { Button, buttonVariants } from '#app/components/ui/button.tsx'
import { Input } from '#app/components/ui/input.tsx'
import { Label } from '#app/components/ui/label.tsx'
import { updateUserById } from '#app/models/user.server.ts'
import { userSchema } from '#app/schemas/user-schema.ts'
import { requireUserId } from '#app/utils/auth.server.ts'

export async function action({ request }: ActionFunctionArgs) {
	const userId = await requireUserId(request)
	const formData = await request.formData()

	const firstName = formData.get('firstName') as string
	const lastName = formData.get('lastName') as string
	const email = formData.get('email') as string

	const updatedUser = await updateUserById(userId, {
		firstName,
		lastName,
		email,
	})

	if (!updatedUser) {
		return json({ error: 'User not found' }, { status: 404 })
	}

	return redirect('/account')
}

export default function UpdateUser() {
	const lastResult = useActionData<typeof action>()
	const [form, fields] = useForm({
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: userSchema })
		},
		shouldValidate: 'onSubmit',
		shouldRevalidate: 'onInput',
	})

	return (
		<Form
			method="post"
			action="/account/update-user"
			className="mt-4 space-y-6"
			preventScrollReset
			{...getFormProps(form)}
		>
			<div>
				<Label htmlFor="firstName">First Name</Label>
				<Input {...getInputProps(fields.firstName, { type: 'text' })} />
			</div>
			<div>
				<Label htmlFor="lastName">Last Name</Label>
				<Input {...getInputProps(fields.lastName, { type: 'text' })} />
			</div>
			<div>
				<Label htmlFor="email">Email</Label>
				<Input {...getInputProps(fields.email, { type: 'email' })} />
			</div>
			<div className="flex flex-row space-x-6">
				<Button type="submit">Update</Button>
				<Link
					to="/account"
					className={buttonVariants({ variant: 'ghost' })}
					unstable_viewTransition
					preventScrollReset
				>
					Cancel
				</Link>
			</div>
		</Form>
	)
}
