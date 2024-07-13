import { invariantResponse } from '@epic-web/invariant'
import { json, type LoaderFunctionArgs } from '@remix-run/node'
import { Form, Link, useLoaderData, type MetaFunction } from '@remix-run/react'
import { GeneralErrorBoundary } from '#app/components/error-boundary.tsx'
import { Spacer } from '#app/components/spacer.tsx'
import {
	Avatar,
	AvatarFallback,
	AvatarImage,
} from '#app/components/ui/avatar.tsx'
import { Button } from '#app/components/ui/button.tsx'
import { Card } from '#app/components/ui/card.tsx'
import { Icon } from '#app/components/ui/icon.tsx'
import { prisma } from '#app/utils/db.server.ts'
import { getUserImgSrc } from '#app/utils/misc.tsx'
import { useOptionalUser } from '#app/utils/user.ts'

export async function loader({ params }: LoaderFunctionArgs) {
	const user = await prisma.user.findFirst({
		select: {
			id: true,
			firstName: true,
			lastName: true,
			createdAt: true,
			image: { select: { id: true } },
		},
		where: {
			username: params.username,
		},
	})

	invariantResponse(user, 'User not found', { status: 404 })

	return json({ user, userJoinedDisplay: user.createdAt.toLocaleDateString() })
}

export default function ProfileRoute() {
	const data = useLoaderData<typeof loader>()
	const user = data.user
	const userDisplayName = `${user.firstName} ${user.lastName}`
	const userInitials = user.firstName[0] + user.lastName[0]
	const loggedInUser = useOptionalUser()
	const isLoggedInUser = data.user.id === loggedInUser?.id

	return (
		<div className="container mb-24 mt-36 flex flex-col items-center justify-center">
			<Spacer size="4xs" />

			<Card className="flex w-full max-w-2xl flex-col items-center p-12">
				<div className="relative w-52">
					<div className="absolute -top-40">
						<div className="relative">
							<Avatar className="h-52 w-52 border-4 border-card bg-background">
								<AvatarImage
									src={getUserImgSrc(data.user.image?.id)}
									alt={userDisplayName}
								/>
								<AvatarFallback className="font-display text-6xl font-semibold">
									{userInitials}
								</AvatarFallback>
							</Avatar>
							{/* <img
								src={getUserImgSrc(data.user.image?.id)}
								alt={userDisplayName}
								className="h-52 w-52 rounded-full border-2 border-border bg-background object-cover"
							/> */}
						</div>
					</div>
				</div>

				<Spacer size="sm" />

				<div className="flex flex-col items-center">
					<div className="flex flex-wrap items-center justify-center gap-4">
						<h1 className="text-h2 text-center text-2xl font-semibold">
							{userDisplayName}
						</h1>
					</div>
					<p className="mt-2 text-center text-muted-foreground">
						Joined {data.userJoinedDisplay}
					</p>
					<div className="mt-10">
						{isLoggedInUser ? (
							<Button asChild>
								<Link to="/settings/profile" prefetch="intent">
									Edit profile
								</Link>
							</Button>
						) : null}
					</div>
					{isLoggedInUser ? (
						<Form action="/logout" method="POST" className="mt-8">
							<Button type="submit" variant="secondary">
								<Icon name="exit" className="scale-125 max-md:scale-150">
									Logout
								</Icon>
							</Button>
						</Form>
					) : null}
				</div>
			</Card>
		</div>
	)
}

export const meta: MetaFunction<typeof loader> = ({ data, params }) => {
	const displayName = data?.user.firstName ?? params.username
	return [
		{ title: `${displayName} | Epic Notes` },
		{
			name: 'description',
			content: `Profile of ${displayName} on Epic Notes`,
		},
	]
}

export function ErrorBoundary() {
	return (
		<GeneralErrorBoundary
			statusHandlers={{
				404: ({ params }) => (
					<p>No user with the username "{params.username}" exists</p>
				),
			}}
		/>
	)
}
