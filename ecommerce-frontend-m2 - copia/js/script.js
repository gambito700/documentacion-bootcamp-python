/**
 * script.js — Tienda Demo (Windows 98 + Solarized)
 * ============================================================
 * Módulos:
 *   1. Cart        → lógica de datos (localStorage)
 *   2. UI          → renderizado, toasts, filtros
 *   3. Theme       → dark / light con persistencia
 *   4. JQFeatures  → decoraciones Win98, modal, tooltips, back-to-top
 *   5. DevPanel    → panel oculto (Ctrl+Shift+D)
 *   6. Init        → DOMContentLoaded
 *
 * Problemas corregidos:
 *   ✔ Delegación de eventos con jQuery (más robusto)
 *   ✔ try/catch en tooltips para evitar bloqueo si Bootstrap falla
 *   ✔ Botones "Agregar al carrito" ahora usan delegación
 *   ✔ Console.log en puntos clave para debugging
 *   ✔ Decoraciones de ventana Win98 en cards
 * ============================================================
 */


/* ============================================================
   1. CART — Lógica de datos del carrito
   ============================================================ */
const Cart = (() => {

  const KEY = "tienda_carrito";

  /** Lee el carrito de localStorage */
  function load() {
    try {
      const data = JSON.parse(localStorage.getItem(KEY)) || [];
      console.log("[Cart] Cargado desde localStorage:", data.length, "items");
      return data;
    } catch (err) {
      console.error("[Cart] Error al leer localStorage:", err);
      return [];
    }
  }

  /** Guarda el carrito en localStorage */
  function save(carrito) {
    try {
      localStorage.setItem(KEY, JSON.stringify(carrito));
      console.log("[Cart] Guardado en localStorage:", carrito.length, "items");
    } catch (err) {
      console.error("[Cart] Error al guardar en localStorage:", err);
    }
  }

  function getAll()       { return load(); }
  function getItemCount() { return load().reduce((t, i) => t + i.cantidad, 0); }
  function getCartTotal() { return load().reduce((t, i) => t + i.precioNum * i.cantidad, 0); }

  /**
   * Agrega un producto al carrito.
   * @param {Object} producto - { titulo, precio, img }
   * @returns {boolean} true si es nuevo, false si ya existía
   */
  function addToCart(producto) {
    console.log("[Cart] addToCart() llamado con:", producto);

    // Validar datos del producto
    if (!producto || !producto.titulo || !producto.precio) {
      console.error("[Cart] Datos del producto inválidos:", producto);
      return false;
    }

    const carrito   = load();
    const existente = carrito.find(i => i.titulo === producto.titulo);

    if (existente) {
      existente.cantidad += 1;
      console.log("[Cart] Producto existente, cantidad:", existente.cantidad);
      save(carrito);
      return false;
    }

    const nuevoItem = {
      id:        Date.now(),
      titulo:    producto.titulo,
      precio:    producto.precio,
      precioNum: parsePrecio(producto.precio),
      img:       producto.img || "",
      cantidad:  1
    };
    console.log("[Cart] Nuevo producto creado:", nuevoItem);
    carrito.push(nuevoItem);
    save(carrito);
    return true;
  }

  function removeFromCart(id) {
    console.log("[Cart] removeFromCart() id:", id);
    save(load().filter(i => i.id !== id));
  }

  function updateQuantity(id, delta) {
    const carrito = load();
    const item = carrito.find(p => p.id === id);
    if (!item) return;
    item.cantidad += delta;
    console.log("[Cart] updateQuantity() id:", id, "delta:", delta, "nueva cantidad:", item.cantidad);
    if (item.cantidad <= 0) save(carrito.filter(p => p.id !== id));
    else save(carrito);
  }

  function clearCart() {
    console.log("[Cart] clearCart() — carrito vaciado");
    save([]);
  }

  /** Convierte precio string "$89.000" a número 89000 */
  function parsePrecio(str) {
    const num = parseFloat(str.replace(/[$.]/g, "").replace(",", ".")) || 0;
    console.log("[Cart] parsePrecio('" + str + "') →", num);
    return num;
  }

  /** Formatea número a precio chileno "$89.000" */
  function formatPrice(valor) {
    return "$" + Math.round(valor).toLocaleString("es-CL");
  }

  return { getAll, getItemCount, getCartTotal, addToCart, removeFromCart, updateQuantity, clearCart, formatPrice };

})();


