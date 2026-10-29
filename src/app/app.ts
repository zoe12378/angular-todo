import { Component, signal } from '@angular/core';
import {Todo, TodoStatusType} from './@models/todo.model';

@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('OneTodo');
  protected readonly placeholder = signal('What needs to be done???');

  toggleAllBtn = false;
  nowTodoStatusType = TodoStatusType.All; //預設為All
  TodoStatusType = TodoStatusType; //讓 HTML 可以使用 enum 

  todoDataList: Todo[] = [
    {
    Status: true,
    Thing:'第一件事情',
    Editing: false
    },
    {
    Status: false,
    Thing:'第二件事情',
    Editing: false
    },
    {
    Status:false,
    Thing:'第三件事情',
    Editing: false
    },
  ];

  toggleAll(){
    this.toggleAllBtn = !this.toggleAllBtn;
    for (let i = 0; i < this.todoDataList.length; i++) {
      this.todoDataList[i].Status = this.toggleAllBtn;
    }
  }
  clickCheck(item: Todo){
    item.Status = !item.Status;
  }
  delete(index: number){
    this.todoDataList.splice(index,1);
  }
  add(value: string){
    console.log('輸入的內容：', value);
    const todo: Todo = {
      Status: false,
      Thing: value,
      Editing: false
    }
    this.todoDataList.push(todo);
  }
  edit(item: Todo){
    item.Editing = true;
  }
  update(item: Todo, value: string){
    item.Thing = value;
    item.Editing = false;
  }
  setTodoStatusType(type: number){
    this.nowTodoStatusType = type;
  }
}
