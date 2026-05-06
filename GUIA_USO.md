# Guia de uso de la aplicacion

## Proposito
Esta aplicacion es una calculadora financiera en Python para Ingenieria Economica. Funciona en terminal y permite calcular interes simple, interes compuesto, cuota fija mensual y comparaciones entre ambos metodos.

## Como ejecutar
1. Abra una terminal en la carpeta del proyecto.
2. Ejecute el archivo principal:

```bash
python main.py
```

Si su sistema usa otro comando de Python, puede reemplazarlo por el ejecutable que tenga disponible.

## Menu principal
Al iniciar, el programa muestra estas opciones:

1. Interes simple - Pago unico al final
2. Interes compuesto - Pago unico al final
3. Interes compuesto - Cuota fija mensual
4. Comparar simple vs compuesto (pago unico)
5. Salir

Debe escribir solo el numero de la opcion y presionar Enter.

## Tipo de datos que se esperan en las entradas

### 1. Capital inicial
- Tipo esperado: numero positivo
- Puede ser entero o decimal
- Ejemplos validos: `1000`, `2500.75`, `15000`
- No se permiten valores negativos ni cero

### 2. Tasa de interes mensual
- Tipo esperado: numero entre 0 y 100
- Puede ser entero o decimal
- Ejemplos validos: `5`, `2.5`, `12.75`
- No escriba el simbolo `%`
- No se permiten valores menores que 0 ni mayores que 100

### 3. Plazo
- Tipo esperado: entero positivo
- Se interpreta como numero de meses
- Ejemplos validos: `6`, `12`, `24`, `36`
- No se permiten decimales
- No se permiten valores negativos ni cero

### 4. Cuota manual
- Solo se usa en la opcion de cuota fija si decide escribir una cuota propia
- Tipo esperado: numero positivo
- Puede ser entero o decimal
- Debe cubrir al menos los intereses del primer periodo

## Como se interpretan los datos

### Capital inicial
Es el dinero que se presta o invierte al comienzo. En los calculos se usa como base para determinar el monto final y los intereses.

### Tasa de interes mensual
Es el porcentaje que se aplica cada mes. El programa convierte ese valor a calculo decimal internamente:
- Si ingresa `5`, el programa lo interpreta como `5% mensual`
- Internamente se usa como `0.05`

### Plazo
Es la cantidad de meses que dura el calculo.
- Si ingresa `12`, el programa interpreta 12 periodos mensuales

### Cuota fija
Es el pago que se hace cada mes en la opcion 3.
- Si usa la cuota calculada por el programa, se obtiene con la formula de anualidad
- Si ingresa una cuota manual, el programa valida que sea suficiente para cubrir el interes del primer mes

## Interpretacion de las salidas

### Opcion 1: interes simple
Muestra:
- Monto final
- Intereses pagados
- Resumen general

Interpretacion:
- El interes se calcula sobre el capital inicial durante todo el plazo
- El crecimiento es lineal

### Opcion 2: interes compuesto
Muestra:
- Monto final
- Intereses pagados
- Resumen general

Interpretacion:
- El interes se capitaliza mes a mes
- El monto final suele ser mayor que en interes simple

### Opcion 3: interes compuesto con cuota fija mensual
Muestra:
- Cuota fija
- Tabla de amortizacion con las columnas:
  - Mes
  - Saldo inicial
  - Interes
  - Cuota
  - Abono a capital
  - Saldo final
- Total pagado
- Total intereses

Interpretacion de la tabla:
- Saldo inicial: deuda al inicio del mes
- Interes: valor generado en ese periodo
- Cuota: pago total de ese mes
- Abono a capital: parte de la cuota que reduce la deuda
- Saldo final: deuda restante despues del pago

### Opcion 4: comparacion simple vs compuesto
Muestra una tabla lado a lado con:
- Metodo
- Monto final
- Intereses pagados
- Diferencia

Interpretacion:
- Permite ver cual metodo genera mas costo financiero
- La diferencia muestra cuanto cambia el monto final entre ambos metodos

## Ejemplo de uso rapido

### Caso de prueba para opcion 1 o 2
- Capital: `1000`
- Tasa mensual: `5`
- Plazo: `12`

### Caso de prueba para opcion 3
- Capital: `1000`
- Tasa mensual: `5`
- Plazo: `12`
- Cuota manual: deje Enter para usar la cuota calculada automaticamente

## Recomendaciones
- Ingrese solo numeros en las entradas
- No use comas para decimales, use punto decimal si necesita valores con fraccion
- Si el programa muestra un error, revise que el dato cumpla con el tipo esperado

## Resumen corto
- Menu: numero entero entre 1 y 5
- Capital: numero positivo
- Tasa: numero entre 0 y 100
- Plazo: entero positivo en meses
- Cuota manual: numero positivo que cubra al menos el interes del primer periodo
