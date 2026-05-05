const fs = require('fs');
const filePath = 'C:\\TH\\SISPO\\sispo-front\\src\\pages\\admin\\UsuariosPage.vue';
let content = fs.readFileSync(filePath, 'utf8');

// Replace the specific lines matching partial regexes
content = content.replace(/<p class="text-gray-500 font-medium">Aqu.*puede entrar cada usuario del sistema.<\/p>/, '<p class="text-gray-500 font-medium">Aquí solo gestionas a qué convocatorias específicas puede entrar cada usuario del sistema.</p>');
content = content.replace(/label="Sin restricci.*espec.*fica"/, 'label="Sin restricción específica"');
content = content.replace(/>Convocatorias espec.*ficas</, '>Convocatorias específicas<');
content = content.replace(/hint="Si seleccionas convocatorias, el usuario solo ver.*esas convocatorias.*Si queda vac.*o, ver.*las convocatorias permitidas por su acceso base."/, 'hint="Si seleccionas convocatorias, el usuario solo verá esas convocatorias y sus postulaciones relacionadas. Si queda vacío, verá las convocatorias permitidas por su acceso base."');

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed file encoding texts!');
