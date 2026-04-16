import { type ButtonHTMLAttributes, type ReactNode } from "react";
import { SDKClient, type AuthenticatedUser } from "../client/SDKClient";
export interface ConnectButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
    client: SDKClient;
    children?: ReactNode;
    onSuccess?: (user: AuthenticatedUser) => void;
    onError?: (error: Error) => void;
}
export declare function ConnectButton({ client, children, disabled, onSuccess, onError, ...buttonProps }: ConnectButtonProps): any;
//# sourceMappingURL=ConnectButton.d.ts.map