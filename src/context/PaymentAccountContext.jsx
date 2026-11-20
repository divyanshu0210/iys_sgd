import { createContext, useContext, useEffect, useState } from "react";
import API from "../services/api";

const PaymentAccountContext = createContext(null);

export function PaymentAccountProvider({ children }) {
  const [paymentAccount, setPaymentAccount] = useState(null);

  useEffect(() => {
    let active = true;
    API.get("/payments/account-details/")
      .then(({ data }) => {
        if (active) setPaymentAccount(data);
      })
      .catch((err) => console.error("Failed to load payment account details", err));
    return () => { active = false; };
  }, []);

  return (
    <PaymentAccountContext.Provider value={{ paymentAccount }}>
      {children}
    </PaymentAccountContext.Provider>
  );
}

export function usePaymentAccount() {
  const context = useContext(PaymentAccountContext);
  if (!context) throw new Error("usePaymentAccount must be used within PaymentAccountProvider");
  return context;
}
