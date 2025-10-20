import "../Styles/Contact.css"
import { useState } from "react";

function Contact() {
  const [formData, setFormData] = useState({
    fname: "",
    lname: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("Sending...");

    try {
      const res = await fetch("http://localhost:3000/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("✅ Message sent successfully!");
        setFormData({ fname: "", lname: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setStatus("❌ Error sending message. Please try again.");
      }
    } catch (err) {
      console.error(err);
      setStatus("❌ Network error. Please try again.");
    }
  };

  return (
    <section className="contact">
      <h2>Contact</h2>
      <form onSubmit={handleSubmit}>
        <input
          name="fname"
          type="text"
          placeholder="First name"
          value={formData.fname}
          onChange={handleChange}
          required
        />
        <input
          name="lname"
          type="text"
          placeholder="Last name"
          value={formData.lname}
          onChange={handleChange}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Your email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          name="phone"
          type="tel"
          placeholder="Phone number"
          value={formData.phone}
          onChange={handleChange}
          required
        />
        <input
          name="subject"
          type="text"
          placeholder="Subject"
          value={formData.subject}
          onChange={handleChange}
          required
        />
        <textarea
          name="message"
          placeholder="Your message"
          value={formData.message}
          onChange={handleChange}
          required
        />
        <button type="submit">Send</button>
      </form>

      {status && <p className="status-message">{status}</p>}

      <div className="contact-info">
        <p>📧 noam@example.com</p>
        <p>📞 +972-50-123-4567</p>
        <a href="https://wa.me/972501234567" target="_blank">WhatsApp</a>
      </div>
    </section>
  );
}

export default Contact;
