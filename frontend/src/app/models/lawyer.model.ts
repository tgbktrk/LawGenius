export interface PopulatedUser {
  _id: string,
  name: string;
  email: string;
  phone?: string;
  birthDate?: Date;
  gender?: string;
  role?: string;
}

export interface Lawyer {
  _id: string;
  userId: PopulatedUser;
  licenseNumber: string;
  barAssociation: string;
  expertiseAreas: string[];
  experienceYears: number;
  biography: string;
  availableStart: string;
  availableEnd:   string; 
  location: {
    city: string;
    district: string;
  };
  priceRange: string;
  profilePhoto: string;
  documents: string[];
  isApproved: boolean;
}