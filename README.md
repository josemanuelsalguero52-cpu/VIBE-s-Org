# 🏝️ VIBE — Red Social Por Islas

**VIBE** es una plataforma social interactiva y futurista basada en una vista panorámica de islas flotantes navegables. Cada isla representa un módulo funcional independiente (Feed, Chats en tiempo real, Crear Publicaciones, Perfil, Descubrir usuarios, Notificaciones y Configuración de Base de Datos).

---

## 🚀 Características Principales

- **Canvas Panorámico de Islas Flotantes**: Navegación inmersiva e intuitiva haciendo clic directamente en las islas para desplegar su contenido sin barras de navegación invasivas.
- **Feed Interactivo**: Publica mensajes, reacciona con "Me Gusta", comparte y comenta publicaciones en tiempo real.
- **Salas de Chat Realtime**: Sistema de mensajería instantánea interactiva con indicador de estado en línea.
- **Perfil de Usuario**: Visualiza tus estadísticas, historial de publicaciones y gestiona tu cuenta.
- **Sección Descubrir**: Encuentra nuevos usuarios de la comunidad VIBE y síguelos con un solo clic.
- **Centro de Notificaciones**: Mantente al día con likes, menciones, mensajes y seguidores.
- **Integración con Supabase**: Soporte para base de datos persistente en la nube y autenticación.
- **Diseño Elegane & Responsivo**: Interfaz con paleta sobria (`#0A0E14`, `#121824`, acento `#3B6FF0`) y animaciones fluidas impulsadas por Motion.

---

## 🛠️ Tecnologías Utilizadas

- **Frontend**: [React 18](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- **Build Tool**: [Vite](https://vitejs.dev/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Animaciones**: [Motion (Framer Motion)](https://motion.dev/)
- **Iconografía**: [Lucide React](https://lucide.dev/)
- **Backend / Persistencia**: [Supabase](https://supabase.com/)

---

## 📂 Estructura del Proyecto

```text
├── src/
│   ├── assets/          # Logotipos e íconos vectoriales oficiales VIBE
│   ├── components/      # Componentes UI (IslandsCanvas, AuthModal, CommentsSection)
│   │   └── islands/     # Módulos de islas (FeedIsland, ChatsIsland, ProfileIsland, etc.)
│   ├── lib/             # Cliente Supabase y llamadas a API
│   ├── types.ts         # Definiciones de tipos TypeScript
│   ├── App.tsx          # Componente raíz
│   └── main.tsx         # Punto de entrada
├── index.html           # Plantilla HTML principal
├── package.json         # Configuración de scripts y dependencias
└── README.md            # Documentación del proyecto
```

---

## ⚡ Instalación y Ejecución Local

1. **Clonar el repositorio:**
   ```bash
   git clone <repository-url>
   cd vibe-islands
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno (Opcional):**
   Copia el archivo `.env.example` a `.env` e ingresa tus credenciales de Supabase para activar la base de datos persistente:
   ```env
   VITE_SUPABASE_URL="https://tu-proyecto.supabase.co"
   VITE_SUPABASE_ANON_KEY="tu-anon-key"
   ```

4. **Iniciar el servidor de desarrollo:**
   ```bash
   npm run dev
   ```

5. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 📄 Licencia

Proyecto liberado bajo la licencia MIT.
