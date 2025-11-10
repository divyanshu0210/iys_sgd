import React, { useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';

const PaymentQR = () => {
  const [amount, setAmount] = useState('3000');
  const [confirmed, setConfirmed] = useState(false);

  const upiId = '9307816821@ybl';
  const name = 'Abhishek Bhande';
  const upiUri = `upi://pay?pa=${upiId}&pn=${name}&am=${amount}&cu=INR`;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        width: '320px',
        margin: 'auto',
        marginTop: '50px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
      }}
    >
      {!confirmed ? (
        <>
          <h2>Enter Amount</h2>
          <div style={{ marginBottom: '20px', marginTop: '15px' }}>
            {['3000', '6500'].map((value) => (
              <label
                key={value}
                style={{
                  fontSize: '18px',
                  fontWeight: 'bold',
                  marginRight: '10px',
                }}
              >
                <input
                  type="radio"
                  value={value}
                  checked={amount === value}
                  onChange={(e) => setAmount(e.target.value)}
                />{' '}
                ₹{value}
              </label>
            ))}
          </div>

          <button
            style={{
              padding: '10px 20px',
              fontSize: '16px',
              backgroundColor: '#28a745',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
            }}
            onClick={() => setConfirmed(true)}
          >
            Confirm Payment
          </button>
        </>
      ) : (
        <>
          <h2>Confirm Payment</h2>
          <p style={{ fontSize: '18px', marginBottom: '15px' }}>
            Amount: ₹{amount}
          </p>

          <QRCodeCanvas value={upiUri} size={200} />

          <p style={{ marginTop: '10px', fontSize: '14px' }}>
            UPI ID: <strong>{upiId}</strong>
          </p>

          <div style={{ marginTop: '20px' }}>
            <button
              style={{
                padding: '10px 20px',
                marginRight: '10px',
                backgroundColor: '#007bff',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
              }}
              onClick={() => setConfirmed(false)}
            >
              Modify Amount
            </button>

            <a href={upiUri}>
              <button
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                Pay Now
              </button>
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default PaymentQR;
