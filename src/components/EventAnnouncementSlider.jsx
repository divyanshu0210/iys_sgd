import React, { useEffect, useState } from "react";
import "../css/EventAnnouncementSlider.css";
import { MapPin, Calendar, PlayCircle, Video, CheckCircle } from "lucide-react";

const API_URL = `${import.meta.env.VITE_BACKEND_URL}announcements/events/home/`;

const formatEventDateTime = (dateString) => {
  const date = new Date(dateString);
  const now = new Date();

  const isToday = date.toDateString() === now.toDateString();

  const tomorrow = new Date();
  tomorrow.setDate(now.getDate() + 1);
  const isTomorrow = date.toDateString() === tomorrow.toDateString();

  const time = date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

  if (isToday) return `Today • ${time}`;
  if (isTomorrow) return `Tomorrow • ${time}`;

  return (
    date.toLocaleDateString([], {
      weekday: "short",
      day: "numeric",
      month: "short",
    }) + ` • ${time}`
  );
};

export default function EventAnnouncementSlider() {
  const [events, setEvents] = useState([]);
  const [index, setIndex] = useState(0);
  const [showFull, setShowFull] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  const getDescriptionLimit = () => {
    if (window.innerWidth >= 900) return 500; // desktop
    return 120; // mobile
  };
  const [descLimit, setDescLimit] = useState(getDescriptionLimit());

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setEvents)
      .catch(console.error);

    const handleResize = () => setDescLimit(getDescriptionLimit());
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!events.length) return;
    const interval = setInterval(
      () => setIndex((i) => (i + 1) % events.length),
      4500
    );
    return () => clearInterval(interval);
  }, [events]);

  const event = events.length ? events[index] : null;

  useEffect(() => {
    if (!event?.start_datetime || event.status !== "upcoming") return;

    const updateCountdown = () => {
      const now = new Date();
      const start = new Date(event.start_datetime);
      const diff = start - now;

      if (diff <= 0) {
        setTimeLeft(null);
        return;
      }

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ days, hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);

    return () => clearInterval(interval);
  }, [event]);

  if (!event) return null;

  const imageSrc = event.youtube_thumbnail || event.poster;
  const clickUrl =
    event.youtube_live_url || event.youtube_replay_url || imageSrc;

  return (
    <div className="event-slider-container">
      {/* IMAGE */}
      <a
        href={clickUrl}
        rel="noopener noreferrer"
        className="event-image-link"
      >
        <div className="event-image-wrapper">
          <div
            className="event-image-bg"
            style={{
              backgroundImage: `url(${imageSrc})`,
            }}
          />

          <img
            src={imageSrc}
            alt={event.title}
            className="event-slider-image"
          />

          {/* STATUS BADGE */}
          {event.status === "live" && (
            <div className="live-badge live">
              <PlayCircle size={16} strokeWidth={2} /> LIVE
            </div>
          )}

          {event.status === "upcoming" && timeLeft && (
            <div className="live-badge upcoming">
              {timeLeft.days > 0 ? (
                <>
                  <Calendar size={16} /> {timeLeft.days} day
                  {timeLeft.days > 1 ? "s" : ""} to go
                </>
              ) : (
                <>
                  <Calendar size={16} />
                  {String(timeLeft.hours).padStart(2, "0")}:
                  {String(timeLeft.minutes).padStart(2, "0")}:
                  {String(timeLeft.seconds).padStart(2, "0")}
                </>
              )}
            </div>
          )}
        </div>
      </a>

      {/* CONTENT */}
      <div className="event-content">
        <h2 className="event-title">{event.title}</h2>

        <p className="event-description">
          {showFull
            ? event.description
            : event.description.slice(0, descLimit) +
              (event.description.length > descLimit ? "..." : "")}

          {event.description.length > descLimit && (
            <button
              className="read-more-btn"
              onClick={() => setShowFull(!showFull)}
            >
              {showFull ? " Show Less" : " Read More"}
            </button>
          )}
        </p>
        <div className="event-meta">
          {event.location_name && (
            <span className="meta-item">
              <MapPin size={16} /> {event.location_name}
            </span>
          )}

          {event.start_datetime && (
            <span className="meta-item">
              <Calendar size={16} /> {formatEventDateTime(event.start_datetime)}
            </span>
          )}
        </div>

        {/* ACTIONS */}
        <div className="event-actions">
          {event.status === "live" && event.youtube_live_url && (
            <a
              href={event.youtube_live_url}
              target="_blank"
              rel="noreferrer"
              className="btn live-btn"
            >
              <PlayCircle size={16} /> Watch Live
            </a>
          )}

          {event.status === "completed" && event.youtube_replay_url && (
            <a
              href={event.youtube_replay_url}
              target="_blank"
              rel="noreferrer"
              className="btn replay-btn"
            >
              <Video size={16} /> Watch Replay
            </a>
          )}

          {event.registration_link && event.status === "upcoming" && (
            <a
              href={event.registration_link}
              target="_blank"
              rel="noreferrer"
              className="btn register-btn"
            >
              <CheckCircle size={16} /> Register
            </a>
          )}
        </div>
      </div>

      {/* DOTS */}
      <div className="event-slider-dots">
        {events.map((_, i) => (
          <span
            key={i}
            className={`event-dot ${i === index ? "active" : ""}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  );
}
