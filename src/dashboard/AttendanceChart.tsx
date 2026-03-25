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

export const AttendanceChart: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<Array<{ name: string; value: number }>>([]);

  useEffect(() => {
    const fetchAgeGroupData = async () => {
      if (!user) return;

      try {
        const { data: projetos, error } = await supabase
          .from('projetos')
          .select('faixa_etaria_atingida, numero_pessoas_impactadas')
          .eq('user_id', user.id);

        if (error) throw error;

        // Agrupar por faixa etária
        const ageGroupData: { [key: string]: number } = {};

        projetos?.forEach(projeto => {
          const faixaEtaria = projeto.faixa_etaria_atingida || 'Não informado';
          const pessoas = projeto.numero_pessoas_impactadas || 0;
          ageGroupData[faixaEtaria] = (ageGroupData[faixaEtaria] || 0) + pessoas;
        });

        // Converter para array para o gráfico
        const chartData = Object.entries(ageGroupData)
          .map(([name, value]) => ({ name, value }))
          .sort((a, b) => b.value - a.value);

        setData(chartData.length > 0 ? chartData : [
          { name: 'Sem dados', value: 0 }
        ]);
      } catch (error) {
        console.error('Erro ao buscar dados de faixa etária:', error);
      }
    };

    fetchAgeGroupData();
  }, [user]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          FAIXA ETÁRIA ATENDIDA
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip formatter={(value) => [`${value}`, 'Pessoas']} />
            <Bar dataKey="value" fill="#f97316" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
