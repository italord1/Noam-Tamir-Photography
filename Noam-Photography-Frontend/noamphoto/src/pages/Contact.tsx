import "../Styles/Contact.css";
import { useState } from "react";
import { API_BASE_URL, validateContactPayload } from "../utils/security";

function Contact() {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [honeypot, setHoneypot] = useState("");
  const [status, setStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (honeypot) {
      setStatus("✅ Message sent successfully!");
      return;
    }

    const validated = validateContactPayload(formData);
    if (!validated.ok) {
      setStatus(`❌ ${validated.error}`);
      return;
    }

    setStatus("Sending...");

    try {
      const res = await fetch(`${API_BASE_URL}/send-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated.data),
      });

      if (res.ok) {
        setStatus("✅ Message sent successfully!");
        setFormData({ fname: "", lname: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setStatus("❌ Error sending message. Please try again.");
      }
    } catch {
      setStatus("❌ Network error. Please try again.");
    }
  };

  return (
    <section className="contact">
      <h2>Contact</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="website"
          value={honeypot}
          onChange={(e) => setHoneypot(e.target.value)}
          className="honeypot"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <input
          name="fname"
          type="text"
          placeholder="First name"
          value={formData.fname}
          onChange={handleChange}
          required
          maxLength={100}
        />
        <input
          name="lname"
          type="text"
          placeholder="Last name"
          value={formData.lname}
          onChange={handleChange}
          required
          maxLength={100}
        />
        <input
          name="email"
          type="email"
          placeholder="Your email"
          value={formData.email}
          onChange={handleChange}
          required
          maxLength={254}
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone number"
          value={formData.phone}
          onChange={handleChange}
          required
          maxLength={30}
        />
        <input
          name="subject"
          type="text"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          required
          maxLength={200}
        />
        <textarea
          name="message"
          placeholder="Your message"
          value={formData.message}
          onChange={handleChange}
          required
          maxLength={5000}
        />
        <button type="submit">Send</button>
      </form>

      {status && <p className="status-message">{status}</p>}

      <div className="contact-info">
        <p>📧 noamphoto99@gmail.com</p>
        <p>📞 +972-052-720-2308</p>
        <a
          href="https://wa.me/9720527202308"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
      </div>
    </section>
  );
}

export default Contact;
