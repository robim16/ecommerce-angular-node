import { Component, OnInit } from '@angular/core';
import { CartModelServer } from 'src/app/models/cart.model';
import { CartService } from 'src/app/services/cart.service';
import { Observable } from 'rxjs'

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {

  cartData!: CartModelServer;

  cartTotal!: Number;

  subTotal!: Number;

  constructor(public cartService: CartService) { }

  ngOnInit() {
    this.cartService.cartDataObs$.subscribe((data: CartModelServer) => this.cartData = data)
    this.cartService.cartTotal$.subscribe(total => this.cartTotal = total)
  }

  ChangeQuantity(index: number, increase: boolean) {
    this.cartService.UpdateCartData(index, increase)
  }

}
