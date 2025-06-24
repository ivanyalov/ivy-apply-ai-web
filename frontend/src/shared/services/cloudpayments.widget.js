this.pay = function () {
    var widget = new cp.CloudPayments();
       widget.pay('auth', // или 'charge'
           { //options
               publicId: 'test_api_00000000000000000000002', //id из личного кабинета
               description: 'Оплата товаров в example.com', //назначение
               amount: 100, //сумма
               currency: 'RUB', //валюта
               accountId: 'user@example.com', //идентификатор плательщика (необязательно)
               invoiceId: '1234567', //номер заказа  (необязательно)
               email: 'user@example.com', //email плательщика (необязательно)
               skin: "mini", //дизайн виджета (необязательно)
               autoClose: 3, //время в секундах до авто-закрытия виджета (необязательный)
               data: {
                   myProp: 'myProp value'
               },
               configuration: {
                   common: {
                       successRedirectUrl: "https://{ваш сайт}/success", // адреса для перенаправления 
                       failRedirectUrl: "https://{ваш сайт}/fail"        // при оплате по T-Pay
                   }
               },
               payer: { 
                   firstName: 'Тест',
                   lastName: 'Тестов',
                   middleName: 'Тестович',
                   birth: '1955-02-24',
                   address: 'тестовый проезд дом тест',
                   street: 'Lenina',
                   city: 'MO',
                   country: 'RU',
                   phone: '+71234567890',
                   postcode: '345'
               }
           },
           {
               onSuccess: function (options) { // success
                   //действие при успешной оплате
               },
               onFail: function (reason, options) { // fail
                   //действие при неуспешной оплате
               },
               onComplete: function (paymentResult, options) { //Вызывается как только виджет получает от api.cloudpayments ответ с результатом транзакции.
                   //например вызов вашей аналитики
               }
           }
       )
   };
