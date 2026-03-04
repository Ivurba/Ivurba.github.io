// ===== ALMACENAMIENTO UNIVERSAL (funciona en file:// y https://) =====
const appStorage = (() => {
  let memoryStorage = {};
  try {
    localStorage.setItem("__test__", "test");
    localStorage.removeItem("__test__");
    return localStorage;
  } catch (e) {
    console.log("localStorage no disponible, usando almacenamiento en memoria");
    return {
      setItem: (key, value) => { memoryStorage[key] = value; },
      getItem: (key) => { return memoryStorage[key] || null; },
      removeItem: (key) => { delete memoryStorage[key]; },
      clear: () => { memoryStorage = {}; }
    };
  }
})();

// ===== DATOS LOCALES =====
// La aplicación usa datos almacenados en localStorage.
// Si no existen, intenta cargar desde el archivo JSON estático
// `datos-recomendaciones.json` (solo lectura).
async function obtenerDatos() {
  const almacen = appStorage.getItem("datos");
  if (almacen) {
    return JSON.parse(almacen);
  }
  try {
    const resp = await fetch("datos-recomendaciones.json");
    if (resp.ok) {
      const datos = await resp.json();
      appStorage.setItem("datos", JSON.stringify(datos));
      return datos;
    }
  } catch (e) {
    console.error("Error cargando datos estáticos:", e);
  }
  return [];
}

function guardarDatos(datos, autoExport = true) {
  // Guarda en almacenamiento local (o memoria)
  appStorage.setItem("datos", JSON.stringify(datos));
  // Al guardar, opcionalmente también generamos un archivo descargable
  if (autoExport) {
    exportarDatos();
  }
}

