import { parseWithZod } from '@conform-to/zod'
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	type MetaFunction,
	json,
	redirect,
} from '@remix-run/node'
import { useActionData } from '@remix-run/react'
import JobPostingForm from '#app/components/job-posting-form.tsx'
import { createJobPosting } from '#app/models/job-postings.server.ts'
import { jobPostingSchema } from '#app/schemas/job-posting-schema.ts'
import { requireUserId } from '#app/utils/auth.server.ts'

export async function loader({ request }: LoaderFunctionArgs) {
	await requireUserId(request)
	return json({})
}

export const action = async ({ request }: ActionFunctionArgs) => {
	const userId = await requireUserId(request)

	const formData = await request.formData()
	const submission = parseWithZod(formData, { schema: jobPostingSchema })

	if (submission.status !== 'success') {
		return json(submission.reply())
	}

	const {
		jobTitle,
		companyName,
		category,
		employmentType,
		jobDescription,
		salaryMin = null,
		salaryMax = null,
		salaryType,
		partOfTown = '',
		workPresence,
		companyWebsite = '',
		linkToApply = '',
		contactEmail = '',
		contactPhone = '',
		customInstructions = '',
	} = submission.value

	const newJobPosting = await createJobPosting({
		jobTitle,
		companyName,
		category,
		employmentType,
		jobDescription,
		salaryMin,
		salaryMax,
		salaryType,
		partOfTown,
		workPresence,
		companyWebsite,
		linkToApply,
		contactEmail,
		contactPhone,
		customInstructions,
		authorId: userId,
	})

	return redirect(`/jobs/${newJobPosting.id}?job_created=true`)
}

export const meta: MetaFunction = () => {
	return [{ title: 'Advertise A Job | Providence Job Board' }]
}

export default function NewJobsPage() {
	const lastResult = useActionData<typeof action>()

	return (
		<div className="mx-auto flex max-w-7xl flex-col items-center px-2 py-20 sm:px-6 lg:px-8">
			<JobPostingForm lastResult={lastResult} />
		</div>
	)
}