/* ============================================================
   2.5 COPY — Textos descriptivos para productos y portada
   ============================================================ */
const ProductContent = (() => {
  const COPY = {
    "Pantalones de Cuero": {
      resumen: "Un clásico con actitud urbana, pensado para looks con presencia y textura.",
      detalle: "Corte firme, acabado pulido y una silueta que funciona tanto de día como de noche."
    },
    "Camiseta Premium": {
      resumen: "Básico elevado con tacto suave y caída limpia para usar todos los días.",
      detalle: "Ideal para combinar capas, sumar accesorios y construir un outfit simple pero bien resuelto."
    },
    "Chaqueta de Cuero": {
      resumen: "Una pieza protagonista para quienes quieren un look retro con energía moderna.",
      detalle: "Estructura definida, presencia visual fuerte y detalles que destacan incluso a la distancia."
    },
    "Bufanda Tejida": {
      resumen: "Cálida, ligera y con el toque artesanal perfecto para completar tu conjunto.",
      detalle: "Suma color, textura y abrigo sin recargar, ideal para mañanas frías o tardes de paseo."
    },
    "Gafas de Sol": {
      resumen: "Protección con estilo para cerrar cualquier look con una vibra segura y relajada.",
      detalle: "Montura cómoda y diseño versátil para acompañarte en ciudad, viaje o escapada de fin de semana."
    },
    "Gorro Bucket": {
      resumen: "Accesorio fresco con espíritu noventero para outfits casuales con personalidad.",
      detalle: "Ligero, práctico y fácil de combinar con prendas neutras o conjuntos más atrevidos."
    },
    "Zapatos Deportivos": {
      resumen: "Comodidad y ritmo visual para jornadas largas con un acabado deportivo limpio.",
      detalle: "Pensados para moverte con soltura sin renunciar a una presencia moderna y cuidada."
    },
    "Zapatos Formales": {
      resumen: "Elegancia sobria con líneas definidas para reuniones, eventos o una salida especial.",
      detalle: "Funcionan perfecto con pantalones de vestir, denim oscuro o looks minimalistas."
    },
    "Bolso Premium": {
      resumen: "Espacio, orden y carácter en una pieza diseñada para acompañar tus planes diarios.",
      detalle: "Acabado refinado y presencia elegante para llevar lo esencial con estilo y comodidad."
    }
  };

  function get(title) {
    return COPY[title] || {
      resumen: "Una selección especial de la tienda, curada para combinar estilo y funcionalidad.",
      detalle: "Haz clic en la imagen para verla más de cerca y descubrir mejor sus detalles."
    };
  }

  return { get };
})();


/* ============================================================
   2. UI — Interacción con el DOM
   ============================================================ */
