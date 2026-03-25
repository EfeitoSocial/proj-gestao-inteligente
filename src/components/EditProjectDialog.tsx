import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { supabase } from '@/integrations/supabase/client'
import { toast } from '@/hooks/use-toast'
import { Loader2, Upload, Plus } from 'lucide-react'
import { LocalidadeProjeto } from '@/pages/LocalidadeProjeto'
import { DocumentUpload } from './DocumentUpload'
import { ContrapartidaUpload } from './ContrapartidaUpload'

// Funções para validação e formatação de CPF
const formatCPF = (cpf: string) => {
  const numbers = cpf.replace(/\D/g, '')
  return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
}

const validateCPF = (cpf: string) => {
  const numbers = cpf.replace(/\D/g, '')

  if (numbers.length !== 11) return false

  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(numbers)) return false

  // Calcula o primeiro dígito verificador
  let sum = 0
  for (let i = 0; i < 9; i++) {
    sum += parseInt(numbers[i]) * (10 - i)
  }
  let remainder = sum % 11
  const firstDigit = remainder < 2 ? 0 : 11 - remainder

  if (parseInt(numbers[9]) !== firstDigit) return false

  // Calcula o segundo dígito verificador
  sum = 0
  for (let i = 0; i < 10; i++) {
    sum += parseInt(numbers[i]) * (11 - i)
  }
  remainder = sum % 11
  const secondDigit = remainder < 2 ? 0 : 11 - remainder

  return parseInt(numbers[10]) === secondDigit
}

interface Documento {
  id: number
  tipo: string
  descricao: string
  arquivo_url?: string
}

interface Contrapartida {
  id: number
  quantidade: string
  descricao: string
  data: string
  evidencia: string
}

interface Projeto {
  id: string
  nome_projeto: string
  localidade_projeto: string
  tipo_investimento: string
  valor_total_projeto: number
  valor_aporte_projeto: number
  numero_pessoas_impactadas: number
  resumo_projeto: string
  // data_aporte?: string;
  classe_social_atingida?: string
  faixa_etaria_atingida?: string
  // periodo_realizacao?: string;
  lei_projeto?: string
  segmento_projeto?: string
  cnpj?: string
  proponente?: string
  localidade?: string
  representante_legal?: string
  cpf_representante?: string
  email?: string
  contato?: string
  numero_projeto?: string
  status_projeto?: string
}

interface EditProjectDialogProps {
  projeto: Projeto
  open: boolean
  onOpenChange: (open: boolean) => void
  onProjectUpdated: (updatedProject: Projeto) => void
}

