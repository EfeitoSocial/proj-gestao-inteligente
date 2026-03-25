import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

interface ProjetoODS {
  id: string
  nome_projeto: string
  ods: {
    id: string
    numero: number
    nome: string
  }[]
}

export const ProjectsList: React.FC = () => {
  const { user } = useAuth()
  const [projetos, setProjetos] = useState<ProjetoODS[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProjetos = async () => {
      if (!user) return

      try {
        const { data, error } = await supabase
          .from('projetos')
          .select(
            `
            id,
            nome_projeto,
            projeto_ods (
              ods (
                id,
                numero,
                nome
              )
            )
          `,
          )
          .eq('user_id', user.id)
          .limit(5)

        if (error) {
          console.error('Erro ao buscar projetos:', error)
        } else {
          const projetosFormatados =
            data?.map((projeto) => ({
              id: projeto.id,
              nome_projeto: projeto.nome_projeto || 'Projeto sem nome',
              ods: projeto.projeto_ods?.map((po: any) => po.ods) || [],
            })) || []

          setProjetos(projetosFormatados)
        }
      } catch (error) {
        console.error('Erro ao buscar projetos:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProjetos()
  }, [user])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            OBJETIVOS DE DESENVOLVIMENTO SUSTENTÁVEL IMPACTADOS - ODS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando...</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">ODS CAPTADAS</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {projetos.map((projeto) => (
            <div key={projeto.id} className="border rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-3">{projeto.nome_projeto}</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {projeto.ods.map((ods) => {
                  const odsImageUrl = `https://brasil.un.org/profiles/undg_country/themes/custom/undg/images/SDGs/pt-br/SDG-${ods.numero}.svg`

                  return (
                    <div
                      key={ods.id}
                      className="flex items-center space-x-3 p-2 bg-gray-50 rounded-lg"
                    >
                      <div className="w-8 h-8 flex-shrink-0">
                        <img
                          src={odsImageUrl}
                          alt={`ODS ${ods.numero}`}
                          className="w-full h-full object-contain"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          ODS {ods.numero}
                        </p>
                        <p className="text-xs text-gray-500 truncate">{ods.nome}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
              {projeto.ods.length === 0 && (
                <p className="text-sm text-gray-500 italic">Nenhum ODS selecionado</p>
              )}
            </div>
          ))}
          {projetos.length === 0 && (
            <div className="text-center py-8 text-gray-500">Nenhum projeto encontrado</div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
