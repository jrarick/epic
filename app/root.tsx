import { getFormProps, useForm } from '@conform-to/react'
import { parseWithZod } from '@conform-to/zod'
import { invariantResponse } from '@epic-web/invariant'
import {
	json,
	type LoaderFunctionArgs,
	type ActionFunctionArgs,
	type HeadersFunction,
	type LinksFunction,
	type MetaFunction,
} from '@remix-run/node'
import {
	Form,
	Link,
	Links,
	Meta,
	Outlet,
	Scripts,
	ScrollRestoration,
	useFetcher,
	useFetchers,
	useLoaderData,
} from '@remix-run/react'
import { withSentry } from '@sentry/remix'
import { HoneypotProvider } from 'remix-utils/honeypot/react'
import { z } from 'zod'
import ProvidenceIcon from './assets/providence-icon.svg'
import { GeneralErrorBoundary } from './components/error-boundary.tsx'
import { EpicProgress } from './components/progress-bar.tsx'
import { useToast } from './components/toaster.tsx'
import { Avatar, AvatarFallback } from './components/ui/avatar.tsx'

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from './components/ui/dropdown-menu.tsx'
import { Icon, href as iconsHref } from './components/ui/icon.tsx'
import { EpicToaster } from './components/ui/sonner.tsx'
import tailwindStyleSheetUrl from './styles/tailwind.css?url'
import { getUserId, logout } from './utils/auth.server.ts'
import { ClientHintCheck, getHints, useHints } from './utils/client-hints.tsx'
import { prisma } from './utils/db.server.ts'
import { getEnv } from './utils/env.server.ts'
import { honeypot } from './utils/honeypot.server.ts'
import { combineHeaders, getDomainUrl } from './utils/misc.tsx'
import { useNonce } from './utils/nonce-provider.ts'
import { useRequestInfo } from './utils/request-info.ts'
import { type Theme, setTheme, getTheme } from './utils/theme.server.ts'
import { makeTimings, time } from './utils/timing.server.ts'
import { getToast } from './utils/toast.server.ts'
import { useOptionalUser } from './utils/user.ts'

export const links: LinksFunction = () => {
	return [
		// Preload svg sprite as a resource to avoid render blocking
		{ rel: 'preload', href: iconsHref, as: 'image' },
		// Preload CSS as a resource to avoid render blocking
		{ rel: 'mask-icon', href: '/favicons/mask-icon.svg' },
		{
			rel: 'alternate icon',
			type: 'image/png',
			href: '/favicons/favicon-32x32.png',
		},
		{ rel: 'apple-touch-icon', href: '/favicons/apple-touch-icon.png' },
		{
			rel: 'manifest',
			href: '/site.webmanifest',
			crossOrigin: 'use-credentials',
		} as const, // necessary to make typescript happy
		//These should match the css preloads above to avoid css as render blocking resource
		{ rel: 'icon', type: 'image/svg+xml', href: '/favicons/favicon.svg' },
		{ rel: 'stylesheet', href: 'https://use.typekit.net/jfz8jfw.css' },
		{ rel: 'stylesheet', href: tailwindStyleSheetUrl },
	].filter(Boolean)
}

export const meta: MetaFunction<typeof loader> = ({ data }) => {
	return [
		{ title: data ? 'Epic Notes' : 'Error | Epic Notes' },
		{ name: 'description', content: `Your own captain's log` },
	]
}

export async function loader({ request }: LoaderFunctionArgs) {
	const timings = makeTimings('root loader')
	const userId = await time(() => getUserId(request), {
		timings,
		type: 'getUserId',
		desc: 'getUserId in root',
	})

	const user = userId
		? await time(
				() =>
					prisma.user.findUniqueOrThrow({
						select: {
							id: true,
							firstName: true,
							lastName: true,
							username: true,
							email: true,
							image: { select: { id: true } },
							roles: {
								select: {
									name: true,
									permissions: {
										select: { entity: true, action: true, access: true },
									},
								},
							},
						},
						where: { id: userId },
					}),
				{ timings, type: 'find user', desc: 'find user in root' },
			)
		: null
	if (userId && !user) {
		console.info('something weird happened')
		// something weird happened... The user is authenticated but we can't find
		// them in the database. Maybe they were deleted? Let's log them out.
		await logout({ request, redirectTo: '/' })
	}
	const { toast, headers: toastHeaders } = await getToast(request)
	const honeyProps = honeypot.getInputProps()

	return json(
		{
			user,
			requestInfo: {
				hints: getHints(request),
				origin: getDomainUrl(request),
				path: new URL(request.url).pathname,
				userPrefs: {
					theme: getTheme(request),
				},
			},
			ENV: getEnv(),
			toast,
			honeyProps,
		},
		{
			headers: combineHeaders(
				{ 'Server-Timing': timings.toString() },
				toastHeaders,
			),
		},
	)
}

