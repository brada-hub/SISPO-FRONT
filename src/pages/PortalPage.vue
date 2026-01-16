<template>
    <q-page class="flex flex-col min-h-screen font-sans bg-gray-50">

        <!-- HEADER / HERO SECTION -->
        <div class="relative bg-primary text-white overflow-hidden pb-32">
            <!-- Decoración de Fondo (Patron) -->
            <div class="absolute inset-0 opacity-10 pointer-events-none">
                <svg class="w-full h-full" width="100%" height="100%" viewBox="0 0 800 800"
                    xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M0 40L40 0H20L0 20M40 40V20L20 40" stroke="white" stroke-width="2" fill="none" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
            </div>
            <div class="absolute inset-0 bg-gradient-to-b from-transparent to-primary/90"></div>

            <!-- Navbar Simple Transparente -->
            <div class="relative z-20 px-6 py-4 flex justify-between items-center max-w-7xl mx-auto">
                <div class="flex items-center gap-3">
                    <div class="bg-white p-1.5 rounded-lg shadow-lg">
                        <img src="~assets/logo_unitepc.png" alt="UNITEPC" class="h-8 md:h-10" />
                    </div>
                    <div class="hidden md:block leading-tight text-white">
                        <div class="font-bold tracking-wide text-sm opacity-90">UNIVE. TÉCNICA PRIVADA COSMOS</div>
                        <div class="text-[10px] opacity-70 tracking-widest uppercase">Sistema de Talento Humano</div>
                    </div>
                </div>
                <div>
                    <q-btn outline rounded color="white" label="Iniciar Sesión" to="/login" no-caps
                        class="px-6 border-white/30 hover:bg-white/10" />
                </div>
            </div>

            <!-- Contenido Hero Centrado -->
            <div class="relative z-10 max-w-5xl mx-auto px-6 pt-12 text-center">

                <div
                    class="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-4 py-1 mb-8 animate-fade-in-down">
                    <span class="relative flex h-3 w-3">
                        <span
                            class="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                        <span class="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                    </span>
                    <span class="text-sm font-medium tracking-wide text-teal-100">Convocatorias Abiertas 2026</span>
                </div>

                <h1 class="text-5xl md:text-7xl font-bold mb-6 tracking-tight leading-tight hero-text-shadow">
                    Construye tu Futuro <br />
                    <span class="text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-white">con
                        Nosotros</span>
                </h1>

                <p class="text-lg md:text-2xl text-blue-100 mb-10 max-w-3xl mx-auto font-light leading-relaxed">
                    Forma parte de la Universidad Técnica Privada Cosmos. Buscamos talento comprometido con la
                    excelencia educativa y la innovación.
                </p>

                <div class="flex flex-col sm:flex-row justify-center gap-4 animate-fade-in-up">
                    <q-btn to="/postular" unelevated color="warning" text-color="dark" size="xl"
                        class="rounded-full px-10 shadow-xl shadow-yellow-500/20 hover:scale-105 transition-transform"
                        no-caps>
                        <div class="flex flex-col items-center leading-none py-1">
                            <span class="text-lg font-bold">Postular Ahora</span>
                            <span class="text-[10px] opacity-70 font-normal uppercase tracking-wider">Proceso
                                Digital</span>
                        </div>
                        <q-icon name="rocket_launch" class="ml-3" size="24px" />
                    </q-btn>

                    <q-btn to="/seguimiento" outline color="white" size="xl"
                        class="rounded-full px-8 hover:bg-white/10 backdrop-blur-sm border-white/30" no-caps>
                        <q-icon name="search" class="mr-2" size="24px" />
                        <span>Seguimiento</span>
                    </q-btn>
                </div>
            </div>
        </div>

        <!-- MAIN CONTENT - CARDS (Overlapping) -->
        <div class="flex-grow bg-gray-50 relative z-20">
            <div class="max-w-7xl mx-auto px-6 -mt-24 relative z-30">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <!-- Card 1 -->
                    <div
                        class="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
                        <div
                            class="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-blue-500/30">
                            <q-icon name="public" size="32px" />
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-3">Cobertura Nacional</h3>
                        <p class="text-gray-500 leading-relaxed text-sm">
                            Accede a oportunidades laborales en todas nuestras sedes a nivel nacional desde una única
                            plataforma centralizada.
                        </p>
                    </div>

                    <!-- Card 2 -->
                    <div
                        class="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 relative overflow-hidden">
                        <div class="absolute top-0 right-0 p-4 opacity-5">
                            <q-icon name="gpp_good" size="120px" />
                        </div>
                        <div
                            class="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-purple-800 flex items-center justify-center text-white mb-6 shadow-lg shadow-purple-500/30">
                            <q-icon name="security" size="32px" />
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-3">Datos Protegidos</h3>
                        <p class="text-gray-500 leading-relaxed text-sm">
                            Garantizamos la confidencialidad de su información personal y documentación académica bajo
                            estrictos protocolos.
                        </p>
                    </div>

                    <!-- Card 3 -->
                    <div
                        class="bg-white rounded-3xl p-8 shadow-xl shadow-gray-200/50 hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100">
                        <div
                            class="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-400 to-teal-600 flex items-center justify-center text-white mb-6 shadow-lg shadow-teal-500/30">
                            <q-icon name="speed" size="32px" />
                        </div>
                        <h3 class="text-2xl font-bold text-gray-800 mb-3">Gestión Ágil</h3>
                        <p class="text-gray-500 leading-relaxed text-sm">
                            Monitoree el estado de su postulación en tiempo real y reciba notificaciones sobre el avance
                            del proceso.
                        </p>
                    </div>
                </div>

                <!-- Sección Extra: Valores / Banner -->
                <div class="mt-20 mb-20">
                    <div
                        class="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 flex flex-col md:flex-row">
                        <div class="md:w-1/2 p-12 flex flex-col justify-center">
                            <div class="uppercase tracking-widest text-xs font-bold text-primary mb-2">Nuestra Cultura
                            </div>
                            <h2 class="text-3xl font-bold text-gray-800 mb-6">Innovación y Excelencia</h2>
                            <p class="text-gray-500 leading-relaxed mb-6">
                                En la UNITEPC valoramos el talento que busca transformar la educación. Ofrecemos un
                                ambiente de crecimiento profesional continuo y desafíos que inspiran.
                            </p>
                            <div class="flex gap-4">
                                <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <q-icon name="check_circle" color="secondary" /> Crecimiento
                                </div>
                                <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <q-icon name="check_circle" color="secondary" /> Estabilidad
                                </div>
                                <div class="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                    <q-icon name="check_circle" color="secondary" /> Impacto
                                </div>
                            </div>
                        </div>
                        <div class="md:w-1/2 relative min-h-[300px]">
                            <img src="~assets/team_culture.png" alt="Cultura UNITEPC"
                                class="absolute inset-0 w-full h-full object-cover" />
                            <div class="absolute inset-0 bg-primary/10 mix-blend-multiply"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- PROFESSIONAL FOOTER -->
        <footer class="bg-gray-900 text-white pt-16 pb-8 border-t border-gray-800 mt-auto">
            <div class="max-w-7xl mx-auto px-6">
                <div class="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
                    <!-- Columna 1: Info Universidad -->
                    <div class="col-span-1 md:col-span-2">
                        <div class="flex items-center gap-3 mb-6">
                            <img src="~assets/logo_unitepc.png" class="h-12 bg-white/10 rounded-lg p-1" />
                            <div>
                                <h4 class="text-lg font-bold tracking-wide">UNITEPC</h4>
                                <p class="text-xs text-gray-500 uppercase tracking-widest">Universidad Técnica Privada
                                    Cosmos</p>
                            </div>
                        </div>
                        <p class="text-gray-400 text-sm leading-relaxed max-w-md mb-6">
                            Comprometidos con la formación de profesionales de excelencia, impulsando el desarrollo
                            científico y tecnológico de la sociedad.
                        </p>
                        <div class="flex gap-4">
                            <a href="https://www.facebook.com/unitepc?locale=es_LA" target="_blank"
                                class="w-10 h-10 rounded-full bg-white/5 hover:bg-primary flex items-center justify-center transition-colors text-white">
                                <q-icon name="facebook" size="20px" />
                            </a>
                            <a href="https://www.instagram.com/unitepc.bolivia/" target="_blank"
                                class="w-10 h-10 rounded-full bg-white/5 hover:bg-primary flex items-center justify-center transition-colors text-white">
                                <q-icon name="camera_alt" size="20px" /> <!-- Instagram -->
                            </a>
                            <a href="https://www.tiktok.com/@unitepc.oficial" target="_blank"
                                class="w-10 h-10 rounded-full bg-white/5 hover:bg-primary flex items-center justify-center transition-colors text-white">
                                <q-icon name="music_note" size="20px" /> <!-- TikTok -->
                            </a>
                            <a href="https://unitepc.edu.bo/" target="_blank"
                                class="w-10 h-10 rounded-full bg-white/5 hover:bg-primary flex items-center justify-center transition-colors text-white">
                                <q-icon name="language" size="20px" />
                            </a>
                        </div>
                    </div>

                    <!-- Columna 2: Enlaces Rápidos -->
                    <div>
                        <h5 class="text-white font-bold mb-6 border-b border-gray-800 pb-2 inline-block">Enlaces Rápidos
                        </h5>
                        <ul class="space-y-3 text-sm text-gray-400">
                            <li><a href="https://unitepc.edu.bo/" target="_blank"
                                    class="hover:text-primary transition-colors flex items-center gap-2"><q-icon
                                        name="chevron_right" size="xs" /> Portal Web</a></li>
                            <li><a href="https://unitepc.edu.bo/" target="_blank"
                                    class="hover:text-primary transition-colors flex items-center gap-2"><q-icon
                                        name="chevron_right" size="xs" /> Oferta Académica</a></li>
                            <li><a href="https://unitepc.edu.bo/" target="_blank"
                                    class="hover:text-primary transition-colors flex items-center gap-2"><q-icon
                                        name="chevron_right" size="xs" /> Sedes</a></li>
                            <li><a href="https://unitepc.edu.bo/" target="_blank"
                                    class="hover:text-primary transition-colors flex items-center gap-2"><q-icon
                                        name="chevron_right" size="xs" /> Contacto</a></li>
                        </ul>
                    </div>

                    <!-- Columna 3: Contacto -->
                    <div>
                        <h5 class="text-white font-bold mb-6 border-b border-gray-800 pb-2 inline-block">Contacto RR.HH.
                        </h5>
                        <ul class="space-y-4 text-sm text-gray-400">
                            <li class="flex items-start gap-3">
                                <q-icon name="location_on" class="mt-1 text-primary" />
                                <span>Av. Blanco Galindo Km 3.5<br />Cochabamba, Bolivia</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <q-icon name="phone" class="text-primary" />
                                <span>800102627</span>
                            </li>
                            <li class="flex items-center gap-3">
                                <q-icon name="email" class="text-primary" />
                                <span>rrhh@unitepc.edu.bo</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div
                    class="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500">
                    <p>&copy; 2026 Universidad Técnica Privada Cosmos. Todos los derechos reservados.</p>
                    <div class="flex gap-6 mt-4 md:mt-0">
                        <a href="#" class="hover:text-white transition-colors">Términos de Uso</a>
                        <a href="#" class="hover:text-white transition-colors">Política de Privacidad</a>
                    </div>
                </div>
            </div>
        </footer>

    </q-page>
</template>

<script setup>
// No store required for this landing page
</script>

<style scoped>
.hero-text-shadow {
    text-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.pattern-dots {
    background-image: radial-gradient(currentColor 1px, transparent 1px);
    background-size: 20px 20px;
}

/* Animaciones Simples */
@keyframes fade-in-down {
    from {
        opacity: 0;
        transform: translateY(-20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-down {
    animation: fade-in-down 0.8s ease-out;
}

@keyframes fade-in-up {
    from {
        opacity: 0;
        transform: translateY(20px);
    }

    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.animate-fade-in-up {
    animation: fade-in-up 0.8s ease-out 0.2s backwards;
}
</style>
