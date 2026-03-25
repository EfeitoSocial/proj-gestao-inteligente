import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import { useProjeto } from '@/hooks/useProjeto'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

function parseMoney(raw: string): number {
  const t = raw.trim().replace(/\s/g, '')
  if (!t) return 0
  const normalized = t.includes(',') ? t.replace(/\./g, '').replace(',', '.') : t
  const n = Number(normalized)
  return Number.isFinite(n) ? n : 0
}

export const CadastrarProjeto = () => {
  const { user, signOut } = useAuth()
  const { salvarProjeto, loading } = useProjeto()
  const navigate = useNavigate()

  const [nomeProjeto, setNomeProjeto] = useState('')
  const [localidadeProjeto, setLocalidadeProjeto] = useState('')
  const [tipoInvestimento, setTipoInvestimento] = useState<'privado' | 'ir'>('privado')
  const [leiProjeto, setLeiProjeto] = useState('')
  const [segmentoProjeto, setSegmentoProjeto] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  const [valorAporte, setValorAporte] = useState('')
  const [numeroPessoas, setNumeroPessoas] = useState('')
  const [resumo, setResumo] = useState('')
  const [dataInicio, setDataInicio] = useState('')
  const [dataFim, setDataFim] = useState('')

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const ok = await salvarProjeto(
      {
        cnpj: '',
        proponente: '',
        localidade: localidadeProjeto.trim(),
        representante_legal: '',
        cpf_representante: '',
        email: user?.email ?? '',
        contato: '',
        nome_projeto: nomeProjeto.trim(),
        localidade_projeto: localidadeProjeto.trim(),
        tipo_investimento: tipoInvestimento,
        lei_projeto: leiProjeto.trim() || '—',
        segmento_projeto: segmentoProjeto.trim() || '—',
        valor_total_projeto: parseMoney(valorTotal),
        valor_aporte_projeto: parseMoney(valorAporte),
        data_inicio_projeto: dataInicio || null,
        numero_projeto: '',
        classe_social_atingida: '',
        faixa_etaria_atingida: '',
        numero_pessoas_impactadas: Number(numeroPessoas) || 0,
        data_fim_projeto: dataFim || null,
        resumo_projeto: resumo.trim(),
        status_projeto: 'ativo',
      },
      [],
      [],
      [],
      [],
      [],
    )
    if (ok) {
      navigate('/projetos')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-3xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <h1 className="text-lg font-semibold">Cadastrar projeto</h1>
          <nav className="flex flex-wrap items-center gap-2">
            <Button variant="outline" asChild>
              <Link to="/projetos">Lista</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link to="/dashboard">Painel</Link>
            </Button>
            <Button variant="secondary" onClick={handleSignOut}>
              Sair
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Dados do projeto</CardTitle>
            <CardDescription>
              Preencha os campos essenciais. Você pode complementar depois na edição do projeto.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome do projeto</Label>
                <Input
                  id="nome"
                  value={nomeProjeto}
                  onChange={(ev) => setNomeProjeto(ev.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="localidade">Localidade</Label>
                <Input
                  id="localidade"
                  value={localidadeProjeto}
                  onChange={(ev) => setLocalidadeProjeto(ev.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Tipo de investimento</Label>
                <Select
                  value={tipoInvestimento}
                  onValueChange={(v) => setTipoInvestimento(v as 'privado' | 'ir')}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="privado">Privado</SelectItem>
                    <SelectItem value="ir">Incentivo a projetos (IR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="lei">Lei / eixo</Label>
                  <Input
                    id="lei"
                    value={leiProjeto}
                    onChange={(ev) => setLeiProjeto(ev.target.value)}
                    placeholder="Ex.: Cultura"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="segmento">Segmento</Label>
                  <Input
                    id="segmento"
                    value={segmentoProjeto}
                    onChange={(ev) => setSegmentoProjeto(ev.target.value)}
                    placeholder="Ex.: Audiovisual"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="valorTotal">Valor total (R$)</Label>
                  <Input
                    id="valorTotal"
                    inputMode="decimal"
                    value={valorTotal}
                    onChange={(ev) => setValorTotal(ev.target.value)}
                    placeholder="0,00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="valorAporte">Aporte (R$)</Label>
                  <Input
                    id="valorAporte"
                    inputMode="decimal"
                    value={valorAporte}
                    onChange={(ev) => setValorAporte(ev.target.value)}
                    placeholder="0,00"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pessoas">Pessoas impactadas</Label>
                <Input
                  id="pessoas"
                  inputMode="numeric"
                  value={numeroPessoas}
                  onChange={(ev) => setNumeroPessoas(ev.target.value)}
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="inicio">Início</Label>
                  <Input
                    id="inicio"
                    type="date"
                    value={dataInicio}
                    onChange={(ev) => setDataInicio(ev.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fim">Fim</Label>
                  <Input
                    id="fim"
                    type="date"
                    value={dataFim}
                    onChange={(ev) => setDataFim(ev.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="resumo">Resumo</Label>
                <Textarea
                  id="resumo"
                  value={resumo}
                  onChange={(ev) => setResumo(ev.target.value)}
                  rows={4}
                  required
                />
              </div>
              <Button type="submit" disabled={loading} className="w-full sm:w-auto">
                {loading ? 'Salvando…' : 'Salvar projeto'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
