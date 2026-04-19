import React, { useState } from "react";

interface Review {
  name: string;
  rating: number;
  text: string;
  date: string;
}

const LOCAL_KEY = "rilstack_reviews";

function getReviews(): Review[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveReview(review: Review) {
  const reviews = getReviews();
  reviews.unshift(review);
  localStorage.setItem(LOCAL_KEY, JSON.stringify(reviews.slice(0, 30)));
}

export default function ReviewsWidget() {
  const [reviews, setReviews] = useState<Review[]>(getReviews());
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [minimised, setMinimised] = useState(false);
  const [autoMinimised, setAutoMinimised] = useState(false);

  // Auto-minimise after 5s if not manually minimised
  React.useEffect(() => {
    if (!minimised && !autoMinimised) {
      const timer = setTimeout(() => {
        setMinimised(true);
        setAutoMinimised(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [minimised, autoMinimised]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !text.trim() || rating < 1) {
      setError("Please fill all fields and select a rating.");
      return;
    }
    const review: Review = {
      name: name.trim(),
      rating,
      text: text.trim(),
      date: new Date().toLocaleString(),
    };
    saveReview(review);
    setReviews(getReviews());
    setSuccess("Thank you for your feedback!");
    setName("");
    setText("");
    setRating(0);
    setShowForm(false);
    setTimeout(() => setSuccess(""), 2000);
  };

  return (
    <div
      className={`w-full max-w-xs mx-auto transition-all duration-500 ${minimised ? "h-14 overflow-hidden" : ""}`}
    >
      <div
        className={`bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-3 transition-all duration-500 ${minimised ? "py-2" : ""}`}
      >
        <div className="flex items-center justify-between mb-1">
          <span className="font-bold text-base text-blue-700">
            Suggestions Box
          </span>
          <div className="flex items-center gap-2">
            <button
              className="text-xs text-blue-600 hover:underline"
              onClick={() => setShowForm((v) => !v)}
            >
              {showForm ? "Close" : "Suggest"}
            </button>
            <button
              className="ml-1 text-xs px-2 py-1 rounded bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
              aria-label={
                minimised
                  ? "Expand suggestions box"
                  : "Minimise suggestions box"
              }
              onClick={() => setMinimised((m) => !m)}
            >
              {minimised ? "▸" : "—"}
            </button>
          </div>
        </div>
        {!minimised && success && (
          <div className="mb-2 text-green-600 text-sm">{success}</div>
        )}
        {!minimised && showForm && (
          <form onSubmit={handleSubmit} className="mb-3">
            <input
              className="w-full mb-2 px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
              placeholder="Your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={32}
            />
            <textarea
              className="w-full mb-2 px-3 py-2 rounded border border-gray-300 dark:bg-gray-800 dark:border-gray-700"
              placeholder="Your review or suggestion"
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={3}
              maxLength={200}
            />
            <div className="flex items-center mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  className={`text-2xl ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
                  onClick={() => setRating(star)}
                  aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
                >
                  ★
                </button>
              ))}
              <span className="ml-2 text-sm">
                {rating > 0 ? `${rating}/5` : "Rate"}
              </span>
            </div>
            {error && <div className="mb-2 text-red-600 text-xs">{error}</div>}
            <button
              type="submit"
              className="w-full bg-[#2c3e5f] text-white rounded py-2 font-semibold hover:bg-[#1e2d46]"
            >
              Submit
            </button>
          </form>
        )}
        {/* Always show reviews from others when not writing (enforced) */}
        {(!showForm || minimised) && (
          <div className="max-h-48 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
            {reviews.length === 0 && (
              <div className="text-gray-500 text-sm">No reviews yet.</div>
            )}
            {reviews.slice(0, 5).map((r, i) => (
              <div key={i} className="py-2">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-sm">{r.name}</span>
                  <span className="text-xs text-gray-400">{r.date}</span>
                </div>
                <div className="flex items-center mb-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      className={`text-lg ${star <= r.rating ? "text-yellow-400" : "text-gray-200"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
                <div className="text-sm text-gray-700 dark:text-gray-200">
                  {r.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
