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
    <div style={{ maxWidth: 800, margin: '40px auto', color: '#222', background: '#fff', padding: 24, borderRadius: 8 }}>
      <h1 style={{ fontSize: 28, marginBottom: 24, textAlign: 'center' }}>Пользовательское соглашение</h1>
      <section style={{ marginBottom: 40 }}>
        <ReactMarkdown>{privacy}</ReactMarkdown>
      </section>
      <section style={{ marginBottom: 40 }}>
        <ReactMarkdown>{terms}</ReactMarkdown>
      </section>
      <section style={{ marginBottom: 40 }}>
        <ReactMarkdown>{returnPolicy}</ReactMarkdown>
      </section>
      <section style={{ marginBottom: 40 }}>
        <ReactMarkdown>{contact}</ReactMarkdown>
      </section>
    </div>
  );
};

export default UserAgreement;