import { type LoaderFunctionArgs } from '@remix-run/node'
import {
	Link,
	type MetaFunction,
	Outlet,
	useLoaderData,
	useLocation,
	useSearchParams,
	json,
} from '@remix-run/react'
import clsx from 'clsx'
import { Clock, MapPin } from 'lucide-react'
import { buttonVariants } from '#app/components/ui/button.tsx'
import {
	Pagination,
	PaginationContent,
	PaginationEllipsis,
	PaginationItem,
	PaginationLink,
	PaginationNext,
	PaginationPrevious,
} from '#app/components/ui/pagination.tsx'
import RESULTS_PER_PAGE from '#app/constants/RESULTS_PER_PAGE.ts'
import {
	getJobPostings,
	getJobPostingsCount,
} from '#app/models/job-postings.server.ts'
import { requireUserId } from '#app/utils/auth.server.ts'
import { timeSincePosted } from '#app/utils/misc.tsx'
import { useMediaQuery } from '#app/utils/use-media-query.ts'

interface JobPreviewType {
	category: string
	companyName: string
	createdAt: string
	id: string
	jobDescription: string
	jobTitle: string
	partOfTown?: string | null
}

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url)
	const page = Number(url.searchParams.get('page')) || 1

	await requireUserId(request)
	const jobs = await getJobPostings(page)
	const jobPostingsCount = await getJobPostingsCount()

	if (!jobs) {
		return json({ jobs: [], jobPostingsCount: 0 })
	}

	return json({ jobs, jobPostingsCount })
}

export const meta: MetaFunction = () => [{ title: 'Providence Job Board' }]

const JobPreviewCard = ({
	job,
	index,
	page,
}: {
	job: JobPreviewType
	index: number
	page: number
}) => {
	const location = useLocation()
	const isActive = location.pathname.includes(job.id)
	const isFirstAtRoot = location.pathname === '/jobs' && index === 0
	const isDesktop = useMediaQuery('(min-width: 1024px)')

	return (
		<li
			key={job.id}
			className={clsx(
				'border-card-border relative flex items-center space-x-4 rounded border px-8 py-6 text-card-foreground ring-offset-background transition-colors duration-200 ease-in-out focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 hover:bg-background',
				isActive || (isFirstAtRoot && isDesktop)
					? 'bg-background ring-2 ring-ring ring-offset-2'
					: 'bg-card',
			)}
		>
			<div className="min-w-0">
				<span className="inline-flex items-center rounded bg-primary px-2 py-1 text-xs font-medium text-primary-foreground ring-1 ring-inset ring-primary-foreground/10">
					{job.category}
				</span>
				<h2 className="mt-3 min-w-0 text-xl font-bold">
					<Link
						to={{
							pathname: `/jobs/${job.id}`,
							search: `?page=${page}`,
						}}
						className="focus-visible:ring-none focus-visible:outline-none"
						unstable_viewTransition
						preventScrollReset={true}
					>
						{job.jobTitle + ' / ' + job.companyName}
						<span className="absolute inset-0" />
					</Link>
				</h2>
				<div className="mt-3 flex space-x-2 text-sm font-bold leading-5 text-muted-foreground">
					<MapPin className="h-5 w-auto flex-none" />
					<span className="truncate">{job.partOfTown || 'Not specified'}</span>
				</div>
				<div
					className="mt-6 line-clamp-3 h-[4.5rem] text-ellipsis text-longform-foreground"
					dangerouslySetInnerHTML={{ __html: job.jobDescription }}
				/>
				<div className="mt-6 flex space-x-2 font-bold leading-5 text-muted-foreground">
					<Clock className="h-4 w-auto flex-none" />
					<span className="text-xs font-bold text-muted-foreground">
						{timeSincePosted(job.createdAt)}
					</span>
				</div>
			</div>
		</li>
	)
}

