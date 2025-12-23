import { booleanAttribute, Component, Input, input } from '@angular/core';

@Component({
  selector: 'app-title',
  standalone: true,
  imports: [],
  template: `
  <div  [class]="{'shadow': withShadow()}" class="mb-5 p-2">
    <h1 class="text-3xl">{{title()}}</h1>
    @if(subtitle()){
      <h2 class="text-lg opacity-60">{{subtitle()}}</h2>
    }
  </div>
  `
})
export class TitleComponent {

  title = input.required();
  withShadow = input(false, { transform: booleanAttribute });   //* booleanAttribute interpreta a la propiedad sin falores asignados, si se especifica se recibe un true, si no por defecto será un "false"

  // formas anteriores de hacer lo mismo:
  // @Input({required: true}) title2!: string;
  // @Input({transform: booleanAttribute}) withShadow2:boolean = false;   //* booleanAttribute es una funcion que convierte un string que se recibe de un input a un booleano.


  subtitle = input<string | undefined>(undefined);
}
