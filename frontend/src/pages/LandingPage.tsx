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
            Ivy Apply AI
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Ivy Apply AI — ваш персональный AI-консультант по поступлению в вузы. Загружайте документы, задавайте вопросы и получайте чёткие рекомендации на русском языке.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="bg-harvard-crimson text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-red-800 transition-colors"
          >
            Начать
          </button>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 px-6">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">🧠 Что умеет:</h2>
          <ul className="list-disc list-inside text-lg text-gray-600 text-center space-y-2">
            <li>Анализирует эссе и анкеты</li>
            <li>Помогает выбрать университет</li>
            <li>Отвечает на вопросы в формате чата</li>
          </ul>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Как это работает</h2>
          <div className="space-y-8">
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl">1</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Регистрация и выбор плана</h3>
                <p className="text-gray-600">Создайте аккаунт и выберите бесплатную пробную версию или подписку.</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl">2</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Загрузка документов и вопросы</h3>
                <p className="text-gray-600">Поделитесь своими эссе, транскриптами или задайте вопросы о подаче документов.</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="w-12 h-12 bg-harvard-crimson text-white rounded-full flex items-center justify-center font-bold text-xl">3</div>
              <div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Получите персонализированную обратную связь</h3>
                <p className="text-gray-600">Получите мгновенное, подробное руководство, адаптированное к вашим конкретным потребностям.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Часто задаваемые вопросы</h2>
          <div className="space-y-6">
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Как работает AI-помощник?</h3>
              <p className="text-gray-600">Наш AI основан на передовых языковых моделях, специально обученных для консультирования по поступлению в университет. Он может анализировать документы, отвечать на вопросы и предоставлять персонализированные рекомендации.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Безопасны ли мои данные?</h3>
              <p className="text-gray-600">Да, мы серьезно относимся к безопасности данных. Все загруженные документы и переписка шифруются и надежно хранятся.</p>
            </div>
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Какие типы документов я могу загрузить?</h3>
              <p className="text-gray-600">Вы можете загружать эссе, транскрипты, рекомендательные письма и другие документы, связанные с поступлением, в различных форматах.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-gray-900 py-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-bold mb-4">Ivy Apply AI</h3>
          <div className="flex justify-center space-x-8 mb-6">
            <a href="#" className="text-gray-900 hover:text-gray-700">Политика конфиденциальности</a>
            <a href="#" className="text-gray-900 hover:text-gray-700">Условия использования</a>
            <a href="#" className="text-gray-900 hover:text-gray-700">Контакты</a>
          </div>
          <p className="text-gray-600">© 2024 Ivy Apply AI. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
