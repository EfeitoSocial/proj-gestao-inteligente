import React, { useEffect, useState } from 'react';
import { Button } from '../ui/button';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../hooks/useAuth';
import { Filter, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

interface ListarProjetosProps {
  estadoFiltro?: string | null;
}

interface Projeto {
  id: string;
  nome_projeto: string;
  resumo_projeto: string;
  tipo_investimento: 'privado' | 'ir';
  valor_aporte_projeto: number;
  valor_total_projeto: number;
  numero_pessoas_impactadas?: number;
  localidade_projeto?: string;
  data_inicio_projeto?: string;
  data_fim_projeto?: string;
}

export const ListarProjetos: React.FC<ListarProjetosProps> = ({ estadoFiltro }) => {
  const { user } = useAuth();
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [projetosComOds, setProjetosComOds] = useState<(Projeto & {ods_numeros: number[]})[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [odsOptions, setOdsOptions] = useState<{numero: number, nome: string}[]>([]);
  
  // Filter states
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [locationFilter, setLocationFilter] = useState<string>('todas');
  const [odsFilter, setOdsFilter] = useState<string>('todos');
  
  const navigate = useNavigate();

  useEffect(() => {
    const buscarDados = async () => {
      if (!user) return;

      // Buscar projetos
      let baseQuery = supabase
        .from('projetos')
        .select(
          'id, nome_projeto, resumo_projeto, tipo_investimento, valor_aporte_projeto, valor_total_projeto, numero_pessoas_impactadas, localidade_projeto, data_inicio_projeto, data_fim_projeto',
        )
        .eq('user_id', user.id);

      // Aplicar filtro por estado se fornecido
      if (estadoFiltro) {
        // Filtrar projetos que tenham o estado correspondente na localidade_projeto
        baseQuery = baseQuery.or(`localidade_projeto.ilike.%${estadoFiltro}%,localidade_projeto.ilike.%, ${estadoFiltro}%`);
      }

      const { data, error } = await baseQuery;
  
      if (error) {
        console.error('Erro ao buscar projetos:', error.message);
      } else {
        const projetosFormatados = (data || []).map((projeto) => ({
          ...projeto,
          tipo_investimento: projeto.tipo_investimento as 'privado' | 'ir',
        }));

        setProjetos(projetosFormatados);

        // Buscar ODS para cada projeto
        const projetosComOdsData = await Promise.all(
          projetosFormatados.map(async (projeto) => {
            const { data: odsData } = await supabase
              .from('projeto_ods')
              .select(`
                ods:ods_id (
                  numero
                )
              `)
              .eq('projeto_id', projeto.id);

            const odsNumeros = odsData?.map(item => (item.ods as any).numero).filter(Boolean) || [];
            
            return {
              ...projeto,
              ods_numeros: odsNumeros
            };
          })
        );

        setProjetosComOds(projetosComOdsData);
      }

      // Buscar estados únicos das localizações
      const { data: locationsData } = await supabase
        .from('projetos')
        .select('localidade_projeto')
        .eq('user_id', user.id)
        .not('localidade_projeto', 'is', null);

      if (locationsData) {
        const uniqueStates = Array.from(new Set(
          locationsData
            .map(p => p.localidade_projeto)
            .filter(Boolean)
            .map(location => {
              // Extrair apenas o estado (após a vírgula, se existir)
              const parts = location.split(',');
              return parts.length > 1 ? parts[1].trim() : location.trim();
            })
        )) as string[];
        setLocations(uniqueStates);
      }

      // Buscar ODS disponíveis
      const { data: odsData } = await supabase
        .from('ods')
        .select('numero, nome')
        .order('numero');

      if (odsData) {
        setOdsOptions(odsData);
      }
    };

    buscarDados();
  }, [user, estadoFiltro]);

  const hasActiveFilters = tipoFilter !== 'todos' || locationFilter !== 'todas' || odsFilter !== 'todos';

  // Função para limpar filtros
  const onClearFilters = () => {
    setTipoFilter('todos');
    setLocationFilter('todas');
    setOdsFilter('todos');
  };

  const projetosFiltrados = projetosComOds.filter((projeto) => {
    // Filtro por tipo
    if (tipoFilter !== 'todos' && projeto.tipo_investimento !== tipoFilter) {
      return false;
    }
    
    // Filtro por localização (comparar apenas o estado)
    if (locationFilter !== 'todas') {
      const projetoState = projeto.localidade_projeto ? 
        (projeto.localidade_projeto.includes(',') ? 
          projeto.localidade_projeto.split(',')[1].trim() : 
          projeto.localidade_projeto.trim()) : '';
      
      if (projetoState !== locationFilter) {
        return false;
      }
    }
    
    // Filtro por ODS
    if (odsFilter !== 'todos') {
      const odsNumero = parseInt(odsFilter);
      if (!projeto.ods_numeros.includes(odsNumero)) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      <h1 className="text-2xl font-bold text-teal-600 mb-6">
        Projetos Cadastrados
      </h1>

      {/* Filtros de Projetos */}
      <div className="mb-8 border rounded-lg">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-teal-600 ml-4" />
          <h3 className="text-lg font-medium text-gray-700">Filtros de Projetos</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
          {/* Tipo de Projeto */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tipo de Projeto</label>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os Tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os Tipos</SelectItem>
                <SelectItem value="privado">Recurso Privado</SelectItem>
                <SelectItem value="ir">Recurso Imposto de Renda</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Localização */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Localização</label>
            <Select value={locationFilter} onValueChange={setLocationFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todas as Localizações" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as Localizações</SelectItem>
                {locations.map((location) => (
                  <SelectItem key={location} value={location}>
                    {location}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* ODS */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">ODS</label>
            <Select value={odsFilter} onValueChange={setOdsFilter}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Todos os ODS" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os ODS</SelectItem>
                {odsOptions.map((ods) => (
                  <SelectItem key={ods.numero} value={ods.numero.toString()}>
                    {ods.numero}. {ods.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

                  {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onClearFilters}
              className="gap-2"
            >
              <X size={14} />
              Limpar Filtros
            </Button>
          </div>
        )}
        </div>
      </div>

      {/* Lista de Projetos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {projetosFiltrados.map((projeto) => (
          <div
            key={projeto.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm flex flex-col gap-4"
          >
            {/* Cabeçalho */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {projeto.nome_projeto}
                </h2>
                <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                  <span className="flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-map-pin w-4 h-4 mr-1"
                      data-lov-id="src/components/ProjetosList.tsx:67:18"
                      data-lov-name="MapPin"
                      data-component-path="src/components/ProjetosList.tsx"
                      data-component-line="67"
                      data-component-file="ProjetosList.tsx"
                      data-component-name="MapPin"
                      data-component-content="%7B%22className%22%3A%22w-4%20h-4%20mr-1%22%7D"
                    >
                      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"></path>
                      <circle cx="12" cy="10" r="3"></circle>
                    </svg>
                    {projeto.localidade_projeto || 'Localidade não informada'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Tipo Investimento */}
                <span className="bg-gray-100 text-gray-800 text-xs px-3 py-1 rounded-full capitalize">
                  {projeto.tipo_investimento === 'ir' ? 'IR' : 'PRIVADO'}
                </span>
              </div>
            </div>

            {/* Valores */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm mt-2">
              <div className="flex items-center gap-2">
                <span className="text-green-600 text-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-dollar-sign w-4 h-4 mr-2 text-blue-600"
                    data-lov-id="src/components/ProjetosList.tsx:96:16"
                    data-lov-name="DollarSign"
                    data-component-path="src/components/ProjetosList.tsx"
                    data-component-line="96"
                    data-component-file="ProjectsList.tsx"
                    data-component-name="DollarSign"
                    data-component-content="%7B%22className%22%3A%22w-4%20h-4%20mr-2%20text-blue-600%22%7D"
                  >
                    <line x1="12" x2="12" y1="2" y2="22"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </span>
                <div>
                  <p className="text-gray-500">Valor Total</p>
                  <p className="font-semibold text-black">
                    R${' '}
                    {projeto.valor_total_projeto?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-blue-600 text-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-dollar-sign w-4 h-4 mr-2 text-green-600"
                    data-lov-id="src/components/ProjetosList.tsx:86:16"
                    data-lov-name="DollarSign"
                    data-component-path="src/components/ProjetosList.tsx"
                    data-component-line="86"
                    data-component-file="ProjectsList.tsx"
                    data-component-name="DollarSign"
                    data-component-content="%7B%22className%22%3A%22w-4%20h-4%20mr-2%20text-green-600%22%7D"
                  >
                    <line x1="12" x2="12" y1="2" y2="22"></line>
                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                  </svg>
                </span>
                <div>
                  <p className="text-gray-500">Valor Aporte</p>
                  <p className="font-semibold text-black">
                    R${' '}
                    {projeto.valor_aporte_projeto?.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-teal-600 text-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-users w-4 h-4 mr-2 text-teal-600"
                    data-lov-id="src/components/ProjetosList.tsx:106:16"
                    data-lov-name="Users"
                    data-component-path="src/components/ProjetosList.tsx"
                    data-component-line="106"
                    data-component-file="ProjectsList.tsx"
                    data-component-name="Users"
                    data-component-content="%7B%22className%22%3A%22w-4%20h-4%20mr-2%20text-teal-600%22%7D"
                  >
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
                    <circle cx="9" cy="7" r="4"></circle>
                    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
                    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                  </svg>
                </span>
                <div>
                  <p className="text-gray-500">Pessoas Impactadas</p>
                  <p className="font-semibold text-black">
                    {projeto.numero_pessoas_impactadas || 0}
                  </p>
                </div>
              </div>
            </div>

            {/* Botão */}
            <div className="flex justify-end mt-4">
              <Button
                className="bg-teal-500 text-white hover:bg-teal-600"
                onClick={() => navigate(`/projetos/${projeto.id}`)}
              >
                Ver Detalhes
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
