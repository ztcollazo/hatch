/**
 * Backwards-compatible exports for the profile server actions.
 * New code should import actions from the capability-specific modules.
 */
export {
  saveProfileImage,
  updateProfileImageVisibility,
  removeProfileImage,
} from "./image-actions";
export {
  saveProfileFullName,
  saveProfileDetails,
} from "./profile-actions";
export {
  saveProfileElement,
  saveProfileProject,
  updateProfileElementVisibility,
  reorderProfileElements,
  reorderProfileSections,
} from "./elements-actions";
export {
  saveProfileTemplate,
  publishProfileSnapshot,
  unpublishProfile,
} from "./publishing-actions";
export { deleteProfileData } from "./account-actions";
export { claimProfileHandle } from "./handle-actions";
export type { ProfileProjectInput } from "./domain/profile-types";
