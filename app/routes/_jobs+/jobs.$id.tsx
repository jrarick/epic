import {
	type LoaderFunctionArgs,
	type MetaFunction,
	json,
} from '@remix-run/node'
import { useLoaderData, useLocation, useNavigate } from '@remix-run/react'
import {
	Banknote,
	Briefcase,
	Building,
	Calendar,
	Globe,
	MapPin,
	Pen,
} from 'lucide-react'
import { useState } from 'react'
import { ClientOnly } from 'remix-utils/client-only'
import { JobPosting } from '#app/components/job-posting.tsx'
import { Button } from '#app/components/ui/button.tsx'
import {
	Drawer,
	DrawerContent,
	DrawerFooter,
	DrawerHeader,
	DrawerTitle,
} from '#app/components/ui/drawer.tsx'
import { ScrollArea } from '#app/components/ui/scroll-area.tsx'
import { getJobPosting } from '#app/models/job-postings.server.ts'
import { formatSalaryString } from '#app/utils/misc.tsx'
import { useMediaQuery } from '#app/utils/use-media-query.ts'

export async function loader({ request, params }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const showJobCreatedToast = url.searchParams.get('job_created') === 'true'
	const showJobUpdatedToast = url.searchParams.get('job_updated') === 'true'
	const jobQuery = await getJobPosting(params.id!)

	if (!jobQuery) {
		throw new Error('Job not found')
	}

	const job = {
		author: {
			firstName: jobQuery.author.firstName,
			lastName: jobQuery.author.lastName,
		},
		category: jobQuery.category,
		companyName: jobQuery.companyName,
		createdAt: jobQuery.createdAt,
		employmentType: jobQuery.employmentType,
		linkToApply: jobQuery.linkToApply,
		contactEmail: jobQuery.contactEmail,
		contactPhone: jobQuery.contactPhone,
		customInstructions: jobQuery.customInstructions,
		id: jobQuery.id,
		jobDescription: jobQuery.jobDescription,
		jobTitle: jobQuery.jobTitle,
		partOfTown: jobQuery.partOfTown,
		workPresence: jobQuery.workPresence,
		companyWebsite: jobQuery.companyWebsite,
		formattedSalaryString: formatSalaryString(
			jobQuery.salaryMin,
			jobQuery.salaryMax,
			jobQuery.salaryType,
		),
	}

	return json({ job, showJobCreatedToast, showJobUpdatedToast })
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{
			title: `${data?.job.jobTitle} / ${data?.job.companyName} | Providence Job Board`,
		},
	]
}

