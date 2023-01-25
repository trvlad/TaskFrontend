export class Message{
    public id?:number;
    public idTheme:number;
    public idContact:number;
    public message:string;
    public dateTimeMessage:Date;

    constructor(){
        this.id=0;
        this.idTheme=0;
        this.idContact=0;
        this.message='';
        this.dateTimeMessage=new Date("1000-01-01T00:00:00");
    }
}