// Genera y descarga un fichero JSON con los datos actuales.
// El usuario debe aceptar la descarga y luego, si lo desea,
// reemplazar el `datos-recomendaciones.json` en el proyecto.
function exportarDatos() {
  try {
    const contenido = appStorage.getItem("datos") || "[]";
    const blob = new Blob([contenido], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "datos-recomendaciones.json";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (e) {
    console.error("No se pudo exportar datos:", e);
  }
}

// Tipos extra almacenados por el usuario (además de los derivados de datos)
function obtenerTiposAlmacenados() {
  try {
    return JSON.parse(appStorage.getItem("tipos") || "[]");
  } catch {
    return [];
  }
}

function guardarTipos(tipos) {
  appStorage.setItem("tipos", JSON.stringify(tipos));
}

async function obtenerTipos() {
  const datos = await obtenerDatos();
  const tiposDeDatos = [...new Set(datos.map(d => d.tipo))];
  const almacenados = obtenerTiposAlmacenados();
  return [...new Set([...tiposDeDatos, ...almacenados])];
}

// ===== FUNCIONES DE SESIÓN =====

// Función para verificar y mostrar estado de sesión
function verificarSesion() {
  const sesionActiva = appStorage.getItem("sesionActiva");
  const infoUsuario = document.getElementById("infoUsuario");
  const btnSesion = document.getElementById("btnSesion");

  if (!infoUsuario && !btnSesion) return; // 🔥 IMPORTANTE

  if (sesionActiva) {
    const datos = JSON.parse(sesionActiva);

    if (infoUsuario) {
      infoUsuario.innerHTML = `<span>Bienvenido, <strong>${datos.usuario}</strong></span>`;
      infoUsuario.style.display = "block";
    }

    if (btnSesion) {
      btnSesion.textContent = "Cerrar Sesión";
      btnSesion.onclick = cerrarSesion;
    }
  } else {
    if (infoUsuario) {
      infoUsuario.style.display = "none";
    }

    if (btnSesion) {
      btnSesion.textContent = "Iniciar Sesión";
      btnSesion.onclick = irALogin;
    }
  }
}


// Función para ir al login
function irALogin() {
  window.location.href = "IniciarSesion.html";
}

// Función para cerrar sesión
function cerrarSesion() {
  appStorage.removeItem("sesionActiva");
  verificarSesion();
  buscar().catch(console.error);
  AbrirDashboard();
}

// ===== FUNCIONES DE LISTAS PERSONALIZADAS =====

// Función para inicializar listas personalizadas
function inicializarListas() {
  if (!appStorage.getItem("listas")) {
    appStorage.setItem("listas", JSON.stringify({}));
  }
}

// Función para acceder a una lista personalizada
function accederALista() {
  const nombreLista = document.getElementById("listaPersonalizada").value.trim();
  
  if (!nombreLista) {
    alert("Escribe el nombre de la lista");
    return;
  }

  const listas = JSON.parse(appStorage.getItem("listas")) || {};

  // Si no existe, crear la lista
  if (!listas[nombreLista]) {
    listas[nombreLista] = { nombre: nombreLista, elementos: [] };
    appStorage.setItem("listas", JSON.stringify(listas));
    alert(`Lista "${nombreLista}" creada`);
  }

  // Mostrar la lista
  mostrarListaPersonalizada(nombreLista);
}

// Función para agregar elemento a lista personalizada
function agregarALista(nombre, tipo) {
  const nombreLista = document.getElementById("listaPersonalizada").value.trim();

  if (!nombreLista) {
    alert("Selecciona o crea una lista primero");
    return;
  }

  const listas = JSON.parse(appStorage.getItem("listas")) || {};
  
  // Crear lista si no existe
  if (!listas[nombreLista]) {
    listas[nombreLista] = { nombre: nombreLista, elementos: [] };
  }

  const lista = listas[nombreLista];
  
  // Verificar si el elemento ya existe
  if (lista.elementos.some(e => e.nombre === nombre)) {
    alert("Este elemento ya existe en la lista");
    return;
  }

  lista.elementos.push({ nombre, tipo });
  appStorage.setItem("listas", JSON.stringify(listas));
  alert(`"${nombre}" agregado a "${nombreLista}"`);
}

// Función para mostrar elementos de lista personalizada
function mostrarListaPersonalizada(nombreLista) {
  const resultado = document.getElementById("resultado");
  const listas = JSON.parse(appStorage.getItem("listas")) || {};

  if (!listas[nombreLista]) {
    resultado.innerHTML = "<li>Esta lista no existe</li>";
    return;
  }

  const lista = listas[nombreLista];

  resultado.innerHTML = "";

  if (lista.elementos.length === 0) {
    resultado.innerHTML = `<li>La lista "${nombreLista}" está vacía</li>`;
    return;
  }

  resultado.innerHTML = `<h4>Elementos en "${nombreLista}"</h4>`;

  lista.elementos.forEach((elemento, index) => {
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";

    const span = document.createElement("span");
    span.textContent = `${elemento.nombre} (${elemento.tipo})`;

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.style.padding = "5px 10px";
    btnEliminar.style.background = "#f5576c";
    btnEliminar.style.color = "white";
    btnEliminar.style.border = "none";
    btnEliminar.style.borderRadius = "4px";
    btnEliminar.style.cursor = "pointer";
    btnEliminar.onclick = () => eliminarDeLista(nombreLista, index);

    li.appendChild(span);
    li.appendChild(btnEliminar);
    resultado.appendChild(li);
  });
}

// Función para eliminar elemento de lista
function eliminarDeLista(nombreLista, indiceElemento) {
  const listas = JSON.parse(appStorage.getItem("listas")) || {};
  listas[nombreLista].elementos.splice(indiceElemento, 1);
  appStorage.setItem("listas", JSON.stringify(listas));
  mostrarListaPersonalizada(nombreLista);
}

// Función para inicializar los datos si no existen en LocalStorage
async function inicializarDatos() {
  // inicializar el almacenamiento de tipos si no existe
  if (!appStorage.getItem("tipos")) {
    appStorage.setItem("tipos", JSON.stringify([]));
  }

  if (!appStorage.getItem("datos")) {
    // primero intenta cargar desde el JSON estático
    try {
      const resp = await fetch("datos-recomendaciones.json");
      if (resp.ok) {
        const datosIniciales = await resp.json();
        appStorage.setItem("datos", JSON.stringify(datosIniciales));
        return;
      }
    } catch (e) {
      console.error("Error cargando JSON inicial:", e);
    }
    // si falla la carga, usar valores por defecto
    const datosIniciales = [
      { nombre: "El Quijote", tipo: "Libro", autor: "Miguel de Cervantes" },
      { nombre: "Cien años de soledad", tipo: "Libro", autor: "Gabriel García Márquez" },
      { nombre: "Inception", tipo: "Película", autor: "Christopher Nolan" },
      { nombre: "The Matrix", tipo: "Película", autor: "Hermanas Wachowski" }
    ];
    appStorage.setItem("datos", JSON.stringify(datosIniciales));
  }
}

// Función para cargar los tipos en las listas
async function cargarTipos() {
  let tiposUnicos = [];
  try {
    tiposUnicos = await obtenerTipos();
  } catch (e) {
    console.error("Error cargando tipos:", e);
    const datosJSON = appStorage.getItem("datos");
    if (datosJSON) {
      const datos = JSON.parse(datosJSON);
      tiposUnicos = [...new Set(datos.map(d => d.tipo))];
    }
  }

  const lstTipo = document.getElementById("lstTipo");
  const lstTipoNuevo = document.getElementById("lstTipoNuevo");

  // Lista de búsqueda (si existe en la página)
  if (lstTipo) {
    lstTipo.innerHTML = "";
    const optionTodos = document.createElement("option");
    optionTodos.value = "";
    optionTodos.textContent = "Todos";
    lstTipo.appendChild(optionTodos);

    // Agregar opciones a la lista de búsqueda
    tiposUnicos.forEach(tipo => {
      const option1 = document.createElement("option");
      option1.value = tipo;
      option1.textContent = tipo;
      lstTipo.appendChild(option1);
    });
  }

  // Lista de añadir (si existe en la página)
  if (lstTipoNuevo) {
    lstTipoNuevo.innerHTML = "";

    tiposUnicos.forEach(tipo => {
      const option2 = document.createElement("option");
      option2.value = tipo;
      option2.textContent = tipo;
      lstTipoNuevo.appendChild(option2);
    });
  }
}

// Función de búsqueda
async function buscar() {
  const texto = document.getElementById("txtBuscar").value.toLowerCase();
  const tipo = document.getElementById("lstTipo").value;
  const Autor = document.getElementById("AutorBusqueda").value.toLowerCase();
  const resultado = document.getElementById("resultado");

  const datos = await obtenerDatos();

const filtrados = datos.filter(d =>
  d.nombre.toLowerCase().includes(texto) &&
  (tipo === "" || d.tipo === tipo) &&
  (Autor === "" || (d.autor && d.autor.toLowerCase().includes(Autor)))
);


  resultado.innerHTML = "";

  if (filtrados.length === 0) {
    resultado.innerHTML = "<li>No se encontraron resultados</li>";
    return;
  }

  filtrados.forEach(d => {
    const li = document.createElement("li");
    li.style.marginBottom = "15px";
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    
    const contenedor = document.createElement("div");
    contenedor.style.display = "flex";
    contenedor.style.alignItems = "center";
    
    if (d.portada && d.enlace) {
      const a = document.createElement("a");
      a.href = d.enlace;
      a.target = "_blank";
      a.rel = "noopener noreferrer";

      const img = document.createElement("img");
      img.src = d.portada;
      img.style.width = "100px";
      img.style.height = "150px";
      img.style.objectFit = "cover";
      img.style.marginRight = "10px";
      img.style.cursor = "pointer";

      a.appendChild(img);
      contenedor.appendChild(a);
    } else if (d.portada) {
      const img = document.createElement("img");
      img.src = d.portada;
      img.style.width = "100px";
      img.style.height = "150px";
      img.style.objectFit = "cover";
      img.style.marginRight = "10px";
      contenedor.appendChild(img);
    } else if (d.enlace) {
      const enlaceBtn = document.createElement("a");
      enlaceBtn.href = d.enlace;
      enlaceBtn.target = "_blank";
      enlaceBtn.rel = "noopener noreferrer";
      enlaceBtn.textContent = "Abrir enlace";
      enlaceBtn.style.display = "inline-block";
      enlaceBtn.style.marginRight = "10px";
      enlaceBtn.style.padding = "8px 12px";
      enlaceBtn.style.background = "#667eea";
      enlaceBtn.style.color = "white";
      enlaceBtn.style.borderRadius = "4px";
      enlaceBtn.style.textDecoration = "none";
      contenedor.appendChild(enlaceBtn);
    }
    
    const span = document.createElement("span");
    span.textContent = `${d.nombre} (${d.tipo})`;
    contenedor.appendChild(span);
    
    li.appendChild(contenedor);
    
    // Botón para agregar a lista
    const btnAgregar = document.createElement("button");
    btnAgregar.textContent = "+ Lista";
    btnAgregar.style.padding = "8px 12px";
    btnAgregar.style.marginLeft = "10px";
    btnAgregar.style.background = "#667eea";
    btnAgregar.style.color = "white";
    btnAgregar.style.border = "none";
    btnAgregar.style.borderRadius = "4px";
    btnAgregar.style.cursor = "pointer";
    btnAgregar.onclick = () => agregarALista(d.nombre, d.tipo);
    
    li.appendChild(btnAgregar);
    // Obtener usuario actual
const sesionActiva = appStorage.getItem("sesionActiva");
let usuarioActual = null;

if (sesionActiva) {
  usuarioActual = JSON.parse(sesionActiva).usuario;
}

// Si el usuario actual es el autor → mostrar botón eliminar
if (usuarioActual && usuarioActual === d.autor) {
  const btnEliminar = document.createElement("button");
  btnEliminar.textContent = "Eliminar";
  btnEliminar.style.padding = "8px 12px";
  btnEliminar.style.marginLeft = "10px";
  btnEliminar.style.background = "#f5576c";
  btnEliminar.style.color = "white";
  btnEliminar.style.border = "none";
  btnEliminar.style.borderRadius = "4px";
  btnEliminar.style.cursor = "pointer";

  btnEliminar.onclick = () => eliminarRecomendacion(d.nombre);

  li.appendChild(btnEliminar);
}

    resultado.appendChild(li);
  });
}

// Función para convertir archivo a base64
function leerArchivo(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

// Función para añadir nuevo elemento
async function anadir() {
  const nombre = document.getElementById("txtNombreNuevo").value.trim();
  const tipo = document.getElementById("lstTipoNuevo").value;
  const archivoPortada = document.getElementById("PortadaNueva").files[0];
  const enlaceInput = document.getElementById("txtEnlaceNuevo");
  const enlace = enlaceInput ? enlaceInput.value.trim() : "";

  const sesionActiva = appStorage.getItem("sesionActiva");

  // 🚫 Si no hay sesión
  if (!sesionActiva) {
    alert("Debes iniciar sesión para añadir una recomendación");
    window.location.href = "IniciarSesion.html";
    return;
  }

  const autor = JSON.parse(sesionActiva).usuario;

  if (nombre === "" || tipo === "") {
    alert("Completa todos los campos");
    return;
  }

  // Enlace no opcional
  if (!enlace) {
    alert("El campo 'Enlace' es obligatorio.");
    return;
  }

  // Validar formato básico de URL
  try {
    const testUrl = new URL(enlace);
  } catch (err) {
    alert("Escribe una URL válida (incluye http:// o https://)");
    return;
  }

  const nuevoElemento = { nombre, tipo, autor, enlace };

  // 📷 Si hay imagen
  if (archivoPortada) {
    try {
      nuevoElemento.portada = await leerArchivo(archivoPortada);
    } catch (error) {
      alert("Error al cargar la imagen");
      return;
    }
  } else {
    nuevoElemento.portada = "";
  }

  // Guardar localmente
  try {
    const datos = await obtenerDatos();
    datos.push(nuevoElemento);
    guardarDatos(datos);
    alert("Recomendación añadida correctamente");
  } catch (error) {
    alert("Error al guardar: " + error.message);
    return;
  }

  // Limpiar campos
  document.getElementById("txtNombreNuevo").value = "";
  document.getElementById("PortadaNueva").value = "";

  window.location.href = "index.html";
}

// ===== FUNCIONES DE SESIÓN =====

// Función para inicializar usuarios
function inicializarUsuarios() {
  if (!appStorage.getItem("usuarios")) {
    appStorage.setItem("usuarios", JSON.stringify([]));
  }
}

// Función para registrarse
function registrarse() {
  const usuario = document.getElementById("usuarioReg").value.trim();
  const contrasena = document.getElementById("contrasenaReg").value;
  const confirmar = document.getElementById("confirmarReg").value;
  const mensaje = document.getElementById("mensajeReg");

  // Validaciones
  if (usuario === "" || contrasena === "" || confirmar === "") {
    mostrarMensaje(mensaje, "Completa todos los campos", "error");
    return;
  }

  if (contrasena.length < 4) {
    mostrarMensaje(mensaje, "La contraseña debe tener al menos 4 caracteres", "error");
    return;
  }

  if (contrasena !== confirmar) {
    mostrarMensaje(mensaje, "Las contraseñas no coinciden", "error");
    return;
  }

  inicializarUsuarios();
  const usuarios = JSON.parse(appStorage.getItem("usuarios"));

  // Verificar si el usuario ya existe
  if (usuarios.some(u => u.usuario === usuario)) {
    mostrarMensaje(mensaje, "Este usuario ya existe", "error");
    return;
  }

  // Guardar nuevo usuario
  usuarios.push({ usuario, contrasena });
  appStorage.setItem("usuarios", JSON.stringify(usuarios));
  
  mostrarMensaje(mensaje, "Registro exitoso. Ya puedes iniciar sesión", "exito");
  
  // Limpiar campos
  document.getElementById("usuarioReg").value = "";
  document.getElementById("contrasenaReg").value = "";
  document.getElementById("confirmarReg").value = "";
}

// Función para iniciar sesión
function iniciarSesion() {
  // existe en la misma hoja, protegemos contra llamadas antes de cargar
  if (typeof document === 'undefined') return;
  const usuario = document.getElementById("usuarioLogin").value.trim();
  const contrasena = document.getElementById("contrasenaLogin").value;
  const mensaje = document.getElementById("mensajeLogin");

  if (usuario === "" || contrasena === "") {
    mostrarMensaje(mensaje, "Completa todos los campos", "error");
    return;
  }

  inicializarUsuarios();
  const usuarios = JSON.parse(appStorage.getItem("usuarios"));

  // Verificar credenciales
  const usuarioValido = usuarios.find(u => u.usuario === usuario && u.contrasena === contrasena);

  if (usuarioValido) {
    appStorage.setItem("sesionActiva", JSON.stringify({ usuario }));
    mostrarMensaje(mensaje, "Sesión iniciada correctamente. Redirigiendo...", "exito");
    AbrirDashboard();
    
    // Redirigir a index.html después de 2 segundos
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  } else {
    mostrarMensaje(mensaje, "Usuario o contraseña incorrectos", "error");
  }

  document.getElementById("usuarioLogin").value = "";
  document.getElementById("contrasenaLogin").value = "";
}

// Función para mostrar mensajes
function mostrarMensaje(elemento, texto, tipo) {
  elemento.textContent = texto;
  elemento.className = "mensaje " + tipo;
  elemento.style.display = "block";
}

// Ejecutar al cargar la página
window.addEventListener("load", async () => {
  await inicializarDatos();

  if (document.getElementById("lstTipo") || document.getElementById("lstTipoNuevo")) {
    cargarTipos().catch(console.error);
  }

  if (document.getElementById("txtBuscar")) {
    buscar().catch(console.error);
  }

  if (appStorage.getItem("sesionActiva")) {
    AbrirDashboard();
  }
});

inicializarUsuarios();
inicializarListas();
verificarSesion();

// Event listener para Enter en lista personalizada
const listaPersonalizada = document.getElementById("listaPersonalizada");
if (listaPersonalizada) {
  listaPersonalizada.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      accederALista();
    }
  });
}
async function eliminarRecomendacion(nombre) {
  const sesionActiva = appStorage.getItem("sesionActiva");

  if (!sesionActiva) {
    alert("Debes iniciar sesión para eliminar");
    return;
  }

  try {
    const datos = await obtenerDatos();
    const filtrados = datos.filter(d => d.nombre !== nombre);
    guardarDatos(filtrados);
    buscar().catch(console.error); // refrescar lista
  } catch (error) {
    alert("Error al eliminar: " + error.message);
  }
}

