import { z } from 'zod'
import EMPLOYMENT_TYPE from '#app/constants/EMPLOYMENT_TYPE.ts'
import JOB_CATEGORIES from '#app/constants/JOB_CATEGORIES.ts'
import SALARY_TYPE from '#app/constants/SALARY_TYPE.ts'
import WORK_PRESENCE from '#app/constants/WORK_PRESENCE.js'

export const jobPostingSchema = z
	.object({
		jobTitle: z.string({ required_error: 'Job Title is required' }),
		companyName: z.string({ required_error: 'Company Name is required' }),
		category: z.enum(JOB_CATEGORIES, {
			required_error: 'Category is required',
		}),
		employmentType: z.enum(EMPLOYMENT_TYPE, {
			required_error: 'Employment Type is required',
		}),
		jobDescription: z.string({ required_error: 'Job Description is required' }),
		salaryMin: z.preprocess(
			(val) => Number(val),
			z
				.number()
				.nonnegative()
				.max(1_000_000, { message: 'Cannot exceed $1,000,000' })
				.optional(),
		),
		salaryMax: z.preprocess(
			(val) => Number(val),
			z
				.number()
				.nonnegative()
				.max(1_000_000, { message: 'Cannot exceed $1,000,000' })
				.optional(),
		),
		salaryType: z.enum(SALARY_TYPE, {
			required_error: 'Required',
		}),
		partOfTown: z.string().optional(),
		workPresence: z.enum(WORK_PRESENCE, {
			required_error: 'Required',
		}),
		companyWebsite: z
			.string()
			.url({ message: 'Invalid url. Make sure to include protocol (https://)' })
			.optional(),
		howToApply: z.enum([
			'applyOnline',
			'emailResume',
			'callPhone',
			'customInstructions',
		]),
		linkToApply: z.string().url().optional(),
		contactEmail: z.string().email().optional(),
		contactPhone: z
			.string()
			.regex(new RegExp(/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}$/), {
				message: 'Invalid phone number',
			})
			.optional(),
		customInstructions: z.string().optional(),
	})
	.refine(
		(data) => {
			return (
				!data.salaryMin || !data.salaryMax || data.salaryMin <= data.salaryMax
			)
		},
		{
			message: 'Salary Min cannot be greater than Salary Max',
			path: ['salaryMin'],
		},
	)
	.refine(
		(data) => {
			return data.linkToApply || data.howToApply !== 'applyOnline'
		},
		{
			message: 'Link to Apply is required if "Apply Online" is chosen',
			path: ['linkToApply'],
		},
	)
	.refine(
		(data) => {
			return data.contactEmail || data.howToApply !== 'emailResume'
		},
		{
			message: 'Contact Email is required if "Email Resume" is chosen',
			path: ['contactEmail'],
		},
	)
	.refine(
		(data) => {
			return data.contactPhone || data.howToApply !== 'callPhone'
		},
		{
			message: 'Contact Phone is required if "Call Phone" is chosen',
			path: ['contactPhone'],
		},
	)
	.refine(
		(data) => {
			return data.customInstructions || data.howToApply !== 'customInstructions'
		},
		{
			message:
				'Custom Instructions are required if "Custom Application Instructions" is chosen',
			path: ['customInstructions'],
		},
	)
