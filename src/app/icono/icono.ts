import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Auth, onAuthStateChanged, User } from '@angular/fire/auth';
import { ServicioAnimal } from '../servicio/servicioanimal'; // ajusta ruta si es distinta

@Component({
  selector: 'app-icono',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './icono.html',
  styleUrl: './icono.css'
})
export class Icono implements OnChanges, OnDestroy {
  // Entradas y salidas del componente
  @Input() menuVisible = false;
  @Input() imgUrl?: string;
  @Input() datosAnimal?: any;

  @Output() menuToggle = new EventEmitter<void>();
  @Output() editar = new EventEmitter<string>();
  @Output() animalEliminado = new EventEmitter<string>();

  puedeEliminar = false;
  eliminando = false;
  errorEliminar = '';

  private uidActual: string | null = null;
  private unsubscribeAuth?: () => void;

  // Suscribirse a cambios de autenticación
  constructor(private auth: Auth, private servicioAnimal: ServicioAnimal) {
    this.unsubscribeAuth = onAuthStateChanged(this.auth, (user: User | null) => {
      this.uidActual = user?.uid ?? null;
      this.recalcularPermiso();
    });
  }

  // Recalcular permisos al cambiar los datos del animal
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['datosAnimal']) {
      this.recalcularPermiso();
    }
  }

  // Emitir evento para editar el animal
  onEditar() {
    const id = this.datosAnimal?.id;
    if (id) {
      this.editar.emit(id);
    }
  }

  // Recalcular si el usuario actual puede eliminar el animal
  private recalcularPermiso() {
    const uidCreador = this.datosAnimal?.uidCreador ?? null;
    this.puedeEliminar = !!this.uidActual && !!uidCreador && this.uidActual === uidCreador;
  }

  // Eliminar el animal
  async eliminar() {
    this.errorEliminar = '';

    const id = this.datosAnimal?.id;
    if (!id) {
      this.errorEliminar = 'NO SE ENCONTRÓ EL ID DEL ANIMAL.';
      return;
    }

    // Confirmación para eliminar el animal
    const ok = confirm('¿Desea eliminar este animal?');
    if (!ok) return;

    this.eliminando = true;

    // Intentar eliminar el animal
    try {
      await this.servicioAnimal.eliminarAnimal(id);

      // cerrar menú y avisar al padre
      this.menuToggle.emit();
      this.animalEliminado.emit(id);
    } catch (e: any) {
      // si no es dueño o reglas bloquean
      this.errorEliminar = 'NO SE PUDO ELIMINAR (PERMISOS O CONEXIÓN).';
    } finally {
      this.eliminando = false;
    }
  }

  ngOnDestroy() {
    if (this.unsubscribeAuth) this.unsubscribeAuth();
  }
}