export const headers: HeadersFunction = ({ loaderHeaders }) => {
	const headers = {
		'Server-Timing': loaderHeaders.get('Server-Timing') ?? '',
	}
	return headers
}

const ThemeFormSchema = z.object({
	theme: z.enum(['system', 'light', 'dark']),
})

export async function action({ request }: ActionFunctionArgs) {
	const formData = await request.formData()
	const submission = parseWithZod(formData, {
		schema: ThemeFormSchema,
	})

	invariantResponse(submission.status === 'success', 'Invalid theme received')

	const { theme } = submission.value

	const responseInit = {
		headers: { 'set-cookie': setTheme(theme) },
	}
	return json({ result: submission.reply() }, responseInit)
}

function Document({
	children,
	nonce,
	theme = 'light',
	env = {},
	allowIndexing = true,
}: {
	children: React.ReactNode
	nonce: string
	theme?: Theme
	env?: Record<string, string>
	allowIndexing?: boolean
}) {
	return (
		<html lang="en" className={`${theme} h-full`}>
			<head>
				<ClientHintCheck nonce={nonce} />
				<Meta />
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width,initial-scale=1" />
				{allowIndexing ? null : (
					<meta name="robots" content="noindex, nofollow" />
				)}
				<Links />
			</head>
			<body className="bg-background text-foreground">
				{children}
				<script
					nonce={nonce}
					dangerouslySetInnerHTML={{
						__html: `window.ENV = ${JSON.stringify(env)}`,
					}}
				/>
				<ScrollRestoration nonce={nonce} />
				<Scripts nonce={nonce} />
			</body>
		</html>
	)
}

