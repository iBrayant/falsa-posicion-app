import { evaluate } from "mathjs";

export interface IterationData {
  n: number;
  a: number;
  b: number;
  x_i: number;
  fx_i: number;
}

export interface FalsaPosicionResult {
  rootFound: boolean;
  root: number | null;
  results: IterationData[];
  errorMsg: string;
}

/**
 * Módulo para calcular la raíz de una función usando el Método de la Falsa Posición.
 * 
 * Este método es cerrado, lo que significa que necesita un intervalo inicial [a, b] 
 * que encierre la raíz, es decir, f(a) y f(b) deben tener signos opuestos.
 */
export function calculateFalsaPosicion(
  funcString: string,
  valA: number,
  valB: number,
  tolerance: number,
  maxIter: number
): FalsaPosicionResult {
  
  const iterData: IterationData[] = [];
  let rootFound = false;
  let root: number | null = null;
  let errorMsg = "";

  try {
    // 1. Conversión de la función matemática a ejecutable
    const f = (x: number) => evaluate(funcString, { x });

    let a = valA;
    let b = valB;
    let f_a = f(a);
    let f_b = f(b);

    // 2. Validación inicial del Teorema de Bolzano:
    // Para que el método converja, debe haber un cambio de signo en el intervalo inicial.
    if (f_a * f_b >= 0) {
      throw new Error("Intervalo inválido: f(a) y f(b) deben tener signos opuestos.");
    }

    let iter = 0;
    let x_i = 0;
    let f_xi = 0;

    // 3. Ciclo de iteraciones (hasta encontrar raíz o llegar al máximo de iteraciones)
    while (iter < maxIter) {
      iter++;
      
      // Calculamos el denominador para la fórmula de Falsa Posición
      const denominator = f_b - f_a;
      
      // Evitamos división por cero si la función se vuelve horizontal
      if (Math.abs(denominator) < 1e-15) {
        throw new Error("División por cero en el cálculo de X_i.");
      }

      // ----------------------------------------------------------------------
      // PASO CLAVE 1: Fórmula de la Falsa Posición
      // ----------------------------------------------------------------------
      // Se traza una línea recta entre (a, f(a)) y (b, f(b)) y se calcula dónde 
      // cruza el eje X. Esa será nuestra nueva aproximación x_i.
      // 
      // X_i = (a * f(b) - b * f(a)) / (f(b) - f(a))
      // ----------------------------------------------------------------------
      x_i = (a * f_b - b * f_a) / denominator;
      
      // Evaluamos el nuevo punto en la función
      f_xi = f(x_i);

      // Guardamos los datos de esta iteración
      iterData.push({
        n: iter,
        a: a,
        b: b,
        x_i: x_i,
        fx_i: f_xi,
      });

      // ----------------------------------------------------------------------
      // PASO CLAVE 2: Criterios de Parada
      // ----------------------------------------------------------------------
      // Comprobamos si ya estamos lo suficientemente cerca de la raíz exacta.
      // Si la evaluación en la función da cero exacto, o un valor menor a la tolerancia.
      if (Math.abs(f_xi) === 0 || Math.abs(f_xi) < tolerance) {
        rootFound = true;
        break; // Detenemos la búsqueda exitosamente
      }

      // ----------------------------------------------------------------------
      // PASO CLAVE 3: Actualización del intervalo (Subintervalo de búsqueda)
      // ----------------------------------------------------------------------
      // Determinamos en qué mitad del intervalo quedó encerrada la raíz comprobando
      // los signos. Multiplicar las evaluaciones nos dice si tienen signos diferentes (< 0)
      if (f_a * f_xi < 0) {
        // La raíz está en la mitad izquierda, entre 'a' y 'x_i'.
        // Movemos el límite superior ('b') a la posición actual.
        b = x_i;
        f_b = f_xi; 
      } else {
        // La raíz está en la mitad derecha, entre 'x_i' y 'b'.
        // Movemos el límite inferior ('a') a la posición actual.
        a = x_i;
        f_a = f_xi;
      }
    }

    // 4. Conclusión del método
    if (rootFound) {
      root = x_i;
    } else {
      errorMsg = "El método no alcanzó la tolerancia en el número máximo de iteraciones.";
    }

  } catch (err: any) {
    errorMsg = err.message || "Error al evaluar la función matemática.";
  }

  return {
    rootFound,
    root,
    results: iterData,
    errorMsg
  };
}
