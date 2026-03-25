import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts'

import { supabase } from '@/integrations/supabase/client'
import { useAuth } from '@/hooks/useAuth'

const COLORS = ['#ef4444', '#22c55e', '#3b82f6', '#f97316', '#8b5cf6']

export const ImpactChart: React.FC = () => {
  const { user } = useAuth()
  const [data, setData] = useState<Array<{ name: string; value: number; color: string }>>([])

  useEffect(() => {
    const fetchSocialClassData = async () => {
      if (!user) return

      try {
        const { data: projetos, error } = await supabase
          .from('projetos')
          .select('classe_social_atingida, numero_pessoas_impactadas')
          .eq('user_id', user.id)

        if (error) throw error

        // Agrupar por classe social
        const classData: { [key: string]: number } = {}

        projetos?.forEach((projeto) => {
          const classe = projeto.classe_social_atingida || 'Não informado'
          const pessoas = projeto.numero_pessoas_impactadas || 0
          classData[classe] = (classData[classe] || 0) + pessoas
        })

        // Converter para array para o gráfico
        const chartData = Object.entries(classData)
          .map(([name, value], index) => ({
            name,
            value,
            color: COLORS[index % COLORS.length],
          }))
          .sort((a, b) => b.value - a.value)

        setData(
          chartData.length > 0 ? chartData : [{ name: 'Sem dados', value: 1, color: '#gray' }],
        )
      } catch (error) {
        console.error('Erro ao buscar dados de classe social:', error)
      }
    }

    fetchSocialClassData()
  }, [user])

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">CLASSES SOCIAIS IMPACTADAS</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value}`, 'Pessoas']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