export default function JobPostingCard() {
	const { job } = useLoaderData<typeof loader>()
	const isDesktop = useMediaQuery('(min-width: 1024px)')
	const navigate = useNavigate()
	const location = useLocation()
	const [drawerOpen, setDrawerOpen] = useState(true)

	const details = [
		{
			label: 'Salary',
			icon: Banknote,
			value: job.formattedSalaryString || 'Not specified',
		},
		{
			label: 'Employment',
			icon: Briefcase,
			value: job.employmentType,
		},
		{
			label: 'Location',
			icon: MapPin,
			value: job.partOfTown || 'Not specified',
		},
		{
			label: 'Work Setting',
			icon: Building,
			value: job.workPresence,
		},
		{
			label: 'Website',
			icon: Globe,
			value: job.companyWebsite || 'Not specified',
		},
	]

	const handleCloseDrawer = (open: boolean) => {
		if (!open) {
			navigate(
				{
					pathname: '/jobs',
					search: location.search || '',
				},
				{
					preventScrollReset: true,
				},
			)
		}
	}

	// useEffect(() => {
	// 	if (showJobCreatedToast) {
	// 		setTimeout(() => {
	// 			toast({
	// 				title: 'Job posting created',
	// 				description: `Posting for ${job.jobTitle} at ${job.companyName} has been created`,
	// 			})
	// 		}, 1000)
	// 	} else if (showJobUpdatedToast) {
	// 		setTimeout(() => {
	// 			toast({
	// 				title: 'Job posting updated',
	// 				description: `Posting for ${job.jobTitle} at ${job.companyName} has been updated`,
	// 			})
	// 		}, 1000)
	// 	}
	// }, [showJobCreatedToast, showJobUpdatedToast, job, toast])

	return (
		<>
			{isDesktop ? (
				<JobPosting job={job} />
			) : (
				<Drawer
					open={drawerOpen}
					onOpenChange={(open) => handleCloseDrawer(open)}
				>
					<DrawerContent
						className="h-[85lvh]"
						onInteractOutside={(e) => {
							e.preventDefault()
							setDrawerOpen(false)
						}}
						onPointerDownOutside={(e) => {
							e.preventDefault()
							setDrawerOpen(false)
						}}
					>
						<DrawerHeader>
							<DrawerTitle className="text-left text-2xl">
								{job.jobTitle + ' / ' + job.companyName}
							</DrawerTitle>
						</DrawerHeader>
						<ScrollArea className="h-full overflow-y-auto px-4">
							<ul className="space-y-3 border-b border-border py-4 text-foreground">
								{details.map((detail) => (
									<li key={detail.label} className="flex flex-row items-center">
										<div className="flex w-28 items-center space-x-2 text-sm leading-5 sm:w-32">
											<detail.icon className="h-5 w-auto flex-none" />
											<span className="text-xs font-bold sm:text-sm sm:font-normal">
												{detail.label}
											</span>
										</div>
										{detail.label === 'Website' &&
										detail.value !== 'Not specified' ? (
											<a
												href={detail.value!}
												target="_blank"
												rel="noreferrer"
												className="inline-flex break-all rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-secondary-foreground/10 hover:underline"
											>
												{detail.value}
											</a>
										) : (
											<span className="inline-flex items-center rounded bg-secondary px-2 py-1 text-xs font-medium text-secondary-foreground ring-1 ring-inset ring-secondary-foreground/10">
												{detail.value}
											</span>
										)}
									</li>
								))}
							</ul>
							<h3 className="pt-4 font-display text-2xl font-semibold">
								Job Description
							</h3>
							<div
								className="prose prose-sm prose-h1:font-display prose-h1:text-2xl prose-h1:font-semibold prose-h1:tracking-tight prose-headings:text-foreground prose-h2:tracking-widest prose-h2:uppercase prose-h2:text-lg prose-blockquote:text-muted-foreground prose-a:text-foreground prose-a:font-semibold prose-strong:text-longform-foreground text-longform-foreground"
								dangerouslySetInnerHTML={{ __html: job.jobDescription }}
							/>
							<h3 className="pt-4 font-display text-2xl font-semibold">
								How To Apply
							</h3>
							{job.linkToApply ? (
								<div className="text-longform-foreground">
									Visit{' '}
									<a
										href={job.linkToApply}
										className="break-all font-semibold text-foreground hover:underline"
									>
										{job.linkToApply}
									</a>
								</div>
							) : job.contactEmail ? (
								<div className="text-longform-foreground">
									Send your resume to{' '}
									<a
										// eslint-disable-next-line remix-react-routes/use-link-for-routes
										href={`mailto:${job.contactEmail}`}
										className="break-all font-semibold text-foreground hover:underline"
									>
										{job.contactEmail}
									</a>
								</div>
							) : job.contactPhone ? (
								<div className="text-longform-foreground">
									Call{' '}
									<a
										// eslint-disable-next-line remix-react-routes/use-link-for-routes
										href={`tel:${job.contactPhone}}`}
										className="break-all font-semibold text-foreground hover:underline"
									>
										{job.contactPhone}
									</a>
								</div>
							) : job.customInstructions ? (
								<div className="text-longform-foreground">
									{job.customInstructions}
								</div>
							) : null}
						</ScrollArea>
						<DrawerFooter>
							<div className="flex flex-row items-end justify-between border-t border-border pt-4">
								<div className="space-y-2.5">
									<div className="flex space-x-2 font-bold leading-5 text-muted-foreground">
										<Pen className="h-4 w-auto flex-none" />
										<span className="text-xs font-bold text-muted-foreground">
											{`Posted by ${job.author?.firstName} ${job.author?.lastName}`}
										</span>
									</div>
									<div className="flex space-x-2 font-bold leading-5 text-muted-foreground">
										<Calendar className="h-4 w-auto flex-none" />
										<ClientOnly>
											{() => (
												<time
													dateTime={job.createdAt}
													className="text-xs font-bold text-muted-foreground"
												>
													{`On ${new Date(job.createdAt).toLocaleDateString(
														'en-US',
														{
															year: 'numeric',
															month: 'long',
															day: 'numeric',
														},
													)}`}
												</time>
											)}
										</ClientOnly>
									</div>
								</div>
								<Button
									variant="outline"
									size="sm"
									onClick={() => setDrawerOpen(false)}
								>
									Close
								</Button>
							</div>
						</DrawerFooter>
					</DrawerContent>
				</Drawer>
			)}
		</>
	)
}