// ===== FUNCIONES DASHBOARD =====
async function BuscarAutorDashboard() {
  const AutorBuscar = document.getElementById("txtBuscarDashboard").value.toLowerCase();
  const resultado = document.getElementById("dashboardList");

  if (!resultado) return; // Evita errores si el elemento no existe

  const datos = await obtenerDatos();

  // Filtrar por autor
  const filtrados = datos.filter(d =>
    d.autor && d.autor.toLowerCase().includes(AutorBuscar)
  );

  resultado.innerHTML = ""; // Limpiar lista

  if (filtrados.length === 0) {
    resultado.innerHTML = "<li>No se encontraron resultados</li>";
    return;
  }

  filtrados.forEach(d => {
    // Crear li
    const li = document.createElement("li");
    li.style.display = "flex";
    li.style.justifyContent = "space-between";
    li.style.alignItems = "center";
    li.style.marginBottom = "10px";

    // Nombre y autor
    const span = document.createElement("span");
    span.textContent = `${d.nombre} - ${d.autor}`;
    li.appendChild(span);

    // Botón eliminar (solo si el usuario es el autor)
// Botón eliminar (todos pueden eliminar en Dashboard)
const btnEliminar = document.createElement("button");
btnEliminar.textContent = "Eliminar";
btnEliminar.style.padding = "8px 12px";
btnEliminar.style.marginLeft = "10px";
btnEliminar.style.background = "#f5576c";
btnEliminar.style.color = "white";
btnEliminar.style.border = "none";
btnEliminar.style.borderRadius = "4px";
btnEliminar.style.cursor = "pointer";

btnEliminar.onclick = () => {
  eliminarRecomendacionDashboard(d.nombre);
  BuscarAutorDashboard();
};

li.appendChild(btnEliminar);


    resultado.appendChild(li);
  });
}

