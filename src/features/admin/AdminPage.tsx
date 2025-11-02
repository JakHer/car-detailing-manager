import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import { HiUserCircle, HiPencil, HiCog } from "react-icons/hi2";
import toast from "react-hot-toast";
import { authStore } from "../../stores/AuthStore";
import Loader from "../../components/Loader/Loader";
import ExpandableTable, {
  type ExpandableTableColumn,
} from "../../components/ExpandableTable/ExpandableTable";
import Button from "../../components/Button/Button";
import AdminModal from "./AdminModal";
import type { Profile } from "../../stores/AuthStore";
import PageHeader from "../../components/PageHeader/PageHeader";

const AdminPage = observer(() => {
  const [allProfiles, setAllProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmAction, setConfirmAction] = useState<{
    userId: string;
    newRole: "user" | "admin";
  } | null>(null);

  useEffect(() => {
    const loadProfiles = async () => {
      if (authStore.profile?.role !== "admin") {
        toast.error("Brak dostępu do panelu admina");
        return;
      }
      try {
        const profiles = await authStore.fetchAllProfiles();
        setAllProfiles(profiles);
      } catch (error: unknown) {
        toast.error(
          "Błąd ładowania użytkowników: " +
            (error instanceof Error ? error.message : String(error))
        );
      } finally {
        setLoading(false);
      }
    };

    loadProfiles();
  }, []);

  const openConfirm = (userId: string, newRole: "user" | "admin") => {
    if (userId === authStore.user?.id) {
      toast.error("Nie możesz zmienić swojej roli");
      return;
    }
    setConfirmAction({ userId, newRole });
  };

  const handleConfirm = async () => {
    if (!confirmAction) return;

    try {
      await authStore.updateUserRole(
        confirmAction.userId,
        confirmAction.newRole
      );
      toast.success(
        `Rola zmieniona na ${
          confirmAction.newRole === "admin" ? "admin" : "user"
        }`
      );

      const profiles = await authStore.fetchAllProfiles();
      setAllProfiles(profiles);
    } catch (error: unknown) {
      toast.error(
        "Błąd zmiany roli: " +
          (error instanceof Error ? error.message : String(error))
      );
    } finally {
      setConfirmAction(null);
    }
  };

  const closeConfirm = () => {
    setConfirmAction(null);
  };

  if (authStore.loading || authStore.profileLoading || loading) {
    return (
      <Loader
        text="Ładowanie panelu admina..."
        size="lg"
        icon={<HiCog className="w-8 h-8 text-indigo-500" />}
      />
    );
  }

  if (authStore.profile?.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <HiUserCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Brak dostępu</h1>
          <p>
            Jesteś zalogowany jako {authStore.profile?.role}, ale panel admina
            jest tylko dla administratorów.
          </p>
        </div>
      </div>
    );
  }

  const columns: ExpandableTableColumn<Profile>[] = [
    {
      header: "Użytkownik",
      accessor: "username" as const,
      render: (profile: Profile) => (
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10">
            <HiUserCircle className="h-10 w-10 text-gray-300" />
          </div>
          <div className="ml-4">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {profile.username}
            </div>
          </div>
        </div>
      ),
      enableSorting: true,
    },
    {
      header: "Email",
      accessor: "email" as const,
      enableSorting: true,
    },
    {
      header: "Rola",
      accessor: "role" as const,
      render: (profile: Profile) => (
        <span
          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
            profile.role === "admin"
              ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
              : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
          }`}
        >
          {profile.role === "admin" ? "Admin" : "User"}
        </span>
      ),
      enableSorting: true,
    },
  ];

  const renderActions = (profile: Profile) => (
    <div>
      {profile.role === "user" ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => openConfirm(profile.id, "admin")}
          className="mr-1"
        >
          <HiPencil className="w-4 h-4 mr-1" />
          Awansuj
        </Button>
      ) : (
        <Button
          size="sm"
          variant="outline"
          onClick={() => openConfirm(profile.id, "user")}
          className="mr-1"
        >
          <HiPencil className="w-4 h-4 mr-1" />
          Degraduj
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        icon={<HiCog />}
        title="Dashboard"
        subtitle="Zarządzaj użytkownikami i rolami"
        rightContent={
          <div className="text-sm text-gray-500">
            Zalogowany jako: {authStore.profile.username} (
            {authStore.profile.role})
          </div>
        }
      />

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <ExpandableTable
          data={allProfiles}
          columns={columns}
          renderActions={renderActions}
          keyField="id"
          expandedId={null}
        />
      </div>

      {allProfiles.length === 0 && (
        <div className="text-center py-12">
          <HiUserCircle className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
            Brak użytkowników
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Na razie nie ma innych użytkowników. Dodaj ich przez rejestrację.
          </p>
        </div>
      )}

      <AdminModal
        isOpen={!!confirmAction}
        onClose={closeConfirm}
        confirmAction={confirmAction}
        onConfirm={handleConfirm}
        allProfiles={allProfiles}
      />
    </div>
  );
});

export default AdminPage;
