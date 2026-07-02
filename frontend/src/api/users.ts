import type { TFormData } from "../components/Formulair";
import type { PrivateUser, User } from "../components/ListUZz";
import { apiClient } from "./client";

type AdminCredentials = {
  username: string;
  password: string;
};

export async function fetchUsers() {
  const response = await apiClient.get<{ utilisateurs: User[] }>("/users");
  return response.data.utilisateurs;
}

export async function createUser(formData: TFormData) {
  const response = await apiClient.post<{ utilisateur: User }>("/users", {
    nom: formData.lastName,
    prenom: formData.firstName,
    email: formData.email,
    date_naissance: formData.birthDate,
    pays: "France",
    ville: formData.city,
    code_postal: formData.postalCode,
    telephone: formData.phone,
    nombre_achat: 0,
  });

  return response.data.utilisateur;
}

export async function loginAdmin(credentials: AdminCredentials) {
  const response = await apiClient.post<{ token: string }>(
    "/admin/login",
    credentials,
  );
  return response.data.token;
}

export async function fetchPrivateUser(userId: number, token: string) {
  const response = await apiClient.get<{ utilisateur: PrivateUser }>(
    `/admin/users/${userId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data.utilisateur;
}

export async function removeUser(userId: number, token: string) {
  await apiClient.delete(`/admin/users/${userId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