export const EditProjectDialog: React.FC<EditProjectDialogProps> = ({
  projeto,
  open,
  onOpenChange,
  onProjectUpdated,
}) => {
  const [formData, setFormData] = useState<Projeto>(projeto)
  const [loading, setLoading] = useState(false)
  const [cpfError, setCpfError] = useState('')
  const [documentos, setDocumentos] = useState<Documento[]>([])
  const [contrapartidas, setContrapartidas] = useState<Contrapartida[]>([])

  // Estados para matching CadastrarProjeto
  const [tipoInvestimento, setTipoInvestimento] = useState(projeto.tipo_investimento || '')
  const [leiProjeto, setLeiProjeto] = useState(projeto.lei_projeto || '')
  const [segmentoProjeto, setSegmentoProjeto] = useState(projeto.segmento_projeto || '')
  // const [dataAporte, setDataAporte] = useState(projeto.data_aporte || '');
  const [classeSocial, setClasseSocial] = useState(projeto.classe_social_atingida || '')
  const [faixaEtaria, setFaixaEtaria] = useState(projeto.faixa_etaria_atingida || '')
  // const [periodoRealizacao, setPeriodoRealizacao] = useState(projeto.periodo_realizacao || '');
  const [statusProjeto, setStatusProjeto] = useState(projeto.status_projeto || 'ativo')

  // Dados das opções conforme CadastrarProjeto
  const leisPorTipo: { [key: string]: string[] } = {
    privado: ['Cultura', 'Esporte', 'Reciclagem', 'Criança e Adolescente', 'Idoso', 'Outros'],
    ir: [
      'Lei da Cultura',
      'Lei do Esporte',
      'Lei da Reciclagem',
      'FIA Criança e Adolescente',
      'Fundo Idoso',
      'Pronas/PCD',
      'Pronon',
    ],
  }

  const segmentosPorLei = {
    Cultura: [
      'Artes Cênicas',
      'Artes Visuais',
      'Audiovisual',
      'Música',
      'Literatura',
      'Patrimônio Cultural',
      'Artesanato',
      'Cultura Popular',
      'Cultura Afro-brasileira',
      'Cultura Urbana',
      'Arte Educação',
      'Eventos e Festivais',
      'Formação e Capacitação',
    ],
    'Lei da Cultura': [
      'Artes Cênicas',
      'Artes Visuais',
      'Audiovisual',
      'Música',
      'Literatura',
      'Patrimônio Cultural',
      'Artesanato',
      'Cultura Popular',
      'Cultura Afro-brasileira',
      'Cultura Urbana',
      'Arte Educação',
      'Eventos e Festivais',
      'Formação e Capacitação',
    ],
    Esporte: ['Desporto Educacional', 'Desporto de Participação', 'Desporto de Rendimento'],
    'Lei do Esporte': [
      'Desporto Educacional',
      'Desporto de Participação',
      'Desporto de Rendimento',
    ],
    'Criança e Adolescente': [
      'Proteção Social',
      'Promoção de Direitos',
      'Fortalecimento do Conselho Tutelar',
      'Capacitação',
      'Combate à Violência',
      'Inclusão',
      'Cultura de Paz',
      'Prevenção de Uso de Drogas',
      'Outras Ações',
    ],
    'FIA Criança e Adolescente': [
      'Proteção Social',
      'Promoção de Direitos',
      'Fortalecimento do Conselho Tutelar',
      'Capacitação',
      'Combate à Violência',
      'Inclusão',
      'Cultura de Paz',
      'Prevenção de Uso de Drogas',
      'Outras Ações',
    ],
    Idoso: [
      'Proteção, promoção e defesa dos direitos da pessoa idosa',
      'Ações intersetoriais',
      'Acesso à cultura, esporte e lazer',
      'Melhoria da acessibilidade',
      'Apoio a iniciativas que divulguem os direitos da pessoa idosa',
      'Atuação em rede',
      'Apoio a Instituições de Longa Permanência para Idosos',
      'Outras Ações',
    ],
    'Fundo Idoso': [
      'Proteção, promoção e defesa dos direitos da pessoa idosa',
      'Ações intersetoriais',
      'Acesso à cultura, esporte e lazer',
      'Melhoria da acessibilidade',
      'Apoio a iniciativas que divulguem os direitos da pessoa idosa',
      'Atuação em rede',
      'Apoio a Instituições de Longa Permanência para Idosos',
      'Outras Ações',
    ],
    Reciclagem: [
      'Capacitação e Formação',
      'Incubação',
      'Pesquisa e Desenvolvimento',
      'Infraestrutura',
      'Equipamentos e Veículos',
      'Comercialização',
      'Ações de Coleta',
      'Compostagem',
    ],
    'Lei da Reciclagem': [
      'Capacitação e Formação',
      'Incubação',
      'Pesquisa e Desenvolvimento',
      'Infraestrutura',
      'Equipamentos e Veículos',
      'Comercialização',
      'Ações de Coleta',
      'Compostagem',
    ],
    'Pronas/PCD': [
      'Prestação de serviços médico-assistenciais',
      'Formação, treinamento e aperfeiçoamento de recursos humanos',
      'Realização de pesquisas',
    ],
    Pronon: [
      'Promoção da informação e prevenção',
      'Pesquisa',
      'Rastreamento',
      'Diagnóstico',
      'Tratamento',
      'Cuidados paliativos',
      'Reabilitação',
      'Formação e capacitação de recursos humanos',
      'Ações de apoio psicossocial',
      'Infraestrutura',
      'Aquisição de equipamentos',
      'Desenvolvimento de tecnologias',
    ],
    Outros: [
      'Apoio a instituições',
      'Aquisição de equipamentos',
      'Pesquisa e Inovação',
      'Educação Profissional',
      'Outros',
    ],
  }

  // Carrega documentos e contrapartidas do projeto
  const loadProjectData = async () => {
    if (!projeto.id) return

    try {
      // Carrega documentos
      const { data: documentosData, error: documentosError } = await supabase
        .from('projeto_documentos')
        .select('*')
        .eq('projeto_id', projeto.id)

      if (documentosError) throw documentosError

      if (documentosData?.length > 0) {
        const documentosFormatted = documentosData.map((doc, index) => ({
          id: index + 1,
          tipo: doc.tipo,
          descricao: doc.descricao || '',
          arquivo_url: doc.arquivo_url || undefined,
        }))
        setDocumentos(documentosFormatted)
      } else {
        setDocumentos([
          {
            id: 1,
            tipo: '',
            descricao: '',
            arquivo_url: undefined,
          },
        ])
      }

      // Carrega contrapartidas
      const { data: contrapartidasData, error: contrapartidasError } = await supabase
        .from('projeto_contrapartidas')
        .select('*')
        .eq('projeto_id', projeto.id)

      if (contrapartidasError) throw contrapartidasError

      if (contrapartidasData?.length > 0) {
        const contrapartidasFormatted = contrapartidasData.map((contra, index) => ({
          id: index + 1,
          quantidade: contra.quantidade || '',
          descricao: contra.descricao || '',
          data: contra.data || '',
          evidencia: contra.evidencia || '',
        }))
        setContrapartidas(contrapartidasFormatted)
      } else {
        setContrapartidas([
          {
            id: 1,
            quantidade: '',
            descricao: '',
            data: '',
            evidencia: '',
          },
        ])
      }
    } catch (error) {
      console.error('Erro ao carregar dados do projeto:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao carregar documentos e contrapartidas',
        variant: 'destructive',
      })
    }
  }

  useEffect(() => {
    setFormData(projeto)
    setTipoInvestimento(projeto.tipo_investimento || '')
    setLeiProjeto(projeto.lei_projeto || '')
    setSegmentoProjeto(projeto.segmento_projeto || '')
    setClasseSocial(projeto.classe_social_atingida || '')
    setFaixaEtaria(projeto.faixa_etaria_atingida || '')
    setStatusProjeto(projeto.status_projeto || 'ativo')
    setCpfError('')

    if (open && projeto.id) {
      loadProjectData()
    }
  }, [projeto, open])

  const handleInputChange = (field: keyof Projeto, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleCpfChange = (value: string) => {
    // Remove caracteres não numéricos
    const numbers = value.replace(/\D/g, '')

    // Limita a 11 dígitos
    const limitedNumbers = numbers.slice(0, 11)

    // Aplica a formatação
    const formattedCpf = formatCPF(limitedNumbers)

    // Atualiza o estado
    handleInputChange('cpf_representante', formattedCpf)

    // Valida o CPF se tem 11 dígitos
    if (limitedNumbers.length === 11) {
      if (!validateCPF(limitedNumbers)) {
        setCpfError('CPF inválido. Verifique os números digitados.')
      } else {
        setCpfError('')
      }
    } else {
      setCpfError('')
    }
  }

  // Funções para gerenciar documentos
  const adicionarDocumento = () => {
    const novoId = documentos.length > 0 ? Math.max(...documentos.map((d) => d.id)) + 1 : 1
    setDocumentos([
      ...documentos,
      {
        id: novoId,
        tipo: '',
        descricao: '',
        arquivo_url: undefined,
      },
    ])
  }

  const removerDocumento = (id: number) => {
    setDocumentos(documentos.filter((d) => d.id !== id))
  }

  const updateDocumento = (id: number, field: string, value: string) => {
    setDocumentos(documentos.map((doc) => (doc.id === id ? { ...doc, [field]: value } : doc)))
  }

  // Funções para gerenciar contrapartidas
  const adicionarContrapartida = () => {
    const novoId = contrapartidas.length > 0 ? Math.max(...contrapartidas.map((c) => c.id)) + 1 : 1
    setContrapartidas([
      ...contrapartidas,
      {
        id: novoId,
        quantidade: '',
        descricao: '',
        data: '',
        evidencia: '',
      },
    ])
  }

  const removerContrapartida = (id: number) => {
    setContrapartidas(contrapartidas.filter((c) => c.id !== id))
  }

  const updateContrapartida = (id: number, field: string, value: string) => {
    setContrapartidas(contrapartidas.map((c) => (c.id === id ? { ...c, [field]: value } : c)))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validação do CPF antes do envio
    if (formData.cpf_representante) {
      const cpfNumbers = formData.cpf_representante.replace(/\D/g, '')
      if (cpfNumbers.length === 11 && !validateCPF(cpfNumbers)) {
        setCpfError('CPF inválido. Verifique os números digitados.')
        toast({
          title: 'Erro de validação',
          description: 'CPF inválido. Verifique os números digitados.',
          variant: 'destructive',
        })
        return
      }
    }

    setLoading(true)

    try {
      const { data, error } = await supabase
        .from('projetos')
        .update({
          nome_projeto: formData.nome_projeto,
          localidade_projeto: formData.localidade_projeto,
          tipo_investimento: tipoInvestimento,
          valor_total_projeto: parseFloat(formData.valor_total_projeto.toString()) || 0,
          valor_aporte_projeto: parseFloat(formData.valor_aporte_projeto.toString()) || 0,
          numero_pessoas_impactadas: parseInt(formData.numero_pessoas_impactadas.toString()) || 0,
          resumo_projeto: formData.resumo_projeto,
          // data_aporte: dataAporte,
          classe_social_atingida: classeSocial,
          faixa_etaria_atingida: faixaEtaria,
          // periodo_realizacao: periodoRealizacao,
          lei_projeto: leiProjeto,
          segmento_projeto: segmentoProjeto,
          cnpj: formData.cnpj,
          proponente: formData.proponente,
          localidade: formData.localidade,
          representante_legal: formData.representante_legal,
          cpf_representante: formData.cpf_representante,
          email: formData.email,
          contato: formData.contato,
          numero_projeto: formData.numero_projeto,
          status_projeto: statusProjeto,
        })
        .eq('id', projeto.id)
        .select()
        .single()

      if (error) throw error

      // Atualizar documentos
      await supabase.from('projeto_documentos').delete().eq('projeto_id', projeto.id)

      if (documentos.length > 0) {
        const documentosData = documentos
          .filter((doc) => doc.tipo && doc.descricao) // Só salva documentos preenchidos
          .map((doc) => ({
            projeto_id: projeto.id,
            tipo: doc.tipo,
            descricao: doc.descricao,
            arquivo_url: doc.arquivo_url || null,
          }))

        if (documentosData.length > 0) {
          const { error: documentosError } = await supabase
            .from('projeto_documentos')
            .insert(documentosData)

          if (documentosError) throw documentosError
        }
      }

      // Atualizar contrapartidas
      await supabase.from('projeto_contrapartidas').delete().eq('projeto_id', projeto.id)

      if (contrapartidas.length > 0) {
        const contrapartidasData = contrapartidas
          .filter((contra) => contra.quantidade || contra.descricao || contra.data) // Só salva contrapartidas preenchidas
          .map((contra) => ({
            projeto_id: projeto.id,
            quantidade: contra.quantidade,
            descricao: contra.descricao,
            data: contra.data,
            evidencia: contra.evidencia || 'Não evidenciado',
          }))

        if (contrapartidasData.length > 0) {
          const { error: contrapartidasError } = await supabase
            .from('projeto_contrapartidas')
            .insert(contrapartidasData)

          if (contrapartidasError) throw contrapartidasError
        }
      }

      toast({
        title: 'Sucesso',
        description: 'Projeto atualizado com sucesso!',
      })

      onProjectUpdated(data)
      onOpenChange(false)
    } catch (error) {
      console.error('Erro ao atualizar projeto:', error)
      toast({
        title: 'Erro',
        description: 'Erro ao atualizar projeto. Tente novamente.',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* DADOS DO PROPONENTE */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">DADOS DO PROPONENTE</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CNPJ <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="00.000.000/0000-00"
                  value={formData.cnpj || ''}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PROPONENTE <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Proponente"
                  value={formData.proponente || ''}
                  // onChange={(e) => handleInputChange('proponente', e.target.value)}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LOCALIDADE <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Localidade"
                  value={formData.localidade || ''}
                  // onChange={(e) => handleInputChange('localidade_projeto', e.target.value)}
                  disabled
                  className="bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  REPRESENTANTE LEGAL <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Nome do Representante"
                  value={formData.representante_legal || ''}
                  onChange={(e) => handleInputChange('representante_legal', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CPF REPRESENTANTE <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="000.000.000-00"
                  value={formData.cpf_representante || ''}
                  onChange={(e) => handleCpfChange(e.target.value)}
                  className={cpfError ? 'border-red-500' : ''}
                />
                {cpfError && <p className="text-red-500 text-sm mt-1">{cpfError}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  E-MAIL <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="E-mail"
                  type="email"
                  value={formData.email || ''}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CONTATO <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="(00) 0000-0000"
                  value={formData.contato || ''}
                  onChange={(e) => handleInputChange('contato', e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* DADOS DO PROJETO */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-700">DADOS DO PROJETO</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NOME DO PROJETO
                </label>
                <Input
                  placeholder="Nome do Projeto"
                  value={formData.nome_projeto || ''}
                  onChange={(e) => handleInputChange('nome_projeto', e.target.value)}
                />
              </div>

              <div>
                <LocalidadeProjeto
                  onLocalidadeChange={(localidade) =>
                    handleInputChange('localidade_projeto', localidade)
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ODS ATENDIDOS
                </label>
                <Input placeholder="ODS" disabled className="bg-gray-100" />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  TIPO DE INVESTIMENTO SOCIAL
                </label>
                <Select
                  value={tipoInvestimento}
                  onValueChange={(value) => {
                    setTipoInvestimento(value)
                    setLeiProjeto('')
                    setSegmentoProjeto('')
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de investimento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="privado">Direto</SelectItem>
                    <SelectItem value="ir">Imposto de Renda</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  LEI DO PROJETO OU CATEGORIA
                </label>
                <Select
                  value={leiProjeto}
                  onValueChange={(value) => {
                    setLeiProjeto(value)
                    setSegmentoProjeto('')
                  }}
                  disabled={!tipoInvestimento}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Lei do Projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {(leisPorTipo[tipoInvestimento] || []).map((lei, index) => (
                      <SelectItem key={index} value={lei}>
                        {lei}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  SEGMENTO DO PROJETO
                </label>
                <Select
                  value={segmentoProjeto}
                  onValueChange={(value) => setSegmentoProjeto(value)}
                  disabled={!leiProjeto}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o segmento do projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {(segmentosPorLei[leiProjeto] || []).map((segmento, index) => (
                      <SelectItem key={index} value={segmento}>
                        {segmento}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VALOR TOTAL DO PROJETO (R$)
                </label>
                <Input
                  placeholder="R$ 000.000,00"
                  value={formData.valor_total_projeto || ''}
                  onChange={(e) => handleInputChange('valor_total_projeto', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  VALOR DO APORTE DO PROJETO
                </label>
                <Input
                  placeholder="R$ 000.000,00"
                  value={formData.valor_aporte_projeto || ''}
                  onChange={(e) => handleInputChange('valor_aporte_projeto', e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  NÚMERO DO PROJETO
                </label>
                <Input
                  placeholder="Número do Projeto"
                  value={formData.numero_projeto || ''}
                  onChange={(e) => handleInputChange('numero_projeto', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CLASSE SOCIAL ATINGIDA
                </label>
                <Select value={classeSocial} onValueChange={setClasseSocial}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione todas as Classes Sociais" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="a">Classe A</SelectItem>
                    <SelectItem value="b">Classe B</SelectItem>
                    <SelectItem value="c">Classe C</SelectItem>
                    <SelectItem value="d">Classe D</SelectItem>
                    <SelectItem value="e">Classe E</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  FAIXA ETÁRIA ATINGIDA
                </label>
                <Select value={faixaEtaria} onValueChange={setFaixaEtaria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione todas as faixas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="0-12">0 a 12 anos</SelectItem>
                    <SelectItem value="13-17">13 a 17 anos</SelectItem>
                    <SelectItem value="18-25">18 a 25 anos</SelectItem>
                    <SelectItem value="26-40">26 a 40 anos</SelectItem>
                    <SelectItem value="41-60">41 a 60 anos</SelectItem>
                    <SelectItem value="60+">Acima de 60 anos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nº PESSOAS IMPACTADAS
                </label>
                <Input
                  placeholder="Número de pessoas"
                  type="number"
                  value={formData.numero_pessoas_impactadas || ''}
                  onChange={(e) =>
                    handleInputChange('numero_pessoas_impactadas', parseInt(e.target.value) || 0)
                  }
                />
              </div>
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  PERÍODO DE REALIZAÇÃO
                </label>
                <Input
                  placeholder="Ex: Janeiro a Dezembro"
                  value={periodoRealizacao}
                  onChange={(e) => setPeriodoRealizacao(e.target.value)}
                />
                              </div> */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  STATUS DO PROJETO
                </label>
                <Select value={statusProjeto} onValueChange={setStatusProjeto}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Projeto Ativo</SelectItem>
                    <SelectItem value="pausado">Projeto Pausado</SelectItem>
                    <SelectItem value="concluido">Projeto Concluído</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                RESUMO DO PROJETO
              </label>
              <Textarea
                placeholder="Descreva resumidamente o projeto..."
                value={formData.resumo_projeto || ''}
                onChange={(e) => handleInputChange('resumo_projeto', e.target.value)}
                className="min-h-[120px] resize-none"
              />
            </div>
          </div>

          {/* Seção de Documentos */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">DOCUMENTOS</h3>
              <Button
                type="button"
                onClick={adicionarDocumento}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Upload size={16} />
                Incluir Documentos
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Documentos
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Descrição
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Arquivo
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {documentos.map((documento) => (
                    <DocumentUpload
                      key={documento.id}
                      documento={documento}
                      onUpdate={updateDocumento}
                      onRemove={removerDocumento}
                      canRemove={documentos.length > 1}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Seção de Contrapartidas */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700">CONTRAPARTIDAS</h3>
              <Button
                type="button"
                onClick={adicionarContrapartida}
                className="bg-teal-500 hover:bg-teal-600 text-white"
              >
                <Plus size={16} />
                Contrapartidas
              </Button>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Quantidade
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Descrição
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Data</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">
                      Evidência
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {contrapartidas.map((contrapartida) => (
                    <ContrapartidaUpload
                      key={contrapartida.id}
                      contrapartida={contrapartida}
                      onUpdate={updateContrapartida}
                      onRemove={removerContrapartida}
                      canRemove={true}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-4 pt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-teal-500 hover:bg-teal-600 text-white"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Alterações
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
