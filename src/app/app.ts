import { Component } from '@angular/core';
import { TodoService } from './@services/todo/todo';

@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  imports: [TodoService],
})

export class App{ }