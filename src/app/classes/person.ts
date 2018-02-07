export class Affiliation {
  organisation: string;
  position: string;
  website: string;
}

export class FieldPermissions {
  preferred_contact: string[];
  intro_bio: string[];
  // XXX
}

export class Person {
  id: any;
  name: string;
  email: string;
  preferred_contact: string[];
  intro_video: string;
  intro_bio: string;
  roles: string[];
  experience: string[];
  regions: string[];
  followed: boolean;
  affiliations: Affiliation[];
  country: string[];
  citizenship: string[];
  gender: string[];
  primary_language: string[];
  other_languages: string
  comfort_level_with_english: string[];
  issues_of_experience: string[];
  annotation: any;
  field_permissions: FieldPermissions;
}
