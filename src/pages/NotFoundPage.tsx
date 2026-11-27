import { Link } from 'react-router'
import { Card, EmptyState } from '../components/ui'

export function NotFoundPage() {
  return (
    <Card>
      <EmptyState
        title="Page introuvable"
        description="Cette page n'existe pas ou a été déplacée."
        action={
          <Link to="/" className="font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Retour au tableau de bord
          </Link>
        }
      />
    </Card>
  )
}
