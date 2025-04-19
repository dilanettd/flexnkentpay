// Créez un nouveau fichier phone-format.directive.ts dans votre dossier shared/directives
import { Directive, ElementRef, HostListener } from '@angular/core';

@Directive({
  selector: '[phoneFormat]',
  standalone: true,
})
export class PhoneFormatDirective {
  constructor(private el: ElementRef) {}

  @HostListener('input', ['$event'])
  onInputChange(event: Event) {
    const input = event.target as HTMLInputElement;
    let value = input.value;

    // Supprimer tous les caractères non numériques
    value = value.replace(/[^0-9]/g, '');

    // Limiter à 9 chiffres
    if (value.length > 9) {
      value = value.substring(0, 9);
    }

    // S'assurer que le premier chiffre est 6
    if (value.length > 0 && value[0] !== '6') {
      value = '6' + value.substring(1);
    }

    // Mettre à jour la valeur
    input.value = value;

    // Déclencher l'événement input pour mettre à jour le FormControl
    const event2 = new Event('input', { bubbles: true });
    input.dispatchEvent(event2);
  }
}