export default function Jobs() {
	const { jobs, jobPostingsCount } = useLoaderData<typeof loader>()
	const [searchParams] = useSearchParams()
	const page = Number(searchParams.get('page')) || 1

	const totalPageCount = Math.ceil(jobPostingsCount / RESULTS_PER_PAGE)
	const currentPage = page
	const maxPages = 5

	const canPageBackwards: boolean = page > 1
	const canPageForwards: boolean = page < totalPageCount

	let pageNumbers: Array<number | string> = []

	if (totalPageCount <= maxPages) {
		pageNumbers = Array.from({ length: totalPageCount }, (_, i) => i + 1)
	} else {
		if (page <= 2) {
			pageNumbers = [1, 2, 3, 'ellipsis-end', totalPageCount]
		} else if (page === 3) {
			pageNumbers = [1, 2, 3, 4, 'ellipsis-end', totalPageCount]
		} else if (page < totalPageCount - 2) {
			pageNumbers = [
				1,
				'ellipsis-start',
				page - 1,
				page,
				page + 1,
				'ellipsis-end',
				totalPageCount,
			]
		} else if (page === totalPageCount - 2) {
			pageNumbers = [
				1,
				'ellipsis-start',
				totalPageCount - 3,
				totalPageCount - 2,
				totalPageCount - 1,
				totalPageCount,
			]
		} else if (page >= totalPageCount - 1) {
			pageNumbers = [
				1,
				'ellipsis-end',
				totalPageCount - 2,
				totalPageCount - 1,
				totalPageCount,
			]
		}
	}

	return (
		<div className="flex min-h-full flex-col">
			{page <= totalPageCount && page > 0 ? (
				<div className="mx-auto flex w-full max-w-6xl items-start gap-x-8 px-4 sm:px-6 lg:px-8">
					<div className="flex-1 py-10">
						<ul className="mx-auto flex max-w-lg flex-col space-y-8">
							{jobs &&
								jobs.map((job, index) => (
									<JobPreviewCard
										key={job.id}
										index={index}
										job={job}
										page={page}
									/>
								))}
						</ul>
					</div>
					<div className="sticky bottom-0 top-0 hidden w-[36rem] shrink-0 py-10 lg:block">
						<Outlet />
					</div>
				</div>
			) : (
				<div className="mx-auto space-y-8 py-20">
					<p className="font-display text-3xl font-medium">No jobs found</p>
					<Link to="/" className={buttonVariants({ variant: 'default' })}>
						Go Back Home
					</Link>
				</div>
			)}
			<Pagination className="pb-8">
				<PaginationContent>
					<PaginationItem>
						<PaginationPrevious
							to={{
								pathname: '/jobs',
								search: `?page=${page - 1}`,
							}}
							preventScrollReset={true}
							prefetch="intent"
							unstable_viewTransition
							className={
								canPageBackwards ? '' : 'pointer-events-none opacity-50'
							}
						/>
					</PaginationItem>
					{pageNumbers.map((pageNumber) => (
						<PaginationItem key={pageNumber}>
							{typeof pageNumber === 'string' &&
							pageNumber.includes('ellipsis') ? (
								<PaginationEllipsis />
							) : (
								<PaginationLink
									isActive={pageNumber === currentPage}
									to={{
										pathname: '/jobs',
										search: `?page=${pageNumber}`,
									}}
									preventScrollReset={true}
									prefetch="intent"
									unstable_viewTransition
								>
									{pageNumber}
								</PaginationLink>
							)}
						</PaginationItem>
					))}
					<PaginationItem>
						<PaginationNext
							to={{
								pathname: '/jobs',
								search: `?page=${page + 1}`,
							}}
							preventScrollReset={true}
							prefetch="intent"
							unstable_viewTransition
							className={
								canPageForwards ? '' : 'pointer-events-none opacity-50'
							}
						/>
					</PaginationItem>
				</PaginationContent>
			</Pagination>
		</div>
	)
}
