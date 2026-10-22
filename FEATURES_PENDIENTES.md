# Funcionalidades pendientes

## Interpretación de problemas en lenguaje natural

Solicitada por el profesor: el usuario escribe el enunciado del problema en lenguaje natural y el sistema lo interpreta (o le pregunta qué necesita y qué tipo de cálculo quiere hacer), y lo lleva a la calculadora correspondiente con los datos cargados.

Estado actual: el asistente (`api/chat.ts`) solo explica conceptos y se niega a calcular; el modo guiado de las calculadoras pregunta "¿Qué quieres averiguar?", pero con opciones fijas.

## Completadas

- Despejar i, I, P, M (F) y n en interés simple y compuesto.
- Tabla período a período en interés simple y compuesto (exportable a Excel).
- Entrada de número de períodos con unidad (días, semanas, quincenas, meses, bimestres, trimestres, cuatrimestres, semestres, años).
