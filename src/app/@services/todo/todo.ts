import { Component, OnInit, signal, ChangeDetectorRef } from '@angular/core';
import {Todo, TodoStatusType} from '../../@models/todo.model';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TodoApi } from '../todo-api';
import { forkJoin } from 'rxjs';
import { Header } from './header/header';
import { Footer } from './footer/footer';
import { Section } from './section/section';

@Component({
  selector: 'app-todo',
  styleUrl: './todo.css',
  templateUrl: './todo.html',
  imports: [FormsModule, Header, Section, Footer],
})
export class TodoService implements OnInit {
  
  title = 'OneTodo';
  todoDataList: Todo[] = [];
  toggleAllBtn = false;
  nowTodoStatusType = TodoStatusType.All;
  TodoStatusType = TodoStatusType;

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

    // 刪除
  delete(item: Todo){
    this.todoDataList = this.todoDataList.filter(data => data !== item);
  }

  clear(){
    this.todoDataList = this.todoActive;
  }

  statusTypeChange(type: number){
    this.nowTodoStatusType = type;
  }

}
