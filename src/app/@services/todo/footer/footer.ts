import { ChangeDetectorRef, Component,Input, Output, EventEmitter } from '@angular/core';
import { Todo, TodoStatusType } from '../../../@models/todo.model';
import { forkJoin } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { TodoApi } from '../../todo-api';

@Component({
  imports: [FormsModule],
  selector: 'app-footer',
  styleUrl: './footer.css',
  templateUrl: './footer.html',
})
export class Footer {
  @Input() todoActive!:Todo[];
  @Input() todoCompleted!:Todo[]
  @Input() todoDataList!:Todo[];
  @Input() nowTodoStatusType!: TodoStatusType;
  TodoStatusType = TodoStatusType;
  toggleAllBtn!:boolean;
  
  @Output() onClearCompleted = new EventEmitter();
  @Output() onStatusTypeChange = new EventEmitter<number>();


  constructor(
    private todoApi: TodoApi, // 負責取得 JSON 資料
    private cdr: ChangeDetectorRef // 負責通知 Angular 更新畫面
  ) {}
  
  ngOnInit(): void {}

  // 設定目前要顯示的事項狀態
  setTodoStatusType(type: number){
    this.nowTodoStatusType = type;
    this.onStatusTypeChange.emit(type);
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

  // 清除已完成的事項
  clearcompleted() {
    const completed = this.todoCompleted;
    if (completed.length === 0) return;
    const requests = completed.map(item =>
      this.todoApi.delete(item)
    );
    this.onClearCompleted.emit();
  }
}
