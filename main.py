"""
CALCULADORA DE INTERES - INGENIERIA ECONOMICA
Primera entrega: Interes simple vs compuesto
"""


# ======================
# 1. FUNCIONES DE CALCULO
# ======================

def calcular_interes_simple_pago_unico(capital, tasa, plazo):
	"""
	Entrada: capital (float), tasa (% mensual), plazo (meses)
	Salida: (monto_final, intereses_totales)
	Formula: VF = P * (1 + n*i)
	"""
	i = tasa / 100
	intereses_totales = capital * i * plazo
	monto_final = capital + intereses_totales
	return monto_final, intereses_totales


def calcular_interes_compuesto_pago_unico(capital, tasa, plazo):
	"""
	Entrada: capital (float), tasa (% mensual), plazo (meses)
	Salida: (monto_final, intereses_totales)
	Formula: VF = P * (1 + i)^n
	"""
	i = tasa / 100
	monto_final = capital * ((1 + i) ** plazo)
	intereses_totales = monto_final - capital
	return monto_final, intereses_totales


def calcular_cuota_fija_compuesto(capital, tasa, plazo):
	"""
	Entrada: capital (float), tasa (% mensual), plazo (meses)
	Salida: cuota_fija (float)
	Formula: Cuota = P * [i*(1+i)^n] / [(1+i)^n - 1]
	Donde i = tasa/100
	"""
	i = tasa / 100
	if i == 0:
		return capital / plazo

	factor = (1 + i) ** plazo
	denominador = factor - 1
	if denominador == 0:
		return capital / plazo

	numerador = capital * i * factor
	cuota = numerador / denominador
	return cuota


def generar_tabla_amortizacion_compuesto(capital, tasa, plazo, cuota_fija):
	"""
	Entrada: capital, tasa (%), plazo, cuota_fija
	Salida: lista de diccionarios, cada uno con:
		{
			'mes': int,
			'saldo_inicial': float,
			'interes': float,
			'cuota': float,
			'abono_capital': float,
			'saldo_final': float
		}
	Proceso:
		Para cada mes desde 1 hasta plazo:
			interes = saldo_inicial * (tasa/100)
			abono_capital = cuota_fija - interes
			si abono_capital > saldo_inicial: ajustar cuota
			saldo_final = saldo_inicial - abono_capital
	"""
	tabla = []
	saldo_actual = capital
	i = tasa / 100

	for mes in range(1, plazo + 1):
		saldo_inicial = saldo_actual
		interes = saldo_inicial * i
		cuota = cuota_fija
		abono_capital = cuota - interes

		if abono_capital > saldo_inicial:
			abono_capital = saldo_inicial
			cuota = interes + abono_capital

		saldo_final = saldo_inicial - abono_capital

		tabla.append(
			{
				"mes": mes,
				"saldo_inicial": saldo_inicial,
				"interes": interes,
				"cuota": cuota,
				"abono_capital": abono_capital,
				"saldo_final": saldo_final,
			}
		)

		saldo_actual = saldo_final
		if saldo_actual <= 1e-10:
			break

	return tabla


def generar_tabla_amortizacion_simple(capital, tasa, plazo, cuota_fija):
	"""
	Entrada: capital, tasa (%), plazo, cuota_fija
	Salida: misma estructura que funcion anterior
	Proceso:
		Para interes simple, el interes cada mes es sobre capital inicial
		interes = capital * (tasa/100)  (mismo todos los meses)
		abono_capital = cuota_fija - interes
		saldo_final = saldo_inicial - abono_capital
	"""
	tabla = []
	saldo_actual = capital
	i = tasa / 100
	interes_fijo = capital * i

	for mes in range(1, plazo + 1):
		saldo_inicial = saldo_actual
		interes = interes_fijo
		cuota = cuota_fija
		abono_capital = cuota - interes

		if abono_capital > saldo_inicial:
			abono_capital = saldo_inicial
			cuota = interes + abono_capital

		saldo_final = saldo_inicial - abono_capital

		tabla.append(
			{
				"mes": mes,
				"saldo_inicial": saldo_inicial,
				"interes": interes,
				"cuota": cuota,
				"abono_capital": abono_capital,
				"saldo_final": saldo_final,
			}
		)

		saldo_actual = saldo_final
		if saldo_actual <= 1e-10:
			break

	return tabla


# ======================
# 2. FUNCIONES DE VISUALIZACION
# ======================

