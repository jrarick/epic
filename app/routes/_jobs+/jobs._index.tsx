import {
	type MetaFunction,
	json,
	type LoaderFunctionArgs,
} from '@remix-run/node'
import { useLoaderData } from '@remix-run/react'
import { JobPosting } from '#app/components/job-posting.tsx'
import { getFirstJobOnPage } from '#app/models/job-postings.server.ts'
import { formatSalaryString } from '#app/utils/misc.tsx'
import { useMediaQuery } from '#app/utils/use-media-query.ts'

export async function loader({ request }: LoaderFunctionArgs) {
	const url = new URL(request.url)
	const page = Number(url.searchParams.get('page')) || 1

	const firstJobQuery = await getFirstJobOnPage(page)

	if (!firstJobQuery) {
		return json({ firstJob: null })
	}

	const firstJob = {
		author: {
			firstName: firstJobQuery.author.firstName,
			lastName: firstJobQuery.author.lastName,
		},
		category: firstJobQuery.category,
		companyName: firstJobQuery.companyName,
		createdAt: firstJobQuery.createdAt,
		employmentType: firstJobQuery.employmentType,
		linkToApply: firstJobQuery.linkToApply,
		contactEmail: firstJobQuery.contactEmail,
		contactPhone: firstJobQuery.contactPhone,
		customInstructions: firstJobQuery.customInstructions,
		id: firstJobQuery.id,
		jobDescription: firstJobQuery.jobDescription,
		jobTitle: firstJobQuery.jobTitle,
		partOfTown: firstJobQuery.partOfTown,
		workPresence: firstJobQuery.workPresence,
		companyWebsite: firstJobQuery.companyWebsite,
		formattedSalaryString: formatSalaryString(
			firstJobQuery.salaryMin,
			firstJobQuery.salaryMax,
			firstJobQuery.salaryType,
		),
	}

	return json({ firstJob })
}

export const meta: MetaFunction = () => {
	return [{ title: 'Job Listings | Providence Job Board' }]
}

export default function JobsIndex() {
	const isDesktop = useMediaQuery('(min-width: 1024px)')
	const { firstJob } = useLoaderData<typeof loader>()

	if (firstJob) {
		if (isDesktop) {
			return <JobPosting job={firstJob} />
		} else {
			return <></>
		}
	}

	return <p className="mx-auto py-20">No job found</p>
}
