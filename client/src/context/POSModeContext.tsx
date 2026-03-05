import { createContext, useContext } from "react";

export type POSMode = "offline" | "online";

export const POSModeContext = createContext<POSMode>("offline");

export const usePOSMode = () => useContext(POSModeContext);
