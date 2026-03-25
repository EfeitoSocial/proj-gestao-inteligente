import { Link, useNavigate } from 'react-router-dom'
import { DollarSign, FolderKanban, MapPin, Users } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { useDashboardMetrics } from '@/hooks/useDashboardMetrics'
import { MetricsCard } from '@/dashboard/MetricsCard'
import { DevelopmentChart } from '@/dashboard/DevelopmentChart'
import { ImpactChart } from '@/dashboard/ImpactChart'
import { ProjectsList } from '@/dashboard/ProjectsList'
import { LocationsMap } from '@/dashboard/LocationsMap'

const formatBRL = (n: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(n)

export const Dashboard = () => {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()
  const { metrics, loading } = useDashboardMetrics()

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <h1 className="text-lg font-semibold">Painel</h1>
            <p className="text-sm text-muted-foreground">{user?.email ?? 'Usuário autenticado'}</p>
          </div>
          <nav className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/projetos">Projetos</Link>
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

      <main className="mx-auto max-w-6xl space-y-8 px-4 py-8">
        {loading ? (
          <p className="text-muted-foreground">Carregando métricas…</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricsCard
              title="Projetos"
              value={metrics.totalProjetos}
              icon={FolderKanban}
              iconColor="text-blue-500"
            />
            <MetricsCard
              title="Investimento (aportes)"
              value={formatBRL(metrics.totalInvestimento)}
              icon={DollarSign}
              iconColor="text-emerald-500"
            />
            <MetricsCard
              title="Localidades"
              value={metrics.totalLocalizacoes}
              icon={MapPin}
              iconColor="text-amber-500"
            />
            <MetricsCard
              title="Pessoas impactadas"
              value={metrics.pessoasImpactadas}
              icon={Users}
              iconColor="text-violet-500"
            />
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <DevelopmentChart />
          <ImpactChart />
        </div>

        <ProjectsList />
        <LocationsMap />
      </main>
    </div>
  )
}
