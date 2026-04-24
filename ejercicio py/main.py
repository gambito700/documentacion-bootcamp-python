
# Ejercicios en clase . py

"""frutas = ["manzana", "banana", "naranja", "pera", ["auto", "bicicleta", "moto",[1,2,3,4,5]]]


frutas.count
frutas.append("banana")
frutas.remove("naranja")

print(frutas)

personas = ["cristian", "maria", "juan", "ana", "luis"]
for i in personas:
        print(i) 
"""

alumnos = [] #lista vacia

while True:
    print("Menu___________")
    print("opcion 1")
    print("opcion 2")   
    print("opcion 3")
    print("opcion 4")
    opcion = input("Ingrese opcion (ctrl + c para salir) :")

    if opcion == "1":
        nombre = input("Ingrese el nomobre del alumno (ctrl + c para salir) :")
        alumnos.append(nombre)
        print(alumnos)
    elif opcion == "2":
        nombre = input("Ingrese el nomobre del alumno a eliminar (ctrl + c para salir) :")
        alumnos.remove(nombre)
        print(alumnos)
    else:
        break
   
print(alumnos)