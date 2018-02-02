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
  preferred_contact: string;
  intro_video: string;
  intro_bio: string;
  roles: string[];
  experience: string[];
  regions: string[];
  followed: boolean;
  affiliations: Affiliation[];
  country: string;
  citizenship: string;
  gender: string;
  primary-language: string;
  other-languages: string;
  comfort-level-with-english: string;
  issues-of-experience: string[];
  annotation: any;
  field_permissions: FieldPermissions;
}
