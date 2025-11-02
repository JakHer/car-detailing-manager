import BaseModal from "../../components/BaseModal/BaseModal";
import type { Profile } from "../../stores/AuthStore";

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  confirmAction: { userId: string; newRole: "user" | "admin" } | null;
  onConfirm: () => void;
  allProfiles: Profile[];
}

const AdminModal: React.FC<AdminModalProps> = ({
  isOpen,
  onClose,
  confirmAction,
  onConfirm,
  allProfiles,
}) => {
  if (!confirmAction) return null;

  const actionText =
    confirmAction.newRole === "admin"
      ? "awansować na administratora"
      : "degraduje do użytkownika";
  const user = allProfiles.find((p) => p.id === confirmAction.userId);

  return (
    <BaseModal
      isOpen={isOpen}
      onClose={onClose}
      title="Potwierdź zmianę roli"
      mode="edit"
      renderBody={() => (
        <p className="dark:text-gray-100">
          Czy na pewno chcesz{" "}
          <span className="font-semibold">{actionText}</span> użytkownika{" "}
          <span className="font-semibold">{user?.username}</span> ({user?.email}
          )?
        </p>
      )}
      onSave={onConfirm}
    />
  );
};

export default AdminModal;