function App() {
	const data = useLoaderData<typeof loader>()
	const nonce = useNonce()
	const user = useOptionalUser()
	const theme = useTheme()
	// const matches = useMatches()
	// const isOnSearchPage = matches.find(m => m.id === 'routes/users+/index')
	// const searchBar = isOnSearchPage ? null : <SearchBar status="idle" />
	const allowIndexing = data.ENV.ALLOW_INDEXING !== 'false'
	useToast(data.toast)

	const footerItems = [
		{ name: 'Browse Jobs', href: '/jobs' },
		{ name: 'Advertise Job', href: '/advertise-job' },
		{ name: 'My Account', href: '/account' },
	]

	return (
		<Document
			nonce={nonce}
			theme={theme}
			allowIndexing={allowIndexing}
			env={data.ENV}
		>
			<div className="flex flex-col justify-between">
				{/* <header className="container py-6">
					<nav className="flex flex-wrap items-center justify-between gap-4 sm:flex-nowrap md:gap-8">
						<Logo />
						<div className="ml-auto hidden max-w-sm flex-1 sm:block">
							{searchBar}
						</div>
						<div className="flex items-center gap-10">
							{user ? (
								<UserDropdown />
							) : (
								<Button asChild variant="default" size="lg">
									<Link to="/login">Log In</Link>
								</Button>
							)}
						</div>
						<div className="block w-full sm:hidden">{searchBar}</div>
					</nav>
				</header> */}
				<header className="border-b border-border px-12 py-8">
					<div className="flex flex-row items-center justify-between">
						<Link
							to="/"
							className="max-w-1/2 font-display text-2xl font-medium uppercase tracking-widest antialiased sm:text-3xl"
							unstable_viewTransition
						>
							<div>Providence</div>
							<div>Job Board</div>
						</Link>
						<div className="flex flex-row items-center gap-6">
							<ThemeSwitch userPreference={data.requestInfo.userPrefs.theme} />
							{user && (
								<DropdownMenu>
									<DropdownMenuTrigger>
										<Avatar
											className="border-2 border-border shadow shadow-primary transition-colors hover:border-primary"
											title="Account"
										>
											<AvatarFallback className="font-display font-bold">
												{user.firstName.slice(0, 1) + user.lastName.slice(0, 1)}
											</AvatarFallback>
										</Avatar>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem asChild>
											<Link
												to={`/users/${user.username}`}
												unstable_viewTransition
											>
												<Icon size="sm" name="avatar">
													Profile
												</Icon>
											</Link>
										</DropdownMenuItem>
										<DropdownMenuItem asChild>
											<Link to="/settings/profile" unstable_viewTransition>
												<Icon size="sm" name="gear">
													Settings
												</Icon>
											</Link>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<Form action="/logout" method="POST">
											<DropdownMenuItem asChild>
												<button type="submit" className="h-full w-full">
													<Icon size="sm" name="exit">
														Logout
													</Icon>
												</button>
											</DropdownMenuItem>
										</Form>
									</DropdownMenuContent>
								</DropdownMenu>
							)}
						</div>
					</div>
				</header>
				<Outlet />
				{/* <div className="container flex justify-between pb-5">
					<Logo />
					<ThemeSwitch userPreference={data.requestInfo.userPrefs.theme} />
				</div> */}
				<footer
					className="bg-primary text-primary-foreground selection:bg-primary-foreground selection:text-primary"
					aria-labelledby="footer-heading"
				>
					<h2 id="footer-heading" className="sr-only">
						Footer
					</h2>
					<div className="mx-auto max-w-7xl px-6 pb-8 pt-16 sm:pt-24 lg:px-8 lg:pt-32">
						<div className="md:grid md:grid-cols-2 md:gap-8">
							<div className="space-y-8">
								<Link
									to="/"
									aria-label="Home"
									className="max-w-min"
									unstable_viewTransition
								>
									<img
										className="h-32"
										src={ProvidenceIcon}
										alt="Providence Icon"
									/>
								</Link>
								<p className="max-w-96 text-sm leading-6 text-primary-foreground">
									The Providence job board exists as a networking platform for
									job seekers to connect with employers within the Providence
									Church community.
								</p>
							</div>
							<div className="mt-16 gap-8 md:mt-0">
								<ul className="mt-6 space-y-4">
									{footerItems.map((item) => (
										<li key={item.name}>
											<Link
												to={item.href}
												className="font-display text-lg font-bold uppercase leading-6 tracking-widest text-primary-foreground transition-colors hover:text-primary-foreground/60"
												unstable_viewTransition
											>
												{item.name}
											</Link>
										</li>
									))}
									<li>
										<a
											href="https://providenceaustin.com/"
											target="_blank"
											rel="noreferrer"
											className="font-display text-lg font-bold uppercase leading-6 tracking-widest text-primary-foreground transition-colors hover:text-primary-foreground/60"
										>
											Providence Website
										</a>
									</li>
								</ul>
							</div>
						</div>
						<div className="mt-16 flex flex-col justify-between space-y-6 border-t border-white/10 pt-8 sm:mt-20 md:flex-row md:space-y-0 lg:mt-24">
							<p className="text-xs leading-5">
								&copy; {new Date().getFullYear()} Providence Church. All rights
								reserved.
							</p>
							<p className="max-w-96 text-xs leading-5 text-muted-foreground">
								Experiencing an issue? Email{' '}
								<a
									// eslint-disable-next-line remix-react-routes/use-link-for-routes
									href="mailto:josh@longhorndesign.studio"
									className="hover:underline"
								>
									josh@longhorndesign.studio
								</a>{' '}
								with a description of the problem.
							</p>
						</div>
					</div>
				</footer>
			</div>
			<EpicToaster closeButton position="top-center" theme={theme} />
			<EpicProgress />
		</Document>
	)
}

// function Logo() {
// 	return (
// 		<Link to="/" className="group grid leading-snug">
// 			<span className="font-light transition group-hover:-translate-x-1">
// 				epic
// 			</span>
// 			<span className="font-bold transition group-hover:translate-x-1">
// 				notes
// 			</span>
// 		</Link>
// 	)
// }

function AppWithProviders() {
	const data = useLoaderData<typeof loader>()
	return (
		<HoneypotProvider {...data.honeyProps}>
			<App />
		</HoneypotProvider>
	)
}

export default withSentry(AppWithProviders)

