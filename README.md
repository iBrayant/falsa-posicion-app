# Método de la Falsa Posición

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)
![Licencia](https://img.shields.io/badge/licencia-MIT-green)

Calculadora web del **método de la falsa posición** (*regula falsi*) para encontrar raíces de ecuaciones. Escribes la función `f(x)`, el intervalo `[a, b]`, la tolerancia y el máximo de iteraciones, y la app muestra la raíz aproximada, la tabla de iteraciones y la gráfica de la función.

> Proyecto académico — Ingeniería de Sistemas y Computación, Universidad de Cundinamarca.

<!-- TODO: captura o GIF de la app (guardar en docs/img/) -->
<!-- ![Demo](docs/img/demo.png) -->
<!-- TODO: enlace a la demo desplegada en Vercel -->

## Características

- **Entrada flexible:** cualquier expresión que entienda [math.js](https://mathjs.org/) (por ejemplo `x^3 - x - 1`, `cos(x) - x`, `exp(x) - 3`).
- **Vista previa en LaTeX** de la función mientras se escribe, renderizada con KaTeX.
- **Tabla de iteraciones** con `a`, `b`, `x_i` y `f(x_i)` de cada paso.
- **Gráfica de la función** con la raíz encontrada.
- **Validación del intervalo:** verifica que `f(a)` y `f(b)` tengan signos opuestos (teorema de Bolzano) y evita la división por cero.
- **Manejo de errores:** avisa si la sintaxis es inválida o no se alcanza la tolerancia en el máximo de iteraciones.
- **Lógica separada de la interfaz:** el algoritmo vive en `src/math/falsaPosicion.ts`, comentado paso a paso.

## El método

Es un método cerrado: necesita un intervalo `[a, b]` donde `f(a)` y `f(b)` tengan signos opuestos. En cada iteración se traza la recta entre `(a, f(a))` y `(b, f(b))` y se toma el punto donde cruza el eje X:

```
x_i = (a · f(b) − b · f(a)) / (f(b) − f(a))
```

Luego el intervalo se reduce al subintervalo donde sigue habiendo cambio de signo. La iteración se detiene cuando `|f(x_i)|` es menor que la tolerancia o se alcanza el máximo de iteraciones.

## Stack

Next.js (App Router) · React · TypeScript · Tailwind CSS · math.js · KaTeX · Recharts · Lucide

## Estructura

```
src/
├── app/page.tsx            -> interfaz: formulario, tabla y gráfica
└── math/falsaPosicion.ts   -> algoritmo de falsa posición (sin dependencias de React)
```

## Cómo correrlo

```bash
npm install
npm run dev
```

Abre http://localhost:3000. Para compilar: `npm run build && npm start`.

## Ejemplo

Con `f(x) = x^3 − x − 1`, intervalo `[1, 2]`, tolerancia `0.001` y 50 iteraciones, el método converge en 9 iteraciones a `x ≈ 1.3245` (la raíz real es 1.3247).

## Autor

**Brayant Vásquez Gómez** · [GitHub](https://github.com/iBrayant) · [LinkedIn](https://www.linkedin.com/in/brayant-v%C3%A1squez-g%C3%B3mez-4b483a1a1)

Licencia [MIT](LICENSE).
