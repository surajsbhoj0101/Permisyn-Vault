import { SDKClient, type AuthStatus, type CompleteUserOnboardingInput } from "../client/SDKClient";
export interface UserOnboardingFlowProps {
    client: SDKClient;
    defaultValues?: Partial<CompleteUserOnboardingInput>;
    onSuccess?: (auth: AuthStatus) => void;
    onError?: (error: Error) => void;
}
export declare function UserOnboardingFlow({ client, defaultValues, onSuccess, onError, }: UserOnboardingFlowProps): any;
//# sourceMappingURL=UserOnboardingFlow.d.ts.map