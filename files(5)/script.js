/**
 * script.js — Tienda Demo
 * ============================================================
 * Organización del código (en orden):
 *
 *   1. Cart      → toda la lógica de datos del carrito
 *   2. UI        → todo lo que toca el DOM (render, toasts, filtros)
 *   3. Theme     → dark / light mode con persistencia
 *   4. DevPanel  → panel oculto de configuración (Ctrl+Shift+D)
 *   5. Init      → arranque cuando el DOM está listo
 *
 * REGLA: ningún módulo toca directamente el DOM de otro módulo.
 * ============================================================
 */


/* ============================================================
   1. CART — Lógica de datos del carrito
   ============================================================
   El carrito es un array de objetos guardado en localStorage:
   [{ id, titulo, precio, precioNum, cantidad }, ...]

   Para extender: agrega métodos al objeto que retorna el módulo.
   ============================================================ */
const Cart = (() => {

  // Clave en localStorage — cámbiala si necesitas un namespace distinto
  const KEY = "tienda_carrito";

  // ─── Persistencia ───────────────────────────────────────────

  /**
   * Lee el carrito desde localStorage.
   * Si no existe o está corrupto, retorna array vacío.
   */
  function load() {
    try {
      return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
      return [];
    }
  }

  /**
   * Guarda el carrito en localStorage.
   * @param {Array} carrito
   */
  function save(carrito) {
    localStorage.setItem(KEY, JSON.stringify(carrito));
  }

  // ─── Lectura ────────────────────────────────────────────────

  /** Retorna todos los productos del carrito */
  function getAll() {
    return load();
  }

  /**
   * Cuenta cuántos ítems hay en total (suma de cantidades).
   * @returns {number}
   */
  function getItemCount() {
    return load().reduce((total, item) => total + item.cantidad, 0);
  }

  /**
   * Calcula el total monetario del carrito.
   * Usa precioNum (número limpio) guardado al agregar el producto.
   * @returns {number}
   */
  function getCartTotal() {
    return load().reduce((total, item) => total + item.precioNum * item.cantidad, 0);
  }

  // ─── Escritura ──────────────────────────────────────────────

  /**
   * Agrega un producto al carrito.
   *
   * Lógica de duplicados:
   *   - Si el producto ya existe (mismo título) → aumenta cantidad en 1
   *   - Si no existe → lo agrega con cantidad 1
   *
   * @param {Object} producto - { titulo: string, precio: string }
   * @returns {boolean} true si es nuevo, false si era duplicado
   */
  function addToCart(producto) {
    const carrito = load();

    // Buscar si ya existe un producto con el mismo título
    const existente = carrito.find(item => item.titulo === producto.titulo);

    if (existente) {
      // Ya existe → solo incrementar la cantidad
      existente.cantidad += 1;
      save(carrito);
      return false;  // era duplicado
    }

    // No existe → agregar como nuevo
    carrito.push({
      id:        Date.now(),                    // ID único basado en timestamp
      titulo:    producto.titulo,
      precio:    producto.precio,               // String formateado para mostrar
      precioNum: parsePrecio(producto.precio),  // Número para calcular total
      cantidad:  1
    });

    save(carrito);
    return true;  // era nuevo
  }

  /**
   * Elimina un producto del carrito por su ID.
   * @param {number} id
   */
  function removeFromCart(id) {
    const carrito = load().filter(item => item.id !== id);
    save(carrito);
  }

  /**
   * Modifica la cantidad de un producto.
   * Si la cantidad resultante es 0 o menor → lo elimina del carrito.
   *
   * @param {number} id    - ID del producto
   * @param {number} delta - Cuánto cambiar (+1 o -1)
   */
  function updateQuantity(id, delta) {
    const carrito = load();
    const item = carrito.find(p => p.id === id);
    if (!item) return;

    item.cantidad += delta;

    if (item.cantidad <= 0) {
      // Cuando llega a 0 se elimina directamente
      save(carrito.filter(p => p.id !== id));
    } else {
      save(carrito);
    }
  }

  /** Vacía el carrito completamente */
  function clearCart() {
    save([]);
  }

  // ─── Utilidades ─────────────────────────────────────────────

  /**
   * Convierte un precio formateado como string a número.
   * Ejemplos: "$89.000" → 89000 | "$1.200.000" → 1200000
   * Para otros formatos de precio, ajusta este regex.
   *
   * @param {string} str
   * @returns {number}
   */
  function parsePrecio(str) {
    // Quitar "$" y puntos de miles, dejar solo dígitos y coma/punto decimal
    const limpio = str.replace(/[$.]/g, "").replace(",", ".");
    return parseFloat(limpio) || 0;
  }

  /**
   * Formatea un número como precio en pesos chilenos.
   * Ejemplo: 89000 → "$89.000"
   * Para cambiar el formato, modifica aquí.
   *
   * @param {number} valor
   * @returns {string}
   */
  function formatPrice(valor) {
    return "$" + Math.round(valor).toLocaleString("es-CL");
  }

  // API pública del módulo
  return { getAll, getItemCount, getCartTotal, addToCart, removeFromCart, updateQuantity, clearCart, formatPrice };

})();


