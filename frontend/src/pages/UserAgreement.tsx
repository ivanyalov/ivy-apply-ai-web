import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const UserAgreement: React.FC = () => {
    const [privacy, setPrivacy] = useState<string>('');
    const [terms, setTerms] = useState<string>('');
    const [returnPolicy, setReturnPolicy] = useState<string>('');
    const [contact, setContact] = useState<string>('');

  useEffect(() => {
    fetch('http://localhost:8000/legal/PP.md')
      .then(res => res.text())
      .then(setPrivacy);
    fetch('http://localhost:8000/legal/ToS.md')
      .then(res => res.text())
      .then(setTerms);
    fetch('http://localhost:8000/legal/RP.md')
      .then(res => res.text())
      .then(setReturnPolicy);
    fetch('http://localhost:8000/legal/contact.md')
      .then(res => res.text())
      .then(setContact);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      <div className="bg-gray-50 max-w-2xl mx-auto mt-12 mb-12 p-8 rounded-lg shadow">
        <h1 className="text-2xl font-bold mb-6 text-center">Пользовательское соглашение</h1>
        <section className="mb-10">
          <ReactMarkdown>{privacy}</ReactMarkdown>
        </section>
        <section className="mb-10">
          <ReactMarkdown>{terms}</ReactMarkdown>
        </section>
        <section className="mb-10">
          <ReactMarkdown>{returnPolicy}</ReactMarkdown>
        </section>
        <section className="mb-10">
          <ReactMarkdown>{contact}</ReactMarkdown>
        </section>
      </div>
    </div>
  );
};

export default UserAgreement;