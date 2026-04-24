#considerando la siguiente lista

a = [5, 1, 4, 9, 0]
b = list(range(3, 10)) + list(range(20, 23))
c = [[1, 2], [3, 4, 5], [6, 7]]
d = ['perro', 'gato', 'jirafa', 'elefante']
e = ['a', a, 2 * a]

#¿Qué valor devuelve cada una de las siguientes expresiones?

01.   a[2]
02.   b[9]
03.   c[1][2]
04.   e[0] == e[1]
05.   len(c)
06.   len(c[0])
07.   len(e)
08.   c[-1]
09.   c[-1][+1]
10.   c[2:] + d[2:]
11.   a[3:10]
12.   a[3:10:2]
13.   d.index('jirafa')
14.   e[c[0][1]].count(5)
15.   sorted(a)[2]
16.   complex(b[0], b[1])

01. a[2] → 4
Indice 2 de [5, 1, 4, 9, 0] → tercer elemento → 4

02. b[9] → 22
b = [3,4,5,6,7,8,9,20,21,22] → indice 9 → 22

03. c[1][2] → 5
c[1] = [3,4,5] → indice 2 → 5

04. e[0] == e[1] → False
e[0] = 'a' y e[1] = [5,1,4,9,0] → distintos → False

05. len(c) → 3
Hay 3 sublistas

06. len(c[0]) → 2
[1,2] tiene 2 elementos

07. len(e) → 3
['a', a, 2*a] → 3 elementos

08. c[-1] → [6, 7]
-1 = ultimo elemento

09. c[-1][+1] → 7
Ultima lista [6,7] → indice 1 → 7

10. c[2:] + d[2:] → [[6, 7], 'jirafa', 'elefante']
    c[2:] → [[6,7]]
    d[2:] → ['jirafa','elefante']
    Se concatenan

11. a[3:10] → [9, 0]
Desde indice 3 hasta el final (aunque pida 10)

12. a[3:10:2] → [9]
Desde indice 3, saltando de 2 en 2 → solo alcanza 9

13. d.index('jirafa') → 2
Posicion de 'jirafa'

14. e[c[0][1]].count(5) → 2
Paso a paso:
    c[0] = [1,2]
    c[0][1] = 2
    e[2] = 2*a = [5,1,4,9,0,5,1,4,9,0]
.count(5) → aparece 2 veces

15. sorted(a)[2] → 4  
Ordena: [0,1,4,5,9] → indice 2 → 4

16. complex(b[0], b[1]) → (3+4j)  
b[0]=3, b[1]=4 → numero complejo