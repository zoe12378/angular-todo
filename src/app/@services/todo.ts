import { Injectable, signal } from '@angular/core';
import { TodoApi } from './todo-api';
import { Todo, TodoStatusType } from '../@models/todo.model';

@Injectable({
    providedIn: 'root' // 讓 Angular 自動建立並提供 TodoApi
})
export class TodoService {
    nowTodoStatusType = TodoStatusType.All; //預設為All
    // 【修改】使用 Signal 儲存待辦清單
    todoDataList = signal<Todo[]>([]);

    // 取得目前清單
    get nowTodoList(): Todo[] {
    switch (this.nowTodoStatusType) {
        case TodoStatusType.Active:
        return this.todoActive;

        case TodoStatusType.Completed:
        return this.todoCompleted;

        default:
        return this.todoDataList();
    }
    }

    // 未完成清單
    get todoActive(): Todo[] {
    return this.todoDataList().filter(data => !data.Status);
    }

    // 已完成清單
    get todoCompleted(): Todo[] {
    return this.todoDataList().filter(data => data.Status);
    }

    // 全選狀態
    get toggleAllBtn(): boolean {
    return this.todoDataList().length > 0 &&
        this.todoDataList().every(item => item.Status);
    }


    constructor(private todoApi: TodoApi) {
        this.getData(); // 取得資料
    }

    
    // 從後端取得資料
    getData(): void {

    // 呼叫 TodoApi Service
    this.todoApi.getTodoList().subscribe({

        // 成功取得資料
        next: (data: Todo[]) => {

        // 【修改】使用 set() 更新 Signal
        this.todoDataList.set(data);

        // 確認後端實際回傳內容
        console.log('成功取得資料：', data);
        },

        // 【新增】顯示 HTTP 錯誤
        error: (error) => {
        console.error('取得資料失敗：', error);
        }
    });
    }

    // 新增
    add(value: string){
        const todo: Todo = {
        Status: false,
        Thing: value,
        Editing: false,
        id: ''
        }
        this.todoApi.add(todo).subscribe(data => {
        this.todoDataList.update(current => [...current, data]);
        console.log('資料已更新:', this.todoDataList);
        });
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
    }

    // 刪除
    delete(item: Todo){
        this.todoApi.delete(item).subscribe(data => {
        console.log('資料已刪除:', data);
        });
        this.todoDataList.update(current => current.filter(data => data !== item));
    }

    // 全選或取消全選
    toggleAll() {
        const nextStatus = !this.toggleAllBtn;
        this.todoDataList().forEach(item => {
            this.todoApi.update({ ...item, Status: nextStatus }).subscribe();
        });
        this.todoDataList.update(current =>
            current.map(item => ({
                ...item,
                Status: nextStatus
            }))
        );
    }

    // 清除已完成的事項
    clearcompleted(){
        this.todoApi.deleteCompleted().subscribe(data => {
        console.log('已清除已完成的事項:', data);
        });
        this.todoDataList.update(current => this.todoActive); //清除已完成的事項
    }






    // 設定目前要顯示的事項狀態
    setTodoStatusType(type: number){
        this.nowTodoStatusType = type;
    }

    
}