def mostrar_tabla(tabla, titulo):
	"""
	Entrada: tabla (lista de diccionarios), titulo (string)
	Salida: imprime tabla formateada en consola
	"""
	if not tabla:
		print("No hay datos para mostrar.")
		return

	print()
	print(titulo)
	print("-" * 86)
	encabezado = (
		f"{'MES':<5}"
		f"{'SALDO INICIAL':>16}"
		f"{'INTERES':>12}"
		f"{'CUOTA':>12}"
		f"{'ABONO CAPITAL':>16}"
		f"{'SALDO FINAL':>14}"
	)
	print(encabezado)
	print("-" * 86)

	for fila in tabla:
		print(
			f"{fila['mes']:<5}"
			f"{fila['saldo_inicial']:>16.2f}"
			f"{fila['interes']:>12.2f}"
			f"{fila['cuota']:>12.2f}"
			f"{fila['abono_capital']:>16.2f}"
			f"{fila['saldo_final']:>14.2f}"
		)

	print("-" * 86)


def mostrar_resumen(total_pagado, total_intereses, capital_inicial):
	"""
	Entrada: total_pagado, total_intereses, capital_inicial
	Salida: imprime resumen con totales
	"""
	print()
	print("RESUMEN")
	print("-" * 40)
	print(f"Capital inicial  : {capital_inicial:>15.2f}")
	print(f"Total pagado     : {total_pagado:>15.2f}")
	print(f"Intereses totales: {total_intereses:>15.2f}")
	print("-" * 40)


def mostrar_comparacion_simple_compuesto(capital, tasa, plazo):
	"""
	Entrada: capital, tasa, plazo
	Salida: imprime comparacion lado a lado
	"""
	monto_simple, intereses_simple = calcular_interes_simple_pago_unico(capital, tasa, plazo)
	monto_compuesto, intereses_compuesto = calcular_interes_compuesto_pago_unico(capital, tasa, plazo)

	print()
	print("COMPARACION: INTERES SIMPLE VS COMPUESTO")
	print("-" * 78)
	print(f"{'METODO':<20}{'MONTO FINAL':>18}{'INTERESES':>18}{'DIFERENCIA':>14}")
	print("-" * 78)
	diferencia = monto_compuesto - monto_simple
	print(f"{'Simple':<20}{monto_simple:>18.2f}{intereses_simple:>18.2f}{0.00:>14.2f}")
	print(f"{'Compuesto':<20}{monto_compuesto:>18.2f}{intereses_compuesto:>18.2f}{diferencia:>14.2f}")
	print("-" * 78)
	print(f"Diferencia en monto final (compuesto - simple): {diferencia:.2f}")


# ======================
# 3. FUNCIONES DE VALIDACION Y ENTRADA
# ======================

def validar_positivo(valor, nombre_campo):
	"""
	Entrada: valor (string o numero), nombre_campo (string)
	Salida: float si es valido, None si no
	"""
	try:
		numero = float(valor)
	except (TypeError, ValueError):
		print(f"Error: {nombre_campo} debe ser numerico.")
		return None

	if numero <= 0:
		print(f"Error: {nombre_campo} debe ser mayor que 0.")
		return None

	return numero


def validar_tasa(valor, nombre_campo=None):
	"""
	Entrada: valor (string o numero)
	Salida: float si esta entre 0 y 100, None si no
	"""
	try:
		numero = float(valor)
	except (TypeError, ValueError):
		print("Error: la tasa debe ser numerica.")
		return None

	if numero < 0 or numero > 100:
		print("Error: la tasa debe estar entre 0 y 100.")
		return None

	return numero


def validar_entero_positivo(valor, nombre_campo):
	"""Valida que el valor sea un entero positivo."""
	try:
		numero = int(valor)
	except (TypeError, ValueError):
		print(f"Error: {nombre_campo} debe ser un entero numerico.")
		return None

	if numero <= 0:
		print(f"Error: {nombre_campo} debe ser mayor que 0.")
		return None

	return numero


def obtener_entrada_float(mensaje, validacion_func, nombre_campo):
	"""
	Entrada: mensaje (string), funcion_validacion, nombre_campo
	Salida: float valido (loop hasta que sea correcto)
	"""
	while True:
		valor = input(mensaje)
		numero = validacion_func(valor, nombre_campo) if nombre_campo else validacion_func(valor)
		if numero is not None:
			return numero


def obtener_datos_iniciales():
	"""
	Salida: (capital, tasa, plazo) todos float positivo
	Solicita capital, tasa y plazo al usuario con validaciones
	"""
	capital = obtener_entrada_float("Ingrese el capital inicial: ", validar_positivo, "Capital")
	tasa = obtener_entrada_float("Ingrese la tasa de interes mensual (%): ", validar_tasa, "Tasa")

	while True:
		plazo_input = input("Ingrese el plazo en meses (entero): ")
		plazo = validar_entero_positivo(plazo_input, "Plazo")
		if plazo is not None:
			return capital, tasa, plazo


