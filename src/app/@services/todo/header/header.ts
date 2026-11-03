import { ChangeDetectorRef, Component, Input, signal } from '@angular/core';
import { Todo } from '../../../@models/todo.model';
import { TodoApi } from '../../todo-api';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-header',
  styleUrl: './header.css',
  templateUrl: './header.html',
})
export class Header {
  @Input() title!:string;
   
  @Input() todoDataList!:Todo[];

  todoInputModel!:string;
  toggleAllBtn!:boolean;

  constructor(
    private todoApi: TodoApi, // 負責取得 JSON 資料
    private cdr: ChangeDetectorRef // 負責通知 Angular 更新畫面
  ) {}
  
  // 新增
  add(){
    const todo: Todo = {
      Status: false,
      Thing: this.todoInputModel,
      Editing: false,
      id: ''
    }
    this.todoApi.add(todo).subscribe(data => {
      this.todoDataList.push(data);
      console.log('資料已更新:', this.todoDataList);
    });
    this.toggleAllBtn = false;
    this.todoInputModel = '';
  }
}
