# Descanso Ojos 👁️

App sencilla en Next.js que implementa la regla **20-20-20**: cada 20 minutos
te recuerda con una pantalla visual (y sonido) que descanses la vista durante
20 segundos mirando algo a 6 metros (20 pies) de distancia.

## Desarrollo local

```bash
npm install
npm run dev
```

Abre http://localhost:3000, pulsa **Iniciar jornada** y deja la pestaña abierta.

## Publicar en Vercel

**Opción A — con GitHub (recomendada):**
1. Sube este proyecto a un repositorio en GitHub.
2. Entra a https://vercel.com/new, importa el repo y despliega (no requiere
   configuración extra, Vercel detecta Next.js automáticamente).

**Opción B — directo desde la terminal, sin GitHub:**
```bash
npm install -g vercel
vercel
```
Sigue las instrucciones en pantalla (login y confirmar el proyecto) y al
terminar obtendrás la URL pública.
