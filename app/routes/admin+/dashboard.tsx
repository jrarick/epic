import {
	type ActionFunctionArgs,
	type MetaFunction,
	json,
} from '@remix-run/node'
import { Form, useFetcher, useLoaderData } from '@remix-run/react'
import {
	type ColumnDef,
	flexRender,
	getCoreRowModel,
	useReactTable,
} from '@tanstack/react-table'
import { Trash } from 'lucide-react'
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
import { Button } from '#app/components/ui/button.tsx'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from '#app/components/ui/table.tsx'
import {
	deleteJobPosting,
	getJobPostings,
} from '#app/models/job-postings.server.ts'
import {
	deleteUserById,
	getUsers,
	addAdminRole,
	removeAdminRole,
} from '#app/models/user.server.ts'

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const _action = String(formData.get('_action'))
	const jobId = String(formData.get('jobId'))
	const userId = String(formData.get('userId'))
	const isAdmin = formData.get('isAdmin') === 'on'

	if (_action === 'deleteUser') {
		if (typeof userId !== 'string') {
			return json(
				{ errors: { userId: 'User ID is required' } },
				{ status: 400 },
			)
		}

		await deleteUserById(userId)

		return json({ success: true })
	}

	if (_action === 'deleteJob') {
		if (typeof jobId !== 'string') {
			return json({ errors: { jobId: 'Job ID is required' } }, { status: 400 })
		}

		await deleteJobPosting(jobId)

		return json({ success: true })
	}

	if (_action === 'toggleIsAdmin') {
		if (typeof userId !== 'string') {
			return json(
				{ errors: { userId: 'User ID is required' } },
				{ status: 400 },
			)
		}

		if (isAdmin) {
			await addAdminRole(userId)
		} else {
			await removeAdminRole(userId)
		}

		return json({ success: true })
	}
}

export async function loader() {
	let jobs = await getJobPostings()
	let users = await getUsers()

	if (!jobs) {
		jobs = []
	}

	if (!users) {
		users = []
	}

	return json({ jobs, users })
}

export const meta: MetaFunction = () => {
	return [{ title: 'Admin | Providence Job Board' }]
}

interface DataTableProps<TData, TValue> {
	columns: ColumnDef<TData, TValue>[]
	data: TData[]
}

function DataTable<TData, TValue>({
	columns,
	data,
}: DataTableProps<TData, TValue>) {
	const table = useReactTable({
		data,
		columns,
		getCoreRowModel: getCoreRowModel(),
	})

	return (
		<div className="rounded border border-border">
			<Table>
				<TableHeader>
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow key={headerGroup.id}>
							{headerGroup.headers.map((header) => (
								<TableHead key={header.id}>
									{header.isPlaceholder
										? null
										: flexRender(
												header.column.columnDef.header,
												header.getContext(),
											)}
								</TableHead>
							))}
						</TableRow>
					))}
				</TableHeader>
				<TableBody>
					{table.getRowModel().rows?.length ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								data-state={row.getIsSelected() ? 'selected' : null}
							>
								{row.getVisibleCells().map((cell) => (
									<TableCell key={cell.id}>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell colSpan={columns.length}>No results.</TableCell>
						</TableRow>
					)}
				</TableBody>
			</Table>
		</div>
	)
}

