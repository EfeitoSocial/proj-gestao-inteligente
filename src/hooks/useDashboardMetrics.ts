import { useState, useEffect } from 'react'
import { supabase, hasValidSupabaseConfig } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

export interface DashboardMetrics {
  totalProjetos: number
  totalInvestimento: number
  totalLocalizacoes: number
  impactoSocial: number
  valorTotalProjetos: number
  pessoasImpactadas: number
}

export const useDashboardMetrics = () => {
  const { user } = useAuth()
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalProjetos: 0,
    totalInvestimento: 0,
    totalLocalizacoes: 0,
    impactoSocial: 0,
    valorTotalProjetos: 0,
    pessoasImpactadas: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMetrics = async () => {
      if (!user) return

      if (!hasValidSupabaseConfig) {
        // Dados mockados caso as credenciais do Supabase não estejam configuradas
        setMetrics({
          totalProjetos: 24,
          totalInvestimento: 1250000,
          totalLocalizacoes: 8,
          impactoSocial: 2500000,
          valorTotalProjetos: 3200000,
          pessoasImpactadas: 15420,
        })
        setLoading(false)
        return
      }

      try {
        // Buscar todos os projetos do usuário
        const { data: projetos, error } = await supabase
          .from('projetos')
          .select(`
            id,
            valor_total_projeto,
            valor_aporte_projeto,
            numero_pessoas_impactadas,
            localidade_projeto
          `)
          .eq('user_id', user.id)

        if (error) throw error

        // Calcular métricas
        const totalProjetos = projetos?.length || 0

        const totalInvestimento =
          projetos?.reduce(
            (sum, projeto) => sum + (Number(projeto.valor_aporte_projeto) || 0),
            0,
          ) || 0

        const valorTotalProjetos =
          projetos?.reduce((sum, projeto) => sum + (Number(projeto.valor_total_projeto) || 0), 0) ||
          0

        const pessoasImpactadas =
          projetos?.reduce((sum, projeto) => sum + (projeto.numero_pessoas_impactadas || 0), 0) || 0

        // Contar localidades únicas
        const localizacoes = new Set(projetos?.map((p) => p.localidade_projeto).filter(Boolean))
        const totalLocalizacoes = localizacoes.size

        // Calcular impacto social (pode ser uma fórmula específica)
        const impactoSocial = valorTotalProjetos

        setMetrics({
          totalProjetos,
          totalInvestimento,
          totalLocalizacoes,
          impactoSocial,
          valorTotalProjetos,
          pessoasImpactadas,
        })
      } catch (error) {
        console.error('Erro ao buscar métricas:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [user])

  return { metrics, loading }
}
