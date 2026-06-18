import React, { useState } from "react";
import axios from "axios";
import {
  isAdult,
  isValidEmail,
  isValidFrenchPhone,
  isValidFrenchPostalCode,
  isValidName,
} from "../utils/validations"

export type TFormData = {
  firstName: string;
  lastName: string;
  birthDate: string;
  email: string;
  city: string;
  postalCode: string;
  phone: string,
};

type FormulaireProps = {
  onCancel: () => void;
  onSuccess: (formData: TFormData) => Promise<void>;
};

type Commune = {
  nom: string;
  codesPostaux: string[];
};

function Formulaire({ onCancel, onSuccess }: FormulaireProps) {
  const [formData, setFormData] = useState<TFormData>({
    firstName: "",
    lastName: "",
    birthDate: "",
    email: "",
    city: "",
    postalCode: "",
    phone: "",
  });

  const [error, setError] = useState<string | null>(null);
  const [cities, setCities] = useState<string[]>([]);
  const [postalCodeError, setPostalCodeError] = useState<string | null>(null);
  const [isCheckingPostalCode, setIsCheckingPostalCode] = useState(false);
  const [verifiedPostalCode, setVerifiedPostalCode] = useState<string | null>(
    null,
  );

  const adultDate = new Date();
  adultDate.setFullYear(adultDate.getFullYear() - 18);
  const maximumBirthDate = adultDate.toISOString().split("T")[0];

  async function verifyPostalCode() {
    if (!isValidFrenchPostalCode(formData.postalCode)) {
      setCities([]);
      setVerifiedPostalCode(null);
      setPostalCodeError("Le code postal doit contenir 5 chiffres");
      return;
    }

    setIsCheckingPostalCode(true);
    setPostalCodeError(null);

    try {
      const response = await axios.get<Commune[]>(
        "https://geo.api.gouv.fr/communes",
        {
          params: {
            codePostal: formData.postalCode,
            fields: "nom,codesPostaux",
            format: "json",
          },
        },
      );
      const matchingCities = response.data
        .filter((commune) =>
          commune.codesPostaux.includes(formData.postalCode),
        )
        .map((commune) => commune.nom)
        .sort((cityA, cityB) => cityA.localeCompare(cityB));

      if (matchingCities.length === 0) {
        setCities([]);
        setVerifiedPostalCode(null);
        setPostalCodeError("Aucune ville trouvée pour ce code postal");
        return;
      }

      setCities(matchingCities);
      setVerifiedPostalCode(formData.postalCode);
      setFormData((currentData) => ({
        ...currentData,
        city: matchingCities.includes(currentData.city)
          ? currentData.city
          : matchingCities[0],
      }));
    } catch {
      setCities([]);
      setVerifiedPostalCode(null);
      setPostalCodeError("Impossible de vérifier le code postal");
    } finally {
      setIsCheckingPostalCode(false);
    }
  }

  async function handleSubmit(
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

  if (verifiedPostalCode !== formData.postalCode) {
    setError("Veuillez vérifier le code postal avant l'envoi");
    return;
  }

  if (
    !isValidFrenchPhone(
      formData.phone
    )
  ) {
    setError("Le numero du téléphone est invalide");
    return;
  }

  try {
    await onSuccess(formData);
  } catch {
    setError("Impossible de créer l'utilisateur avec l'API Python");
  }
}

  return (
    <div className="max-w-md mx-auto p-6 m-6 bg-blue-50 rounded-lg shadow-lg ">
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
          <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
            Prénom
          </label>

          <input
            id="firstName"
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
          <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
            Nom
          </label>

          <input
            id="lastName"
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
          <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700">
            Date de naissance
          </label>

          <input
            id="birthDate"
            type="date"
            max={maximumBirthDate}
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
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>

          <input
            id="email"
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

        {/* Code postal */}
        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700">
            Code postal
          </label>

          <input
            id="postalCode"
            type="text"
            inputMode="numeric"
            maxLength={5}
            value={formData.postalCode}
            onChange={(e) => {
              setVerifiedPostalCode(null);
              setCities([]);
              setPostalCodeError(null);
              setFormData({
                ...formData,
                postalCode: e.target.value.replace(/\D/g, "").slice(0, 5),
                city: "",
              });
            }}
            onBlur={verifyPostalCode}
            className="mt-1 block w-full rounded-md border p-2"
            required
          />
          <div className="mt-2 flex items-center justify-between gap-3">
            <p className="text-sm text-red-600" role="status">
              {postalCodeError}
            </p>
            <button
              type="button"
              onClick={verifyPostalCode}
              disabled={isCheckingPostalCode}
              className="shrink-0 text-sm font-semibold text-emerald-700 disabled:text-slate-400"
            >
              {isCheckingPostalCode ? "Vérification..." : "Vérifier"}
            </button>
          </div>
        </div>

        {/* Ville */}
        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700">
            Ville
          </label>

          {cities.length > 0 ? (
            <select
              id="city"
              value={formData.city}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  city: e.target.value,
                })
              }
              className="mt-1 block w-full rounded-md border p-2"
              required
            >
              {cities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="city"
              type="text"
              value={formData.city}
              readOnly
              placeholder="Vérifiez d'abord le code postal"
              className="mt-1 block w-full rounded-md border bg-slate-100 p-2"
              required
            />
          )}
        </div>
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Numero de Telephone
          </label>

          <input
            id="phone"
            type="text"
            value={formData.phone}
            onChange={(e) =>
              setFormData({
                ...formData,
                phone: e.target.value,
              })
            }
            className="mt-1 block w-full rounded-md border p-2"
            required
          />
        </div>

        {/* Bouton */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="w-full bg-gray-600 text-white p-2 rounded-md hover:bg-gray-700"
          >
            Retour accueil
          </button>
          <button
            type="submit"
            className="w-full bg-green-700 text-white p-2 rounded-md hover:bg-violet-700"
          >
            Envoyer
          </button>
        </div>
      </form>
    </div>
  );
}

export default Formulaire;
