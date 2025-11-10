// src/pages/YatraRegister.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import API from "../../services/api";
import "../../css/members.css";
import { useAuth } from "../../context/AuthContext";

import RegistrationFormModal from "./components/RegistrationFormModal";
import InstallmentBadge from "./components/InstallmentBadge";

export default function YatraRegister() {
  const { yatra_id } = useParams();
  const { profile } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const yatra = location.state?.yatra || null;

  const [registerData, setRegisterData] = useState({ profiles: [], yatra: {} });
  const [eligibilityData, setEligibilityData] = useState({ profiles: [] });
  const [selected, setSelected] = useState([]); // [profileId]
  const [registrations, setRegistrations] = useState({}); // { profileId: { formData, amount } }
  const [activeTab, setActiveTab] = useState("registered");
  const [showModal, setShowModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [loading, setLoading] = useState({});
  
  
const [showPaymentModal, setShowPaymentModal] = useState(null);

  const [showForm, setShowForm] = useState(null); // profileId
  const [currentStep, setCurrentStep] = useState(1); // 1=select, 2=review, 3=checkout

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [regRes, eligRes] = await Promise.all([
          API.get(`/api/yatras/${yatra_id}/register/`),
          activeTab === "approve"
            ? API.get(`/api/yatras/${yatra_id}/eligibility/`)
            : Promise.resolve({ data: { profiles: [] } }),
        ]);
        setRegisterData(regRes.data);
        if (activeTab === "approve") setEligibilityData(eligRes.data);
      } catch (err) {
        alert("Failed to load data");
      }
    };
    fetchData();
  }, [yatra_id, activeTab]);

  // Toggle selection + open form
  const toggleSelect = (profile) => {
    if (profile.is_registered) return;
    if (!profile.is_eligible) {
      setModalMessage(
        profile.is_self
          ? "You must request approval from your mentor first."
          : "This devotee is not approved yet."
      );
      setShowModal(true);
      return;
    }

    const id = profile.id;
    if (selected.includes(id)) {
      setSelected(prev => prev.filter(x => x !== id));
      setRegistrations(prev => {
        const copy = { ...prev };
        delete copy[id];
        return copy;
      });
    } else {
      setShowForm(id);
    }
  };

  // Save form data
