import { type ReactNode } from "react";
import { SDKClient, type AuthStatus, type AuthenticatedUser, type CompleteUserOnboardingInput } from "../client/SDKClient";
export interface AuthFlowProps {
    client: SDKClient;
    triggerLabel?: ReactNode;
    title?: ReactNode;
    description?: ReactNode;
    connectLabel?: ReactNode;
    defaultValues?: Partial<CompleteUserOnboardingInput>;
    onAuthenticated?: (user: AuthenticatedUser) => void;
    onOnboardingRequired?: (user: AuthenticatedUser) => void;
    onOnboardingSuccess?: (auth: AuthStatus) => void;
    onContinue?: (user: AuthenticatedUser | null) => void;
    onClose?: () => void;
    onError?: (error: Error) => void;
    className?: string;
}
export declare function AuthFlow({ client, triggerLabel, title, description, connectLabel, defaultValues, onAuthenticated, onOnboardingRequired, onOnboardingSuccess, onContinue, onClose, onError, className, }: AuthFlowProps): any;
//# sourceMappingURL=AuthFlow.d.ts.map