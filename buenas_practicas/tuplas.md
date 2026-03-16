## TUPLAS
Autor: Karen Ñanco Vásquez  
Fecha: 16-03-2026
Issue relacionada: #16

📘 Definición
Una tupla es una estructura de datos que permite almacenar una colección de elementos de forma ordenada.

A diferencia de las listas, las tuplas son inmutables. Esto significa que, una vez que la creas, no puedes cambiar, añadir ni eliminar sus elementos. Imagínalas como una "fotografía" de datos que debe permanecer intacta.

🧠 ¿Para qué sirve?
Las tuplas son fundamentales en el desarrollo de software por tres razones principales:

1. Integridad de los datos: Al ser inmutables, te aseguras de que valores críticos (como las coordenadas de un mapa o los colores RGB) no sean modificados accidentalmente por otra parte del código.

2. Rendimiento: Al ser más simples que las listas, ocupan menos espacio en memoria y el procesador las maneja de forma más rápida.

3. Uso como llaves: En lenguajes como Python, puedes usar una tupla como clave en un diccionario, algo que no puedes hacer con una lista.

¿Cuándo usarlas? Úsalas cuando sepas que el orden y el contenido de los datos no deben cambiar durante la ejecución del programa.

🧩 Sintaxis
# Ejemplo básico de sintaxis en Python

# 1. Creación de una tupla
punto_geografico = (10.5, -66.9)

# 2. Acceso a los elementos (igual que las listas, empieza en 0)
latitud = punto_geografico[0]

# 3. Intento de modificación (Esto daría ERROR)
# punto_geografico[0] = 11.0  # TypeError: 'tuple' object does not support item assignment

print(f"La latitud es: {latitud}")