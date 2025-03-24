import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

export type ComboboxOption = {
  value: string;
  label: string;
};

export interface ComboboxProps {
  options: ComboboxOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  triggerClassName?: string;
  contentClassName?: string;
  disabled?: boolean;
}

export function Combobox({ options, placeholder = 'Select an option...', searchPlaceholder = 'Search...', emptyMessage = 'No option found.', value, onValueChange, className, triggerClassName, contentClassName, disabled = false }: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState(value || '');

  // Update internal state when external value changes
  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleSelect = React.useCallback(
    (currentValue: string) => {
      const newValue = currentValue === selectedValue ? '' : currentValue;
      setSelectedValue(newValue);

      if (onValueChange) {
        onValueChange(newValue);
      }

      setOpen(false);
    },
    [selectedValue, onValueChange],
  );

  const selectedOption = options.find((option) => option.value === selectedValue);

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant='outline' role='combobox' aria-expanded={open} disabled={disabled} className={cn('w-full justify-between', triggerClassName)}>
            {selectedValue ? selectedOption?.label : placeholder}
            <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className={cn('p-0', contentClassName)}>
          <Command>
            <CommandInput placeholder={searchPlaceholder} className='h-9' />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem keywords={[option.label]} key={option.value} value={option.value} onSelect={handleSelect}>
                    {option.label}
                    <Check className={cn('ml-auto h-4 w-4', selectedValue === option.value ? 'opacity-100' : 'opacity-0')} />
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
