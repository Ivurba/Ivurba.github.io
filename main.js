// ===== FUNCIONES DE SESIÓN =====

// Función para verificar y mostrar estado de sesión
function verificarSesion() {
  const sesionActiva = localStorage.getItem("sesionActiva");
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
  localStorage.removeItem("sesionActiva");
  verificarSesion();
  buscar();
  AbrirDashboard();
}

// ===== FUNCIONES DE LISTAS PERSONALIZADAS =====

// Función para inicializar listas personalizadas
function inicializarListas() {
  if (!localStorage.getItem("listas")) {
    localStorage.setItem("listas", JSON.stringify({}));
  }
}

// Función para acceder a una lista personalizada
function accederALista() {
  const nombreLista = document.getElementById("listaPersonalizada").value.trim();
  
  if (!nombreLista) {
    alert("Escribe el nombre de la lista");
    return;
  }

  const listas = JSON.parse(localStorage.getItem("listas")) || {};

  // Si no existe, crear la lista
  if (!listas[nombreLista]) {
    listas[nombreLista] = { nombre: nombreLista, elementos: [] };
    localStorage.setItem("listas", JSON.stringify(listas));
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

  const listas = JSON.parse(localStorage.getItem("listas")) || {};
  
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
  localStorage.setItem("listas", JSON.stringify(listas));
  alert(`"${nombre}" agregado a "${nombreLista}"`);
}

// Función para mostrar elementos de lista personalizada
function mostrarListaPersonalizada(nombreLista) {
  const resultado = document.getElementById("resultado");
  const listas = JSON.parse(localStorage.getItem("listas")) || {};

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
  const listas = JSON.parse(localStorage.getItem("listas")) || {};
  listas[nombreLista].elementos.splice(indiceElemento, 1);
  localStorage.setItem("listas", JSON.stringify(listas));
  mostrarListaPersonalizada(nombreLista);
}

// Función para inicializar los datos si no existen en LocalStorage
function inicializarDatos() {
  if (!localStorage.getItem("datos")) {
   const datosIniciales = [
  { nombre: "El Quijote", tipo: "Libro", autor: "Miguel de Cervantes" },
  { nombre: "Cien años de soledad", tipo: "Libro", autor: "Gabriel García Márquez" },
  { nombre: "Inception", tipo: "Película", autor: "Christopher Nolan" },
  { nombre: "The Matrix", tipo: "Película", autor: "Hermanas Wachowski" }
];

    localStorage.setItem("datos", JSON.stringify(datosIniciales));
  }
}

// Función para cargar los tipos en las listas
function cargarTipos() {
  const datosJSON = localStorage.getItem("datos");
  
  if (!datosJSON) {
    inicializarDatos();
    return cargarTipos();
  }
  
  const datos = JSON.parse(datosJSON);

  const lstTipo = document.getElementById("lstTipo");
  const lstTipoNuevo = document.getElementById("lstTipoNuevo");

  const tiposUnicos = [...new Set(datos.map(d => d.tipo))];

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
function buscar() {
  const texto = document.getElementById("txtBuscar").value.toLowerCase();
  const tipo = document.getElementById("lstTipo").value;
  const Autor = document.getElementById("AutorBusqueda").value.toLowerCase();
  const resultado = document.getElementById("resultado");

  const datosJSON = localStorage.getItem("datos");
  if (!datosJSON) {
    resultado.innerHTML = "<li>No hay datos</li>";
    return;
  }

  const datos = JSON.parse(datosJSON);

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
    
    if (d.portada) {
      const img = document.createElement("img");
      img.src = d.portada;
      img.style.width = "100px";
      img.style.height = "150px";
      img.style.objectFit = "cover";
      img.style.marginRight = "10px";
      contenedor.appendChild(img);
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
const sesionActiva = localStorage.getItem("sesionActiva");
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
  const btnAnadir = document.getElementById("btnAnadir");

  const sesionActiva = localStorage.getItem("sesionActiva");

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

  const datosJSON = localStorage.getItem("datos");
  const datos = datosJSON ? JSON.parse(datosJSON) : [];

  const nuevoElemento = { nombre, tipo, autor };

  // 📷 Si hay imagen
  if (archivoPortada) {
    try {
      nuevoElemento.portada = await leerArchivo(archivoPortada);
    } catch (error) {
      alert("Error al cargar la imagen");
      return;
    }
  }

  datos.push(nuevoElemento);
  localStorage.setItem("datos", JSON.stringify(datos));

  // Limpiar campos
  document.getElementById("txtNombreNuevo").value = "";
  document.getElementById("PortadaNueva").value = "";

  alert("Recomendación añadida correctamente");

  window.location.href = "index.html";
}

// ===== FUNCIONES DE SESIÓN =====

// Función para inicializar usuarios
function inicializarUsuarios() {
  if (!localStorage.getItem("usuarios")) {
    localStorage.setItem("usuarios", JSON.stringify([]));
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
  const usuarios = JSON.parse(localStorage.getItem("usuarios"));

  // Verificar si el usuario ya existe
  if (usuarios.some(u => u.usuario === usuario)) {
    mostrarMensaje(mensaje, "Este usuario ya existe", "error");
    return;
  }

  // Guardar nuevo usuario
  usuarios.push({ usuario, contrasena });
  localStorage.setItem("usuarios", JSON.stringify(usuarios));
  
  mostrarMensaje(mensaje, "Registro exitoso. Ya puedes iniciar sesión", "exito");
  
  // Limpiar campos
  document.getElementById("usuarioReg").value = "";
  document.getElementById("contrasenaReg").value = "";
  document.getElementById("confirmarReg").value = "";
}

// Función para iniciar sesión
function iniciarSesion() {
  const usuario = document.getElementById("usuarioLogin").value.trim();
  const contrasena = document.getElementById("contrasenaLogin").value;
  const mensaje = document.getElementById("mensajeLogin");

  if (usuario === "" || contrasena === "") {
    mostrarMensaje(mensaje, "Completa todos los campos", "error");
    return;
  }

  inicializarUsuarios();
  const usuarios = JSON.parse(localStorage.getItem("usuarios"));

  // Verificar credenciales
  const usuarioValido = usuarios.find(u => u.usuario === usuario && u.contrasena === contrasena);

  if (usuarioValido) {
    localStorage.setItem("sesionActiva", JSON.stringify({ usuario }));
    mostrarMensaje(mensaje, "Sesión iniciada correctamente. Redirigiendo...", "exito");
    AbrirDashboard();
    
    // Redirigir a main.html después de 2 segundos
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
inicializarDatos();
if (document.getElementById("lstTipo") || document.getElementById("lstTipoNuevo")) {
  cargarTipos();
}

if (document.getElementById("txtBuscar")) {
  buscar();
}
if (!localStorage.getItem("sesionActiva")) {}else{
AbrirDashboard();
}
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
function eliminarRecomendacion(nombre) {
  const datos = JSON.parse(localStorage.getItem("datos")) || [];
  const sesionActiva = localStorage.getItem("sesionActiva");

  if (!sesionActiva) return;

  const usuarioActual = JSON.parse(sesionActiva).usuario;

  const nuevosDatos = datos.filter(d => 
    !(d.nombre === nombre && d.autor === usuarioActual)
  );

  localStorage.setItem("datos", JSON.stringify(nuevosDatos));

  buscar(); // refrescar lista
}

// ===== FUNCIONES DASHBOARD =====
function BuscarAutorDashboard() {
  const AutorBuscar = document.getElementById("txtBuscarDashboard").value.toLowerCase();
  const resultado = document.getElementById("dashboardList");

  if (!resultado) return; // Evita errores si el elemento no existe

  const datosJSON = localStorage.getItem("datos");
  if (!datosJSON) {
    resultado.innerHTML = "<li>No hay datos</li>";
    return;
  }

  const datos = JSON.parse(datosJSON);

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

function eliminarRecomendacionDashboard(nombre) {
  const datos = JSON.parse(localStorage.getItem("datos")) || [];

  const nuevosDatos = datos.filter(d => d.nombre !== nombre);

  localStorage.setItem("datos", JSON.stringify(nuevosDatos));
}


function AbrirDashboard() {
  const BtnDashboard = document.getElementById("btnDashboard");
  if (!BtnDashboard) return;

  const sesionActiva = localStorage.getItem("sesionActiva");

  // Siempre ocultar primero
  BtnDashboard.style.display = "none";

  if (!sesionActiva) return;

  const usuario = JSON.parse(sesionActiva).usuario;

  if (usuario && usuario.trim().toLowerCase() === "ivan") {
    BtnDashboard.style.display = "block";
  }
}

