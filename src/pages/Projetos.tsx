import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { ListarProjetos } from '@/dashboard/ListarProjetos'

export const Projetos = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold">Projetos</h1>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/dashboard">Painel</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/projetos/cadastrar">Novo projeto</Link>
            </Button>
            <Button variant="secondary" onClick={handleSignOut}>
              Sair
            </Button>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">
        <ListarProjetos />
      </main>
    </div>
  )
}
