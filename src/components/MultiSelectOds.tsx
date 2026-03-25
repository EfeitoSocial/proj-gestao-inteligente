import React, { useState, useEffect } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import { supabase } from '@/integrations/supabase/client'

interface ODS {
  id: string
  numero: number
  nome: string
}

interface MultiSelectOdsProps {
  selectedOds: string[]
  onSelectionChange: (selectedIds: string[]) => void
}

export const MultiSelectOds: React.FC<MultiSelectOdsProps> = ({
  selectedOds,
  onSelectionChange,
}) => {
  const [open, setOpen] = useState(false)
  const [odsList, setOdsList] = useState<ODS[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOds = async () => {
      try {
        const { data, error } = await supabase
          .from('ods')
          .select('id, numero, nome')
          .order('numero')

        if (error) {
          console.error('Erro ao buscar ODS:', error)
        } else {
          setOdsList(data || [])
        }
      } catch (error) {
        console.error('Erro ao buscar ODS:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOds()
  }, [])

  const handleSelect = (odsId: string) => {
    const isSelected = selectedOds.includes(odsId)

    if (isSelected) {
      onSelectionChange(selectedOds.filter((id) => id !== odsId))
    } else {
      onSelectionChange([...selectedOds, odsId])
    }
  }

  const getSelectedOdsNames = () => {
    return odsList
      .filter((ods) => selectedOds.includes(ods.id))
      .map((ods) => `ODS ${ods.numero}`)
      .join(', ')
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">ODS ATENDIDOS</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedOds.length > 0 ? `${selectedOds.length} ODS selecionados` : 'Selecione os ODS'}
            <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar ODS..." />
            <CommandList>
              <CommandEmpty>Nenhum ODS encontrado.</CommandEmpty>
              <CommandGroup>
                {odsList.map((ods) => (
                  <CommandItem
                    key={ods.id}
                    value={`${ods.numero} ${ods.nome}`}
                    onSelect={() => handleSelect(ods.id)}
                  >
                    <Check
                      className={`mr-2 h-4 w-4 ${
                        selectedOds.includes(ods.id) ? 'opacity-100' : 'opacity-0'
                      }`}
                    />
                    ODS {ods.numero} - {ods.nome}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {selectedOds.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {odsList
            .filter((ods) => selectedOds.includes(ods.id))
            .map((ods) => (
              <Badge
                key={ods.id}
                variant="secondary"
                className="cursor-pointer bg-primary"
                onClick={() => handleSelect(ods.id)}
              >
                ODS {ods.numero}
                <span className="ml-1 text-xs">×</span>
              </Badge>
            ))}
        </div>
      )}
    </div>
  )
}
