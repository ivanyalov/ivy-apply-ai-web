
import React from 'react';
import { useNavigate } from 'react-router-dom';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Your AI-Powered University Admissions Assistant
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get expert guidance on essays, school selection, applications, and more. 
            Upload documents, ask unlimited questions, and receive personalized feedback.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-harvard-crimson text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* About Ivy AI */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">About Ivy AI</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Ivy Apply AI leverages advanced artificial intelligence to provide comprehensive 
            university admissions support. Our AI assistant understands the complexities of 
            college applications and provides personalized guidance tailored to your goals.
          </p>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Key Features</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-harvard-crimson rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">File Upload</h3>
              <p className="text-gray-600">Upload essays, transcripts, and documents for instant AI analysis and feedback.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-harvard-crimson rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">GPT-Style Chat</h3>
              <p className="text-gray-600">Engage in natural conversations with our AI for personalized admissions guidance.</p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-harvard-crimson rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Unlimited Questions</h3>
              <p className="text-gray-600">Ask as many questions as you need - no limits on your learning journey.</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">How It Works</h2>
          <div className="space-y-8">
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Sign Up & Choose Your Plan</h3>
                <p className="text-gray-600">Create your account and select either a free trial or subscription.</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Upload Documents & Ask Questions</h3>
                <p className="text-gray-600">Share your essays, transcripts, or ask questions about applications.</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Get Personalized Feedback</h3>
                <p className="text-gray-600">Receive instant, detailed guidance tailored to your specific needs.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How does the AI assistant work?</h3>
              <p className="text-gray-600">Our AI is powered by advanced language models trained specifically for university admissions guidance. It can analyze documents, answer questions, and provide personalized advice.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is my data secure?</h3>
              <p className="text-gray-600">Yes, we take data security seriously. All uploaded documents and conversations are encrypted and stored securely.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What types of documents can I upload?</h3>
              <p className="text-gray-600">You can upload essays, transcripts, recommendation letters, and other admissions-related documents in various formats.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Ivy Apply AI</h3>
          <div className="flex justify-center space-x-8 mb-6">
            <a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-gray-300 hover:text-white">Terms of Service</a>
            <a href="#" className="text-gray-300 hover:text-white">Contact</a>
          </div>
          <p className="text-gray-400">© 2024 Ivy Apply AI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
