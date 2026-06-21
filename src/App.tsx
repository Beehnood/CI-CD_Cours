import { useEffect, useState } from "react";
import Formulair, { type TFormData } from "./components/Formulair";
import ListUZz, { type User } from "./components/ListUZz";
import Navigateur, {
  type NavigationPage,
} from "./components/Navigateur";
import {
  createUser as createUserRequest,
  fetchPrivateUser,
  fetchUsers,
  loginAdmin as loginAdminRequest,
  removeUser,
} from "./api/users";

function App() {
  const [currentPage, setCurrentPage] =
    useState<NavigationPage>("home");
  const [users, setUsers] = useState<User[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers()
      .then((loadedUsers) => {
        setUsers(loadedUsers);
        setApiError(null);
      })
      .catch(() => {
        setApiError(
          "API Python indisponible. Vérifiez que FastAPI et MySQL sont démarrés.",
        );
      });
  }, []);

  async function createUser(formData: TFormData) {
    const createdUser = await createUserRequest(formData);

    setUsers((currentUsers) => [...currentUsers, createdUser]);
    setApiError(null);
    setCurrentPage("users");
  }

  async function loginAdmin(credentials: {
    username: string;
    password: string;
  }) {
    setAdminToken(await loginAdminRequest(credentials));
  }

  async function getPrivateUser(userId: number) {
    if (!adminToken) {
      throw new Error("Session administrateur absente");
    }
    return fetchPrivateUser(userId, adminToken);
  }

  async function deleteUser(userId: number) {
    if (!adminToken) {
      throw new Error("Session administrateur absente");
    }
    await removeUser(userId, adminToken);
    setUsers((currentUsers) =>
      currentUsers.filter((user) => user.id !== userId),
    );
  }

  const usersCount = users.length;
  const countLabel =
    usersCount === 0
      ? "Aucun utilisateur inscrit"
      : `${usersCount} utilisateur${usersCount > 1 ? "s" : ""} inscrit${usersCount > 1 ? "s" : ""}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigateur
        currentPage={currentPage}
        onNavigate={setCurrentPage}
      />

      {currentPage === "home" && (
        <main className="mx-auto grid max-w-6xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.3fr_0.7fr] lg:items-center">
          <section>
            <p className="mb-3 text-sm font-semibold text-emerald-700">
              Bienvenue chez UZz
            </p>
            <h1 className="max-w-2xl text-4xl font-bold text-slate-950 sm:text-5xl">
              UZz s'inscrit
            </h1>
            <p className="mt-5 max-w-xl text-lg leading-8 text-slate-600">
              Inscrivez-vous simplement et retrouvez les membres de la
              communauté depuis la liste des utilisateurs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => setCurrentPage("form")}
                className="rounded-md bg-emerald-700 px-5 py-3 font-semibold text-white hover:bg-emerald-800"
              >
                S'inscrire
              </button>
              <button
                type="button"
                onClick={() => setCurrentPage("users")}
                className="rounded-md border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-800 hover:bg-slate-100"
              >
                Voir les utilisateurs
              </button>
            </div>
          </section>

          <aside className="border-l-4 border-emerald-600 bg-white p-7 shadow-sm">
            <p className="text-sm font-semibold text-slate-500">
              Membres inscrits
            </p>
            <p className="mt-2 text-5xl font-bold text-slate-950">
              {usersCount}
            </p>
            <p className="mt-3 text-slate-600">{countLabel}</p>
            {apiError && (
              <p className="mt-4 text-sm text-red-700">{apiError}</p>
            )}
          </aside>
        </main>
      )}

      {currentPage === "users" && (
        <ListUZz
          users={users}
          error={apiError}
          isAdmin={adminToken !== null}
          onRegister={() => setCurrentPage("form")}
          onAdminLogin={loginAdmin}
          onAdminLogout={() => setAdminToken(null)}
          onViewPrivateUser={getPrivateUser}
          onDeleteUser={deleteUser}
        />
      )}

      {currentPage === "form" && (
        <Formulair
          onCancel={() => setCurrentPage("home")}
          onSuccess={createUser}
        />
      )}
    </div>
  );
}

export default App;
