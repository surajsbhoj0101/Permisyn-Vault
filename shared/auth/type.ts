import type { Role } from "../role/type";

export type AuthResponse = {
    isAuthorized: boolean;
    role: Role | null;
    userId: string | null;
    username: string | null;
};

export type NonceResponse = {
    nonce: string;
};

export type SetRoleRequest = {
    username: string;
    companyName?: string | null;
    email?: string;
    role: Role;
};