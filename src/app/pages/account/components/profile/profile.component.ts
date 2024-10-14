import { Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';

@Component({
  selector: 'flexnkentpay-profile',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss',
})
export class ProfileComponent implements OnInit, OnDestroy {
  imageUrl: string | ArrayBuffer | null = 'assets/images/avatars/avatar.jpg';
  logoUrl: string | ArrayBuffer | null = 'assets/images/avatars/avatar.jpg';
  coverPhotoUrl: string | ArrayBuffer | null =
    'assets/images/avatars/avatar.jpg';
  profileForm!: FormGroup;
  sellerForm!: FormGroup;
  isFormModified: boolean = false;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {}

  changePicture(event: any) {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: any) => {
        this.imageUrl = e.target.result;
      };

      reader.readAsDataURL(file);
    }
  }

  onUpdate() {}
  // Méthode pour changer le logo
  changeLogo(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.logoUrl = e.target.result;
        // Logique pour sauvegarder le logo ou l'envoyer au serveur
      };
      reader.readAsDataURL(file);
    }
  }

  // Méthode pour changer la photo de couverture
  changeCoverPhoto(event: any): void {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.coverPhotoUrl = e.target.result;
        // Logique pour sauvegarder la photo de couverture ou l'envoyer au serveur
      };
      reader.readAsDataURL(file);
    }
  }

  // Méthode pour sauvegarder les détails du vendeur
  onUpdateSeller(): void {
    // Logique pour envoyer les informations du vendeur mises à jour au serveur
    console.log('Mise à jour des informations du vendeur');
  }

  ngOnDestroy(): void {}
}
