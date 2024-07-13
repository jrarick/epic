import {
	getFormProps,
	getInputProps,
	getSelectProps,
	getTextareaProps,
	useForm,
	type SubmissionResult,
} from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { type JobPosting } from '@prisma/client'
import { type SerializeFrom } from '@remix-run/node'
import { Form, Link } from '@remix-run/react'
import { useState } from 'react'
import { Button, buttonVariants } from '#app/components/ui/button.tsx'
import EMPLOYMENT_TYPE from '#app/constants/EMPLOYMENT_TYPE.ts'
import JOB_CATEGORIES from '#app/constants/JOB_CATEGORIES.ts'
import SALARY_TYPE from '#app/constants/SALARY_TYPE.ts'
import WORK_PRESENCE from '#app/constants/WORK_PRESENCE.ts'
import { jobPostingSchema } from '#app/schemas/job-posting-schema.ts'
import { cn } from '#app/utils/misc.tsx'
import { ErrorList, Field, SelectField } from './forms.tsx'
import EditorField from './tip-tap/editor-field.tsx'
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from './ui/card.tsx'
import { Input } from './ui/input.tsx'
import { Label } from './ui/label.tsx'
import { RadioGroup, RadioGroupItem } from './ui/radio-group.tsx'
import { Textarea } from './ui/textarea.tsx'

