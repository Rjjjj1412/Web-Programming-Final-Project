import React from "react";
import { Users, Target, BookOpen } from "lucide-react";

const AboutPage = () => {
  return (
    <div className="min-h-full flex flex-col p-6">
      <header
        className="bg-cover bg-center h-64"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=2098&auto=format&fit=crop&ixlib=rb-4.0.3')",
        }}
      >
        <div className="flex items-center justify-center h-full bg-black bg-opacity-50">
          <h1 className="text-4xl font-bold text-white">About Our Bookstore</h1>
        </div>
      </header>

      <main className="container mx-auto p-8">
        {/* Intro Section */}
        <section className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-[#1F3B6D] mb-4">
            Welcome to a Reader's Paradise
          </h2>
          <p className="text-[#757575] max-w-3xl mx-auto">
            We believe in the power of books to change lives. Our mission is to
            create a space where book lovers can discover new worlds, connect
            with authors, and share their passion for reading. We are more than
            just a bookstore; we are a community.
          </p>
        </section>

        {/* Highlights */}
        <div className="grid md:grid-cols-3 gap-8 mb-12 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <BookOpen className="w-12 h-12 text-[#4A90E2] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1F3B6D] mb-2">
              Our Story
            </h3>
            <p className="text-sm text-[#757575]">
              Founded in 2023, our bookstore was born from a lifelong love of
              literature. We started as a small local shop and have grown into a
              beloved destination for readers of all ages.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Target className="w-12 h-12 text-[#4A90E2] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1F3B6D] mb-2">
              Our Mission
            </h3>
            <p className="text-sm text-[#757575]">
              To inspire and cultivate a universal passion for reading by
              providing a diverse selection of books, fostering a community of
              readers, and supporting literary culture.
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Users className="w-12 h-12 text-[#4A90E2] mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-[#1F3B6D] mb-2">
              Our Team
            </h3>
            <p className="text-sm text-[#757575]">
              Our knowledgeable and friendly staff are always here to help you
              find your next favorite book. We are passionate readers dedicated
              to providing personalized recommendations.
            </p>
          </div>
        </div>

        {/* Meet the Team */}
        <section>
          <h2 className="text-3xl font-semibold text-center text-[#1F3B6D] mb-6">
            Meet the Team
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {/* Team Member 1 */}
            <div className="bg-white p-4 rounded-lg shadow-md text-center w-56">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center text-[#1F3B6D] font-bold text-lg">
                RC
              </div>
              <h4 className="font-semibold text-[#1F3B6D]">RJ Castellano</h4>
              <p className="text-sm text-[#757575]">Founder & CEO</p>
            </div>

            {/* Team Member 2 */}
            <div className="bg-white p-4 rounded-lg shadow-md text-center w-56">
              <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4 flex items-center justify-center text-[#1F3B6D] font-bold text-lg">
                SAL
              </div>
              <h4 className="font-semibold text-[#1F3B6D]">
                Simon Andrew Labay
              </h4>
              <p className="text-sm text-[#757575]">President</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
};

export default AboutPage;
