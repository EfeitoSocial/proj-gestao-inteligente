import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

interface ProjectPhoto {
  id: string;
  foto_url: string;
  descricao?: string;
  ordem: number;
}

interface Contato {
  id: number;
  tipo: string;
  nome: string;
  cpf: string;
  contato: string;
  email: string;
}

interface Documento {
  id: number;
  tipo: string;
  descricao: string;
  arquivo_url?: string;
}

interface Contrapartida {
  id: number;
  quantidade: string;
  descricao: string;
  data: string;
  evidencia: string;
}

interface ProjetoData {
  // Dados do Proponente
  cnpj: string;
  proponente: string;
  localidade: string;
  representante_legal: string;
  cpf_representante: string;
  email: string;
  contato: string;

  // Dados do Projeto
  nome_projeto: string;
  localidade_projeto: string;
  tipo_investimento: string;
  lei_projeto: string;
  segmento_projeto: string;
  valor_total_projeto: number;
  valor_aporte_projeto: number;
  data_inicio_projeto: string | null;
  numero_projeto: string;
  classe_social_atingida: string;
  faixa_etaria_atingida: string;
  numero_pessoas_impactadas: number;
  data_fim_projeto: string | null;
  resumo_projeto: string;
  status_projeto: string;
}

export const useProjeto = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);

  const salvarProjeto = async (
    dadosProjeto: ProjetoData,
    contatos: Contato[],
    documentos: Documento[],
    contrapartidas: Contrapartida[],
    odsAtendidos: string[] = [],
    projectPhotos: ProjectPhoto[] = []
  ) => {
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado",
        variant: "destructive",
      });
      return false;
    }

    setLoading(true);

    try {
      // Inserir projeto principal (sem ods_atendidos)
      const { data: projeto, error: projetoError } = await supabase
        .from('projetos')
        .insert({
          user_id: user.id,
          ...dadosProjeto,
        })
        .select()
        .single();

      if (projetoError) throw projetoError;

      const projetoId = projeto.id;

      // Inserir relacionamentos ODS
      if (odsAtendidos.length > 0) {
        const odsData = odsAtendidos.map(odsId => ({
          projeto_id: projetoId,
          ods_id: odsId,
        }));

        const { error: odsError } = await supabase
          .from('projeto_ods')
          .insert(odsData);

        if (odsError) throw odsError;
      }

      // Inserir contatos
      if (contatos.length > 0) {
        const contatosData = contatos.map(contato => ({
          projeto_id: projetoId,
          tipo: contato.tipo,
          nome: contato.nome,
          cpf: contato.cpf,
          contato: contato.contato,
          email: contato.email,
        }));

        const { error: contatosError } = await supabase
          .from('projeto_contatos')
          .insert(contatosData);

        if (contatosError) throw contatosError;
      }

      // Inserir documentos (incluindo arquivos anexados)
      if (documentos.length > 0) {
        const documentosData = documentos.map(doc => ({
          projeto_id: projetoId,
          tipo: doc.tipo,
          descricao: doc.descricao,
          arquivo_url: doc.arquivo_url || null,
        }));

        const { error: documentosError } = await supabase
          .from('projeto_documentos')
          .insert(documentosData);

        if (documentosError) throw documentosError;
      }

      // Inserir contrapartidas
      if (contrapartidas.length > 0) {
        const contrapartidasData = contrapartidas.map(contra => ({
          projeto_id: projetoId,
          quantidade: contra.quantidade,
          descricao: contra.descricao,
          data: contra.data,
          evidencia: contra.evidencia,
        }));

        const { error: contrapartidasError } = await supabase
          .from('projeto_contrapartidas')
          .insert(contrapartidasData);

        if (contrapartidasError) throw contrapartidasError;
      }

      // Inserir fotos do projeto
      if (projectPhotos.length > 0) {
        const fotosData = projectPhotos.map(foto => ({
          projeto_id: projetoId,
          foto_url: foto.foto_url,
          descricao: foto.descricao || null,
          ordem: foto.ordem,
        }));

        const { error: fotosError } = await supabase
          .from('projeto_fotos')
          .insert(fotosData);

        if (fotosError) throw fotosError;
      }

      toast({
        title: "Sucesso",
        description: "Projeto salvo com sucesso!",
      });

      return true;
    } catch (error) {
      console.error('Erro ao salvar projeto:', error);
      toast({
        title: "Erro",
        description: "Erro ao salvar projeto. Tente novamente.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    salvarProjeto,
    loading,
  };
};
