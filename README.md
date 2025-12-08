# Backend para sistema de inventario

## Estructura del proyecto 
```bash
backend/
├── config/
│   └── db.js
├── controllers/
│   └──Controladores de la API
├── middleware/
│   └── Autenticación
├── routes/
│   └── Rutas de la API
├── utils/
│   └── Funciones auxiliares
├── .env
└── server.js
```



## Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/usuario/tu-repo.git
```

### 2. Entrar al proyecto
```bash
cd nombre-proyecto
```

### 3. Instalar dependencias
```bash
npm install
```

### 4. Crear archivo .env
```bash
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=tu_bd
PORT=3000
```

### 5. Ejecutar proyecto
#### Desarrollo
```bash
npm run dev
```
#### Producción
```bash
npm start
```
