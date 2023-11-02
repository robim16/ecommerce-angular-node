import { Component, OnInit } from '@angular/core';
import { ProductModelServer, ServerResponse } from 'src/app/models/product.model';
import { ProductService } from 'src/app/services/product.service';
import { Router } from '@angular/router';
import { CartService } from 'src/app/services/cart.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  products: ProductModelServer[] = [];

  constructor(private productService: ProductService,
    private cartService: CartService, 
    private router: Router) { }

  ngOnInit(): void {
    this.productService.getAllProducts().subscribe((prods: ServerResponse) => {
      
      this.products = prods.products
      
    })
  }

  selectProduct(id: Number){
    this.router.navigate(['/product', id]).then()
  }

  AddToCart(id: Number){
    this.cartService.AddProductToCart(id)
  }

}
