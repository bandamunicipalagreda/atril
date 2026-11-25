/* ====== CONFIGURACIÓN DE ATRIL ======
   Es lo único que hay que cambiar al instalar (ver INSTALAR.txt). */

/* 1) Dirección del motor (la URL de Apps Script que termina en /exec) */
self.ATRIL_API = 'https://script.google.com/macros/s/AKfycbwyfnazNng7js-zRGE1qRF19162cVFTEPCWxOoEzBnDQ0TYLGbVz4qWPGvB3LhcskS2/exec';

/* 2) Notificaciones (Firebase). Si se deja así, la app funciona igual, pero sin avisos. */
self.ATRIL_FIREBASE = {
  apiKey: 'AIzaSyA89Ey_R8eC_jO5HAV9WVijYO9nOB3VEvg',
  authDomain: 'atril-3506f.firebaseapp.com',
  projectId: 'atril-3506f',
  storageBucket: 'atril-3506f.firebasestorage.app',
  messagingSenderId: '508160816178',
  appId: '1:508160816178:web:49502ae8d4185741c4f82b',
  vapidKey: 'BMeS5K8EuKUzmBlZGptcrslhTTjc48QZjATfrIhLcobp5Sf4ySmcNaqdPB7fT-5VT7t8Kne1ASWaaF9ydPfMAYY'          // «Certificados web push» > «Par de claves»
};
