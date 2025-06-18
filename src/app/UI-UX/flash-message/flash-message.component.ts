import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-flash-message',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './flash-message.component.html',
  styleUrls: ['./flash-message.component.css'],
  animations: [
    trigger('slideDownFade', [
      transition(':enter', [
        style({ opacity: 0, marginTop: '-20px' }),
        animate('400ms ease-out', style({ opacity: 1, marginTop: '0px' }))
      ]),
      transition(':leave', [
        animate('400ms ease-in', style({ opacity: 0, marginTop: '-20px' }))
      ])
    ])
  ]
})
export class FlashMessageComponent {
  @Input() message: string = '';
  @Input() type: 'success' | 'error' | 'info' = 'success';
}
