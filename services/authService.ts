const API_URL = process.env.EXPO_PUBLIC_API_URL;

export interface LoginResponse {
  data: {
    idUsuario: number;
    username: string;
    email: string;
  };
}

export async function login(
  email: string,
  password: string,
): Promise<LoginResponse> {
  if (!API_URL) {
    throw new Error("URL da API não configurada.");
  }

  const response = await fetch(`${API_URL}/api/v1/credentials/session`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      email,
      password,
    }),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Credenciais inválidas.");
    }

    throw new Error(`Erro ao realizar login: ${response.status}`);
  }

  return response.json();
}
