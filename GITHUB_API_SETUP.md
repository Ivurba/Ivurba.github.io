# 🚀 Configuración: GitHub API + GitHub Pages

## ✅ Requisitos completados

Tu app ahora sincroniza datos **automáticamente con GitHub** a través de la API. 

- ✅ Lee/escribe en `datos-recomendaciones.json` en tu repo
- ✅ Los mismos datos en todos los dispositivos
- ✅ Sin necesidad de Google Sheets o backend
- ✅ Funciona en GitHub Pages

---

## 📋 Qué necesitas hacer ahora

### Paso 1: Sube los archivos a GitHub

**En tu repositorio `Ivurba.github.io`:**

1. Crea/reemplaza el archivo **`datos-recomendaciones.json`** con el contenido de este proyecto
2. Sube `main.js` actualizado
3. Sube los demás archivos HTML y CSS

```bash
git add .
git commit -m "Configurar sincronización con GitHub API"
git push origin main
```

### Paso 2: Verifica que funciona

1. Abre tu GitHub Page: `https://Ivurba.github.io/`
2. Intenta **agregar una recomendación**
3. Abre otra pestaña/dispositivo
4. **Actualiza** y debe aparecer la nueva recomendación

---

## 🔧 Cómo funciona

**Configuración de GitHub:**
```javascript
const GITHUB_USER = "Ivurba";
const GITHUB_REPO = "Ivurba.github.io";
const DATA_FILE = "datos-recomendaciones.json";
```

La app **te pedirá tu Token** la primera vez que intentes sincronizar datos. El token se almacena en `sessionStorage` (solo durante esa sesión del navegador) y NO se guarda en el código.

**Cada operación:**
- ✅ Leer datos: `GET /repos/Ivurba/Ivurba.github.io/contents/datos-recomendaciones.json`
- ✅ Guardar: `PUT /repos/Ivurba/Ivurba.github.io/contents/datos-recomendaciones.json`
- ✅ Autorización: Token personal que proporcionas en el navegador

---

## ⚠️ Seguridad

**El token NO está en el código** - se solicita al usuario en tiempo de ejecución y se almacena localmente en la sesión.

Para obtener un token:
1. Ve a [GitHub Settings → Tokens](https://github.com/settings/tokens)
2. Crea un "Personal Access Token" con permisos `repo`
3. Cuando la app lo pida, pega el token
4. El token se guarda solo para esa sesión (no es persistente)

⚠️ **Nunca compartas tu token** - es como tu contraseña de GitHub

---

## 🔄 Sincronización

Cuando abres la app:
1. **Lee** `datos-recomendaciones.json` de GitHub
2. Muestra los datos
3. Al agregar/eliminar, **actualiza el archivo** en GitHub
4. Otros dispositivos **ven los cambios al actualizar**

---

## 🚨 Si no funciona

### Error: "Error obteniendo datos de GitHub"

**Causas comunes:**
- El archivo `datos-recomendaciones.json` no existe en el repo
- El token expiró o es inválido
- Problemas de CORS (raros con esta API)

**Solución:**
1. Verifica que el archivo exista en `Ivurba.github.io/datos-recomendaciones.json`
2. Abre la consola (F12) y busca el error específico
3. Si dice "Not Found", sube el archivo manualmente

### Error: "Error al guardar en GitHub"

**Probablemente:**
- El token no tiene permisos `repo`
- El archivo cambió en GitHub y el SHA no coincide

**Solución:**
1. Recarga la página
2. Intenta nuevamente

---

## 📁 Estructura esperada

```
Ivurba.github.io/
├── index.html
├── main.js  (actualizado con GitHub API)
├── styles.css
├── DashBoard.html
├── IniciarSesion.html
├── Publicar.html
├── datos-recomendaciones.json  ← IMPORTANTE
└── ... otros archivos
```

---

## 💡 Fallback local

Si GitHub falla:
- Los datos se guardan en `localStorage` del navegador
- La app sigue funcionando offline
- Cuando GitHub vuelve, se sincroniza automáticamente

---

## 🎉 ¡Listo!

Tu app ahora:
- ✅ Sincroniza datos entre dispositivos
- ✅ Se ejecuta en GitHub Pages (sin servidor)
- ✅ Usa GitHub como base de datos
- ✅ Funciona offline temporalmente

**Prueba agregando datos desde dos devices a la vez 🚀**
