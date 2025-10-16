// Type declarations for Jupiter Plugin
// https://station.jup.ag/docs/apis/swap-api

export interface JupiterPluginConfig {
  /** Display mode for the widget */
  displayMode: 'integrated' | 'modal' | 'widget';
  /** Target DOM element ID for integrated mode */
  integratedTargetId?: string;
  /** Solana RPC endpoint URL */
  endpoint: string;
  /** Enable strict token list (verified tokens only) */
  strictTokenList?: boolean;
  /** Default input token mint address */
  defaultExplorer?: 'Solscan' | 'Solana Explorer';
  /** Form configuration */
  formProps?: {
    /** Initial input token mint */
    initialInputMint?: string;
    /** Initial output token mint */
    initialOutputMint?: string;
    /** Initial amount in lamports/base units */
    initialAmount?: string;
  };
  /** Enable passthrough of wallet adapter */
  passThroughWallet?: any;
  /** Callback when form updates */
  onFormUpdate?: (form: any) => void;
  /** Callback when swap success */
  onSuccess?: (txid: string) => void;
  /** Referral configuration */
  referral?: {
    /** Referral account public key */
    account: string;
    /** Fee in basis points (max 100 = 1%) */
    feeBps: number;
  };
}

declare global {
  interface Window {
    Jupiter: {
      /** Initialize Jupiter Plugin */
      init: (config: JupiterPluginConfig) => Promise<void>;
      /** Resume Jupiter Plugin */
      resume: () => void;
      /** Close Jupiter Plugin */
      close: () => void;
      /** Cleanup and remove Jupiter Plugin */
      destroy: () => void;
    };
  }
}

export {};
