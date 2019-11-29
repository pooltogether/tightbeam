import { BaseProvider } from "ethers/providers";

export type ProviderSource = () => Promise<BaseProvider>
