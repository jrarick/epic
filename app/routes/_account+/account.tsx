import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
	json,
} from '@remix-run/node'
import { Form, Link, Outlet, useLoaderData } from '@remix-run/react'
import { SquarePen, Trash } from 'lucide-react'
import { ClientOnly } from 'remix-utils/client-only'
import {
	AlertDialog,
	AlertDialogAction,
	AlertDialogCancel,
	AlertDialogContent,
	AlertDialogDescription,
	AlertDialogFooter,
	AlertDialogHeader,
	AlertDialogTitle,
	AlertDialogTrigger,
} from '#app/components/ui/alert-dialog.tsx'

import { Button, buttonVariants } from '#app/components/ui/button.tsx'
import {
	deleteJobPosting,
	getJobPostingsByAuthorId,
} from '#app/models/job-postings.server.ts'
import { requireUserId } from '#app/utils/auth.server.ts'
import { cn } from '#app/utils/misc.tsx'

export async function loader({ request }: LoaderFunctionArgs) {
	const userId = await requireUserId(request)
	const jobsByUser = await getJobPostingsByAuthorId(userId)

	if (!jobsByUser) {
		throw new Error('Jobs not found')
	}

	return json({ jobsByUser })
}

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const jobId = formData.get('jobId') as string

	if (!jobId) {
		return json({ error: 'Job ID is required' }, { status: 404 })
	}

	await deleteJobPosting(jobId)

	return json({ success: true })
}

export const meta: MetaFunction = () => {
	return [{ title: 'Account | Providence Job Board' }]
}

export default function Account() {
	const { jobsByUser } = useLoaderData<typeof loader>()

	return (
		<div className="mx-auto max-w-6xl px-2 py-20 sm:px-6 lg:px-8">
			<div className="grid grid-cols-1 rounded border border-border lg:grid-cols-5">
				<div className="col-span-3 px-4 py-8 lg:px-8">
					<h2 className="font-display text-2xl font-bold xl:text-3xl">
						My Job Postings
					</h2>
					{jobsByUser.length > 0 ? (
						<ul className="mt-4 divide-y divide-border">
							{jobsByUser.map((job) => (
								<li
									key={job.id}
									className="flex flex-row items-center justify-between py-2 sm:px-2"
								>
									<div className="">
										<Link
											to={`/jobs/${job.id}`}
											className={cn(
												'justify-start font-sans text-sm font-medium normal-case hover:underline',
											)}
										>
											{job.jobTitle} / {job.companyName}
										</Link>
										<ClientOnly>
											{() => (
												<p className="pt-1 text-xs font-semibold text-muted-foreground">
													Posted on{' '}
													<time dateTime={job.createdAt}>
														{new Date(job.createdAt).toLocaleDateString(
															'en-US',
															{
																year: 'numeric',
																month: 'long',
																day: 'numeric',
															},
														)}
													</time>
												</p>
											)}
										</ClientOnly>
									</div>
									<div className="ml-2 flex flex-row space-x-2">
										<Link
											to={`/edit/${job.id}`}
											className={buttonVariants({
												variant: 'ghost',
												size: 'icon',
											})}
											aria-label={`Edit ${job.jobTitle} job posting`}
											title="Edit"
										>
											<SquarePen className="size-4" />
										</Link>
										<AlertDialog>
											<AlertDialogTrigger asChild>
												<Button
													variant="ghost"
													size="icon"
													className="hover:bg-destructive/10"
													title="Delete"
												>
													<Trash className="size-4 text-destructive" />
												</Button>
											</AlertDialogTrigger>
											<AlertDialogContent>
												<AlertDialogHeader>
													<AlertDialogTitle className="mb-2 text-2xl">
														Are you sure you want to delete this job posting?
													</AlertDialogTitle>
													<AlertDialogDescription>
														This action cannot be undone. This will permanently
														delete this job posting and remove it from our
														servers.
													</AlertDialogDescription>
												</AlertDialogHeader>
												<AlertDialogFooter className="mt-4">
													<AlertDialogCancel>Cancel</AlertDialogCancel>
													<Form method="post" action="/account">
														<input type="hidden" name="jobId" value={job.id} />
														<AlertDialogAction
															type="submit"
															className="border border-destructive bg-background text-destructive transition-colors hover:bg-destructive/10"
														>
															Delete
														</AlertDialogAction>
													</Form>
												</AlertDialogFooter>
											</AlertDialogContent>
										</AlertDialog>
									</div>
								</li>
							))}
						</ul>
					) : (
						<>
							<p className="my-6 text-sm font-semibold text-muted-foreground">
								{"You haven't posted any jobs yet."}
							</p>
							<Link
								to="/advertise-job"
								className={buttonVariants({ variant: 'default' })}
								unstable_viewTransition
							>
								Advertise A Job
							</Link>
						</>
					)}
				</div>
				<div className="col-span-2 overflow-hidden border-t border-border bg-card px-4 py-8 text-card-foreground lg:border-l lg:border-t-0 lg:px-8">
					<h2 className="font-display text-2xl font-bold xl:text-3xl">
						Account Details
					</h2>
					<Outlet />
				</div>
			</div>
			<Form method="post" action="/logout">
				<Button type="submit" variant="default" className="mt-8">
					Logout
				</Button>
			</Form>
		</div>
	)
}