// function UserDropdown() {
// 	const user = useUser()
// 	const submit = useSubmit()
// 	const formRef = useRef<HTMLFormElement>(null)
// 	return (
// 		<DropdownMenu>
// 			<DropdownMenuTrigger asChild>
// 				<Button asChild variant="secondary">
// 					<Link
// 						to={`/users/${user.username}`}
// 						// this is for progressive enhancement
// 						onClick={e => e.preventDefault()}
// 						className="flex items-center gap-2"
// 					>
// 						<img
// 							className="h-8 w-8 rounded-full object-cover"
// 							alt={user.firstName ?? user.username}
// 							src={getUserImgSrc(user.image?.id)}
// 						/>
// 						<span className="text-body-sm font-bold">
// 							{user.firstName ?? user.username}
// 						</span>
// 					</Link>
// 				</Button>
// 			</DropdownMenuTrigger>
// 			<DropdownMenuPortal>
// 				<DropdownMenuContent sideOffset={8} align="start">
// 					<DropdownMenuItem asChild>
// 						<Link prefetch="intent" to={`/users/${user.username}`}>
// 							<Icon className="text-body-md" name="avatar">
// 								Profile
// 							</Icon>
// 						</Link>
// 					</DropdownMenuItem>
// 					<DropdownMenuItem asChild>
// 						<Link prefetch="intent" to={`/users/${user.username}/notes`}>
// 							<Icon className="text-body-md" name="pencil-2">
// 								Notes
// 							</Icon>
// 						</Link>
// 					</DropdownMenuItem>
// 					<DropdownMenuItem
// 						asChild
// 						// this prevents the menu from closing before the form submission is completed
// 						onSelect={event => {
// 							event.preventDefault()
// 							submit(formRef.current)
// 						}}
// 					>
// 						<Form action="/logout" method="POST" ref={formRef}>
// 							<Icon className="text-body-md" name="exit">
// 								<button type="submit">Logout</button>
// 							</Icon>
// 						</Form>
// 					</DropdownMenuItem>
// 				</DropdownMenuContent>
// 			</DropdownMenuPortal>
// 		</DropdownMenu>
// 	)
// }

/**
 * @returns the user's theme preference, or the client hint theme if the user
 * has not set a preference.
 */
export function useTheme() {
	const hints = useHints()
	const requestInfo = useRequestInfo()
	const optimisticMode = useOptimisticThemeMode()
	if (optimisticMode) {
		return optimisticMode === 'system' ? hints.theme : optimisticMode
	}
	return requestInfo.userPrefs.theme ?? hints.theme
}

/**
 * If the user's changing their theme mode preference, this will return the
 * value it's being changed to.
 */
export function useOptimisticThemeMode() {
	const fetchers = useFetchers()
	const themeFetcher = fetchers.find((f) => f.formAction === '/')

	if (themeFetcher && themeFetcher.formData) {
		const submission = parseWithZod(themeFetcher.formData, {
			schema: ThemeFormSchema,
		})

		if (submission.status === 'success') {
			return submission.value.theme
		}
	}
}

function ThemeSwitch({ userPreference }: { userPreference?: Theme | null }) {
	const fetcher = useFetcher<typeof action>()

	const [form] = useForm({
		id: 'theme-switch',
		lastResult: fetcher.data?.result,
	})

	const optimisticMode = useOptimisticThemeMode()
	const mode = optimisticMode ?? userPreference ?? 'system'
	const nextMode =
		mode === 'system' ? 'light' : mode === 'light' ? 'dark' : 'system'
	const modeLabel = {
		light: (
			<Icon name="sun">
				<span className="sr-only">Light</span>
			</Icon>
		),
		dark: (
			<Icon name="moon">
				<span className="sr-only">Dark</span>
			</Icon>
		),
		system: (
			<Icon name="laptop">
				<span className="sr-only">System</span>
			</Icon>
		),
	}

	return (
		<fetcher.Form method="POST" {...getFormProps(form)}>
			<input type="hidden" name="theme" value={nextMode} />
			<div className="flex gap-2">
				<button
					type="submit"
					className="flex h-8 w-8 cursor-pointer items-center justify-center"
				>
					{modeLabel[mode]}
				</button>
			</div>
		</fetcher.Form>
	)
}

export function ErrorBoundary() {
	// the nonce doesn't rely on the loader so we can access that
	const nonce = useNonce()

	// NOTE: you cannot use useLoaderData in an ErrorBoundary because the loader
	// likely failed to run so we have to do the best we can.
	// We could probably do better than this (it's possible the loader did run).
	// This would require a change in Remix.

	// Just make sure your root route never errors out and you'll always be able
	// to give the user a better UX.

	return (
		<Document nonce={nonce}>
			<GeneralErrorBoundary />
		</Document>
	)
}
