import { ApplicationFormData } from "./forms";

import { Application } from "@/services/api";

export interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingApp: Application | null;
  onSubmit: (data: ApplicationFormData) => Promise<void>;
  isSubmitting: boolean;
}