const handleFormSave = (profileId, formData) => {
  // const amount = formData.installment === "Full Payment (Rs 6500)" ? 6500 : 3000;
const installment = formData.installment;
  const selectedInstallment = yatra.installments.find(
    i => i.label === installment
  );
  const amount = selectedInstallment ? parseFloat(selectedInstallment.amount) : 0;
  setRegistrations(prev => ({
    ...prev,
    [profileId]: { ...formData, amount } // ← Overwrites if exists
  }));

  // Ensure profile is selected (add if not, keep if already)
  setSelected(prev => 
    prev.includes(profileId) ? prev : [...prev, profileId]
  );

  setShowForm(null);
};

  // Final payment
  // const handleFinalPayment = async () => {
  //   setLoading(prev => ({ ...prev, payment: true }));
  //   try {
  //     const payload = {
  //       registered_for_ids: selected,
  //       registration_data: Object.fromEntries(
  //         Object.entries(registrations).map(([id, data]) => [id, data])
  //       ),
  //     };
  //     await API.post(`/api/yatras/${yatra_id}/register/`, payload);
  //     alert("Payment initiated!");
  //     navigate("/payment", {
  //       state: { yatra_id, registrations: Object.values(registrations) },
  //     });
  //   } catch (err) {
  //     alert(err.response?.data?.errors?.[0] || "Payment failed");
  //   } finally {
  //     setLoading(prev => ({ ...prev, payment: false }));
  //   }
  // };

  // Approve / Unapprove
  const handleEligibility = async (profileId, action) => {
    const key = `${profileId}-${action}`;
    setLoading(prev => ({ ...prev, [key]: true }));
    try {
      await API.post(`/api/yatras/${yatra_id}/eligibility/`, {
        profile_ids: [profileId],
        action,
      });
      const [res1, res2] = await Promise.all([
        API.get(`/api/yatras/${yatra_id}/eligibility/`),
        API.get(`/api/yatras/${yatra_id}/register/`),
      ]);
      setEligibilityData(res1.data);
      setRegisterData(res2.data);
    } catch (err) {
      alert(err.response?.data?.errors?.[0] || `Failed to ${action}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Request approval for self
  const requestApproval = async () => {
    setLoading(prev => ({ ...prev, selfRequest: true }));
    try {
      await API.post(`/api/yatras/${yatra_id}/eligibility/`, {
        profile_ids: [profile.id],
        action: "request_approval",
      });
      alert("Approval request sent to your mentor!");
      const res = await API.get(`/api/yatras/${yatra_id}/eligibility/`);
      setEligibilityData(res.data);
    } catch (err) {
      alert(err.response?.data?.errors?.[0] || "Failed to send request");
    } finally {
      setLoading(prev => ({ ...prev, selfRequest: false }));
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Data
  const registered = registerData.profiles?.filter(p => p.is_registered) || [];
  const approveList = eligibilityData.profiles || [];
  const eligibleForReg = registerData.profiles?.filter(
    p => !p.is_registered && p.is_eligible
  ) || [];

  // WhatsApp Card
  const WhatsAppCard = ({ p, showCheckbox = false, isEligibilityCard = false }) => {
    const profileId = p.id || p.profile_id;
    const isApproved = p.is_approved ?? p.is_eligible;
    const isLoading = loading[`${profileId}-approve`] || loading[`${profileId}-unapprove`];
    const isSelfRequesting = loading.selfRequest && p.is_self;
    const regData = registrations[profileId];

    return (
      <div className="whatsapp-card">
        <div className="whatsapp-avatar">
          <img src={p.profile_picture_url || "/default-avatar.png"} alt={p.full_name} />
        </div>
        <div className="whatsapp-info">
          <div className="whatsapp-name-line">
            <strong>{p.full_name}</strong>
            {p.is_self && <span className="badge-self">You</span>}
            {p.is_registered && <span className="badge-registered">Registered</span>}
          </div>
          <div className="whatsapp-memberid">ID: {p.member_id || "N/A"}</div>
        </div>
        <div className="whatsapp-action" style={{ gap: "8px" }}>
          {regData && <InstallmentBadge installment={regData.installment} />}
          {showCheckbox && !p.is_registered && (
            <input
              type="checkbox"
              checked={selected.includes(profileId)}
              onChange={() => toggleSelect(p)}
              disabled={!isApproved}
              className="reg-checkbox"
            />
          )}
          {isEligibilityCard && !p.is_self && (
            <button
              onClick={() => handleEligibility(profileId, isApproved ? "unapprove" : "approve")}
              disabled={isLoading || p.is_registered}
              className={`action-btn ${isApproved ? "unapprove" : "approve"}`}
            >
              {isLoading
                ? isApproved ? "Unapproving..." : "Approving..."
                : isApproved ? "Unapprove" : "Approve"}
            </button>
          )}
          {isEligibilityCard && p.is_self && (
            <>
              {!p.approved_by && !p.is_approved && (
                <button onClick={requestApproval} disabled={isSelfRequesting} className="action-btn request">
                  {isSelfRequesting ? "Sending..." : "Request"}
                </button>
              )}
              {p.approved_by && !p.is_approved && (
                <button
                  onClick={() => window.confirm("Send again?") && requestApproval()}
                  disabled={isSelfRequesting}
                  className="action-btn pending"
                >
                  {isSelfRequesting ? "Sending..." : "Request Pending"}
                </button>
              )}
              {/* Case 3: Already approved */}
              {p.is_approved && (
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Can't unapprove yourself. Contact your mentor to unapprove."
                      )
                    ) {
                    }
                  }}
                  className="action-btn unapprove"
                >
                  Unapprove
                </button>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  const tabs = [
    { id: "registered", label: "Registered" },
    { id: "approve", label: "Approve Devotees" },
    { id: "newReg", label: "New Registration" },
  ];

  // === STEP 2: REVIEW TABLE ===
  const ReviewTable = () => {
    const total = Object.values(registrations).reduce((sum, r) => sum + r.amount, 0);

    return (
      <div className="review-container">
        <h3>Step 2: Review Details</h3>
        <table className="review-table">
          <thead>
            <tr>
              <th>Devotee</th>
              <th>Details</th>
              <th>Amount</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(registrations).map(([id, data]) => {
              const profile = eligibleForReg.find(p => p.id === id);
              return (
                <tr key={id}>
                  <td>
                    <strong>{profile.full_name}</strong>
                  </td>
                  <td>
                    <InstallmentBadge installment={data.installment} />
                    {Object.entries(data)
                      .filter(([k]) => k !== "amount" && k !== "installment")
                      .map(([k, v]) => (
                        <div key={k}><strong>{k}:</strong> {v}</div>
                      ))}
                  </td>
                  <td>₹{data.amount}</td>
                  <td>
                    <button
                      onClick={() => setShowForm(id)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <div className="total-row">
          <strong>Total: ₹{total}</strong>
        </div>
        <div className="step-actions">
          <button onClick={() => setCurrentStep(1)} className="btn-back">
            Back
          </button>
          <button onClick={() => setCurrentStep(3)} className="btn-next">
            Proceed to Pay
          </button>
        </div>
      </div>
    );
  };

  // === STEP 3: CHECKOUT ===
// === STEP 3: CHECKOUT (FULL PAGE) ===
const CheckoutStep = () => {
  const total = Object.values(registrations).reduce((sum, r) => sum + r.amount, 0);
  const [proofStep, setProofStep] = useState(1); // 1=QR, 2=Proof
  const [transactionId, setTransactionId] = useState("");
  const [screenshot, setScreenshot] = useState(null);
  const [loading, setLoading] = useState(false);

  const upiId = "iskcon.yatra@upi"; // from yatra config
  const qrUrl = `${API.defaults.baseURL}api/qr/?amount=${total}&note=Yatra+Payment`;

  const handleSubmitProof = async (e) => {
    e.preventDefault();
    if (!screenshot || !transactionId) return alert("Fill all fields");

    setLoading(true);
    const formData = new FormData();
    formData.append('transaction_id', transactionId);
    formData.append('screenshot', screenshot);
    formData.append('amount', total);

    Object.entries(registrations).forEach(([profileId, data]) => {
    formData.append('registration_ids', profileId);
    formData.append('amounts', data.amount);
  });
    try {
      // Submit proof for the entire batch
      await API.post(`/api/yatras/${yatra_id}/batch-payment-proof/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert("Payment proof submitted!");
      // Reset or redirect
      setCurrentStep(1);
      setSelected([]);
      setRegistrations({});
    } catch (err) {
      alert("Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="checkout-full">
      <h3>Step 3: Checkout</h3>

      {/* Summary */}
      <div className="checkout-summary">
        <p><strong>Yatra:</strong> {registerData.yatra.title}</p>
        <p><strong>Devotees:</strong> {selected.length}</p>
        <p><strong>Total Amount:</strong> ₹{total}</p>
      </div>

      {/* QR + Proof Flow */}
      <div className="payment-flow">
        {proofStep === 1 && (
          <div className="qr-section">
            <h4>Scan & Pay</h4>
            <img src={qrUrl} alt="UPI QR" className="qr-code" />
            <p><strong>Amount:</strong> ₹{total}</p>
            <p><strong>UPI ID:</strong> {upiId}</p>
            <p className="info">Use Google Pay, PhonePe, BHIM, etc.</p>
            <button onClick={() => setProofStep(2)} className="btn-next">
              I Have Paid
            </button>
          </div>
        )}

        {proofStep === 2 && (
          <form onSubmit={handleSubmitProof} className="proof-form">
            <h4>Submit Payment Proof</h4>
            <div className="form-group">
              <label>Transaction ID</label>
              <input
                type="text"
                value={transactionId}
                onChange={e => setTransactionId(e.target.value)}
                placeholder="e.g., T241108123456789"
                required
              />
            </div>
            <div className="form-group">
              <label>Payment Screenshot</label>
              <input type="file" accept="image/*" onChange={e => setScreenshot(e.target.files[0])} required />
            </div>
            <div className="step-actions">
              <button type="button" onClick={() => setProofStep(1)} className="btn-back">
                Back to QR
              </button>
              <button type="submit" disabled={loading} className="btn-submit">
                {loading ? "Submitting..." : "Submit Proof"}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Back to Review */}
      <div className="step-actions bottom">
        <button onClick={() => setCurrentStep(2)} className="btn-back">
          Back to Review
        </button>
      </div>
    </div>
  );
};
  return (
    <div className="profile-page">
      {/* Sidebar */}
      <div className="profile-sidebar">
        <div className="profile-header">
          <div className="profile-info-compact">
            <h2 className="profile-name">
              {yatra?.title || registerData.yatra?.title || "Yatra Registration"}
            </h2>
            {(yatra || registerData.yatra) && (
              <>
                <p className="profile-username">
                  Location: {(yatra || registerData.yatra).location}
                </p>
                <p className="profile-dates">
                  {formatDate((yatra || registerData.yatra).start_date)} to{" "}
                  {formatDate((yatra || registerData.yatra).end_date)}
                </p>
                {(yatra || registerData.yatra).description && (
                  <p className="profile-desc">
                    {(yatra || registerData.yatra).description}
                  </p>
                )}
              </>
            )}
          </div>
        </div>

        <nav className="vertical-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => {
                setActiveTab(tab.id);
                if (tab.id !== "newReg") {
                  setCurrentStep(1);
                  setSelected([]);
                  setRegistrations({});
                }
              }}
            >
              <span className="tab-label">{tab.label}</span>
              {tab.id === "newReg" && selected.length > 0 && (
                <span className="tab-count">{selected.length}</span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="profile-content">
        {/* Registered */}
        {activeTab === "registered" && (
          <div className="tab-content">
            <h3>Already Registered</h3>
            {registered.length === 0 ? (
              <p className="empty-msg">No one registered yet.</p>
            ) : (
              <div className="whatsapp-list">
                {registered.map(p => <WhatsAppCard key={p.id} p={p} />)}
              </div>
            )}
          </div>
        )}

        {/* Approve */}
        {activeTab === "approve" && (
          <div className="tab-content">
            <h3>Approve Devotees</h3>
            {approveList.length === 0 ? (
              <p className="empty-msg">No devotees to approve.</p>
            ) : (
              <div className="whatsapp-list">
                {approveList.map(p => (
                  <WhatsAppCard key={p.profile_id} p={p} isEligibilityCard={true} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* New Registration: 3 Steps */}
        {activeTab === "newReg" && (
          <div className="tab-content">
            {/* Step 1: Select */}
            {currentStep === 1 && (
              <>
                <h3>Step 1: Select Devotees</h3>
                <p className="info-text">Click checkbox to fill registration form.</p>
                {eligibleForReg.length === 0 ? (
                  <p className="empty-msg">No approved devotees available.</p>
                ) : (
                  <div className="whatsapp-list">
                    {eligibleForReg.map(p => (
                      <WhatsAppCard key={p.id} p={p} showCheckbox={true} />
                    ))}
                  </div>
                )}
                {selected.length > 0 && (
                  <div className="step-actions fixed" style={{display:'flex', justifyContent: 'center'}}>
                    <button onClick={() => setCurrentStep(2)} className="btn-next">
                      Review Details
                    </button>
                  </div>
                )}
              </>
            )}

            {/* Step 2: Review */}
            {currentStep === 2 && <ReviewTable />}

            {/* Step 3: Checkout */}
            {currentStep === 3 && <CheckoutStep />}
          </div>
        )}
      </div>

      {/* Modals */}
      {showForm && (
        <RegistrationFormModal
          profile={eligibleForReg.find(p => p.id === showForm)}
          yatra={yatra||registerData.yatra}
          onSave={handleFormSave}
          onClose={() => setShowForm(null)}
        />
      )}

      {/* Alert Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <h3>Action Required</h3>
            <p>{modalMessage}</p>
            <button onClick={() => setShowModal(false)} className="btn-close">
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}