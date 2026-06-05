import { useLayoutEffect } from 'react'

export const SITE_NAME = 'MeatByAlvi'

export function formatDocumentTitle(pageTitle) {
  const normalizedTitle = typeof pageTitle === 'string' ? pageTitle.trim() : ''
  return normalizedTitle ? `${SITE_NAME} • ${normalizedTitle}` : SITE_NAME
}

export default function useDocumentTitle(pageTitle) {
  useLayoutEffect(() => {
    document.title = formatDocumentTitle(pageTitle)
  }, [pageTitle])
}
