import { Component } from '@angular/core';

@Component({
  selector: 'ui-card',
  standalone: true,
  template: `
    <div class="rounded-lg border border-border bg-background text-foreground shadow-sm">
      <ng-content />
    </div>
  `,
})
export class UiCardComponent {}

@Component({
  selector: 'ui-card-header',
  standalone: true,
  template: `
    <div class="flex flex-col space-y-1.5 p-6">
      <ng-content />
    </div>
  `,
})
export class UiCardHeaderComponent {}

@Component({
  selector: 'ui-card-title',
  standalone: true,
  template: `
    <h3 class="text-2xl font-semibold leading-none tracking-tight">
      <ng-content />
    </h3>
  `,
})
export class UiCardTitleComponent {}

@Component({
  selector: 'ui-card-description',
  standalone: true,
  template: `
    <p class="text-sm text-muted-foreground">
      <ng-content />
    </p>
  `,
})
export class UiCardDescriptionComponent {}

@Component({
  selector: 'ui-card-content',
  standalone: true,
  template: `
    <div class="p-6 pt-0">
      <ng-content />
    </div>
  `,
})
export class UiCardContentComponent {}
