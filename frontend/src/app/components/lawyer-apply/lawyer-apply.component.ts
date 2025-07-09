import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { BAR_ASSOCIATIONS } from '../../constants/bar-associations';
import { TURKISH_CITIES_WITH_DISTRICTS } from '../../constants/turkiye-cities';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { EXPERTISE_AREAS } from '../../constants/expertise-areas';

// Çalışma saatleri için özel validator
export const timeRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const start = group.get('availableStart')?.value;
  const end = group.get('availableEnd')?.value;
  if (start && end && start >= end) {
    return { invalidTimeRange: true };
  }
  return null;
};

// Minimum ve maksimum fiyat aralığını kontrol eden validator
export const priceRangeValidator: ValidatorFn = (group: AbstractControl): ValidationErrors | null => {
  const min = group.get('priceMin')?.value;
  const max = group.get('priceMax')?.value;
  if (
    min !== null && max !== null &&
    min !== '' && max !== '' &&
    +max <= +min
  ) {
    return { invalidPriceRange: true };
  }
  return null;
};

@Component({
  selector: 'app-lawyer-apply',
  standalone: false,
  templateUrl: './lawyer-apply.component.html',
  styleUrl: './lawyer-apply.component.scss'
})
export class LawyerApplyComponent {
  // Form ve kontrol değişkenleri
  lawyerForm: FormGroup;
  selectedDocuments: File[] = [];
  selectedProfilePhoto: File | null = null;
  documentsLimitExceeded = false;
  submitted = false;
  successMessage = '';
  errorMessage = '';
  barList = BAR_ASSOCIATIONS;
  cities: string[] = Object.keys(TURKISH_CITIES_WITH_DISTRICTS);
  districts: string[] = [];
  suggestedAreaKeys = EXPERTISE_AREAS;
  weekDays: string[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  selectedDays: string[] = [];
  SUPPORTED_LANGUAGES = ['Türkçe', 'İngilizce', 'Almanca', 'Fransızca', 'Arapça', 'İspanyolca'];

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    // Form yapısını başlatma
    this.lawyerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(10)]],
      birthDate: ['', Validators.required],
      gender: ['', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
      licenseNumber: ['', [Validators.required, Validators.pattern('^[a-zA-Z0-9]{4,10}$')]],
      barAssociation: ['', Validators.required],
      expertiseAreas: this.fb.array([this.fb.control('', Validators.required)]),
      experienceYears: ['', [Validators.required, Validators.min(0), Validators.max(60), Validators.pattern('^[0-9]+$')]],
      biography: ['', [Validators.required, Validators.minLength(50), Validators.maxLength(1000)]],
      languages: [[], Validators.required],
      availableDays: [[], Validators.required],
      availableStart: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
      availableEnd: ['', [Validators.required, Validators.pattern(/^([01]\d|2[0-3]):([0-5]\d)$/)]],
      location: this.fb.group({
        city: ['', Validators.required],
        district: ['', Validators.required]
      }),
      priceMin: ['', [Validators.required, Validators.min(0)]],
      priceMax: ['', [Validators.required, Validators.min(0)]],
      profilePhoto: [ null, Validators.required]
    }, { validators: [timeRangeValidator, priceRangeValidator] });
  }

  // Şehir değişince ilçeleri güncelleme
  ngOnInit(): void {
    this.lawyerForm.get('location.city')?.valueChanges.subscribe((selectedCity: string) => {
      this.districts = TURKISH_CITIES_WITH_DISTRICTS[selectedCity] || [];
      this.lawyerForm.get('location.district')?.setValue('');
    });
  }

  // Uzmanlık alanlarını alma
  get expertiseAreasControls() {
    return (this.lawyerForm.get('expertiseAreas') as FormArray).controls;
  }

  // Yeni uzmanlık alanı ekleme
  addExpertiseArea() {
    (this.lawyerForm.get('expertiseAreas') as FormArray).push(this.fb.control('', Validators.required));
  }

  // Uzmanlık alanı kaldırma
  removeExpertiseArea(index: number) {
    (this.lawyerForm.get('expertiseAreas') as FormArray).removeAt(index);
  }

  // Uygun günleri seçme
  toggleDay(day: string) {
    const index = this.selectedDays.indexOf(day);
    if (index > -1) {
      this.selectedDays.splice(index, 1);
    } else {
      this.selectedDays.push(day);
    }

    // Form kontrolünü güncelle
    this.lawyerForm.get('availableDays')?.setValue(this.selectedDays);
    this.lawyerForm.get('availableDays')?.updateValueAndValidity();
  }

  // Belge dosyalarını seçme
  onDocumentsSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const files = Array.from(input.files);
      if (files.length > 5) {
        this.documentsLimitExceeded = true;
        this.selectedDocuments = [];
      } else {
        this.documentsLimitExceeded = false;
        this.selectedDocuments = files;
      }
    }
  }

  // Profil fotoğrafı seçme ve kontrol etme
  onProfilePhotoSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] || null;
    const ctrl  = this.lawyerForm.get('profilePhoto')!;

    if (file) {
      const isValid = /\.(jpe?g|png)$/i.test(file.name);
      if (!isValid) {
        ctrl.setErrors({ invalidFormat: true });
        this.selectedProfilePhoto = null;
        return;
      }
      this.selectedProfilePhoto = file;
      ctrl.setValue(file);
      ctrl.updateValueAndValidity();
    } else {
      this.selectedProfilePhoto = null;
      ctrl.setValue(null);
      ctrl.updateValueAndValidity();
    }
  }

  // Başvuru formunu gönderme işlemi
  onSubmit() {
    this.submitted = true;

    if (this.lawyerForm.invalid) {
      console.warn('Form geçersiz:', this.lawyerForm.errors, this.lawyerForm.value);
      return;
    }

    const formValue = this.lawyerForm.value;
    const formData = new FormData();

    console.log('Form gönderiliyor:', formValue);
    console.log('Seçilen belgeler:', this.selectedDocuments);
    console.log('Seçilen profil fotoğrafı:', this.selectedProfilePhoto);

    // Form alanlarını FormData'ya ekleme
    formData.append('name', formValue.name);
    formData.append('email', formValue.email);
    formData.append('phone', formValue.phone);
    formData.append('birthDate', formValue.birthDate);
    formData.append('gender', formValue.gender);
    formData.append('password', formValue.password);
    formData.append('licenseNumber', formValue.licenseNumber);
    formData.append('barAssociation', formValue.barAssociation);
    formData.append('experienceYears', formValue.experienceYears);
    formData.append('biography', formValue.biography);
    formData.append('languages', JSON.stringify(formValue.languages));
    this.selectedDays.forEach(day => {
      formData.append('availableDays', day);
    });
    formData.append('availableStart', formValue.availableStart);
    formData.append('availableEnd', formValue.availableEnd);
    formData.append('city', formValue.location.city);
    formData.append('district', formValue.location.district);
    formData.append('priceRange', `${formValue.priceMin}-${formValue.priceMax}`);
    formData.append('expertiseAreas', JSON.stringify(formValue.expertiseAreas));  
    this.selectedDocuments.forEach(file => {
      formData.append('documents', file);
    });

    if (!this.selectedProfilePhoto) {
      this.errorMessage = 'Profil fotoğrafı gereklidir.';
      console.warn('⚠️ Profil fotoğrafı eksik');
      return;
    } else {
      formData.append('profilePhoto', this.selectedProfilePhoto);
    }

    console.log('FormData gönderiliyor...');
    this.http.post(`${environment.apiBaseUrl}/api/lawyers/full-register`, formData)
      .subscribe({
        next: (res: any) => {
          console.log('Başvuru başarılı:', res);
          this.successMessage = res.message;
          this.errorMessage = '';
          this.submitted = false; 
          this.lawyerForm.reset();
          this.selectedDocuments = [];
          this.selectedProfilePhoto = null;
          localStorage.setItem('token', res.token);

          setTimeout(() => this.router.navigate(['/']), 3000);
        },
        error: (err) => {
          console.error('Hata:', err);
          this.errorMessage = err.error?.message || 'Başvuru sırasında hata oluştu.';
          this.successMessage = '';
        }
      });
  }
}