/* ============================================================
   2. UI — Interacción con el DOM
   ============================================================
   Renderiza el carrito, actualiza el badge, muestra toasts
   y filtra los productos. No contiene lógica de negocio.
   ============================================================ */
const UI = (() => {

  // ─── Badge del carrito en la navbar ─────────────────────────

  /**
   * Actualiza el número que aparece junto al enlace "Carrito".
   * Llama a este método cada vez que el carrito cambia.
   */
  function updateCounter() {
    const badges = document.querySelectorAll("#contador");
    const count = Cart.getItemCount();

    badges.forEach(badge => {
      badge.textContent = count;
      // Animar el badge con un pulso
      badge.classList.remove("pulse");
      void badge.offsetWidth;  // forzar reflow para reiniciar la animación
      badge.classList.add("pulse");
    });
  }

  // ─── Toast (notificación flotante) ──────────────────────────

  /**
   * Muestra una notificación breve en la esquina inferior derecha.
   * Se crea y destruye automáticamente en 2.5s.
   *
   * @param {string} mensaje
   */
  function showToast(mensaje) {
    // Crear el contenedor si no existe todavía en el DOM
    let container = document.querySelector(".toast-container");
    if (!container) {
      container = document.createElement("div");
      container.className = "toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = "toast-item";
    toast.textContent = mensaje;
    container.appendChild(toast);

    // Eliminar el toast después de que termine su animación
    setTimeout(() => toast.remove(), 2500);
  }

  // ─── Buscador ───────────────────────────────────────────────

  /**
   * Filtra los productos del grid según el texto del input #inputBusqueda.
   *
   * Compara contra:
   *   - El atributo data-producto del contenedor
   *   - El texto del .card-title
   *
   * Para agregar más campos de búsqueda, agrega más condiciones en `coincide`.
   */
  function filtrarProductos() {
    const input = document.querySelector("#inputBusqueda");
    if (!input) return;

    const busqueda = input.value.toLowerCase().trim();
    const productos = document.querySelectorAll(".producto");
    let hayResultados = false;

    productos.forEach(prod => {
      const atributo = (prod.getAttribute("data-producto") || "").toLowerCase();
      const titulo   = (prod.querySelector(".card-title")?.textContent || "").toLowerCase();
      const coincide = atributo.includes(busqueda) || titulo.includes(busqueda);

      prod.style.display = coincide ? "" : "none";
      if (coincide) hayResultados = true;
    });

    // Mostrar / ocultar mensaje "sin resultados"
    let noResults = document.querySelector("#sinResultados");
    if (!hayResultados && busqueda !== "") {
      if (!noResults) {
        noResults = document.createElement("p");
        noResults.id = "sinResultados";
        noResults.style.cssText = "color:var(--text-muted);text-align:center;margin-top:2rem;grid-column:1/-1;";
        noResults.textContent = "No se encontraron productos para \"" + input.value + "\"";
        document.querySelector("#productosContainer")?.appendChild(noResults);
      } else {
        noResults.textContent = "No se encontraron productos para \"" + input.value + "\"";
      }
    } else if (noResults) {
      noResults.remove();
    }
  }

  // ─── Renderizado del carrito ─────────────────────────────────

  /**
   * Construye y muestra toda la tabla del carrito en cart.html.
   *
   * Lee el carrito desde Cart.getAll() y genera el HTML de cada fila.
   * También actualiza el total y el contador de ítems del resumen.
   *
   * Para cambiar cómo se ve una fila, edita el template dentro del .map().
   */
  function renderCart() {
    const tbody       = document.querySelector("#bodyCarrito");
    const totalEl     = document.querySelector("#totalMonto");
    const itemsEl     = document.querySelector("#contadorItems");

    if (!tbody) return;  // No estamos en cart.html

    const carrito = Cart.getAll();

    if (carrito.length === 0) {
      // Estado vacío
      tbody.innerHTML = `
        <tr>
          <td colspan="5">
            <div class="cart-empty">
              <span class="icon">🛒</span>
              <p>Tu carrito está vacío</p>
              <small>Agrega productos desde la tienda</small>
            </div>
          </td>
        </tr>`;
    } else {
      // Construir una fila por producto
      tbody.innerHTML = carrito.map(item => {
        const subtotal = Cart.formatPrice(item.precioNum * item.cantidad);
        return `
          <tr>
            <td class="cart-item-name">${item.titulo}</td>
            <td class="cart-item-price">${item.precio}</td>
            <td>
              <div class="qty-control">
                <button class="qty-btn" onclick="UI.changeQuantity(${item.id}, -1)" title="Disminuir">−</button>
                <span class="qty-value">${item.cantidad}</span>
                <button class="qty-btn" onclick="UI.changeQuantity(${item.id}, 1)" title="Aumentar">+</button>
              </div>
            </td>
            <td class="cart-item-sub">${subtotal}</td>
            <td>
              <button class="btn-peligro" onclick="UI.removeItem(${item.id})">Eliminar</button>
            </td>
          </tr>`;
      }).join("");
    }

    // Actualizar total monetario en el panel de resumen
    if (totalEl) totalEl.textContent = Cart.formatPrice(Cart.getCartTotal());

    // Actualizar contador de ítems en el panel de resumen
    if (itemsEl) itemsEl.textContent = Cart.getItemCount();

    // Actualizar el badge de la navbar
    updateCounter();
  }

  // ─── Acciones del carrito (llamadas desde onclick en el HTML) ─

  /**
   * Elimina un producto y re-renderiza el carrito.
   * @param {number} id
   */
  function removeItem(id) {
    Cart.removeFromCart(id);
    renderCart();
  }

  /**
   * Cambia la cantidad de un producto y re-renderiza.
   * @param {number} id
   * @param {number} delta  +1 o -1
   */
  function changeQuantity(id, delta) {
    Cart.updateQuantity(id, delta);
    renderCart();
  }

  // API pública — las funciones onclick en el HTML necesitan acceso a removeItem y changeQuantity
  return { updateCounter, showToast, filtrarProductos, renderCart, removeItem, changeQuantity };

})();


/* ============================================================
   3. THEME — Dark / Light mode
   ============================================================
   Usa data-theme="light" en el <html> para el modo claro.
   El modo oscuro es el estado por defecto (sin atributo).

   La preferencia se guarda en localStorage con la clave "tienda_tema".
   ============================================================ */
const Theme = (() => {

  const KEY = "tienda_tema";

  /**
   * Aplica el tema al documento y actualiza el texto del botón.
   * @param {string} tema - "dark" | "light"
   */
  function apply(tema) {
    const html = document.documentElement;
    const btn  = document.querySelector("#themeToggle");

    if (tema === "light") {
      html.setAttribute("data-theme", "light");
      if (btn) {
        btn.innerHTML = "🌙 Oscuro";
        btn.title = "Cambiar a modo oscuro";
      }
    } else {
      html.removeAttribute("data-theme");
      if (btn) {
        btn.innerHTML = "☀️ Claro";
        btn.title = "Cambiar a modo claro";
      }
    }
  }

  /**
   * Alterna entre dark y light, guarda la preferencia y aplica.
   * Llamado por el onclick del botón #themeToggle.
   */
  function toggle() {
    const actual = localStorage.getItem(KEY) || "dark";
    const nuevo  = actual === "dark" ? "light" : "dark";
    localStorage.setItem(KEY, nuevo);
    apply(nuevo);
  }

  /**
   * Lee la preferencia guardada y aplica el tema al cargar la página.
   * Llamado en DOMContentLoaded.
   */
  function init() {
    const guardado = localStorage.getItem(KEY) || "dark";
    apply(guardado);
  }

  return { init, toggle };

})();


/* ============================================================
   4. DEV PANEL — Panel oculto de configuración
   ============================================================
   Activar: Ctrl + Shift + D (en cualquier página)
   Invisible para usuarios normales.

   Funcionalidades:
   - Cambiar colores del sitio en tiempo real
   - Ver el estado del carrito en JSON
   - Reiniciar colores a los valores por defecto

   Para agregar más controles, agrega nuevas .color-row en buildHTML().
   ============================================================ */
const DevPanel = (() => {

  // Variables CSS que se pueden editar desde el panel
  // Para agregar una variable: agrega un objeto { variable, label } a este array
  const COLORES = [
    { variable: "--bg-main",        label: "--bg-main"        },
    { variable: "--bg-secondary",   label: "--bg-secondary"   },
    { variable: "--bg-card",        label: "--bg-card"        },
    { variable: "--text-main",      label: "--text-main"      },
    { variable: "--text-secondary", label: "--text-secondary" },
    { variable: "--accent",         label: "--accent"         },
    { variable: "--success",        label: "--success"        },
    { variable: "--danger",         label: "--danger"         },
  ];

  /**
   * Crea e inyecta el HTML del panel en el body.
   * Solo se llama una vez al activar por primera vez.
   */
  function buildHTML() {
    const panel = document.createElement("div");
    panel.id = "devPanel";
    panel.innerHTML = `
      <h2>
        🛠 Dev Panel
        <button class="close-panel" onclick="DevPanel.toggle()" title="Cerrar">✕</button>
      </h2>

      <div class="dev-section">
        <h3>Colores en tiempo real</h3>
        ${COLORES.map(c => `
          <div class="color-row">
            <label>${c.label}</label>
            <input
              type="color"
              data-var="${c.variable}"
              oninput="DevPanel.setColor('${c.variable}', this.value)"
              title="${c.variable}"
            />
          </div>
        `).join("")}
        <button class="btn-secundario" style="margin-top:0.6rem;font-size:0.78rem;" onclick="DevPanel.resetColors()">
          ↺ Resetear colores
        </button>
      </div>

      <div class="dev-section">
        <h3>Estado del carrito</h3>
        <pre id="devCartLog">Cargando...</pre>
        <button class="btn-secundario" style="margin-top:0.5rem;font-size:0.78rem;" onclick="DevPanel.refreshLog()">
          ↻ Actualizar
        </button>
      </div>

      <div class="dev-section">
        <h3>Acciones rápidas</h3>
        <div style="display:flex;flex-direction:column;gap:0.4rem;">
          <button class="btn-peligro" style="width:100%" onclick="if(confirm('¿Vaciar carrito?')){Cart.clearCart();UI.renderCart();UI.updateCounter();DevPanel.refreshLog();}">
            🗑 Vaciar carrito
          </button>
          <button class="btn-secundario" style="width:100%" onclick="localStorage.clear();location.reload();">
            ⚠ Limpiar localStorage y recargar
          </button>
        </div>
      </div>
    `;

    // Overlay semitransparente detrás del panel
    const overlay = document.createElement("div");
    overlay.id = "devOverlay";
    overlay.onclick = () => toggle();

    document.body.appendChild(overlay);
    document.body.appendChild(panel);

    // Sincronizar los color pickers con los colores actuales del CSS
    syncPickers();
  }

  /**
   * Sincroniza los inputs de color con los valores actuales de las variables CSS.
   * Convierte rgb() a hex porque los color pickers solo aceptan hex.
   */
  function syncPickers() {
    COLORES.forEach(c => {
      const input = document.querySelector(`[data-var="${c.variable}"]`);
      if (!input) return;
      const valor = getComputedStyle(document.documentElement).getPropertyValue(c.variable).trim();
      // Intentar convertir a hex
      const hex = cssValueToHex(valor);
      if (hex) input.value = hex;
    });
  }

  /**
   * Convierte un color CSS (hex o rgb) a formato #rrggbb.
   * Los browsers retornan rgb() incluso cuando definiste hex.
   * @param {string} valor
   * @returns {string|null}
   */
  function cssValueToHex(valor) {
    if (!valor) return null;
    // Si ya es hex
    if (valor.startsWith("#")) {
      if (valor.length === 4) {
        return "#" + valor[1]+valor[1]+valor[2]+valor[2]+valor[3]+valor[3];
      }
      return valor;
    }
    // Si es rgb(r, g, b)
    const match = valor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (match) {
      return "#" + [match[1], match[2], match[3]]
        .map(n => parseInt(n).toString(16).padStart(2, "0"))
        .join("");
    }
    return null;
  }

  /** Indica si el panel está abierto */
  let isOpen = false;

  /**
   * Abre o cierra el panel.
   * Si es la primera vez que se abre, construye el HTML.
   */
  function toggle() {
    if (!document.querySelector("#devPanel")) {
      buildHTML();
    }

    isOpen = !isOpen;
    document.querySelector("#devPanel").classList.toggle("open", isOpen);
    document.querySelector("#devOverlay").classList.toggle("visible", isOpen);

    if (isOpen) refreshLog();
  }

  /**
   * Aplica un color a una variable CSS en tiempo real.
   * @param {string} variable  - Nombre de la variable (ej: "--accent")
   * @param {string} valor     - Valor hex (ej: "#4f7cff")
   */
  function setColor(variable, valor) {
    document.documentElement.style.setProperty(variable, valor);
  }

  /**
   * Resetea todos los colores eliminando los estilos inline del <html>.
   * Los valores vuelven a los definidos en :root de style.css.
   */
  function resetColors() {
    COLORES.forEach(c => {
      document.documentElement.style.removeProperty(c.variable);
    });
    syncPickers();
  }

  /**
   * Actualiza el log JSON del carrito en el panel.
   */
  function refreshLog() {
    const log = document.querySelector("#devCartLog");
    if (!log) return;
    const carrito = Cart.getAll();
    log.textContent = carrito.length === 0
      ? "// carrito vacío"
      : JSON.stringify(carrito, null, 2);
  }

  /**
   * Atajo de teclado: Ctrl + Shift + D
   * Registrado globalmente para cualquier página.
   */
  function registerShortcut() {
    document.addEventListener("keydown", function(e) {
      if (e.ctrlKey && e.shiftKey && e.key === "D") {
        e.preventDefault();
        toggle();
      }
    });
  }

  return { toggle, setColor, resetColors, refreshLog, registerShortcut };

})();


/* ============================================================
   5. INIT — Punto de entrada principal
   ============================================================
   Todo lo que debe ocurrir cuando el DOM está listo va aquí.
   ============================================================ */
document.addEventListener("DOMContentLoaded", function() {

  // ── Tema ──────────────────────────────────────────────────
  // Aplicar tema guardado (el script en el <head> ya evita el flash,
  // pero Theme.init() también actualiza el texto del botón toggle)
  Theme.init();

  // ── Navbar ────────────────────────────────────────────────
  // Mostrar el número correcto de productos en el badge del carrito
  UI.updateCounter();

  // ── Botón toggle de tema ──────────────────────────────────
  const btnTema = document.querySelector("#themeToggle");
  if (btnTema) {
    btnTema.addEventListener("click", Theme.toggle);
  }

  // ── Dev Panel ─────────────────────────────────────────────
  // Registrar atajo de teclado Ctrl+Shift+D para abrir el panel
  DevPanel.registerShortcut();


  // ════════════════════════════════════════════════════════════
  //  SECCIÓN: index.html (productos)
  // ════════════════════════════════════════════════════════════

  // Buscador en tiempo real
  const inputBusqueda = document.querySelector("#inputBusqueda");
  if (inputBusqueda) {
    inputBusqueda.addEventListener("input", UI.filtrarProductos);

    // Evitar que Enter recargue la página
    inputBusqueda.addEventListener("keydown", function(e) {
      if (e.key === "Enter") e.preventDefault();
    });
  }

  // Botones "Agregar al carrito"
  const botonesAgregar = document.querySelectorAll(".agregar");
  botonesAgregar.forEach(function(boton) {
    boton.addEventListener("click", function(e) {
      const card   = e.target.closest(".card");
      const titulo = card.querySelector(".card-title")?.textContent?.trim();
      const precio = card.querySelector(".card-price")?.textContent?.trim();

      if (!titulo || !precio) return;

      // Agregar al carrito (maneja duplicados internamente)
      Cart.addToCart({ titulo, precio });

      // Feedback visual en el botón
      boton.textContent = "✓ Agregado";
      boton.classList.add("agregado");
      setTimeout(() => {
        boton.textContent = "Agregar al carrito";
        boton.classList.remove("agregado");
      }, 1200);

      // Toast de confirmación
      UI.showToast("✓ " + titulo + " agregado al carrito");

      // Actualizar badge del navbar
      UI.updateCounter();
    });
  });


  // ════════════════════════════════════════════════════════════
  //  SECCIÓN: cart.html
  // ════════════════════════════════════════════════════════════

  // Si hay tabla del carrito en la página, renderizarla
  if (document.querySelector("#bodyCarrito")) {
    UI.renderCart();
  }

  // Botón "Vaciar carrito"
  const btnLimpiar = document.querySelector("#btnLimpiarCarrito");
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", function() {
      if (confirm("¿Estás seguro de que deseas vaciar el carrito?")) {
        Cart.clearCart();
        UI.renderCart();
        UI.showToast("Carrito vaciado");
      }
    });
  }

});
