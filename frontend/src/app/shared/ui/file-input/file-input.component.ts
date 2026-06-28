import { Component, input, output, signal } from '@angular/core';
import { UiButtonComponent } from '../button/button.component';

@Component({
  selector: 'ui-file-input',
  standalone: true,
  imports: [UiButtonComponent],
  templateUrl: './file-input.component.html',
})
export class UiFileInputComponent {
  accept = input('*/*');
  placeholder = input('No file chosen');

  fileSelected = output<File | null>();

  fileName = signal('');

  reset() {
    this.fileName.set('');
  }

  onNativeChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.fileName.set(file?.name ?? '');
    this.fileSelected.emit(file);
  }
}
