export type ProfileDetails = {
  targetRole: string;
  headline: string;
  publicProfessionalLink: string;
  bio: string;
};

export type ProfileProjectInput = {
  id?: string;
  title: string;
  summary: string;
  url: string;
};

export type ProfileElementKind =
  | "education"
  | "experience"
  | "skill"
  | "professional-link"
  | "contact"
  | "project";

export type ProfileElementInput = Record<string, string | boolean> & {
  id?: string;
};

export type OutputVisibility = {
  showOnProfilePage: boolean;
  showOnResume: boolean;
};

export type SavedProfileElement = {
  id: string;
  label: string;
  values: ProfileElementInput;
  show_on_profile_page: boolean;
  show_on_resume: boolean;
};

export type ProfileTemplate = "recruiter-brief" | "project-showcase";
