import { useEffect, useState } from 'react'

export function useMediaQuery(query: string) {
	const [matches, setMatches] = useState<boolean | null>(null)

	useEffect(() => {
		const mediaQueryList = window.matchMedia(query)

		const listener = () => setMatches(!!mediaQueryList.matches)
		mediaQueryList.addListener(listener)

		listener()

		return () => {
			mediaQueryList.removeListener(listener)
		}
	}, [query])

	return matches
}
