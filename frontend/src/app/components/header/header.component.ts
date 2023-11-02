import { Component, OnInit } from '@angular/core';
import { CartModelServer } from 'src/app/models/cart.model';
import { CartService } from 'src/app/services/cart.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  

  cartData: CartModelServer;
  cartTotal: Number;

  

  constructor(public cartService: CartService) { }

  ngOnInit() {
    this.cartService.cartTotal$.subscribe(total => {
      this.cartTotal = total
    });//obtiene el total del service y setea la propiedad cartTotal del comp.

    this.cartService.cartDataObs$.subscribe(data => this.cartData = data)
  }

}
