import { useState, type ButtonHTMLAttributes, type ReactNode } from "react";

import { SDKClient, type AuthenticatedUser } from "../client/SDKClient";

export interface ConnectButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onClick"> {
  client: SDKClient;
  children?: ReactNode;
  onSuccess?: (user: AuthenticatedUser) => void;
  onError?: (error: Error) => void;
}

export function ConnectButton({
  client,
  children,
  disabled,
  onSuccess,
  onError,
  ...buttonProps
}: ConnectButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = async () => {
    if (isLoading || disabled) {
      return;
    }

    setIsLoading(true);

    try {
      const user = await client.login();
      onSuccess?.(user);
    } catch (error) {
      onError?.(
        error instanceof Error
          ? error
          : new Error("Wallet authentication failed."),
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      {...buttonProps}
      type={buttonProps.type ?? "button"}
      disabled={disabled || isLoading}
      onClick={handleClick}
    >
      {isLoading ? <span>Connecting...</span> : children ?? <span>Connect Wallet</span>}
    </button>
  );
}
