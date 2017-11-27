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
  intro_bio: string;
  country: string;
  preferred_contact: string;
  roles: string[];
  experience: string[];
  regions: string[];
  followed: boolean;
  affiliations: Affiliation[];
  annotation: any;
  field_permissions: FieldPermissions;
}
