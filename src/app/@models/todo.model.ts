export interface Todo {
    Status: boolean;
    Thing: string;
    Editing: boolean;
    id: string;
}

export class TodoClass implements Todo {
    Status: boolean;
    Thing: string;
    Editing: boolean;
    id: string;
    constructor(_thing: string, _status: boolean = false){
        this.Thing = _thing;
        this.Status = _status;
        this.Editing = false;
        this.id = '';
    }
}

export enum TodoStatusType{
    All,
    Active,
    Completed
}
