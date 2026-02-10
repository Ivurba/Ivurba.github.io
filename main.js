// ===== FUNCIONES DE SESIÓN =====

// Función para verificar y mostrar estado de sesión
function verificarSesion() {
  const sesionActiva = localStorage.getItem("sesionActiva");
  const infoUsuario = document.getElementById("infoUsuario");
  const btnSesion = document.getElementById("btnSesion");

  if (sesionActiva) {
    const datos = JSON.parse(sesionActiva);
    infoUsuario.innerHTML = `<span>Bienvenido, <strong>${datos.usuario}</strong></span>`;
    infoUsuario.style.display = "block";
    
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
      { nombre: "El Quijote", tipo: "Libro" },
      { nombre: "Cien años de soledad", tipo: "Libro" },
      { nombre: "Inception", tipo: "Película" },
      { nombre: "The Matrix", tipo: "Película" }
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
  const resultado = document.getElementById("resultado");

  const datosJSON = localStorage.getItem("datos");
  if (!datosJSON) {
    resultado.innerHTML = "<li>No hay datos</li>";
    return;
  }

  const datos = JSON.parse(datosJSON);

  const filtrados = datos.filter(d =>
    d.nombre.toLowerCase().includes(texto) &&
    (tipo === "" || d.tipo === tipo)
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
  const nombre = document.getElementById("txtNombreNuevo").value;
  const tipo = document.getElementById("lstTipoNuevo").value;
  const archivoPortada = document.getElementById("PortadaNueva").files[0];

  if (nombre === "" || tipo === "") {
    alert("Completa todos los campos");
    return;
  }

  const datosJSON = localStorage.getItem("datos");
  if (!datosJSON) {
    inicializarDatos();
    return anadir();
  }

  const datos = JSON.parse(datosJSON);
  
  const nuevoElemento = { nombre, tipo };
  
  // Si hay archivo, convertirlo a base64
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

  document.getElementById("txtNombreNuevo").value = "";
  document.getElementById("PortadaNueva").value = "";

  // Recarga las listas en caso de que se agregue un nuevo tipo
  cargarTipos();
  
  // Vuelve a la página principal
  window.location.href = "main.html";
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
cargarTipos();
buscar();
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
