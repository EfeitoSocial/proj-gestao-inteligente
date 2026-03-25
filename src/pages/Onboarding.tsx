import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckCircle2, ChevronRight, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import useAppStore from '@/stores/useAppStore'

const SECTORS = ['Financeiro', 'Tecnologia', 'Varejo', 'Manufatura', 'Outro']
const TAX_REGIMES = ['Lucro Real', 'Lucro Presumido', 'Simples Nacional']
const LOCATIONS = [
  'Brasil',
  'Acre',
  'Alagoas',
  'Amapá',
  'Amazonas',
  'Bahia',
  'Ceará',
  'Distrito Federal',
  'Espírito Santo',
  'Goiás',
  'Maranhão',
  'Mato Grosso',
  'Mato Grosso do Sul',
  'Minas Gerais',
  'Pará',
  'Paraíba',
  'Paraná',
  'Pernambuco',
  'Piauí',
  'Rio de Janeiro',
  'Rio Grande do Norte',
  'Rio Grande do Sul',
  'Rondônia',
  'Roraima',
  'Santa Catarina',
  'São Paulo',
  'Sergipe',
  'Tocantins',
]

const Onboarding = () => {
  const navigate = useNavigate()
  const { isAuthenticated, setAppState } = useAppStore()

  const [step, setStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    sector: '',
    taxRegime: '',
    location: '',
  })

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, navigate])

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleNext = () => {
    if (step < 4) setStep(step + 1)
  }

  const handleBack = () => {
    if (step > 1) setStep(step - 1)
  }

  const handleSubmit = () => {
    setIsLoading(true)
    setTimeout(() => {
      setIsLoading(false)
      setAppState({ companyData: formData })
      navigate('/summary')
    }, 1200)
  }

  const isStepValid = () => {
    switch (step) {
      case 1:
        return formData.name.trim().length > 2
      case 2:
        return formData.sector !== ''
      case 3:
        return formData.taxRegime !== ''
      case 4:
        return formData.location !== ''
      default:
        return false
    }
  }

  const progress = (step / 4) * 100

  if (!isAuthenticated) return null

  return (
    <div className="w-full max-w-xl animate-fade-in-up">
      <div className="mb-8 space-y-4">
        <div className="flex justify-between items-center text-sm font-medium text-muted-foreground">
          <span>Passo {step} de 4</span>
          <span>{Math.round(progress)}% Concluído</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <Card className="border-border/50 shadow-elevation backdrop-blur-sm bg-card/95 overflow-hidden">
        <CardHeader className="space-y-2 pb-6 pt-8">
          <CardTitle className="text-2xl font-bold">
            {step === 1 && 'Dados da Empresa'}
            {step === 2 && 'Setor de Atuação'}
            {step === 3 && 'Regime Tributário'}
            {step === 4 && 'Localização'}
          </CardTitle>
          <CardDescription className="text-base">
            {step === 1 && 'Qual é o nome oficial ou fantasia da sua empresa?'}
            {step === 2 && 'Em qual área sua empresa atua principalmente?'}
            {step === 3 && 'Selecione o regime de tributação aplicável.'}
            {step === 4 && 'Onde sua empresa está sediada?'}
          </CardDescription>
        </CardHeader>

        <CardContent className="min-h-[140px] pb-8">
          {step === 1 && (
            <div className="space-y-4 animate-slide-in-right">
              <div className="space-y-2">
                <Label htmlFor="companyName">Nome da Empresa</Label>
                <Input
                  id="companyName"
                  placeholder="Ex: Tech Solutions Ltda"
                  value={formData.name}
                  onChange={(e) => updateFormData('name', e.target.value)}
                  className="h-12 text-lg transition-colors focus-visible:ring-primary/50"
                  autoFocus
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 animate-slide-in-right">
              <div className="space-y-2">
                <Label htmlFor="sector">Setor</Label>
                <Select
                  value={formData.sector}
                  onValueChange={(val) => updateFormData('sector', val)}
                >
                  <SelectTrigger className="h-12 text-lg transition-colors focus:ring-primary/50">
                    <SelectValue placeholder="Selecione o setor" />
                  </SelectTrigger>
                  <SelectContent>
                    {SECTORS.map((s) => (
                      <SelectItem key={s} value={s} className="text-base">
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4 animate-slide-in-right">
              <div className="space-y-2">
                <Label htmlFor="taxRegime">Regime Tributário</Label>
                <Select
                  value={formData.taxRegime}
                  onValueChange={(val) => updateFormData('taxRegime', val)}
                >
                  <SelectTrigger className="h-12 text-lg transition-colors focus:ring-primary/50">
                    <SelectValue placeholder="Selecione o regime" />
                  </SelectTrigger>
                  <SelectContent>
                    {TAX_REGIMES.map((r) => (
                      <SelectItem key={r} value={r} className="text-base">
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-4 animate-slide-in-right">
              <div className="space-y-2">
                <Label htmlFor="location">Localidade</Label>
                <Select
                  value={formData.location}
                  onValueChange={(val) => updateFormData('location', val)}
                >
                  <SelectTrigger className="h-12 text-lg transition-colors focus:ring-primary/50">
                    <SelectValue placeholder="Selecione o estado" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px]">
                    {LOCATIONS.map((loc) => (
                      <SelectItem key={loc} value={loc} className="text-base">
                        {loc}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between bg-muted/30 pt-6 pb-6 border-t border-border/50">
          <Button
            variant="ghost"
            onClick={handleBack}
            disabled={step === 1 || isLoading}
            className="text-muted-foreground hover:text-foreground h-11 px-6"
          >
            Voltar
          </Button>

          {step < 4 ? (
            <Button
              onClick={handleNext}
              disabled={!isStepValid()}
              className="h-11 px-8 transition-all active:scale-[0.98]"
            >
              Continuar
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isStepValid() || isLoading}
              className="h-11 px-8 bg-accent hover:bg-accent/90 text-accent-foreground transition-all active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Finalizar Cadastro
                </>
              )}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}

export default Onboarding
