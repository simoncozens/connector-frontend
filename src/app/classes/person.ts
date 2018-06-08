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
  phone: string;
  preferred_contact: string;
  picture: string;
  skype_id:string;
  twitter_id:string;
  facebook_id:string;
  linkedin_id:string;
  intro_video: string;
  intro_bio: string;
  short_bio: string;
  roles: string[];
  experience: string[];
  events: string[];
  regions: string[];
  followed: boolean;
  affiliations: Affiliation[];
  country: string;
  city: string;
  citizenship: string;
  gender: string;
  primary_language: string;
  languages_spoken: string
  comfort_level_with_english: string;
  issues_of_experience: string[];
  annotation: any;
  lausanne_title: string;
  joined_lausanne: string;
  field_permissions: FieldPermissions;
  catalyst: string;
}
