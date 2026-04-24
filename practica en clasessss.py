#durante clase se enseño como crear una caja de diccionario
"""
alumnos = []

while True:
    print("----------------menu---------------------")
    print("1. Agregar alumno")
    print("2. Mostrar alumnos")
    print("3. Salir")
    opcion = input("Seleccione una opción: ")
    if opcion == "1":
        nombre = input("Ingrese el nombre del alumno: ")
        edad = input("Ingrese la edad del alumno: ")
        alumno = {
            "nombre": nombre,
            "edad": edad
        }
        alumnos.append(alumno)
        print("Alumno agregado exitosamente.")
    elif opcion == "2":
        print("------------ Lista de alumnos ------------")
        for alumno in alumnos:
            print(alumno["nombre"], "--", alumno["edad"])
    elif opcion == "3":
        print("¡Hasta luego!")
        break
    else:
        print("opcion no valida.")
        break 
        """
#ejercicio de clase

#diccionario con peliculas similar al anterior
peliculas = []
