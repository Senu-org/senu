export function HomeFooter() {
    return (
        <footer className="bg-gradient-to-br from-slate-100 to-slate-200 py-12 px-4 mt-16">
            <div className="border-t border-gray-300 mt-8 pt-6">
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <div className="mb-4 md:mb-0">
                        © 2024 Senu. Todos los derechos reservados.
                    </div>
                    <div className="flex space-x-6">
                        <a href="#" className="hover:text-gray-700 transition-colors">
                            Términos de Servicio
                        </a>
                        <a href="#" className="hover:text-gray-700 transition-colors">
                            Política de Privacidad
                        </a>
                        <a href="#" className="hover:text-gray-700 transition-colors">
                            Contacto
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
