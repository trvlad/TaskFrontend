import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ThemeService } from '../app/shared/services/theme.service';
import { ContactService } from '../app/shared/services/contact.service';
import { MessageService } from '../app/shared/services/message.service';
import { Theme } from '../app/shared/models/theme.model';
import { Contact } from './shared/models/contact.model';
import { Message } from './shared/models/message.model';
import { map, mergeMap, Observable, of } from 'rxjs';




@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  themes: Theme[] | null = [];

  isFormHide = false;

  form!: FormGroup

  phoneMask = { mask: "+7(000)000-00-00" };

  siteKey: string = "6Lffk_0jAAAAAM1_G-aW3q0IHEtg6LwC01Pyaj4m";

  currentMessage!: {
    user: {
      name: string;
      email: string;
      phone: string;
    }
    themeName: string;
    messageText: string;
  };

  constructor(private themeServise: ThemeService,
    private contactService: ContactService,
    private messageService: MessageService) { }

  ngOnInit() {
    this.form = new FormGroup({
      name: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.email, Validators.required]),
      phone: new FormControl('', [Validators.required, Validators.minLength(16)]),
      theme: new FormControl(null, Validators.required),
      newTheme: new FormControl('', Validators.required),
      message: new FormControl('', [Validators.required]),
      recaptcha: new FormControl('', Validators.required)
    })

    this.form.get('theme')?.valueChanges
      .subscribe((value) => {
        if (value != 'newTheme') {
          this.form.patchValue({ newTheme: value })
        }
        else {
          this.form.patchValue({ newTheme: '' })
        }
        console.log(this.form.value)
      })

    //Попытка вытащить темы из бд
    this.themeServise.getAllThemes().subscribe(param => {
      this.themes = param
    })
  }

  submit() {
    if (this.form.valid) {

      //Скрыть форму
      this.isFormHide = true;

      //Выбранная тема
      let finalTheme$: Observable<Theme>;
      //Если выбрана тема из списка, то присваиваем её
      if (this.form.get('theme')?.value != 'newTheme') {
        finalTheme$ = of(<Theme>this.form.get('theme')?.value)
      }
      //если выбран пункт -Добавить свою тему-
      else {
        //Проверка, есть ли уже "новая тема" в нашем списке тем (защита от дубликатов тем)
        //темы в списке нет -> добавляем в БД
        if(this.themes?.indexOf(this.form.get('newTheme')?.value) == -1){
          finalTheme$ = this.themeServise.addTheme(this.form.get('newTheme')?.value);
        }
        //тема в списке есть
        else{
          finalTheme$ = of(<Theme>this.form.get('newTheme')?.value)
        }
      }

      finalTheme$.pipe(
        mergeMap((theme) => {
          //Клиент. Получаем из БД по связке Email + телефон, если такого в БД нет (null), то создаём новгого и получаем из БД
          let client: Contact | null = {
            email: this.form.get('email')?.value,
            phoneNumber: this.form.get('phone')?.value,
            name: this.form.get('name')?.value
          };
          return this.contactService.getContact(this.form.get('email')?.value, this.form.get('phone')?.value).pipe(
            mergeMap((res) => {
              if (res == null) {
                return this.contactService.addContact(client)
              } else {
                return of(res)
              }
            }),
            mergeMap((contact) => {

              //Добавляем в БД новое сообщение и получаем его из бд
              let ourMessage: Message | null = {
                idTheme: theme.id,
                idContact: contact.id,
                message: this.form.get('message')?.value,
                dateTimeMessage: new Date()
              }
              return this.messageService.addMessage(ourMessage).pipe(map((res) => ({message: res, contact: contact, theme: theme})));
            }))
        })
      ).subscribe((res) => {
        this.currentMessage = {
          user: {
            name: res.contact.name,
            email: res.contact.email,
            phone: res.contact.phoneNumber
          },
          themeName: res.theme.theme,
          messageText: res.message.message
        }
        console.log(res)
      })

    }
  }
}
