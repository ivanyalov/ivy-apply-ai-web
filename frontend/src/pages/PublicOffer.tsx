import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown';

const PublicOffer: React.FC = () => {
    const [offer, setOffer] = useState<string>('');
    useEffect(() => {
        fetch('/legal/Offer.md')
        .then(res => res.text())
        .then(setOffer);
    }, []);

    return (
        <div className="min-h-screen bg-white">
          <div className="bg-gray-50 max-w-2xl mx-auto mt-20 mb-12 p-8 rounded-lg shadow">
            <h1 className="text-2xl font-bold mb-6 text-center">Публичная оферта</h1>
            <section className="mb-10">
                <ReactMarkdown>{offer}</ReactMarkdown>
            </section>
          </div>
        </div>
    );
};

export default PublicOffer;
