import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const Contact: React.FC = () => {
    const [contact, setContact] = useState<string>('');
    useEffect(() => {
        fetch('http://localhost:8000/legal/contact.md')
        .then(res => res.text())
        .then(setContact);
    }, []);

    return (
        <div style={{ maxWidth: 800, margin: '40px auto', color: '#222', background: '#fff', padding: 24, borderRadius: 8 }}>
        <h1 style={{ fontSize: 28, marginBottom: 24, textAlign: 'center' }}>Контакты</h1>
        <section style={{ marginBottom: 40 }}>
            <ReactMarkdown>{contact}</ReactMarkdown>
        </section>
        </div>
    );
};

export default Contact;