const UI = (() => {

  /** Actualiza el badge numérico del carrito en el navbar */
  function updateCounter() {
    const badges = document.querySelectorAll("#contador");
    const count  = Cart.getItemCount();
    console.log("[UI] updateCounter() →", count);
    badges.forEach(badge => {
      badge.textContent = count;
      badge.classList.remove("pulse");
      void badge.offsetWidth; // forzar reflow para re-animar
      badge.classList.add("pulse");
    });
  }

  /** Muestra un toast de notificación estilo Win98 */
  function showToast(mensaje) {
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
    setTimeout(() => toast.remove(), 2500);
  }

  /** Filtra productos por texto del buscador */
  function filtrarProductos() {
    const input = document.querySelector("#inputBusqueda");
    if (!input) return;

    const busqueda  = input.value.toLowerCase().trim();
    const productos = document.querySelectorAll(".producto");
    let hayResultados = false;

    productos.forEach(prod => {
      const atributo = (prod.getAttribute("data-producto") || "").toLowerCase();
      const titulo   = (prod.querySelector(".card-title")?.textContent || "").toLowerCase();
      const coincide = atributo.includes(busqueda) || titulo.includes(busqueda);
      prod.style.display = coincide ? "" : "none";
      if (coincide) hayResultados = true;
    });

    let noResults = document.querySelector("#sinResultados");
    if (!hayResultados && busqueda !== "") {
      if (!noResults) {
        noResults = document.createElement("p");
        noResults.id = "sinResultados";
        noResults.style.cssText = "color:var(--text-muted);text-align:center;margin-top:1.5rem;grid-column:1/-1;font-family:var(--font);font-size:12px;";
        document.querySelector("#productosContainer")?.appendChild(noResults);
      }
      noResults.textContent = 'No se encontraron productos para "' + input.value + '"';
    } else if (noResults) {
      noResults.remove();
    }
  }

  /** Renderiza la tabla del carrito en cart.html */
  function renderCart() {
    const tbody   = document.querySelector("#bodyCarrito");
    const totalEl = document.querySelector("#totalMonto");
    const itemsEl = document.querySelector("#contadorItems");
    if (!tbody) return;

    const carrito = Cart.getAll();
    console.log("[UI] renderCart() →", carrito.length, "items");

    if (carrito.length === 0) {
      tbody.innerHTML = `
        <tr><td colspan="5">
          <div class="cart-empty">
            <span class="icon">🛒</span>
            <p>Tu carrito está vacío</p>
            <small>Agrega productos desde la tienda</small>
          </div>
        </td></tr>`;
    } else {
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
                <button class="qty-btn" onclick="UI.changeQuantity(${item.id}, 1)"  title="Aumentar">+</button>
              </div>
            </td>
            <td class="cart-item-sub">${subtotal}</td>
            <td>
              <button class="btn-peligro" onclick="UI.removeItem(${item.id})">Eliminar</button>
            </td>
          </tr>`;
      }).join("");
    }

    if (totalEl) totalEl.textContent = Cart.formatPrice(Cart.getCartTotal());
    if (itemsEl) itemsEl.textContent = Cart.getItemCount();
    updateCounter();
  }

  function removeItem(id)           { Cart.removeFromCart(id); renderCart(); }
  function changeQuantity(id, delta) { Cart.updateQuantity(id, delta); renderCart(); }

  return { updateCounter, showToast, filtrarProductos, renderCart, removeItem, changeQuantity };

})();


/* ============================================================
   3. THEME — Dark (Solarized) / Light (Win98)
   ============================================================ */
const Theme = (() => {

  const KEY = "tienda_tema";

  function apply(tema) {
    const html = document.documentElement;
    const btn  = document.querySelector("#themeToggle");
    if (tema === "light") {
      html.setAttribute("data-theme", "light");
      if (btn) { btn.innerHTML = "🌙 Oscuro"; btn.title = "Cambiar a Solarized Dark"; }
    } else {
      html.removeAttribute("data-theme");
      if (btn) { btn.innerHTML = "☀️ Claro"; btn.title = "Cambiar a Windows 98 Claro"; }
    }
    console.log("[Theme] Tema aplicado:", tema);
  }

  function toggle() {
    const actual = localStorage.getItem(KEY) || "dark";
    const nuevo  = actual === "dark" ? "light" : "dark";
    localStorage.setItem(KEY, nuevo);
    apply(nuevo);
  }

  function init() {
    apply(localStorage.getItem(KEY) || "dark");
  }

  return { init, toggle };

})();


/* ============================================================
   4. JQUERY — Funcionalidades con jQuery + Bootstrap plugins
   ============================================================
   ✔ Decoraciones Win98 en cards (barras de título + botones)
   ✔ Botón "Ir arriba" con smooth scroll
   ✔ Botón "Ocultar productos" con .toggle()
   ✔ Modal de producto con Bootstrap
   ✔ Tooltips (con try/catch para robustez)
   ============================================================ */
const JQFeatures = (() => {

  // ── Decoraciones de ventana Win98 en cards ─────────────────
  function initWindowDecorations() {
    console.log("[JQ] Inyectando decoraciones de ventana Win98...");

    // Cards de productos → barra de título con botones decorativos
    $(".card").each(function () {
      if ($(this).find(".win-titlebar").length) return; // no duplicar
      const title = $(this).find(".card-title").text().trim() || "Producto";
      $(this).prepend(`
        <div class="win-titlebar">
          <span class="win-titlebar-icon">📦</span>
          <span class="win-titlebar-text">${title}</span>
          <div class="win-titlebar-buttons">
            <button class="win-btn" title="Minimizar" tabindex="-1">_</button>
            <button class="win-btn" title="Maximizar" tabindex="-1">□</button>
            <button class="win-btn win-btn-close" title="Cerrar" tabindex="-1">×</button>
          </div>
        </div>
      `);
    });

    // Tabla del carrito → barra de título
    $(".cart-table-wrapper").each(function () {
      if ($(this).find(".win-titlebar").length) return;
      $(this).prepend(`
        <div class="win-titlebar">
          <span class="win-titlebar-icon">🛒</span>
          <span class="win-titlebar-text">Carrito de Compras</span>
          <div class="win-titlebar-buttons">
            <button class="win-btn" tabindex="-1">_</button>
            <button class="win-btn" tabindex="-1">□</button>
            <button class="win-btn win-btn-close" tabindex="-1">×</button>
          </div>
        </div>
      `);
    });

    // Panel de resumen → barra de título
    $(".cart-summary").each(function () {
      if ($(this).find(".win-titlebar").length) return;
      $(this).prepend(`
        <div class="win-titlebar">
          <span class="win-titlebar-icon">💰</span>
          <span class="win-titlebar-text">Resumen del Pedido</span>
          <div class="win-titlebar-buttons">
            <button class="win-btn" tabindex="-1">_</button>
            <button class="win-btn" tabindex="-1">□</button>
            <button class="win-btn win-btn-close" tabindex="-1">×</button>
          </div>
        </div>
      `);
    });

    console.log("[JQ] Decoraciones inyectadas correctamente");
  }

  // ── Ventanas de productos reordenables por arrastre ─────────────────
  function initDraggableWindows() {
    if (!$("#productosContainer").length) return;

    let draggedItem = null;

    $(".producto").attr("draggable", "false");
    $(".producto .win-titlebar")
      .attr("draggable", "true")
      .attr("title", "Arrastra para reorganizar");

    $(document).on("dragstart", ".producto .win-titlebar", function (e) {
      draggedItem = $(this).closest(".producto")[0];
      if (!draggedItem) return;

      draggedItem.classList.add("producto-arrastrando");
      e.originalEvent.dataTransfer.effectAllowed = "move";
      e.originalEvent.dataTransfer.setData("text/plain", draggedItem.dataset.producto || "");
    });

    $(document).on("dragover", "#productosContainer .producto", function (e) {
      if (!draggedItem || this === draggedItem) return;
      e.preventDefault();

      const rect = this.getBoundingClientRect();
      const shouldInsertBefore = e.originalEvent.clientY < rect.top + rect.height / 2;

      this.classList.add("producto-drop-target");

      if (shouldInsertBefore) {
        this.parentNode.insertBefore(draggedItem, this);
      } else {
        this.parentNode.insertBefore(draggedItem, this.nextSibling);
      }
    });

    $(document).on("dragleave", "#productosContainer .producto", function () {
      this.classList.remove("producto-drop-target");
    });

    $(document).on("drop", "#productosContainer .producto", function (e) {
      e.preventDefault();
      this.classList.remove("producto-drop-target");
    });

    $(document).on("dragend", ".producto .win-titlebar", function () {
      $(".producto").removeClass("producto-arrastrando producto-drop-target");
      draggedItem = null;
    });
  }

  // ── Botón Ir Arriba (smooth scroll) ────────────────────────
  function initBackToTop() {
    $("body").append(`
      <button id="btnArriba" title="Ir al final">↓</button>
    `);

    function updateBackToTopButton() {
      const scrollTop      = $(window).scrollTop();
      const viewportHeight = $(window).height();
      const documentHeight = $(document).height();
      const maxScroll      = Math.max(documentHeight - viewportHeight, 0);
      const mitadPagina    = maxScroll / 2;
      const irHaciaAbajo   = scrollTop < mitadPagina;

      $("#btnArriba")
        .text(irHaciaAbajo ? "↓" : "↑")
        .attr("title", irHaciaAbajo ? "Ir al final" : "Ir arriba")
        .data("target", irHaciaAbajo ? maxScroll : 0);
    }

    $(window).on("scroll resize", updateBackToTopButton);

    $("#btnArriba").on("click", function () {
      const target = $(this).data("target") ?? 0;
      $("html, body").animate({ scrollTop: target }, 400);
    });

    updateBackToTopButton();
  }

  // ── Botón Ocultar / Mostrar productos (jQuery .toggle) ────
  function initToggleProductos() {
    if (!$("#productosContainer").length) return;

    $(".page-header").append(`
      <button id="btnOcultarProductos" class="btn-toggle-productos">
        👁 Ocultar productos
      </button>
    `);

    let visible = true;

    $("#btnOcultarProductos").click(function () {
      visible = !visible;
      $("#productosContainer").toggle(250);

      // jQuery .css() para cambio dinámico
      $(this).css({
        "background-color": visible ? "" : "var(--bg-secondary)"
      });

      $(this).text(visible ? "👁 Ocultar productos" : "👁 Mostrar productos");
    });
  }

  // ── Modal de detalle de producto (Bootstrap plugin) ────────
  function initProductModal() {
    if (!$("#productosContainer").length) return;

    // Inyectar modal en el body
    $("body").append(`
      <div class="modal fade" id="modalProducto" tabindex="-1" aria-labelledby="modalProductoLabel" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered">
          <div class="modal-content modal-producto-content">
            <div class="modal-header border-0 pb-0">
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Cerrar"></button>
            </div>
            <div class="modal-body text-center">
              <img id="modalImg"    src="" alt="" class="modal-producto-img mb-3" />
              <h5  id="modalNombre" class="modal-producto-nombre"></h5>
              <p   id="modalPrecio" class="modal-producto-precio"></p>
              <p   id="modalDescripcion" class="modal-producto-descripcion"></p>
              <p   id="modalDetalle" class="modal-producto-detalle"></p>
              <p class="modal-producto-tip">Haz clic en la imagen para ampliarla y revisar mejor sus detalles.</p>
            </div>
            <div class="modal-footer border-0 justify-content-center">
              <button id="modalBtnExpandir" type="button" class="btn-secundario">
                Maximizar vista
              </button>
              <button id="modalBtnAgregar" type="button" class="btn-agregar agregar-modal">
                Agregar al carrito
              </button>
              <button type="button" class="btn-secundario" data-bs-dismiss="modal">Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    `);

    // Click en imagen → abrir modal
    $(document).on("click", ".card-img-top", function () {
      const card   = $(this).closest(".card");
      const titulo = card.find(".card-title").text().trim();
      const precio = card.find(".card-price").text().trim();
      const img    = $(this).attr("src");
      const copy   = ProductContent.get(titulo);

      $("#modalImg").attr({ src: img, alt: titulo });
      $("#modalNombre").text(titulo);
      $("#modalPrecio").text(precio);
      $("#modalDescripcion").text(copy.resumen);
      $("#modalDetalle").text(copy.detalle);
      $("#modalBtnAgregar").data("titulo", titulo).data("precio", precio).data("img", img);
      $("#modalProducto .modal-dialog").removeClass("modal-producto-expandido");
      $("#modalBtnExpandir").text("Maximizar vista");

      try {
        const modal = new bootstrap.Modal(document.getElementById("modalProducto"));
        modal.show();
      } catch (err) {
        console.error("[JQ] Error al abrir modal:", err);
      }
    });

    // Agregar desde el modal
    $(document).on("click", "#modalBtnAgregar", function () {
      const titulo = $(this).data("titulo");
      const precio = $(this).data("precio");
      const img    = $(this).data("img");

      Cart.addToCart({ titulo, precio, img });
      UI.showToast("✓ " + titulo + " agregado al carrito");
      UI.updateCounter();

      $(this).text("✓ Agregado!").addClass("agregado");
      setTimeout(() => {
        $(this).text("Agregar al carrito").removeClass("agregado");
      }, 1200);
    });

    function toggleExpandedProductModal() {
      const $dialog = $("#modalProducto .modal-dialog");
      $dialog.toggleClass("modal-producto-expandido");
      $("#modalBtnExpandir").text(
        $dialog.hasClass("modal-producto-expandido") ? "Reducir vista" : "Maximizar vista"
      );
    }

    $(document).on("click", "#modalImg, #modalBtnExpandir", function () {
      toggleExpandedProductModal();
    });

    $("#modalProducto").on("hidden.bs.modal", function () {
      $("#modalProducto .modal-dialog").removeClass("modal-producto-expandido");
      $("#modalBtnExpandir").text("Maximizar vista");
    });
  }

  // ── Tooltips Bootstrap ─────────────────────────────────────
  function initTooltips() {
    try {
      const tooltipEls = document.querySelectorAll('[data-bs-toggle="tooltip"]');
      tooltipEls.forEach(el => new bootstrap.Tooltip(el));
      console.log("[JQ] Tooltips inicializados:", tooltipEls.length);
    } catch (err) {
      console.warn("[JQ] No se pudieron inicializar tooltips:", err.message);
    }
  }

  // ── Efecto hover en cards con jQuery .css() ───────────────
  function initCardHoverEffect() {
    $(document).on("mouseenter", ".card-img-top", function () {
      $(this).css("cursor", "zoom-in");
    });
    $(document).on("mouseleave", ".card-img-top", function () {
      $(this).css("cursor", "default");
    });
  }

  // ── Eventos de botones "Agregar al carrito" (DELEGACIÓN) ──
  function initAddToCartButtons() {
    console.log("[JQ] Inicializando botones 'Agregar al carrito' con delegación...");

    // Delegación de eventos con jQuery — más robusto que querySelectorAll
    // Excluye el botón del modal (.agregar-modal)
    $(document).on("click", ".agregar:not(.agregar-modal)", function (e) {
      e.preventDefault();
      e.stopPropagation();

      const $card  = $(this).closest(".card");
      const titulo = $card.find(".card-title").text().trim();
      const precio = $card.find(".card-price").text().trim();
      const img    = $card.find(".card-img-top").attr("src") || "";

      console.log("[JQ] Click en 'Agregar':", { titulo, precio, img });

      if (!titulo || !precio) {
        console.error("[JQ] Datos del producto inválidos. titulo:", titulo, "precio:", precio);
        return;
      }

      Cart.addToCart({ titulo, precio, img });

      // Feedback visual en el botón
      const $btn = $(this);
      $btn.text("✓ Agregado").addClass("agregado");
      setTimeout(() => {
        $btn.text("Agregar al carrito").removeClass("agregado");
      }, 1200);

      UI.showToast("✓ " + titulo + " agregado al carrito");
      UI.updateCounter();
    });

    console.log("[JQ] Botones 'Agregar' listos (delegación activa)");
  }

  // ── API pública ───────────────────────────────────────────
  function init() {
    initWindowDecorations();
    initDraggableWindows();
    initBackToTop();
    initToggleProductos();
    initProductModal();
    initTooltips();
    initCardHoverEffect();
    initAddToCartButtons();
  }

  return { init };

})();


/* ============================================================
   5. DEV PANEL — Panel oculto de configuración (Ctrl+Shift+D)
   Estilo: diálogo de propiedades de Windows 98
   ============================================================ */
const DevPanel = (() => {

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

  function buildHTML() {
    const panel = document.createElement("div");
    panel.id = "devPanel";
    panel.innerHTML = `
      <h2>
        🛠 Dev Panel — Propiedades del Sistema
        <button class="close-panel" onclick="DevPanel.toggle()" title="Cerrar">✕</button>
      </h2>
      <div class="dev-section">
        <h3>Colores en tiempo real</h3>
        ${COLORES.map(c => `
          <div class="color-row">
            <label>${c.label}</label>
            <input type="color" data-var="${c.variable}"
              oninput="DevPanel.setColor('${c.variable}', this.value)"
              title="${c.variable}" />
          </div>
        `).join("")}
        <button class="btn-secundario" style="margin-top:6px;font-size:11px;width:100%;" onclick="DevPanel.resetColors()">
          ↺ Resetear colores
        </button>
      </div>
      <div class="dev-section">
        <h3>Estado del carrito</h3>
        <pre id="devCartLog">Cargando...</pre>
        <button class="btn-secundario" style="margin-top:4px;font-size:11px;width:100%;" onclick="DevPanel.refreshLog()">
          ↻ Actualizar
        </button>
      </div>
      <div class="dev-section">
        <h3>Acciones rápidas</h3>
        <div style="display:flex;flex-direction:column;gap:4px;">
          <button class="btn-peligro" style="width:100%" onclick="if(confirm('¿Vaciar carrito?')){Cart.clearCart();UI.renderCart();UI.updateCounter();DevPanel.refreshLog();}">
            🗑 Vaciar carrito
          </button>
          <button class="btn-secundario" style="width:100%" onclick="localStorage.clear();location.reload();">
            ⚠ Limpiar localStorage y recargar
          </button>
        </div>
      </div>
    `;

    const overlay = document.createElement("div");
    overlay.id = "devOverlay";
    overlay.onclick = () => toggle();

    document.body.appendChild(overlay);
    document.body.appendChild(panel);
    syncPickers();
  }

  function syncPickers() {
    COLORES.forEach(c => {
      const input = document.querySelector(`[data-var="${c.variable}"]`);
      if (!input) return;
      const valor = getComputedStyle(document.documentElement).getPropertyValue(c.variable).trim();
      const hex = cssValueToHex(valor);
      if (hex) input.value = hex;
    });
  }

  function cssValueToHex(valor) {
    if (!valor) return null;
    if (valor.startsWith("#")) {
      if (valor.length === 4) return "#" + valor[1]+valor[1]+valor[2]+valor[2]+valor[3]+valor[3];
      return valor;
    }
    const match = valor.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
    if (match) return "#" + [match[1], match[2], match[3]].map(n => parseInt(n).toString(16).padStart(2,"0")).join("");
    return null;
  }

  let isOpen = false;

  function toggle() {
    if (!document.querySelector("#devPanel")) buildHTML();
    isOpen = !isOpen;
    document.querySelector("#devPanel").classList.toggle("open", isOpen);
    document.querySelector("#devOverlay").classList.toggle("visible", isOpen);
    if (isOpen) refreshLog();
  }

  function setColor(variable, valor) {
    document.documentElement.style.setProperty(variable, valor);
  }

  function resetColors() {
    COLORES.forEach(c => document.documentElement.style.removeProperty(c.variable));
    syncPickers();
  }

  function refreshLog() {
    const log = document.querySelector("#devCartLog");
    if (!log) return;
    const carrito = Cart.getAll();
    log.textContent = carrito.length === 0 ? "// carrito vacío" : JSON.stringify(carrito, null, 2);
  }

  function registerShortcut() {
    document.addEventListener("keydown", function(e) {
      if (e.ctrlKey && e.shiftKey && e.key === "D") { e.preventDefault(); toggle(); }
    });
  }

  return { toggle, setColor, resetColors, refreshLog, registerShortcut };

})();


/* ============================================================
   6. INIT — Punto de entrada (DOMContentLoaded)
   ============================================================
   ORDEN CRÍTICO:
   1. Theme (visual, sin DOM interactivo)
   2. Counter (badge del navbar)
   3. Buscador en tiempo real
   4. Carrito (renderizado)
   5. Botón vaciar carrito
   6. DevPanel atajo
   7. JQFeatures (decoraciones, botones delegados, tooltips — AL FINAL)
   ============================================================ */
document.addEventListener("DOMContentLoaded", function () {
  console.log("[Init] DOMContentLoaded disparado");

  // ── 1. Tema ──────────────────────────────────────────────
  Theme.init();

  // ── 2. Navbar badge ──────────────────────────────────────
  UI.updateCounter();

  // ── 3. Toggle tema ───────────────────────────────────────
  const btnTema = document.querySelector("#themeToggle");
  if (btnTema) btnTema.addEventListener("click", Theme.toggle);

  // ── 4. Buscador en tiempo real ───────────────────────────
  const inputBusqueda = document.querySelector("#inputBusqueda");
  if (inputBusqueda) {
    inputBusqueda.addEventListener("input", UI.filtrarProductos);
    inputBusqueda.addEventListener("keydown", e => { if (e.key === "Enter") e.preventDefault(); });
    console.log("[Init] Buscador en tiempo real enlazado");
  }

  // ── 5. Renderizar carrito (cart.html) ────────────────────
  if (document.querySelector("#bodyCarrito")) {
    console.log("[Init] Página de carrito detectada, renderizando...");
    UI.renderCart();
  }

  // ── 6. Botón vaciar carrito ──────────────────────────────
  const btnLimpiar = document.querySelector("#btnLimpiarCarrito");
  if (btnLimpiar) {
    btnLimpiar.addEventListener("click", function () {
      if (confirm("¿Estás seguro de que deseas vaciar el carrito?")) {
        Cart.clearCart();
        UI.renderCart();
        UI.showToast("🗑 Carrito vaciado");
      }
    });
    console.log("[Init] Botón 'Vaciar carrito' enlazado");
  }

  // ── 7. DevPanel shortcut ─────────────────────────────────
  DevPanel.registerShortcut();

  // ── 8. jQuery — SIEMPRE AL FINAL (con try/catch) ────────
  if (typeof $ !== "undefined") {
    try {
      JQFeatures.init();
      console.log("[Init] JQFeatures inicializado correctamente");
    } catch (err) {
      console.error("[Init] Error en JQFeatures.init():", err);
      // Fallback: registrar botones sin jQuery
      console.log("[Init] Intentando fallback para botones...");
      document.querySelectorAll(".agregar").forEach(function (boton) {
        boton.addEventListener("click", function (e) {
          const card   = e.target.closest(".card");
          const titulo = card?.querySelector(".card-title")?.textContent?.trim();
          const precio = card?.querySelector(".card-price")?.textContent?.trim();
          const img    = card?.querySelector(".card-img-top")?.getAttribute("src") || "";
          if (!titulo || !precio) return;
          Cart.addToCart({ titulo, precio, img });
          boton.textContent = "✓ Agregado";
          boton.classList.add("agregado");
          setTimeout(() => { boton.textContent = "Agregar al carrito"; boton.classList.remove("agregado"); }, 1200);
          UI.showToast("✓ " + titulo + " agregado al carrito");
          UI.updateCounter();
        });
      });
    }
  } else {
    console.warn("[Init] jQuery no disponible, usando vanilla JS para botones");
    document.querySelectorAll(".agregar").forEach(function (boton) {
      boton.addEventListener("click", function (e) {
        const card   = e.target.closest(".card");
        const titulo = card?.querySelector(".card-title")?.textContent?.trim();
        const precio = card?.querySelector(".card-price")?.textContent?.trim();
        const img    = card?.querySelector(".card-img-top")?.getAttribute("src") || "";
        if (!titulo || !precio) return;
        Cart.addToCart({ titulo, precio, img });
        boton.textContent = "✓ Agregado";
        boton.classList.add("agregado");
        setTimeout(() => { boton.textContent = "Agregar al carrito"; boton.classList.remove("agregado"); }, 1200);
        UI.showToast("✓ " + titulo + " agregado al carrito");
        UI.updateCounter();
      });
    });
  }

  console.log("[Init] ✔ Inicialización completa");
});
