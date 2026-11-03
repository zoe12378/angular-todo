
import { Component, OnInit, signal } from '@angular/core';
import { Todo, TodoStatusType } from './@models/todo.model';
import { FormsModule } from '@angular/forms';
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

  TodoStatusType = TodoStatusType;
  todoInputModel = '';
  nowTodoStatusType = TodoStatusType.All;

  // 【修改】使用 Signal 儲存 Todo 資料
  todoDataList = signal<Todo[]>([]);

  constructor(private todoApi: TodoApi) {}

  // 初始化元件
  ngOnInit(): void {
    this.getData();
  }

  // 取得目前要顯示的事項清單
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

  // 取得未完成事項
  get todoActive(): Todo[] {
    return this.todoDataList().filter(data => !data.Status);
  }

  // 取得已完成事項
  get todoCompleted(): Todo[] {
    return this.todoDataList().filter(data => data.Status);
  }

  // 判斷是否全部完成
  get toggleAllBtn(): boolean {
    return this.todoDataList().length > 0 &&
      this.todoDataList().every(item => item.Status);
  }

  // 取得資料
  getData(): void {
    this.todoApi.getTodoList().subscribe({
      next: (data: Todo[]) => {
        this.todoDataList.set(data);
        console.log('成功取得資料：', data);
      },
      error: (error) => {
        console.error('取得資料失敗：', error);
      }
    });
  }

  // 新增事項
  add(): void {
    const value = this.todoInputModel.trim();
    if (value === '') return;

    const todo: Todo = {
      Status: false,
      Thing: value,
      Editing: false,
      id: ''
    };

    this.todoApi.add(todo).subscribe({
      next: (data: Todo) => {
        this.todoDataList.update(current => [...current, data]);
        this.todoInputModel = '';
        console.log('新增成功：', data);
      },
      error: (error) => {
        console.error('新增失敗：', error);
      }
    });
  }

  // 更新單一事項
  update(item: Todo): void {
    const updatedItem: Todo = {
      ...item,
      Editing: false
    };

    this.todoApi.update(updatedItem).subscribe({
      next: () => {
        this.todoDataList.update(current =>
          current.map(data =>
            data.id === item.id ? updatedItem : data
          )
        );
        console.log('資料已更新：', updatedItem);
      },
      error: (error) => {
        console.error('更新失敗：', error);
      }
    });
  }

  // 切換單一事項完成狀態
  clickCheck(item: Todo): void {
    const updatedItem: Todo = {
      ...item,
      Status: !item.Status
    };

    this.todoApi.update(updatedItem).subscribe({
      next: () => {
        this.todoDataList.update(current =>
          current.map(data =>
            data.id === item.id ? updatedItem : data
          )
        );
        console.log('完成狀態已更新：', updatedItem);
      },
      error: (error) => {
        console.error('勾選更新失敗：', error);
      }
    });
  }

  // 刪除單一事項
  delete(item: Todo): void {
    this.todoApi.delete(item).subscribe({
      next: () => {
        this.todoDataList.update(current =>
          current.filter(data => data.id !== item.id)
        );
        console.log('資料已刪除：', item.id);
      },
      error: (error) => {
        console.error('刪除失敗：', error);
      }
    });
  }

  // 全選或取消全選
  toggleAll(): void {
    const nextStatus = !this.toggleAllBtn;
    const items = this.todoDataList();

    if (items.length === 0) return;

    const updatedItems = items.map(item => ({
      ...item,
      Status: nextStatus
    }));

    const requests = updatedItems.map(item =>
      this.todoApi.update(item)
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.todoDataList.set(updatedItems);
        console.log('全選狀態更新成功');
      },
      error: (error) => {
        console.error('全選更新失敗：', error);
        this.getData();
      }
    });
  }

  // 清除已完成事項
  clearcompleted(): void {
    const completed = this.todoCompleted;

    if (completed.length === 0) return;

    const requests = completed.map(item =>
      this.todoApi.delete(item)
    );

    forkJoin(requests).subscribe({
      next: () => {
        this.todoDataList.update(current =>
          current.filter(item => !item.Status)
        );
        console.log('已清除所有完成事項');
      },
      error: (error) => {
        console.error('清除已完成事項失敗：', error);
        this.getData();
      }
    });
  }

  // 編輯單一事項
  edit(item: Todo): void {
    this.todoDataList.update(current =>
      current.map(data =>
        data.id === item.id
          ? { ...data, Editing: true }
          : data
      )
    );
  }

  // 設定目前顯示的事項狀態
  setTodoStatusType(type: number): void {
    this.nowTodoStatusType = type;
  }
}
