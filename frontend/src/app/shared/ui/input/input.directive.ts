import { Directive, HostBinding } from '@angular/core';

const inputClasses =
  'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';

@Directive({
  selector: 'input[uiInput], select[uiInput], textarea[uiInput]',
  standalone: true,
})
export class UiInputDirective {
  @HostBinding('class') classes = inputClasses;
}

export const uiTableClass = 'w-full caption-bottom text-sm';
export const uiTableHeadClass = 'border-b border-border';
export const uiTableRowClass = 'border-b border-border transition-colors hover:bg-muted/50';
export const uiTableCellClass = 'p-4 align-middle';
export const uiTableHeaderCellClass = 'h-12 px-4 text-left align-middle font-medium text-muted-foreground';
