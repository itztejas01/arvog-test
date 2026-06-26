import { Component, input, output } from '@angular/core';

type ButtonVariant = 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
type ButtonSize = 'default' | 'sm' | 'lg';

@Component({
  selector: 'ui-button',
  standalone: true,
  template: `
    <button
      [attr.type]="type()"
      [disabled]="disabled()"
      [class]="classes()"
      (click)="clicked.emit($event)"
    >
      <ng-content />
    </button>
  `,
})
export class UiButtonComponent {
  variant = input<ButtonVariant>('default');
  size = input<ButtonSize>('default');
  type = input<'button' | 'submit' | 'reset'>('button');
  disabled = input(false);
  clicked = output<MouseEvent>();

  classes() {
    const base =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50';

    const variants: Record<ButtonVariant, string> = {
      default: 'bg-primary text-primary-foreground hover:opacity-90',
      secondary: 'bg-muted text-foreground hover:bg-muted/80',
      destructive: 'bg-destructive text-white hover:opacity-90',
      outline: 'border border-border bg-background hover:bg-muted',
      ghost: 'hover:bg-muted',
    };

    const sizes: Record<ButtonSize, string> = {
      default: 'h-10 px-4 py-2',
      sm: 'h-8 rounded-md px-3 text-xs',
      lg: 'h-11 rounded-md px-8',
    };

    return `${base} ${variants[this.variant()]} ${sizes[this.size()]}`;
  }
}
