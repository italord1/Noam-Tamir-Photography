import "../Styles/Contact.css"

function Contact() {
  return (
    <section className="contact">
      <h2>Contact</h2>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          alert("Message sent!");
        }}
      >
        <input type="text" placeholder="Your name" required />
        <input type="email" placeholder="Your email" required />
        <textarea placeholder="Your message" required />
        <button type="submit">Send</button>
      </form>
      <div className="contact-info">
        <p>📧 noam@example.com</p>
        <p>📞 +972-50-123-4567</p>
        <a href="https://wa.me/972501234567" target="_blank">WhatsApp</a>
      </div>
    </section>
  );
}

export default Contact;
