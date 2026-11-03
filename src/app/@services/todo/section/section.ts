import { ChangeDetectorRef, Component,Input, Output, OnInit, EventEmitter } from '@angular/core';
import { forkJoin } from 'rxjs';
import { Todo, TodoStatusType } from '../../../@models/todo.model';
import { TodoApi } from '../../todo-api';
import { FormsModule } from '@angular/forms';

@Component({
  imports: [FormsModule],
  selector: 'app-section',
  styleUrl: './section.css',
  templateUrl: './section.html',
})
export class Section implements OnInit {
  @Input() todoDataList!:Todo[];
  @Input() nowTodoList!:Todo[];
  @Input() todoCompleted!:Todo[];
  toggleAllBtn!:boolean;

  @Output() onDeleteItem = new EventEmitter<Todo>();


  constructor(
    private todoApi: TodoApi, // 負責取得 JSON 資料
    private cdr: ChangeDetectorRef // 負責通知 Angular 更新畫面
  ) {}

  ngOnInit(): void {}
  


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

  // 編輯單一事項
  edit(item: Todo){
    item.Editing = true;
  }

  // 刪除
  delete(item: Todo){
    this.todoApi.delete(item).subscribe(data => {
      console.log('資料已刪除:', data);
    });
    this.onDeleteItem.emit(item);
    // this.todoDataList = this.todoDataList.filter(data => data !== item);
  }

  // 更新
  update(item: Todo){
    this.todoApi.update(item).subscribe(data => {
      console.log('資料已更新:', data);
    });
    item.Editing = false;
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
}
