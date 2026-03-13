# CONTROL DE FLUJO: CONDICIONALES

> Autor:  Karen Nanco Vásquez
> Fecha: 10 de marzo de 2026 
> Issue relacionada: #  8

---

## 📘 Definición

Las condicionales son estructuras que permiten que un programa tome decisiones. Imagina que el código llega a una bifurcación en el camino: basándose en si una afirmación es verdadera ($true$) o falsa ($false$), el programa elegirá avanzar por una ruta o por otra.Sin condicionales, el código siempre se ejecutaría en orden lineal, de arriba hacia abajo, sin poder adaptarse a diferentes situaciones.


## 🧠 ¿Para qué sirve?

Sirven para controlar la lógica de una aplicación. Son fundamentales porque permiten:
1.**Validar datos:** Por ejemplo, verificar si una contraseña es correcta antes de permitir el acceso.
2. **Personalizar la experiencia:** Mostrar un mensaje de "Bienvenido" solo si el usuario ha iniciado sesión.
3. **Manejar errores:** Ejecutar una acción alternativa si algo sale mal.
4. **Ramificar procesos:** Decidir qué cálculo matemático realizar según la entrada del usuario.

*Para mayor información, se sugiere revisar:* [El libro de Python](https://ellibrodepython.com/palabras-reservadas-python#condicionales-if-elif-else)


## 🧩 Sintaxis
A diferencia de otros lenguajes, Python utiliza los dos puntos (:) y la indentación (espacios o tabulaciones) para definir qué código pertenece a la condicional. Además, usa la palabra clave elif en lugar de else if.

if condicion:
    # Este bloque se ejecuta si la condición es verdadera
    print("Condición cumplida")
elif otra_condicion:
    # Se ejecuta si la primera falló, pero esta es verdadera
    print("Segunda opción cumplida")
else:
    # Se ejecuta si ninguna de las anteriores fue verdadera
    print("Nada se cumplió")

```python
# ejemplo básico de sintaxis

    temperatura = 25

if temperatura > 30:
    print("Hace mucho calor.")
elif temperatura >= 20:
    print("El clima está agradable.")
else:
    print("Hace frío.")