import DonationForm from "./DonationForm";

export default function DonationDetailsPage() {

  return (
    <>
     <h1 className="donate-heading" style={{ textAlign: "center" ,margin: "10px"}}>Donation</h1>
     <p style={{ textAlign: "center" ,margin: "20px"}}>Please fill all fields & Submit below to make your donation.</p>
    <DonationForm />
    </>
  );
}
