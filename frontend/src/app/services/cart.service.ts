import {Injectable} from '@angular/core';
import {ProductService} from "./product.service";
import {BehaviorSubject} from "rxjs";
import {CartModelPublic, CartModelServer} from "../models/cart.model";
import {ProductModelServer} from "../models/product.model";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../environments/environment";
import {NavigationExtras, Router} from "@angular/router";
import {OrderService} from "./order.service";
import {NgxSpinnerService} from "ngx-spinner";
import {ToastrService} from "ngx-toastr";

@Injectable({
  providedIn: 'root'
})


export class CartService {

  ServerURL = environment.SERVER_URL;

  private cartDataClient: CartModelPublic = {prodData: [{incart: 0, id: 0}], total: 0};  // This will be sent to the backend Server as post data
  // Cart Data variable to store the cart information on the server
  //setea la propiedad cartDataClient, que instancia el cartModelPublic
  private cartDataServer: CartModelServer = {//es la data del cart en el servidor
    data: [{
      product: undefined,
      numInCart: 0
    }],
    total: 0
  };

  cartTotal$ = new BehaviorSubject<Number>(0);
  // Data variable to store the cart information on the client's local storage

  cartDataObs$ = new BehaviorSubject<CartModelServer>(this.cartDataServer);


  constructor(private productService: ProductService,
              private orderService: OrderService,
              private httpClient: HttpClient,
              private router: Router,
              private spinner: NgxSpinnerService,
              private toast: ToastrService) {

    this.cartTotal$.next(this.cartDataServer.total);
    this.cartDataObs$.next(this.cartDataServer);

    let info: CartModelPublic = JSON.parse(localStorage.getItem('cart'));//obtiene el carrito del localStorage

    if (info !== null && info !== undefined && info.prodData[0].incart !== 0) {
      // assign the value to our data variable which corresponds to the LocalStorage data format
      this.cartDataClient = info;
      // Loop through each entry and put it in the cartDataServer object
      this.cartDataClient.prodData.forEach(p => {//recorre los productos del carrito
        this.productService.getSingleProduct(p.id).subscribe((actualProdInfo: ProductModelServer) => {
          if (this.cartDataServer.data[0].numInCart === 0) {
            this.cartDataServer.data[0].numInCart = p.incart;//setea la cantidad de productos
            this.cartDataServer.data[0].product = actualProdInfo;//setea la propiedad product con la data del producto
            this.CalculateTotal();//calcula el total del cart
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));//setea el item cart en el localStorage
          } else {//si no está vacío el cart
            this.cartDataServer.data.push({
              numInCart: p.incart,
              product: actualProdInfo
            });
            this.CalculateTotal();
            this.cartDataClient.total = this.cartDataServer.total;
            localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
          }
          this.cartDataObs$.next({...this.cartDataServer});
        });
      });
    }
  }

  CalculateSubTotal(index: any): Number {
    let subTotal = 0;

    let p = this.cartDataServer.data[index];
    // @ts-ignore
    subTotal = p.product.price * p.numInCart;

    return subTotal;
  }

  AddProductToCart(id: Number, quantity?: number) {

    this.productService.getSingleProduct(id).subscribe(prod => {//get product for id
      // If the cart is empty
      if (this.cartDataServer.data[0].product === undefined) {
        this.cartDataServer.data[0].product = prod;//setea el producto en el array del server
        this.cartDataServer.data[0].numInCart = quantity !== undefined ? quantity : 1;//setea la cantidad
        this.CalculateTotal();
        this.cartDataClient.prodData[0].incart = this.cartDataServer.data[0].numInCart;
        this.cartDataClient.prodData[0].id = prod.id;//asigna el id del producto
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.cartDataObs$.next({...this.cartDataServer});
        this.toast.success(`${prod.name} added to the cart.`, "Product Added", {
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        })
      }  // END of IF
      // Cart is not empty
      else {
        let index = this.cartDataServer.data.findIndex(p => p.product.id === prod.id);//busca en el carrito el producto

        // 1. If chosen product is already in cart array
        if (index !== -1) {

          if (quantity !== undefined && quantity <= prod.quantity) {//si es menor la cantidad en el carrito al stock
            // @ts-ignore
            this.cartDataServer.data[index].numInCart = this.cartDataServer.data[index].numInCart < prod.quantity ? quantity : prod.quantity;//verifica que la cantidad sea < stock
          } else {//si se quiere agregar una cantidad al carrito mayor al stock
            // @ts-ignore
            this.cartDataServer.data[index].numInCart < prod.quantity ? this.cartDataServer.data[index].numInCart++ : prod.quantity;//se incrementa el producto en el carrito en 1, si es menor la cantidad presente al stock
          }


          this.cartDataClient.prodData[index].incart = this.cartDataServer.data[index].numInCart;
          this.toast.info(`${prod.name} quantity updated in the cart.`, "Product Updated", {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          })
        }
        // 2. If chosen product is not in cart array
        else {
          this.cartDataServer.data.push({
            product: prod,
            numInCart: 1
          });
          this.cartDataClient.prodData.push({
            incart: 1,
            id: prod.id
          });
          this.toast.success(`${prod.name} added to the cart.`, "Product Added", {
            timeOut: 1500,
            progressBar: true,
            progressAnimation: 'increasing',
            positionClass: 'toast-top-right'
          })
        }
        this.CalculateTotal();
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
        this.cartDataObs$.next({...this.cartDataServer});
      }  // END of ELSE


    });
  }

  UpdateCartData(index: any, increase: Boolean) {
    let data = this.cartDataServer.data[index];//trae la data del producto en la posición index del cart
    if (increase) {
      // @ts-ignore
      data.numInCart < data.product.quantity ? data.numInCart++ : data.product.quantity;//si la cantidad < stock, incrementa la cantidad
      this.cartDataClient.prodData[index].incart = data.numInCart;
      this.CalculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;
      this.cartDataObs$.next({...this.cartDataServer});//actualiza la propiedad que escuchada en el cartComponent
      localStorage.setItem('cart', JSON.stringify(this.cartDataClient));//setea el localStorage
    } else {
      // @ts-ignore
      data.numInCart--;

      // @ts-ignore
      if (data.numInCart < 1) {//si la cantidad llega a cero
        this.DeleteProductFromCart(index);
        this.cartDataObs$.next({...this.cartDataServer});
      } else {
        // @ts-ignore
        this.cartDataObs$.next({...this.cartDataServer});
        this.cartDataClient.prodData[index].incart = data.numInCart;//setean el modelo cart del frontend
        this.CalculateTotal();
        this.cartDataClient.total = this.cartDataServer.total;
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }

    }

  }

  DeleteProductFromCart(index: any) {
    /*    console.log(this.cartDataClient.prodData[index].prodId);
        console.log(this.cartDataServer.data[index].product.id);*/

    if (window.confirm('Are you sure you want to delete the item?')) {
      this.cartDataServer.data.splice(index, 1);//borra el producto del cart
      this.cartDataClient.prodData.splice(index, 1);
      this.CalculateTotal();
      this.cartDataClient.total = this.cartDataServer.total;

      if (this.cartDataClient.total === 0) {//si cart queda vacío
        this.cartDataClient = {prodData: [{incart: 0, id: 0}], total: 0};//setea todo con cero
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      } else {
        localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
      }

      if (this.cartDataServer.total === 0) {//si el carrito del servidor queda en cero
        this.cartDataServer = {//setea todo a cero
          data: [{
            product: undefined,
            numInCart: 0
          }],
          total: 0
        };
        this.cartDataObs$.next({...this.cartDataServer});
      } else {
        this.cartDataObs$.next({...this.cartDataServer});
      }
    }
    // If the user doesn't want to delete the product, hits the CANCEL button
    else {
      return;
    }


  }

  CheckoutFromCart(userId: Number) {

    this.httpClient.post(`${this.ServerURL}orders/payment`, null).subscribe((res: { success: Boolean }) => {
      console.clear();

      if (res.success) {


        this.resetServerData();//setea el carrito
        this.httpClient.post(`${this.ServerURL}orders/new`, {//registra la orden y las líneas de pedido
          userId: userId,
          products: this.cartDataClient.prodData
        }).subscribe((data: OrderConfirmationResponse) => {

          this.orderService.getSingleOrder(data.order_id).then(prods => {//obtiene la data de la orden
            if (data.success) {
              const navigationExtras: NavigationExtras = {
                state: {
                  message: data.message,
                  products: prods,
                  orderId: data.order_id,
                  total: this.cartDataClient.total
                }
              };
              this.spinner.hide().then();
              this.router.navigate(['/thankyou'], navigationExtras).then(p => {//redirige a la ruta con los parámetros
                this.cartDataClient = {prodData: [{incart: 0, id: 0}], total: 0};//setea todo al principio
                this.cartTotal$.next(0);
                localStorage.setItem('cart', JSON.stringify(this.cartDataClient));
              });
            }
          });

        })
      } else {
        this.spinner.hide().then();
        this.router.navigateByUrl('/checkout').then();
        this.toast.error(`Sorry, failed to book the order`, "Order Status", {
          timeOut: 1500,
          progressBar: true,
          progressAnimation: 'increasing',
          positionClass: 'toast-top-right'
        })
      }
    })
  }


  private CalculateTotal() {//recorre el array de productos y calcula el total
    let Total = 0;

    this.cartDataServer.data.forEach(p => {
      const {numInCart} = p;
      const {price} = p.product;
      // @ts-ignore
      Total += numInCart * price;
    });
    this.cartDataServer.total = Total;
    this.cartTotal$.next(this.cartDataServer.total);
  }

  private resetServerData() {//reinicia la data del carrito en el servidor
    this.cartDataServer = {
      data: [{
        product: undefined,
        numInCart: 0
      }],
      total: 0
    };
    this.cartDataObs$.next({...this.cartDataServer});
  }

}

interface OrderConfirmationResponse {
  order_id: Number;
  success: Boolean;
  message: String;
  products: [{
    id: String,
    numInCart: String
  }]
}



