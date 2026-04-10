import { useLayoutEffect } from 'react'

export const SITE_NAME = 'Farm To Meat'

export function formatDocumentTitle(pageTitle) {
  const normalizedTitle = typeof pageTitle === 'string' ? pageTitle.trim() : ''
  return normalizedTitle ? `${SITE_NAME} • ${normalizedTitle}` : SITE_NAME
}

export default function useDocumentTitle(pageTitle) {
  useLayoutEffect(() => {
    document.title = formatDocumentTitle(pageTitle)
  }, [pageTitle])
}