// Opcional: permite buscar presionando Enter en el input
const txtDashboard = document.getElementById("txtBuscarDashboard");
if (txtDashboard) {
  txtDashboard.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      BuscarAutorDashboard();
    }
  });
}

async function eliminarRecomendacionDashboard(nombre) {
  try {
    const datos = await obtenerDatos();
    const filtrados = datos.filter(d => d.nombre !== nombre);
    guardarDatos(filtrados);
    BuscarAutorDashboard();
  } catch (error) {
    alert("Error al eliminar: " + error.message);
  }
}


function AbrirDashboard() {
  const BtnDashboard = document.getElementById("btnDashboard");
  if (!BtnDashboard) return;

  const sesionActiva = appStorage.getItem("sesionActiva");

  // Siempre ocultar primero
  BtnDashboard.style.display = "none";

  if (!sesionActiva) return;

  const usuario = JSON.parse(sesionActiva).usuario;

  if (usuario && usuario.trim().toLowerCase() === "ivan") {
    BtnDashboard.style.display = "block";
  }
}

// ===== FUNCIONES DE GESTIÓN DE TIPOS =====

// Función para agregar un tipo nuevo
async function agregarTipo() {
  const inputTipo = document.getElementById("nuevoTipo");
  const nuevoTipo = inputTipo.value.trim();

  if (!nuevoTipo) {
    alert("Escribe un tipo de recomendación");
    return;
  }

  // Obtener tipos actuales
  let tiposExistentes = [];
  try {
    tiposExistentes = await obtenerTipos();
  } catch (e) {
    const datosJSON = appStorage.getItem("datos");
    const datos = datosJSON ? JSON.parse(datosJSON) : [];
    tiposExistentes = [...new Set(datos.map(d => d.tipo))];
  }

  // Verificar si el tipo ya existe
  if (tiposExistentes.includes(nuevoTipo)) {
    alert("Este tipo ya existe");
    return;
  }

  // Guardar tipo en almacenamiento
  const almacenados = obtenerTiposAlmacenados();
  almacenados.push(nuevoTipo);
  guardarTipos(almacenados);

  // Limpiar input
  inputTipo.value = "";

  // Actualizar listas
  cargarTipos().catch(console.error);
  mostrarListaTipos().catch(console.error);
  alert(`Tipo "${nuevoTipo}" agregado correctamente`);
}

