import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import {Todo, TodoStatusType} from './@models/todo.model';
import { FormsModule } from '@angular/forms';
import { TodoService } from './@services/todo';
import { Hello } from './hello/hello';

@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  imports: [FormsModule,Hello],
})
export class App{
  protected readonly title = signal('OneTodo');
  protected readonly placeholder = signal('What needs to be done???');
  TodoStatusType = TodoStatusType; //讓 HTML 可以使用 enum 
  todoInputModel = '';

    // 取得目前要顯示的事項清單
  get nowTodoList(): Todo[]{
    return this.todo.nowTodoList;
  }

  // 取得未完成的事項清單
  get todoActive(): Todo[]{
    return this.todo.todoActive;
  }

  // 取得已完成的事項清單
  get todoCompleted(): Todo[]{
    return this.todo.todoCompleted;
  }

  get toggleAllBtn(){
    return this.todo.toggleAllBtn;
  }

  get nowTodoStatusType(){
    return this.todo.nowTodoStatusType;
  }

  // 【修改】注入 HttpClient 和 ChangeDetectorRef
  constructor(
    private todo: TodoService, // 負責取得 JSON 資料
  ) { }


  // 新增
  add(){
    this.todo.add(this.todoInputModel);
    this.todoInputModel = '';
  }

  // 更新
  update(item: Todo){
    this.todo.update(item);
  }

  // 單一事項的完成狀態切換
  clickCheck(item: Todo){
    this.todo.clickCheck(item);
  }

  // 刪除
  delete(item: Todo){
    this.todo.delete(item);
  }

  // 全選或取消全選
  toggleAll(){
    this.todo.toggleAll();
  }

  // 清除已完成的事項
  clearcompleted(){
    this.todo.clearcompleted();
  }

  // 編輯單一事項
  edit(item: Todo){
    item.Editing = true;
  }

  // 設定目前要顯示的事項狀態
  setTodoStatusType(type: number){
    this.todo.setTodoStatusType(type);
  }



  
}

