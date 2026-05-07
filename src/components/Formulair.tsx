import React, { useState } from "react";
import {
  isAdult,
  isValidEmail,
  isValidFrenchPostalCode,
  isValidName,
} from "../utils/validations"

type TFormData = {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  city: string;
  postalCode: string;
};

function Formulaire() {
  const [formData, setFormData] = useState<TFormData>({
    firstName: "",
    lastName: "",
    birthDate: "",
    email: "",
    city: "",
    postalCode: "",
  });

  const [error, setError] = useState<string | null>(null);

  function handleSubmit(
  e: React.SyntheticEvent<HTMLFormElement>
) {
  e.preventDefault();

  setError(null);

  if (!isValidName(formData.firstName)) {
    setError("Le prénom est invalide");
    return;
  }

  if (!isValidName(formData.lastName)) {
    setError("Le nom est invalide");
    return;
  }

  if (!isValidEmail(formData.email)) {
    setError("L'email est invalide");
    return;
  }

  if (!isAdult(formData.birthDate)) {
    setError("Vous devez avoir au moins 18 ans");
    return;
  }

  if (
    !isValidFrenchPostalCode(
      formData.postalCode
    )
  ) {
    setError("Le code postal est invalide");
    return;
  }

  alert("Formulaire envoyé avec succès !");
}

  return (
    <div className="max-w-md mx-auto p-6 m-6 bg-gray-50 rounded-lg shadow-lg ">
      <h1 className="text-2xl font-bold text-center mb-6">
        Coordonnées
      </h1>

      {error && (
        <p className="text-red-600 text-center mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 m-6">

        {/* Prénom */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Prénom
          </label>

          <input
            type="text"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({
                ...formData,
                firstName: e.target.value,
              })
            }
            className="mt-1 block w-full rounded-md border p-2"
            required
          />
        </div>

        {/* Nom */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Nom
          </label>

          <input
            type="text"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({
                ...formData,
                lastName: e.target.value,
              })
            }
            className="mt-1 block w-full rounded-md border p-2"
            required
          />
        </div>

        {/* Date de naissance */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Date de naissance
          </label>

          <input
            type="date"
            value={formData.birthDate}
            onChange={(e) =>
              setFormData({
                ...formData,
                birthDate: e.target.value,
              })
            }
            className="mt-1 block w-full rounded-md border p-2"
            required
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>

          <input
            type="email"
            value={formData.email}
            onChange={(e) =>
              setFormData({
                ...formData,
                email: e.target.value,
              })
            }
            className="mt-1 block w-full rounded-md border p-2"
            required
          />
        </div>

        {/* Ville */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Ville
          </label>

          <input
            type="text"
            value={formData.city}
            onChange={(e) =>
              setFormData({
                ...formData,
                city: e.target.value,
              })
            }
            className="mt-1 block w-full rounded-md border p-2"
            required
          />
        </div>

        {/* Code postal */}
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Code postal
          </label>

          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) =>
              setFormData({
                ...formData,
                postalCode: e.target.value,
              })
            }
            className="mt-1 block w-full rounded-md border p-2"
            required
          />
        </div>

        {/* Bouton */}
        <button
          type="submit"
          className="w-full bg-green-700 text-white p-2 rounded-md hover:bg-blue-700"
        >
          Envoyer
        </button>
      </form>
    </div>
  );
}

export default Formulaire;