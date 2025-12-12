// components/DonateSlider.jsx
import React, { useState, useEffect } from "react";
const donationItems = [
  {
    text: "Youth preaching programs",
    image:
      "https://lookaside.fbsbx.com/lookaside/crawler/media/?media_id=875750365112885",
  },
  {
    text: "Prasadam distribution",
    image: "https://upload.wikimedia.org/wikipedia/commons/d/dd/Prasadam2.jpg",
  },
  {
    text: "Temple seva & festivals",
    image:
      "https://img.etimg.com/thumb/msid-109376204,width-480,height-360,imgsize-290166,resizemode-75/festival-devotees.jpg",
  },
  {
    text: "Scriptural education",
    image:
      "https://sivanandayogafarm.secure.retreat.guru/wp-content/uploads/sites/315/2017/08/bhagavad-gita.jpg",
  },
  {
    text: "Spiritual Yatras",
    image:
      "https://www.tourmyindia.com/blog//wp-content/uploads/2021/05/Best-Spiritual-Journeys-in-India.jpg",
  },
  {
    text: "Counselling & life guidance for youths",
    image:
      "https://www.globalsistersreport.org/files/styles/facebook_ratio/public/2025-12/Christy%20Babu%201%20web.jpg?h=28decbfb&itok=DDNfiJIv",
  },
  {
    text: "Free personality development workshops",
    image:
      "https://cdn5.planetspark.in/media/medium_u1228994638_fair_young_Indian_girl_age_10_standing_confidentl_9c214546_e8d9_4b6c_b987_78375adea2f7_3_f0e7433ff8.png",
  },
  {
    text: "Bhagavad Gita study circles",
    image:
      "https://www.radhakrishnatemple.net/sites/default/files/2019-12/Screen%20Shot%202019-12-08%20at%207.51.30%20PM_0.png",
  },
  {
    text: "Youth satsang programs",
    image:
      "https://www.jkyog.org/blog/content/images/2025/10/491942326_718040030575292_6101326328226457970_n.webp",
  },
  {
    text: "Career & academic mentorship",
    image: "http://blog.impacteers.com/wp-content/uploads/2025/08/42.jpg",
  },
  {
    text: "Training in kirtan, bhajans & devotional arts",
    image:
      "https://krishnamusicschool.com/wp-content/uploads/al_opt_content/IMAGE/krishnamusicschool.com/wp-content/uploads/2025/08/Website-Image-Banner-scaled.webp.bv_resized_mobile.webp.bv.webp?bv_host=krishnamusicschool.com",
  },
  {
    text: "Meditation & mind-balance sessions",
    image:
      "https://premierfitnessstudio.com/wp-content/uploads/2024/11/PFS-yoga-meditation.jpg",
  },
  {
    text: "Support for hostel students & newcomers",
    image:
      "https://gurukul.org/wp-content/uploads/2024/03/Hostel-Room-raipur.jpg",
  },
  {
    text: "Drug-free & stress-free lifestyle campaigns",
    image:
      "https://www.unodc.org/images/southasia/2022/September/Lekhi_drugs.jpg",
  },
  {
    text: "Community seva & volunteering opportunities",
    image:
      "http://www.srividya.org/wp-content/uploads/2018/08/49323978646_8e470bc3dd_o-1024x678.jpg",
  },
  {
    text: "Free spiritual books for students",
    image:
      "https://media.assettype.com/freepressjournal/2024-12-30/67lx2z8p/Mahakumbh-A-Holy-Festival-Not-a-Fair-Says-Prayagputra-Rakesh-Shukla-11.jpg",
  },
  {
    text: "Value-based education in colleges",
    image:
      "https://www.rayburncollege.ac.in/wp-content/uploads/2025/09/WhatsApp-Image-2025-09-26-at-17.21.31_d12c615d.jpg",
  },
  {
    text: "Skill & leadership training camps",
    image:
      "https://northeastnetwork.org/wp-content/uploads/2023/01/JPEG-image-4-1024x768.jpeg",
  },
  {
    text: "Youth retreats & day camps",
    image:
      "https://advaitaashrama.org/wp-content/uploads/IMG-20250106-WA0001-1024x838.jpg",
  },
];

export default function ImageSlider() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(
      () => setIndex((i) => (i + 1) % donationItems.length),
      2500
    );
    return () => clearInterval(interval);
  }, [donationItems.length]);

  const current = donationItems[index];

  return (
    <div className="slider-container">
      {/* Image */}
      <img
        src={current.image}
        alt="Activity"
        className="slider-image fade-in"
      />

      {/* Overlay Text */}
      <div className="slider-overlay">
        <p>{current.text}</p>
      </div>

      {/* Dots */}
      <div className="slider-dots">
        {donationItems.map((_, i) => (
          <div
            key={i}
            className={`dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