def obtener_cuota_manual_o_calculada(capital, tasa, plazo):
	"""Solicita cuota manual opcional o usa la cuota calculada por formula."""
	cuota_calculada = calcular_cuota_fija_compuesto(capital, tasa, plazo)
	print()
	print(f"Cuota fija calculada por formula: {cuota_calculada:.2f}")
	respuesta = input("Presione Enter para usarla o ingrese una cuota manual: ").strip()

	if respuesta == "":
		return cuota_calculada

	while True:
		cuota_manual = validar_positivo(respuesta, "Cuota manual")
		if cuota_manual is not None:
			interes_primer_periodo = capital * (tasa / 100)
			if cuota_manual < interes_primer_periodo:
				print(
					f"Error: la cuota manual debe cubrir al menos los intereses del primer periodo ({interes_primer_periodo:.2f})."
				)
				respuesta = input("Ingrese una cuota manual valida o presione Enter para usar la cuota calculada: ").strip()
				if respuesta == "":
					return cuota_calculada
				continue
			return cuota_manual

		respuesta = input("Ingrese una cuota manual valida o presione Enter para usar la cuota calculada: ").strip()
		if respuesta == "":
			return cuota_calculada


# ======================
# 4. OPCIONES DEL MENU
# ======================

def opcion_pago_unico_simple():
	"""Flujo completo para opcion 1"""
	print()
	print("OPCION 1 - INTERES SIMPLE (PAGO UNICO AL FINAL)")
	capital, tasa, plazo = obtener_datos_iniciales()
	monto_final, intereses_totales = calcular_interes_simple_pago_unico(capital, tasa, plazo)
	total_pagado = monto_final

	print()
	print(f"Monto final      : {monto_final:.2f}")
	print(f"Intereses pagados: {intereses_totales:.2f}")
	mostrar_resumen(total_pagado, intereses_totales, capital)


def opcion_pago_unico_compuesto():
	"""Flujo completo para opcion 2"""
	print()
	print("OPCION 2 - INTERES COMPUESTO (PAGO UNICO AL FINAL)")
	capital, tasa, plazo = obtener_datos_iniciales()
	monto_final, intereses_totales = calcular_interes_compuesto_pago_unico(capital, tasa, plazo)
	total_pagado = monto_final

	print()
	print(f"Monto final      : {monto_final:.2f}")
	print(f"Intereses pagados: {intereses_totales:.2f}")
	mostrar_resumen(total_pagado, intereses_totales, capital)


def opcion_cuota_fija_compuesto():
	"""Flujo completo para opcion 3"""
	print()
	print("OPCION 3 - INTERES COMPUESTO CON CUOTA FIJA MENSUAL")
	capital, tasa, plazo = obtener_datos_iniciales()
	cuota_fija = obtener_cuota_manual_o_calculada(capital, tasa, plazo)
	tabla = generar_tabla_amortizacion_compuesto(capital, tasa, plazo, cuota_fija)
	mostrar_tabla(tabla, "TABLA DE AMORTIZACION - INTERES COMPUESTO")

	total_pagado = sum(fila["cuota"] for fila in tabla)
	total_intereses = sum(fila["interes"] for fila in tabla)
	mostrar_resumen(total_pagado, total_intereses, capital)


def opcion_comparar():
	"""Flujo completo para opcion 4"""
	print()
	print("OPCION 4 - COMPARAR SIMPLE VS COMPUESTO")
	capital, tasa, plazo = obtener_datos_iniciales()
	mostrar_comparacion_simple_compuesto(capital, tasa, plazo)


# ======================
# 5. MENU PRINCIPAL
# ======================

def mostrar_menu():
	"""
	Muestra:
	================================================
	CALCULADORA DE INTERES - INGENIERIA ECONOMICA
	================================================
	1. Interes simple - Pago unico al final
	2. Interes compuesto - Pago unico al final
	3. Interes compuesto - Cuota fija mensual
	4. Comparar simple vs compuesto (pago unico)
	5. Salir
	------------------------------------------------
	"""
	print()
	print("=" * 48)
	print("CALCULADORA DE INTERES - INGENIERIA ECONOMICA")
	print("=" * 48)
	print("1. Interes simple - Pago unico al final")
	print("2. Interes compuesto - Pago unico al final")
	print("3. Interes compuesto - Cuota fija mensual")
	print("4. Comparar simple vs compuesto (pago unico)")
	print("5. Salir")
	print("-" * 48)


def main():
	"""
	Bucle principal:
		mostrar_menu()
		leer opcion del usuario
		ejecutar funcion correspondiente
		si opcion == 5: break
		pausar antes de volver al menu (input("Presione Enter..."))
	"""
	while True:
		mostrar_menu()
		opcion = input("Seleccione una opcion (1-5): ").strip()

		if opcion == "1":
			opcion_pago_unico_simple()
		elif opcion == "2":
			opcion_pago_unico_compuesto()
		elif opcion == "3":
			opcion_cuota_fija_compuesto()
		elif opcion == "4":
			opcion_comparar()
		elif opcion == "5":
			print("Saliendo del programa...")
			break
		else:
			print("Opcion invalida. Intente de nuevo.")

		input("\nPresione Enter para volver al menu...")


# ======================
# 6. PUNTO DE ENTRADA
# ======================

if __name__ == "__main__":
	main()
