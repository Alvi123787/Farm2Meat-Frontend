import useDocumentTitle from '../hooks/useDocumentTitle'

export default function PageTitle({ title, children }) {
  useDocumentTitle(title)
  return children
}