// Función para quitar un tipo
async function quitarTipo(tipo) {
  if (!confirm(`¿Está seguro de que desea eliminar el tipo "${tipo}"?`)) {
    return;
  }

  try {
    // Obtener datos y filtrar
    const datos = await obtenerDatos();
    const filtrados = datos.filter(d => d.tipo !== tipo);
    guardarDatos(filtrados);
    
    // quitar tipo de almacenados
    const almacenados = obtenerTiposAlmacenados().filter(t => t !== tipo);
    guardarTipos(almacenados);
    
    // Actualizar listas
    cargarTipos().catch(console.error);
    mostrarListaTipos().catch(console.error);
    alert(`Tipo "${tipo}" y sus recomendaciones eliminados`);
  } catch (error) {
    alert("Error al eliminar: " + error.message);
  }
}

// Función para mostrar la lista de tipos en el dashboard
async function mostrarListaTipos() {
  const listaTipos = document.getElementById("listaTipos");
  if (!listaTipos) return;

  let tiposUnicos = [];
  try {
    tiposUnicos = await obtenerTipos();
  } catch (e) {
    const datosJSON = appStorage.getItem("datos");
    const datos = datosJSON ? JSON.parse(datosJSON) : [];
    tiposUnicos = [...new Set(datos.map(d => d.tipo))];
  }

  listaTipos.innerHTML = "";

  if (tiposUnicos.length === 0) {
    listaTipos.innerHTML = "<p>No hay tipos registrados</p>";
    return;
  }

  tiposUnicos.forEach(tipo => {
    const div = document.createElement("div");
    div.className = "tipo-item";
    div.style.display = "flex";
    div.style.justifyContent = "space-between";
    div.style.alignItems = "center";
    div.style.padding = "10px";
    div.style.marginBottom = "8px";
    div.style.background = "#f0f0f0";
    div.style.borderRadius = "4px";

    const span = document.createElement("span");
    span.textContent = tipo;
    span.style.fontWeight = "bold";

    const btnEliminar = document.createElement("button");
    btnEliminar.textContent = "Eliminar";
    btnEliminar.style.padding = "5px 10px";
    btnEliminar.style.background = "#f5576c";
    btnEliminar.style.color = "white";
    btnEliminar.style.border = "none";
    btnEliminar.style.borderRadius = "4px";
    btnEliminar.style.cursor = "pointer";
    btnEliminar.onclick = () => quitarTipo(tipo).catch(console.error);

    div.appendChild(span);
    div.appendChild(btnEliminar);
    listaTipos.appendChild(div);
  });
}

// Cargar lista de tipos al entrar al dashboard
window.addEventListener("load", () => {
  const listaTipos = document.getElementById("listaTipos");
  if (listaTipos) {
    mostrarListaTipos().catch(console.error);
  }
});