import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import {Todo, TodoStatusType} from './@models/todo.model';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TodoApi } from './@services/todo-api';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
  imports: [FormsModule],
})
export class App implements OnInit {
  protected readonly title = signal('OneTodo');
  protected readonly placeholder = signal('What needs to be done???');

  toggleAllBtn = false;
  nowTodoStatusType = TodoStatusType.All; //預設為All
  TodoStatusType = TodoStatusType; //讓 HTML 可以使用 enum 

  todoInputModel = signal('');

  todoDataList: Todo[] = [];

  // 【修改】注入 HttpClient 和 ChangeDetectorRef
  constructor(
    private todoApi: TodoApi, // 負責取得 JSON 資料
    private cdr: ChangeDetectorRef // 負責通知 Angular 更新畫面
  ) {}

// 元件初始化
ngOnInit(): void {

  // 從 TodoApi Service 取得資料
  this.todoApi.getTodoList().subscribe({

    // 成功取得資料
    next: (data: Todo[]) => {

      // 將資料存入清單
      this.todoDataList = data;

      // 【新增】通知 Angular 更新畫面
      this.cdr.markForCheck();
    },

    // 【新增】讀取失敗時顯示錯誤
    error: (error) => {

      // 在 Console 顯示錯誤
      console.error('讀取 Todo 失敗：', error);
    }
  });
}
  // 取得
  getData() {
    this.todoApi.getTodoList().subscribe(data => {

      // 更新資料
      this.todoDataList = data;

      // 【新增】依資料庫內容判斷是否全部完成
      this.toggleAllBtn =
        data.length > 0 && data.every(item => item.Status);

      // 更新畫面
      this.cdr.markForCheck();
    });
  }

  // 新增
  add(){
    const todo: Todo = {
      Status: false,
      Thing: this.todoInputModel(),
      Editing: false,
      id: ''
    }
    this.todoApi.add(todo).subscribe(data => {
      this.todoDataList.push(data);
      console.log('資料已更新:', this.todoDataList);
    });
    this.toggleAllBtn = false;
    this.todoInputModel.set('');
  }

  // 更新
  update(item: Todo){
    this.todoApi.update(item).subscribe(data => {
      console.log('資料已更新:', data);
    });
    item.Editing = false;
  }

  // 單一事項的完成狀態切換
  clickCheck(item: Todo){
    item.Status = !item.Status;
    this.todoApi.update(item).subscribe(data => {
      console.log('資料已更新:', data);
    }); 
    if(this.todoCompleted.length === this.todoDataList.length){
      this.toggleAllBtn = true;
    }else{
      this.toggleAllBtn = false;
    }
  }

  // 刪除
  delete(item: Todo){
    this.todoApi.delete(item).subscribe(data => {
      console.log('資料已刪除:', data);
    });
    this.todoDataList = this.todoDataList.filter(data => data !== item);
  }

  // 全選或取消全選
  toggleAll() {
    const nextStatus = !this.toggleAllBtn;
    const requests = this.todoDataList.map(item =>
      this.todoApi.update({
        ...item,              // 保留原本資料
        Status: nextStatus    // 修改完成狀態
      })
    );
    if (requests.length === 0) return;
    forkJoin(requests).subscribe({
      next: () => {
        this.todoDataList = this.todoDataList.map(item => ({
          ...item,
          Status: nextStatus
        }));
        this.toggleAllBtn = nextStatus;
        this.cdr.markForCheck();
        console.log('全選狀態更新成功');
      },
      error: (error) => {
        console.error('全選更新失敗：', error);
        this.getData();
      }
    });
  }


  // 清除已完成的事項
  clearcompleted() {
    const completed = this.todoCompleted;
    if (completed.length === 0) return;
    const requests = completed.map(item =>
      this.todoApi.delete(item)
    );
    forkJoin(requests).subscribe({
      next: () => {
        this.todoDataList = this.todoActive;
        this.toggleAllBtn = false;
        this.cdr.markForCheck();
        console.log('已清除所有完成事項');
      },
      error: (error) => {
        console.error('清除完成事項失敗：', error);
        this.getData();
      }
    });
  }












  // 編輯單一事項
  edit(item: Todo){
    item.Editing = true;
  }

  // 設定目前要顯示的事項狀態
  setTodoStatusType(type: number){
    this.nowTodoStatusType = type;
  }

  // 取得目前要顯示的事項清單
  get nowTodoList(): Todo[]{
    let list: Todo[] = [];
    switch(this.nowTodoStatusType){
      case TodoStatusType.Active:
        list = this.todoActive;
        break;
      case TodoStatusType.Completed:
        list = this.todoCompleted;
        break;
      default:
        list = this.todoDataList;
        break;
    }
    return list;
  }

  // 取得未完成的事項清單
  get todoActive(): Todo[]{
    return this.todoDataList.filter(data => !data.Status); //回傳未完成的事項
  }

  // 取得已完成的事項清單
  get todoCompleted(): Todo[]{
    return this.todoDataList.filter(data => data.Status); //回傳已完成的事項
  }

  
}

