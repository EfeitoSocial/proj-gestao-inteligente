import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface ODSData {
  numero: number;
  nome: string;
  projectCount: number;
}

export const ODSChart: React.FC = () => {
  const { user } = useAuth();
  const [odsData, setOdsData] = useState<ODSData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredODS, setHoveredODS] = useState<ODSData | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchODSData = async () => {
      if (!user) return;

      try {
        // Buscar todos os ODS
        const { data: allODS, error: odsError } = await supabase
          .from('ods')
          .select('numero, nome')
          .order('numero');

        if (odsError) throw odsError;

        // Buscar contagem de projetos por ODS para o usuário
        const { data: projectODS, error: projectError } = await supabase
          .from('projeto_ods')
          .select(`
            ods_id,
            ods (numero, nome),
            projetos!inner (user_id)
          `)
          .eq('projetos.user_id', user.id);

        if (projectError) throw projectError;

        // Contar projetos por ODS
        const odsCount = new Map<number, { nome: string; count: number }>();

        // Inicializar todos os ODS com count 0
        allODS?.forEach(ods => {
          odsCount.set(ods.numero, { nome: ods.nome, count: 0 });
        });

        // Contar projetos reais
        projectODS?.forEach(item => {
          if (item.ods) {
            const current = odsCount.get(item.ods.numero);
            if (current) {
              odsCount.set(item.ods.numero, {
                nome: item.ods.nome,
                count: current.count + 1
              });
            }
          }
        });

        // Converter para array
        const odsArray: ODSData[] = Array.from({ length: 17 }, (_, i) => {
          const numero = i + 1;
          const data = odsCount.get(numero);
          return {
            numero,
            nome: data?.nome || `ODS ${numero}`,
            projectCount: data?.count || 0
          };
        });

        setOdsData(odsArray);
      } catch (error) {
        console.error('Erro ao buscar dados dos ODS:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchODSData();
  }, [user]);

  const handleMouseMove = (event: React.MouseEvent, ods: ODSData) => {
    setHoveredODS(ods);
    setMousePosition({ x: event.clientX, y: event.clientY });
  };

  const handleMouseLeave = () => {
    setHoveredODS(null);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            ODS CAPTADAS
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  const maxCount = Math.max(...odsData.map(ods => ods.projectCount));
  const chartHeight = 300;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">
          ODS CAPTADAS
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* <div className="relative" style={{ height: chartHeight + 60 }}> */}
          {/* Eixo Y - Labels */}
          {/* <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 pr-2">
            {Array.from({ length: 6 }, (_, i) => {
              const value = Math.ceil((maxCount * (5 - i)) / 5);
              return (
                <div key={i} className="text-right">
                  {value > 0 ? value : 0}
                </div>
              );
            })}
          </div> */}

          {/* Área do gráfico */}
          {/* <div className="ml-4 sm:ml-6 lg:ml-8 overflow-hidden"> */}
            <div className="grid grid-cols-17 gap-0.5 sm:gap-1 items-end h-full" style={{ height: chartHeight }}>
              {odsData.map((ods) => {
                const barHeight = maxCount > 0 ? (ods.projectCount / maxCount) * chartHeight * 0.8 : 0;
                const odsImageUrl = `https://brasil.un.org/profiles/undg_country/themes/custom/undg/images/SDGs/pt-br/SDG-${ods.numero}.svg`;

                return (
                  <div
                    key={ods.numero}
                    className="flex flex-col items-center min-w-0"
                    onMouseMove={(e) => handleMouseMove(e, ods)}
                    onMouseLeave={handleMouseLeave}
                  >
                    {/* Barra */}
                    <div
                      className="w-full bg-primary hover:bg-primary/80 transition-colors duration-200 cursor-pointer rounded-t min-h-[2px]"
                      style={{ height: barHeight || 2 }}
                    />
                    
                    {/* Imagem ODS */}
                    <div className="mt-1 sm:mt-2 w-4 h-4 sm:w-6 sm:h-6 lg:w-7 lg:h-7 flex-shrink-0">
                      <img
                        src={odsImageUrl}
                        alt={`ODS ${ods.numero}`}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    
                    {/* Número ODS */}
                    <div className="text-[10px] sm:text-xs text-center mt-0.5 sm:mt-1 font-medium truncate w-full">
                      {ods.numero}
                    </div>
                  </div>
                );
              })}
            </div>
          {/* </div> */}
        {/* </div> */}

        {/* Tooltip */}
        {hoveredODS && (
          <div
            className="fixed z-50 bg-gray-900 text-white p-3 rounded-lg shadow-lg text-sm max-w-xs"
            style={{
              left: mousePosition.x + 10,
              top: mousePosition.y - 10,
              pointerEvents: 'none'
            }}
          >
            <div className="font-semibold">ODS {hoveredODS.numero}</div>
            <div className="text-gray-300 mb-1">{hoveredODS.nome}</div>
            <div>
              <span className="text-primary-foreground">
                {hoveredODS.projectCount} projeto{hoveredODS.projectCount !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};