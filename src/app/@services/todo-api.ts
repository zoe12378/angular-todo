import { Injectable } from '@angular/core';
import { Todo } from '../@models/todo.model';
import { HttpClient } from '@angular/common/http';

@Injectable({
    providedIn: 'root' // 讓 Angular 自動建立並提供 TodoApi
})
export class TodoApi {
    private url = '/api/todo2_16';

    constructor(
        private http: HttpClient, // 負責取得 JSON 資料
    ) {}
    
    getTodoList() {
        return this.http.get<Todo[]>(this.url);
    }

    add(value: Todo) {
        return this.http.post<Todo>(this.url, value);
    }

    update(value: Todo) {
        return this.http.put(`${this.url}/${value.id}`, value);
    }

    delete(value: Todo) {
        return this.http.delete(`${this.url}/${value.id}`);
    }

    allcheck(value: boolean) {
        return this.http.put(`${this.url}/Status/${value}`, null);
    }

    deleteCompleted() {
        return this.http.delete(`${this.url}/clearCompleted`);
    }
}
