import { Component, input } from '@angular/core';

@Component({
  selector: 'ui-input',
  standalone: true,
  template: `
    <input
      [class]="inputClass()"
      [type]="type()"
      [placeholder]="placeholder()"
      [disabled]="disabled()"
      [value]="value()"
      (input)="onInput($event)"
    />
  `,
})
export class UiInputComponent {
  type = input('text');
  placeholder = input('');
  disabled = input(false);
  value = input('');

  inputClass() {
    return 'flex h-10 w-full rounded-md border border-border bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50';
  }

  onInput(event: Event) {
    const target = event.target as HTMLInputElement;
    this.valueChange?.(target.value);
  }

  valueChange?: (value: string) => void;
}

@Component({
  selector: 'ui-label',
  standalone: true,
  template: `
    <label class="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
      <ng-content />
    </label>
  `,
})
export class UiLabelComponent {}

@Component({
  selector: 'ui-badge',
  standalone: true,
  template: `
    <span [class]="classes()">
      <ng-content />
    </span>
  `,
})
export class UiBadgeComponent {
  variant = input<'default' | 'secondary' | 'destructive'>('default');

  classes() {
    const base = 'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors';
    const variants = {
      default: 'border-transparent bg-primary text-primary-foreground',
      secondary: 'border-transparent bg-muted text-foreground',
      destructive: 'border-transparent bg-destructive text-white',
    };
    return `${base} ${variants[this.variant()]}`;
  }
}
