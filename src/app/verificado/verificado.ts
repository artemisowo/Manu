import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { servicioauth } from '../servicio/servicioauth';

@Component({
  selector: 'app-verificado',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './verificado.html',
  styleUrl: './verificado.css',
})
export class verificado implements OnDestroy {
  cargando = true;

  mensaje =
    'Si ya verificaste tu correo, espera unos segundos. Te enviaremos automáticamente al Mapa.';

  private intervalo: any = null;
  private intentos = 0;

  constructor(private router: Router, private auth: servicioauth) {}

  ngOnInit() {
    this.intervalo = setInterval(async () => {
      this.intentos++;

      try {
        const ok = await this.auth.correoverificadoactual();

        if (ok) {
          this.mensaje = 'Correo verificado ✅ Redirigiendo al Mapa...';
          this.detener();
          await this.router.navigate(['/mapa']);
          return;
        }

        if (this.intentos >= 3) this.cargando = false;

        if (this.intentos >= 15) {
          this.mensaje =
            'Aún no se refleja la verificación. Si abriste un correo antiguo, usa el último correo enviado. Luego vuelve aquí o espera unos segundos.';
          this.detener(); 
        }
      } catch {
        this.cargando = false;
        this.mensaje =
          'No se pudo confirmar automáticamente. Usa el último correo de verificación y vuelve a intentar.';
        this.detener();
      }
    }, 2000);
  }

  ngOnDestroy(): void {
    this.detener();
  }

  private detener() {
    if (this.intervalo) {
      clearInterval(this.intervalo);
      this.intervalo = null;
    }
  }
}
