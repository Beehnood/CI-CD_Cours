import { useEffect, useState } from "react";
import axios from "axios";
import Formulair, { type TFormData } from "./components/Formulair";
import ListUZz, {
  type PrivateUser,
  type User,
} from "./components/ListUZz";
import Navigateur, {
  type NavigationPage,
} from "./components/Navigateur";

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

function App() {
  const [currentPage, setCurrentPage] =
    useState<NavigationPage>("home");
  const [users, setUsers] = useState<User[]>([]);
  const [apiError, setApiError] = useState<string | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(null);

  useEffect(() => {
    axios
      .get<{ utilisateurs: User[] }>(`${API_URL}/users`)
      .then((response) => {
        setUsers(response.data.utilisateurs);
        setApiError(null);
      })
      .catch(() => {
        setApiError("API Python indisponible");
      });
  }, []);

  async function createUser(formData: TFormData) {
    const response = await axios.post<{ utilisateur: User }>(
      `${API_URL}/users`,
      {
        nom: formData.lastName,
        prenom: formData.firstName,
        email: formData.email,
        date_naissance: formData.birthDate,
        pays: "France",
        ville: formData.city,
        code_postal: formData.postalCode,
        telephone: formData.phone,
        nombre_achat: 0,
      },
    );

    setUsers((currentUsers) => [
      ...currentUsers,
      response.data.utilisateur,
    ]);
    setApiError(null);
    setCurrentPage("users");
  }

  async function loginAdmin(credentials: {
    username: string;
    password: string;
  }) {
    const response = await axios.post<{ token: string }>(
      `${API_URL}/admin/login`,
      credentials,
    );
    setAdminToken(response.data.token);
  }

  async function getPrivateUser(userId: number) {
    const response = await axios.get<{ utilisateur: PrivateUser }>(
      `${API_URL}/admin/users/${userId}`,
      {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      },
    );
    return response.data.utilisateur;
  }

  async function deleteUser(userId: number) {
    await axios.delete(`${API_URL}/admin/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
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
