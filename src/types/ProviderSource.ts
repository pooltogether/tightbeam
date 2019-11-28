import { JsonRpcProvider } from "ethers/providers";

export type ProviderSource = () => Promise<JsonRpcProvider>
