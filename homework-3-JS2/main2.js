'use strict';
const API = 'https://raw.githubusercontent.com/GeekBrainsTutorial/online-store-api/master/responses';

// class List { //                   вообще не понял зачем нам этот класс. единственное понял про url и массив goods.
//     constructor(url, container, list = listContext){
//         this.container = container; // блок, куда будет поступать список товара
//         this.list = list; // словарь для классов. вообещ не понял зачем он.
//         this.url = url; //адрес для запроса товара.
//         this.goods = [];
//         this.allProducts = [];
//         this.filtered = []; // фильтр для товаров
//         this._init(); // инициализация
//       }

//   getJson(url) {
//     return fetch(url ? url : `${API + this.url}`)
//       .then(result => result.json())
//       .catch(error => {
//         console.log(error);
//       });
//   }
//   handleData(data){
//     this.goods = data;
//     this.render();
//   }
//   sum(){
//       return this.allProducts.reduce((accum, item) => accum += item.price, 0);
//   }

//   render() {
//     const block = document.querySelector(this.container);
//     for (let product of this.goods){
//       console.log(this.constructor.name);
//       const productObj = new this.list[this.constructor.name](product);
//       console.log(productObj);
//       this.allProducts.push(productObj);
//       block.insertAdjacentHTML('beforeend', productObj.render());
//     }
//   }

//   filter(value){
//     const regexp = new RegExp(value, 'i');
//     this.filtered = this.allProducts.filter(product => regexp.test(product.product_name));
//     this.allProducts.forEach(el => {
//       const block = document.querySelector(`.product-item[data-id="${el.id_product}"]`);
//       if(!this.filtered.includes(el)){
//         block.classList.add('invisible');
//       } else {
//         block.classList.remove('invisible');
//       }
//     })
//   }

//   _init(){
//     return false
//   }
// }

class GoodsItem { // класс для определения свойств конекретного товара. {Домашекк задание - 2}
    constructor(id_product, product_name, price) {
        this.id = id_product;
        this.product_name = product_name;
        this.price = price;
    }

    getJson(url){
      return fetch(url ? url : `${API + this.url}`)
        .then(result => result.json())
        .catch(error => {
          console.log(error);
        })
    } 

    render() {
        return `<div class="product-item">
                <h3>${this.product_name}</h3>
                <p><b>${this.price}</b></p>
                <button class="by-btn">Добавить</button>
              </div>`;
    }
}

class GoodsList { //класс для конструктора со списком всех товаров. {Домашнее задание - 2}
    constructor() {
        this.goods = []; //изначально пустой массив со списком всех товаров      
    }

    fetchGoods(cb) { //для получения списка товаров. позжу будем получать с сервера
      makeGETRequest(`${API}/catalogData.json`, (goods) => {
            this.goods = JSON.parse(goods);
            cb();
        });
    }

    _addProductInBasket(elem) { //для добавления товаров в корзину.
      this.getJson(`${API}/addToBasket.json`)
          .then(data => {
            if(data.result === 1){
              let productId = +elem.dataset['id'];
              let find = this.goods.find(product => product.id_product === productId);
              if(find){
                find.quantity++;
                this._updateCart(find);
              } else {
                let product = {
                  id_product: productId,
                  price: +elem.dataset['price'],
                  product_name: elem.dataset['name'],
                  quantity: 1
                };
                this.goods = [product];
                this.render();
              }
            } else {
              alert('Error');
            }
          })
      };

  
    _removeProductInBasket(elem) { //удаление товаров с корзины
      this.getJson(`${API}/deleteFromBasket.json`)
      .then(data => {
        if(data.result === 1){
          let productId = +elem.dataset['id'];
          let find = this.goods.find(product => product.id_product === productId);
          if(find.quantity > 1){ // если товара > 1, то уменьшаем количество на 1
            find.quantity--;
            this._updateCart(find);
          } else { // удаляем
            this.goods.splice(this.goods.indexOf(find), 1);
            document.querySelector(`.cart-item[data-id="${productId}"]`).remove();
          }
        } else {
          alert('Error');
        }
      })
  }

    _getProductInBasket(_data) { //для получения товаров с корзины
      this.getJson()
      .then(data => {
        this.handleData(data.contents);
      });
  }

    render() { //вывод списка товаров
        let listHtml = '';
        this.goods.forEach(good => {
            const goodItem = new GoodsItem(good.id, good.product_name, good.price);
            listHtml += goodItem.render();
        });
        document.querySelector('.products').innerHTML = listHtml;
    }
    
    sum() { 
        return this.goods.reduce(function (sum, good) {
            return sum + good.price;

        }, 0);
    };
}



const list = new GoodsList();
list.fetchGoods(() => {
    list.render();
});

function makeGETRequest(url, callback) { //переделал функцию в промисc {Домашнее задание - 3}
    var xhr;
    return new Promise ((resolve, reject) => {
        setTimeout(() => {
            if (window.XMLHttpRequest) {
                xhr = new XMLHttpRequest();
                resolve(xhr);
                console.log("вы используете не Internet Explorer") //для проверки
            } else if (window.ActiveXObject) { 
                xhr = new ActiveXObject("Microsoft.XMLHTTP");
                reject(xhr);
                console.log("вы используете Internet Explorer") //для проверки
            }
            xhr.onreadystatechange = function () {
                if (xhr.readyState === 4) {
                  callback(xhr.responseText);
                }
              }
            
              xhr.open('GET', url, true);
              xhr.send();
         });
    });
};

// 1. зачем нам массив AllProduct?
// 2. как работают методы добавления/удаления
// 3. для отрисовки корзины нужен новый рендер, правильно? 
// 4. как работает это:   
// // _updateCart(product){  
// //   let block = document.querySelector(`.cart-item[data-id="${product.id_product}"]`);
// //   block.querySelector('.product-quantity').textContent = `Количество: ${product.quantity}`;
// //   block.querySelector('.product-price').textContent = `${product.quantity * product.price} ₽`;
// // }
// // _init(){
// //   document.querySelector('.btn-cart').addEventListener('click', () => {
// //     document.querySelector(this.container).classList.toggle('invisible');
// //   });
// //   document.querySelector(this.container).addEventListener('click', e => {
// //     if(e.target.classList.contains('del-btn')){
// //       this.removeProduct(e.target);
// //     }
// //   })
// // }
