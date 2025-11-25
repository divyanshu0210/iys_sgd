// src/components/PendingPaymentGuard.jsx
import { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { STORAGE_KEY } from "../pages/Registration/context/YatraRegistrationContext";
import { useAuth } from "../context/AuthContext";

export default function PendingPaymentGuard() {
  const [showSheet, setShowSheet] = useState(false);
  const navigate = useNavigate();
  const {user}= useAuth();

  useEffect(() => {
    const currentPath = window.location.pathname;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) return;
    const checkoutData = JSON.parse(raw);

    if (
      checkoutData &&
      checkoutData?.selected?.length > 0 &&
      currentPath !== "/checkout"
    ) {
      setShowSheet(true);
    }
  }, []);

  const handleContinuePayment = () => {
    setShowSheet(false);
    navigate("/checkout");
  };

  const handleCancelPayment = () => {
    const confirmDelete = window.confirm(
      "If you already paid but haven’t submitted the screenshot yet, the payment data will be lost.\n\nAre you sure you want to cancel?"
    );

    if (!confirmDelete) return;

    localStorage.removeItem(STORAGE_KEY);
    setShowSheet(false);
  };
if(!user)
    return <Outlet />;
  return (
    <>
      <Outlet />

      {showSheet && (
        <div className="pending-payment-sheet">
          <p className="message">You have a pending Yatra payment.</p>
          <div className="actions">
            <button className="pay" onClick={handleContinuePayment}>
              Pay Now
            </button>
            <button className="cancel" onClick={handleCancelPayment}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Basic Styling */}
      <style>
        {`
          .pending-payment-sheet {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #fefefe;
            border-top: 1px solid #ddd;
            border-radius: 12px 12px 0 0;
            padding: 14px 16px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 9999;
            box-shadow: 0 -2px 8px rgba(0,0,0,0.18);
            animation: slideUp 0.3s ease-out;
          }

          @keyframes slideUp {
            from { transform: translateY(100%); }
            to { transform: translateY(0); }
          }

          .message {
            font-size: 15px;
            font-weight: 500;
          }

          .actions {
            display: flex;
            justify-content: flex-end;
            gap: 10px;
          }

          .actions button {
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 14px;
            cursor: pointer;
            border: none;
          }

          .actions .pay {
            background: #0d6efd;
            color: white;
          }

          .actions .cancel {
            background: #e5e5e5;
            color: #333;
          }
        `}
      </style>
    </>
  );
}
