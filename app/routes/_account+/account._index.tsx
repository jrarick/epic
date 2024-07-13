import { Link } from '@remix-run/react'
import { buttonVariants } from '#app/components/ui/button.tsx'
import { useUser } from '#app/utils/user.ts'

export default function AccountIndex() {
	const user = useUser()

	return (
		<>
			<dl className="mb-8 mt-4 space-y-8 text-sm">
				<div>
					<dt className="font-semibold">First Name:</dt>
					<dd className="text-longform-foreground">{user.firstName}</dd>
				</div>
				<div>
					<dt className="font-semibold">Last Name:</dt>
					<dd className="text-longform-foreground">{user.lastName}</dd>
				</div>
				<div>
					<dt className="font-semibold">Email:</dt>
					<dd className="text-longform-foreground">{user.email}</dd>
				</div>
			</dl>
			<Link
				to="/account/update-user"
				className={buttonVariants({ variant: 'outline' })}
				unstable_viewTransition
				preventScrollReset
			>
				Edit
			</Link>
		</>
	)
}
