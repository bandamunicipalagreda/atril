/* ====== CONFIGURACIÓN DE ATRIL ======
   Es lo único que hay que cambiar al instalar (ver INSTALAR.txt). */

/* 1) Dirección del motor (la URL de Apps Script que termina en /exec) */
self.ATRIL_API = 'https://script.google.com/macros/s/AKfycbwyfnazNng7js-zRGE1qRF19162cVFTEPCWxOoEzBnDQ0TYLGbVz4qWPGvB3LhcskS2/exec';

/* 2) Notificaciones (Firebase). Si se deja así, la app funciona igual, pero sin avisos. */
self.ATRIL_FIREBASE = {
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  vapidKey: ''          // «Certificados web push» > «Par de claves»
};
