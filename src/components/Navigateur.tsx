

export type NavigationPage = "home" | "users" | "form";

type NavigateurProps = {
  currentPage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
};

function Navigateur({ currentPage, onNavigate }: NavigateurProps) {
  const linkClass = (page: NavigationPage) =>
    `px-3 py-2 text-sm font-medium transition-colors ${
      currentPage === page
        ? "text-emerald-700"
        : "text-slate-600 hover:text-slate-950"
    }`;

   
  return (
    <nav
      className="border-b border-slate-200 bg-white"
      aria-label="Navigation principale"
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <button
          type="button"
          onClick={() => onNavigate("home")}
          className="text-left text-xl font-bold text-slate-950"
        >
          UZz <span className="text-emerald-700">s'inscrit</span>
        </button>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onNavigate("home")}
            className={linkClass("home")}
          >
            Accueil
          </button>
          <button
            type="button"
            onClick={() => onNavigate("users")}
            className={linkClass("users")}
          >
            Utilisateurs
          </button>
          <button
            type="button"
            onClick={() => onNavigate("form")}
            className="ml-2 rounded-md bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-800"
          >
            S'inscrire
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navigateur;
