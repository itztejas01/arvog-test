import { Component, input, output } from '@angular/core';

@Component({
  selector: 'ui-drawer',
  standalone: true,
  templateUrl: './drawer.component.html',
})
export class UiDrawerComponent {
  open = input(false);
  title = input('Drawer');
  closed = output<void>();
}
