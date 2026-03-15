import { Component } from '@angular/core';
import { Registration } from "../authentication/registration/registration";

@Component({
  selector: 'app-home',
  imports: [Registration],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {

}
