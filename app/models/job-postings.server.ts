import { type JobPosting } from '@prisma/client'
import RESULTS_PER_PAGE from '#app/constants/RESULTS_PER_PAGE.ts'
import { prisma } from '#app/utils/db.server.ts'

export function getFirstJobOnPage(page: number = 1) {
	return prisma.jobPosting.findFirst({
		skip: (page - 1) * RESULTS_PER_PAGE,
		take: 1,
		orderBy: { createdAt: 'desc' },
		include: {
			author: {
				select: {
					firstName: true,
					lastName: true,
				},
			},
		},
	})
}

export function getJobPostings(page: number = 1) {
	return prisma.jobPosting.findMany({
		skip: (page - 1) * RESULTS_PER_PAGE,
		take: RESULTS_PER_PAGE,
		select: {
			category: true,
			companyName: true,
			createdAt: true,
			id: true,
			jobDescription: true,
			jobTitle: true,
			partOfTown: true,
			author: {
				select: {
					firstName: true,
					lastName: true,
				},
			},
		},
		orderBy: { createdAt: 'desc' },
	})
}

export function getJobPosting(id: JobPosting['id']) {
	return prisma.jobPosting.findFirst({
		where: { id },
		include: {
			author: {
				select: {
					firstName: true,
					lastName: true,
				},
			},
		},
	})
}

export function getJobPostingsByAuthorId(authorId: JobPosting['authorId']) {
	return prisma.jobPosting.findMany({
		orderBy: { createdAt: 'desc' },
		where: { authorId },
	})
}

export function getJobPostingsCount() {
	return prisma.jobPosting.count()
}

export function createJobPosting({
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
	authorId,
}: Pick<
	JobPosting,
	| 'jobTitle'
	| 'companyName'
	| 'category'
	| 'employmentType'
	| 'jobDescription'
	| 'salaryMin'
	| 'salaryMax'
	| 'salaryType'
	| 'partOfTown'
	| 'workPresence'
	| 'companyWebsite'
	| 'linkToApply'
	| 'contactEmail'
	| 'contactPhone'
	| 'customInstructions'
> & {
	authorId: JobPosting['authorId']
}) {
	return prisma.jobPosting.create({
		data: {
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
			author: {
				connect: {
					id: authorId,
				},
			},
		},
	})
}

export function deleteJobPosting(id: JobPosting['id']) {
	return prisma.jobPosting.delete({
		where: { id },
	})
}
