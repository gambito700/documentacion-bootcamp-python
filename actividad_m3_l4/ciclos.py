# 1. Uso basico de while
# Este ciclo imprime numeros del 1 al 5.
# Se controla con una variable que aumenta hasta cumplir la condicion.

contador = 1
while contador <= 5:
    print(contador)
    contador += 1


# 2. Uso basico de for
# Recorre una lista de frutas e imprime cada una.

frutas = ["manzana", "platano", "naranja"]

for fruta in frutas:
    print(fruta)


# 3. Condicion en un ciclo
# Recorre numeros del 1 al 10 y evalua si son pares o impares.

for numero in range(1, 11):
    if numero % 2 == 0:
        print(numero, "Par")
    else:
        print(numero, "Impar")


# 4. Ciclo infinito controlado con break
# Solicita numeros hasta que el usuario ingrese 0.

while True:
    numero = int(input("Ingresa un numero (0 para salir): "))
    if numero == 0:
        break


# 5. Ciclo anidado
# Imprime tablas de multiplicar del 1 al 3.

for i in range(1, 4):
    for j in range(1, 11):
        print(i, "x", j, "=", i * j)
    print("---")


# 6. Uso de continue
# Recorre nombres y omite "Juan".

nombres = ["Ana", "Juan", "Pedro", "Maria"]

for nombre in nombres:
    if nombre == "Juan":
        continue
    print(nombre)