import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const Contact: React.FC = () => {
    const [contact, setContact] = useState<string>('');
    useEffect(() => {
        fetch('/legal/Contact.md')
        .then(res => res.text())
        .then(setContact);
    }, []);

    return (
        <div className="min-h-screen bg-white">
          <div className="bg-gray-50 max-w-2xl mx-auto mt-20 mb-12 p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6 text-center">Контакты</h1>
            <section className="mb-10">
                <ReactMarkdown>{contact}</ReactMarkdown>
            </section>
          </div>
        </div>
    );
};

export default Contact;