export default function JobPostingForm({
	job,
	lastResult,
}: {
	job?: SerializeFrom<JobPosting>
	lastResult?: SubmissionResult<string[]>
}) {
	const [howToApply, setHowToApply] = useState(
		job && job.contactEmail
			? 'emailResume'
			: job && job.contactPhone
				? 'callPhone'
				: job && job.customInstructions
					? 'customInstructions'
					: 'customInstructions',
	)

	const [form, fields] = useForm({
		lastResult,
		onValidate({ formData }) {
			return parseWithZod(formData, { schema: jobPostingSchema })
		},
		shouldValidate: 'onSubmit',
		shouldRevalidate: 'onInput',
		defaultValue: {
			jobTitle: job?.jobTitle ?? '',
			companyName: job?.companyName ?? '',
			category: job?.category ?? '',
			employmentType: job?.employmentType ?? '',
			jobDescription: job?.jobDescription ?? '',
			salaryMin: job?.salaryMin?.toString() ?? undefined,
			salaryMax: job?.salaryMax?.toString() ?? undefined,
			salaryType: job?.salaryType ?? 'Hourly',
			partOfTown: job?.partOfTown ?? '',
			workPresence: job?.workPresence ?? 'In person',
			companyWebsite: job?.companyWebsite ?? '',
			linkToApply: job?.linkToApply ?? '',
			contactEmail: job?.contactEmail ?? '',
			contactPhone: job?.contactPhone ?? '',
			customInstructions: job?.customInstructions ?? '',
		},
	})

	return (
		<Card className="max-w-4xl">
			<Form method="post" action="/advertise-job" {...getFormProps(form)}>
				<CardHeader>
					<CardTitle className="font-display text-3xl font-medium">
						{job ? 'Edit Job Posting' : 'Advertise A Job'}
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid space-y-4 lg:grid-cols-2 lg:gap-x-20 lg:space-y-0">
						<div className="flex flex-col">
							<Field
								labelProps={{
									htmlFor: fields.jobTitle.id,
									children: 'Job Title*',
								}}
								inputProps={getInputProps(fields.jobTitle, { type: 'text' })}
								errors={fields.jobTitle.errors}
							/>
							<Field
								labelProps={{
									htmlFor: fields.companyName.id,
									children: 'Company Name*',
								}}
								inputProps={getInputProps(fields.companyName, { type: 'text' })}
								errors={fields.companyName.errors}
							/>
							<Field
								labelProps={{
									htmlFor: fields.companyWebsite.id,
									children: 'Company Website',
								}}
								inputProps={getInputProps(fields.companyWebsite, {
									type: 'url',
								})}
								errors={fields.companyWebsite.errors}
							/>
							<SelectField
								labelProps={{
									htmlFor: fields.category.id,
									children: 'Category*',
								}}
								selectProps={getSelectProps(fields.category)}
								items={JOB_CATEGORIES.map((category) => ({
									name: category,
									value: category,
								}))}
								errors={fields.category.errors}
							/>
							<SelectField
								labelProps={{
									htmlFor: fields.employmentType.id,
									children: 'Employment Type*',
								}}
								selectProps={getSelectProps(fields.employmentType)}
								items={EMPLOYMENT_TYPE.map((type) => ({
									name: type,
									value: type,
								}))}
								errors={fields.employmentType.errors}
							/>
						</div>
						<div className="flex flex-col">
							<div className="flex max-w-lg flex-row items-center space-x-2 sm:space-x-4">
								<div className="flex-grow">
									<Field
										labelProps={{
											htmlFor: fields.salaryMin.id,
											children: 'Salary Min',
										}}
										inputProps={getInputProps(fields.salaryMin, {
											type: 'number',
										})}
										errors={fields.salaryMin.errors}
									/>
								</div>
								<span className="mb-4">to</span>
								<div className="flex-grow">
									<Field
										labelProps={{
											htmlFor: fields.salaryMax.id,
											children: 'Salary Max',
										}}
										inputProps={getInputProps(fields.salaryMax, {
											type: 'number',
										})}
										errors={fields.salaryMax.errors}
									/>
								</div>
								<SelectField
									labelProps={{
										htmlFor: fields.salaryType.id,
										children: 'Salary Type*',
									}}
									selectProps={getSelectProps(fields.salaryType)}
									errors={fields.salaryType.errors}
									items={SALARY_TYPE.map((type) => ({
										name: type,
										value: type,
									}))}
									className="w-40"
								/>
							</div>
							<div className="flex max-w-lg flex-row space-x-2 sm:space-x-4">
								<div className="flex-grow">
									<Field
										labelProps={{
											htmlFor: fields.partOfTown.id,
											children: 'Part of Town',
										}}
										inputProps={getInputProps(fields.partOfTown, {
											type: 'text',
										})}
										errors={fields.partOfTown.errors}
									/>
								</div>
								<SelectField
									className="w-40"
									labelProps={{
										htmlFor: fields.workPresence.id,
										children: 'Work Presence*',
									}}
									selectProps={getSelectProps(fields.workPresence)}
									items={WORK_PRESENCE.map((presence) => ({
										name: presence,
										value: presence,
									}))}
									errors={fields.workPresence.errors}
								/>
							</div>
							<div>
								<RadioGroup
									defaultValue={howToApply}
									onValueChange={(value) => setHowToApply(value)}
									aria-label="How to Apply"
									className="pb-8"
								>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="applyOnline" id="r1" />
										<Label htmlFor="r1">Apply Online</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="emailResume" id="r2" />
										<Label htmlFor="r2">Email Resume</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="callPhone" id="r3" />
										<Label htmlFor="r3">Call Phone</Label>
									</div>
									<div className="flex items-center space-x-2">
										<RadioGroupItem value="customInstructions" id="r4" />
										<Label htmlFor="r4">Custom Application Instructions</Label>
									</div>
								</RadioGroup>
								<input type="hidden" name="howToApply" value={howToApply} />
							</div>
							<div className="grid w-full max-w-lg items-center gap-1.5">
								<Label
									htmlFor={
										howToApply === 'applyOnline'
											? 'linkToApply'
											: howToApply === 'emailResume'
												? 'contactEmail'
												: howToApply === 'callPhone'
													? 'contactPhone'
													: howToApply === 'customInstructions'
														? 'customInstructions'
														: ''
									}
								>
									{howToApply === 'applyOnline'
										? 'Link To Apply*'
										: howToApply === 'emailResume'
											? 'Contact Email*'
											: howToApply === 'callPhone'
												? 'Contact Phone*'
												: howToApply === 'customInstructions'
													? 'Custom Application Instructions*'
													: ''}
								</Label>
								<Input
									{...getInputProps(fields.linkToApply, {
										type: howToApply === 'applyOnline' ? 'url' : 'hidden',
									})}
									hidden={howToApply !== 'applyOnline'}
									className={
										fields.linkToApply.errors
											? 'outline-none ring-2 ring-destructive ring-offset-2'
											: ''
									}
								/>
								<Input
									{...getInputProps(fields.contactEmail, {
										type: howToApply === 'emailResume' ? 'email' : 'hidden',
									})}
									hidden={howToApply !== 'emailResume'}
									className={
										fields.contactEmail.errors
											? 'outline-none ring-2 ring-destructive ring-offset-2'
											: ''
									}
								/>
								<Input
									{...getInputProps(fields.contactPhone, {
										type: howToApply === 'callPhone' ? 'tel' : 'hidden',
									})}
									hidden={howToApply !== 'callPhone'}
									className={
										fields.contactPhone.errors
											? 'outline-none ring-2 ring-destructive ring-offset-2'
											: ''
									}
								/>
								<Textarea
									{...getTextareaProps(fields.customInstructions)}
									hidden={howToApply !== 'customInstructions'}
									className={cn('min-h-28', {
										hidden: howToApply !== 'customInstructions',
										'outline-none ring-2 ring-destructive ring-offset-2':
											fields.customInstructions.errors,
									})}
								/>
								<div className="min-h-[32px] px-4 pb-3 pt-1">
									<ErrorList
										errors={
											fields.linkToApply.errors ??
											fields.contactEmail.errors ??
											fields.contactPhone.errors ??
											fields.customInstructions.errors ??
											undefined
										}
									/>
								</div>
							</div>
						</div>
					</div>
					<div className="grid max-w-lg gap-1.5 lg:max-w-full">
						<div className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
							Job Description*
						</div>
						<EditorField
							meta={fields.jobDescription}
							content={job?.jobDescription ?? undefined}
							errors={fields.jobDescription.errors}
						/>
					</div>
				</CardContent>
				<CardFooter>
					<div>
						<div className="space-x-6">
							<Button type="submit">{job ? 'Save' : 'Submit'}</Button>
							<Link
								className={buttonVariants({
									variant: 'ghost',
								})}
								to="/"
							>
								Cancel
							</Link>
						</div>
						<p className="mt-6 text-xs italic text-muted-foreground">
							*Denotes required field
						</p>
					</div>
				</CardFooter>
			</Form>
		</Card>
	)
}
