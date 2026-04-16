import { jsx as _jsx } from "react/jsx-runtime";
import { useState } from "react";
export function ConnectButton({ client, children, disabled, onSuccess, onError, ...buttonProps }) {
    const [isLoading, setIsLoading] = useState(false);
    const handleClick = async () => {
        if (isLoading || disabled) {
            return;
        }
        setIsLoading(true);
        try {
            const user = await client.login();
            onSuccess?.(user);
        }
        catch (error) {
            onError?.(error instanceof Error
                ? error
                : new Error("Wallet authentication failed."));
        }
        finally {
            setIsLoading(false);
        }
    };
    return (_jsx("button", { ...buttonProps, type: buttonProps.type ?? "button", disabled: disabled || isLoading, onClick: handleClick, children: isLoading ? _jsx("span", { children: "Connecting..." }) : children ?? _jsx("span", { children: "Connect Wallet" }) }));
}
//# sourceMappingURL=ConnectButton.js.map