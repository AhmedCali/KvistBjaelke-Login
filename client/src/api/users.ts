import type { Role, User } from "../models/user";

export interface CreateUserRequest {
    username: string;
    password: string;
    role: Role;
}

export interface UpdateUserRequest {
    username?: string;
    password?: string;
    role?: Role;
}

// Sender et kald til /api/users med brugerens token
async function request(token: string, path: string, method = "GET", body?: unknown): Promise<Response> {
    let response: Response;
    try {
        response = await fetch(`/api/users${path}`, {
            method,
            headers: {
                Authorization: `Bearer ${token}`,
                ...(body ? { "Content-Type": "application/json" } : {}),
            },
            body: body ? JSON.stringify(body) : undefined,
        });
    } catch {
        throw new Error("Kunne ikke nå serveren. Prøv igen senere!");
    }

    if (response.ok) return response;

    // Oversæt fejlkoder fra backend til en besked, brugeren kan forstå
    if (response.status === 401) throw new Error("Din session er udløbet. Log ind igen.");
    if (response.status === 403) throw new Error("Du har ikke rettigheder til denne handling.");
    if (response.status === 404) throw new Error("Brugeren findes ikke længere.");
    if (response.status === 409) throw new Error("Brugernavnet er allerede taget.");

    const text = await response.text();
    throw new Error(text || `Noget gik galt (HTTP ${response.status}).`);
}

export async function getUsers(token: string): Promise<User[]> {
    const response = await request(token, "");
    return await response.json();
}

export async function createUser(token: string, data: CreateUserRequest): Promise<User> {
    const response = await request(token, "", "POST", data);
    return await response.json();
}

export async function updateUser(token: string, id: number, data: UpdateUserRequest): Promise<void> {
    await request(token, `/${id}`, "PUT", data);
}

export async function deleteUser(token: string, id: number): Promise<void> {
    await request(token, `/${id}`, "DELETE");
}