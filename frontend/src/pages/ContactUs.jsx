import React from "react";
import { Phone, Mail, MapPin } from "lucide-react";

const ContactPage = () => {
  return (
    <div className="min-h-full flex flex-col p-6">
      <header
        className="bg-cover bg-center h-64"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      >
        <div className="flex items-center justify-center h-full bg-black bg-opacity-50">
          <h1 className="text-4xl font-bold text-white">Contact Us</h1>
        </div>
      </header>

      <main className="container mx-auto p-8">
        <section className="grid md:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold text-[#1F3B6D] mb-6">
              Send Us a Message
            </h2>
            <form>
              <div className="mb-4">
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-[#757575] mb-1"
                >
                  Name
                </label>
                <input
                  type="text"
                  id="name"
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16325A]"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[#757575] mb-1"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16325A]"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="message"
                  className="block text-sm font-medium text-[#757575] mb-1"
                >
                  Message
                </label>
                <textarea
                  id="message"
                  rows="5"
                  className="w-full px-4 py-2 border border-[#E0E0E0] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#16325A]"
                ></textarea>
              </div>
              <button
                type="submit"
                className="w-full bg-[#4A90E2] text-white py-2 px-4 rounded-lg hover:bg-[#3A7BC8] transition-colors"
              >
                Submit
              </button>
            </form>
          </div>

          {/* Contact Details & Map */}
          <div>
            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
              <h2 className="text-2xl font-semibold text-[#1F3B6D] mb-6">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="flex items-center">
                  <MapPin className="w-6 h-6 text-[#4A90E2] mr-4" />
                  <span className="text-[#757575]">
                    123 Bookworm Lane, Reading, USA
                  </span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-6 h-6 text-[#4A90E2] mr-4" />
                  <span className="text-[#757575]">
                    contact@ourbookstore.com
                  </span>
                </div>
                <div className="flex items-center">
                  <Phone className="w-6 h-6 text-[#4A90E2] mr-4" />
                  <span className="text-[#757575]">(123) 456-7890</span>
                </div>
              </div>
            </div>
            <div className="h-64 rounded-lg shadow-md overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3153.086438392576!2d-122.4194155846813!3d37.77492957975873!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x80858064a346f6ef%3A0x6b7d2f4f7a7a5e0!2sSan%20Francisco%20City%20Hall!5e0!3m2!1sen!2sus!4v1620000000000!5m2!1sen!2sus"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                title="Google Map"
              ></iframe>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default ContactPage;
