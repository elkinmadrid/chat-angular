import { Component, OnInit } from '@angular/core';
import { Client } from '@stomp/stompjs'
import * as SockJS from 'sockjs-client'
import { Mensaje } from './models/mensaje';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss']
})
export class ChatComponent implements OnInit {

  private client: Client;
  conectado: boolean = false;
  mensaje: Mensaje = new Mensaje();
  mensajes: Mensaje[] = [];

  constructor() { }

  ngOnInit(): void {
    this.client = new Client()
    this.client.webSocketFactory = () => {
      return new SockJS('http://localhost:8080/chat-websocket')
    }
    this.client.onConnect = (frame) => {
      console.log('Conectado ' + this.client.connected + ' : ' + frame);
      this.conectado = true;

      this.client.subscribe('/topic/mensaje', (e) => {
        let men = JSON.parse(e.body) as Mensaje;
        men.fecha = new Date(men.fecha);
        this.mensajes.push(men);        
        
      });
      this.mensaje.tipo = 'NEW_USER';
      this.client.publish({
        destination: '/app/mensaje', body: JSON.stringify(this.mensaje)
      });
    }
    this.client.onDisconnect = (frame) => {
      console.log('Desconectado ' + !this.client.connected + ' : ' + frame);
      this.conectado = false;
    }

  }

  conectarse() {
    this.client.activate();
  }

  desconectarse() {
    this.client.deactivate();
  }

  sendMessage() {
    this.mensaje.tipo = 'MENSAJE';
    this.client.publish({
      destination: '/app/mensaje', body: JSON.stringify(this.mensaje)
    })
    this.mensaje.texto= '';
  }

}
