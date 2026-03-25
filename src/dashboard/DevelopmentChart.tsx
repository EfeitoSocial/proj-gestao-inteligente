import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const DevelopmentChart: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    const fetchInvestmentData = async () => {
      if (!user) return;

      try {
        const { data: projetos, error } = await supabase
          .from('projetos')
          .select('created_at, valor_aporte_projeto')
          .eq('user_id', user.id);

        if (error) throw error;

        // Agrupar por mês e somar investimentos
        const monthlyData: { [key: string]: number } = {};
        const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

        // Inicializar todos os meses com 0
        months.forEach(month => {
          monthlyData[month] = 0;
        });

        // Somar investimentos por mês
        projetos?.forEach(projeto => {
          const date = new Date(projeto.created_at);
          const monthIndex = date.getMonth();
          const monthName = months[monthIndex];
          const valor = Number(projeto.valor_aporte_projeto) || 0;
          monthlyData[monthName] += valor;
        });

        // Converter para array para o gráfico (últimos 4 meses com dados)
        const chartData = months
          .map(month => ({
            name: month,
            value: Math.round(monthlyData[month] / 1000), // Converter para milhares
          }))
          .filter(item => item.value > 0)
          .slice(-4); // Últimos 4 meses com dados

        setData(chartData.length > 0 ? chartData : [
          { name: 'Jan', value: 0 },
          { name: 'Fev', value: 0 },
          { name: 'Mar', value: 0 },
          { name: 'Abr', value: 0 },
        ]);
      } catch (error) {
        console.error('Erro ao buscar dados de investimento:', error);
      }
    };

    fetchInvestmentData();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          INVESTIMENTO POR MÊS (R$ mil)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              formatter={(value) => [`R$ ${value}k`, 'Investimento']}
            />
            <Bar dataKey="value" fill="#22c55e" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
