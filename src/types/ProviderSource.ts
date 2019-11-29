import { ethers } from "ethers";

export type ProviderSource = () => Promise<ethers.providers.BaseProvider>
