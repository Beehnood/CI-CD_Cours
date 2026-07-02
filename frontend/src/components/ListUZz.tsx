import { useState } from "react";

export type User = {
  id: number;
  nom: string;
  prenom: string;
  ville: string;
};

export type PrivateUser = User & {
  email: string;
  date_naissance: string;
  pays: string;
  code_postal: string;
  telephone: string;
  nombre_achat: number;
};

type AdminCredentials = {
  username: string;
  password: string;
};

type ListUZzProps = {
  users: User[];
  error: string | null;
  isAdmin: boolean;
  onRegister: () => void;
  onAdminLogin: (credentials: AdminCredentials) => Promise<void>;
  onAdminLogout: () => void;
  onViewPrivateUser: (userId: number) => Promise<PrivateUser>;
  onDeleteUser: (userId: number) => Promise<void>;
};

function ListUZz({
  users,
  error,
  isAdmin,
  onRegister,
  onAdminLogin,
  onAdminLogout,
  onViewPrivateUser,
  onDeleteUser,
}: ListUZzProps) {
  const [credentials, setCredentials] = useState<AdminCredentials>({
    username: "",
    password: "",
  });
  const [adminError, setAdminError] = useState<string | null>(null);
  const [privateUser, setPrivateUser] = useState<PrivateUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const countLabel =
    users.length === 0
      ? "Aucun utilisateur inscrit"
      : `${users.length} utilisateur${users.length > 1 ? "s" : ""} inscrit${users.length > 1 ? "s" : ""}`;

  async function handleAdminLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setAdminError(null);

    try {
      await onAdminLogin(credentials);
      setCredentials({ username: "", password: "" });
    } catch {
      setAdminError("Identifiants administrateur invalides");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function showPrivateUser(userId: number) {
    setAdminError(null);
    try {
      setPrivateUser(await onViewPrivateUser(userId));
    } catch {
      setAdminError("Impossible de charger les informations privées");
    }
  }

  async function deleteUser(user: User) {
    const confirmed = window.confirm(
      `Supprimer l'inscription de ${user.prenom} ${user.nom} ?`,
    );
    if (!confirmed) {
      return;
    }

    setAdminError(null);
    try {
      await onDeleteUser(user.id);
      if (privateUser?.id === user.id) {
        setPrivateUser(null);
      }
    } catch {
      setAdminError("Impossible de supprimer cet utilisateur");
    }
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-semibold text-emerald-700">
            Communauté UZz
          </p>
          <h1 className="text-3xl font-bold text-slate-950">
            Liste des utilisateurs
          </h1>
          <p className="mt-2 text-slate-600" data-testid="users-count">
            {countLabel}
          </p>
        </div>
        <button
          type="button"
          onClick={onRegister}
          className="rounded-md bg-emerald-700 px-4 py-2 font-semibold text-white hover:bg-emerald-800"
        >
          S'inscrire
        </button>
      </div>

      <section className="mb-8 border-y border-slate-200 py-5">
        {isAdmin ? (
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-slate-950">
                Session administrateur active
              </p>
              <p className="text-sm text-slate-600">
                Les détails privés et la suppression sont disponibles.
              </p>
            </div>
            <button
              type="button"
              onClick={onAdminLogout}
              className="rounded-md border border-slate-300 px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100"
            >
              Déconnexion admin
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleAdminLogin}
            className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end"
          >
            <div>
              <label
                htmlFor="adminUsername"
                className="text-sm font-medium text-slate-700"
              >
                Compte admin
              </label>
              <input
                id="adminUsername"
                value={credentials.username}
                onChange={(event) =>
                  setCredentials({
                    ...credentials,
                    username: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-md border border-slate-300 p-2"
                required
              />
            </div>
            <div>
              <label
                htmlFor="adminPassword"
                className="text-sm font-medium text-slate-700"
              >
                Mot de passe
              </label>
              <input
                id="adminPassword"
                type="password"
                value={credentials.password}
                onChange={(event) =>
                  setCredentials({
                    ...credentials,
                    password: event.target.value,
                  })
                }
                className="mt-1 w-full rounded-md border border-slate-300 p-2"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-slate-900 px-4 py-2 font-semibold text-white hover:bg-slate-700 disabled:bg-slate-400"
            >
              {isSubmitting ? "Connexion..." : "Connexion admin"}
            </button>
          </form>
        )}
        {adminError && (
          <p className="mt-3 text-sm text-red-700" role="alert">
            {adminError}
          </p>
        )}
      </section>

      {error && (
        <p className="mb-6 rounded-md border border-red-200 bg-red-50 p-4 text-red-700">
          {error}
        </p>
      )}

      {users.length === 0 ? (
        <section className="border-y border-slate-200 py-12 text-center">
          <h2 className="text-xl font-semibold text-slate-900">
            La liste est encore vide
          </h2>
          <p className="mt-2 text-slate-600">
            Soyez la première personne à rejoindre UZz.
          </p>
        </section>
      ) : (
        <ul
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          aria-label="Liste des utilisateurs"
        >
          {users.map((user) => (
            <li
              key={user.id}
              className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100 font-bold text-emerald-800">
                {user.prenom.charAt(0)}
                {user.nom.charAt(0)}
              </div>
              <h2 className="text-lg font-bold text-slate-950">
                {user.prenom} {user.nom}
              </h2>
              <p className="mt-3 text-sm font-medium text-slate-700">
                {user.ville}
              </p>

              {isAdmin && (
                <div className="mt-5 flex gap-2 border-t border-slate-100 pt-4">
                  <button
                    type="button"
                    onClick={() => showPrivateUser(user.id)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Voir détails
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteUser(user)}
                    className="rounded-md border border-red-300 px-3 py-2 text-sm font-semibold text-red-700 hover:bg-red-50"
                  >
                    Supprimer
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {privateUser && (
        <div
          className="fixed inset-0 z-20 flex items-center justify-center bg-slate-950/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="private-user-title"
        >
          <section className="w-full max-w-lg rounded-lg bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-700">
                  Informations privées
                </p>
                <h2
                  id="private-user-title"
                  className="mt-1 text-2xl font-bold text-slate-950"
                >
                  {privateUser.prenom} {privateUser.nom}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setPrivateUser(null)}
                aria-label="Fermer les détails"
                className="text-2xl leading-none text-slate-500 hover:text-slate-950"
              >
                ×
              </button>
            </div>
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-sm text-slate-500">Email</dt>
                <dd className="break-words font-medium">{privateUser.email}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Téléphone</dt>
                <dd className="font-medium">{privateUser.telephone}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Date de naissance</dt>
                <dd className="font-medium">{privateUser.date_naissance}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-500">Adresse</dt>
                <dd className="font-medium">
                  {privateUser.code_postal} {privateUser.ville},{" "}
                  {privateUser.pays}
                </dd>
              </div>
            </dl>
          </section>
        </div>
      )}
    </main>
  );
}

export default ListUZz;