export default function Admin() {
	const fetcher = useFetcher<typeof action>()
	const { jobs, users } = useLoaderData<typeof loader>()

	interface JobPosting {
		id: string
		title: string
		company: string
		postedBy: string
		date: string
	}

	interface User {
		id: string
		email: string
		name: string
		createdAt: string
		isAdmin: boolean
	}

	const jobsColumns: ColumnDef<JobPosting>[] = [
		{
			accessorKey: 'title',
			header: 'Title',
		},
		{
			accessorKey: 'company',
			header: 'Company',
		},
		{
			accessorKey: 'postedBy',
			header: 'Posted By',
		},
		{
			accessorKey: 'date',
			header: 'Date',
			cell: ({ row }) => {
				const jobPosting = row.original
				return (
					<ClientOnly>
						{() => <time dateTime={jobPosting.date}>{jobPosting.date}</time>}
					</ClientOnly>
				)
			},
		},
		{
			accessorKey: 'delete',
			header: 'Delete',
			cell: ({ row }) => {
				const jobPosting = row.original

				return (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="border-destructive hover:bg-destructive/10 focus-visible:ring-destructive"
							>
								<Trash className="size-5 text-destructive" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle className="mb-2 text-2xl">
									Are you sure you want to delete this job posting?
								</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will permanently delete
									this job posting and completely remove it from the server.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter className="mt-4">
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<Form method="post" action="/admin/dashboard">
									<input type="hidden" name="jobId" value={jobPosting.id} />
									<AlertDialogAction
										type="submit"
										className="border border-destructive bg-background text-destructive transition-colors hover:bg-destructive/10"
										name="_action"
										value="deleteJob"
									>
										Delete
									</AlertDialogAction>
								</Form>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)
			},
		},
	]

	const usersColumns: ColumnDef<User>[] = [
		{
			accessorKey: 'name',
			header: 'Name',
		},
		{
			accessorKey: 'email',
			header: 'Email',
		},
		{
			accessorKey: 'createdAt',
			header: 'Joined',
		},
		{
			accessorKey: 'delete',
			header: 'Delete',
			cell: ({ row }) => {
				const user = row.original

				return (
					<AlertDialog>
						<AlertDialogTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="border-destructive hover:bg-destructive/10 focus-visible:ring-destructive"
							>
								<Trash className="size-5 text-destructive" />
							</Button>
						</AlertDialogTrigger>
						<AlertDialogContent>
							<AlertDialogHeader>
								<AlertDialogTitle className="mb-2 text-2xl">
									{`Are you sure you want to delete ${user.name}'s account?`}
								</AlertDialogTitle>
								<AlertDialogDescription>
									This action cannot be undone. This will permanently delete
									this user and any associated job postings or profiles from the
									server.
								</AlertDialogDescription>
							</AlertDialogHeader>
							<AlertDialogFooter className="mt-4">
								<AlertDialogCancel>Cancel</AlertDialogCancel>
								<Form method="post" action="/admin/dashboard">
									<input type="hidden" name="userId" value={user.id} />
									<AlertDialogAction
										type="submit"
										className="border border-destructive bg-background text-destructive transition-colors hover:bg-destructive/10"
										name="_action"
										value="deleteUser"
									>
										Delete
									</AlertDialogAction>
								</Form>
							</AlertDialogFooter>
						</AlertDialogContent>
					</AlertDialog>
				)
			},
		},
		{
			accessorKey: 'isAdmin',
			header: 'Is Admin?',
			cell: ({ row }) => {
				const user = row.original

				return (
					<div className="flex justify-center">
						<fetcher.Form method="post" action="/admin/dashboard">
							<input type="hidden" name="userId" value={user.id} />
							<input type="hidden" name="_action" value="toggleIsAdmin" />
							<input
								type="checkbox"
								name="isAdmin"
								checked={user.isAdmin}
								onChange={(e) =>
									fetcher.submit(e.currentTarget.form, {
										method: 'POST',
									})
								}
							/>
						</fetcher.Form>
					</div>
				)
			},
		},
	]

	const formattedJobsData = jobs.map((job) => ({
		id: job.id,
		title: job.jobTitle,
		company: job.companyName,
		date: new Date(job.createdAt).toLocaleDateString(),
		postedBy: job.author.firstName + ' ' + job.author.lastName,
	}))

	const formattedUsersData = users.map((user) => ({
		id: user.id,
		email: user.email,
		name: user.firstName + ' ' + user.lastName,
		createdAt: new Date(user.createdAt).toLocaleDateString(),
		isAdmin: user.roles.some((role) => role.name === 'admin'),
	}))

	return (
		<div className="mx-auto max-w-6xl px-4 py-20">
			<div className="space-y-12">
				<div>
					<h2 className="mb-6 font-display text-3xl font-bold">Job Postings</h2>
					<DataTable columns={jobsColumns} data={formattedJobsData} />
				</div>
				<div>
					<h2 className="mb-6 font-display text-3xl font-bold">Users</h2>
					<DataTable columns={usersColumns} data={formattedUsersData} />
				</div>
			</div>
		</div>
	)
}
