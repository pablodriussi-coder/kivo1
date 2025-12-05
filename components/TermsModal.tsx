import React from 'react';
import { X, FileText, Shield, AlertCircle } from 'lucide-react';

interface TermsModalProps {
  onClose: () => void;
}

export const TermsModal: React.FC<TermsModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full flex flex-col max-h-[90vh] transition-colors">
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 rounded-t-xl">
          <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
            <FileText className="w-5 h-5" />
            <h2 className="text-xl font-bold">Términos y Condiciones de Uso</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800">
          <div className="prose prose-indigo dark:prose-invert prose-sm max-w-none text-gray-600 dark:text-gray-300">
            <h3 className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-3">
              <Shield className="w-4 h-4 text-indigo-500" />
              1. Aceptación de los Términos
            </h3>
            <p className="mb-4">
              Al acceder y utilizar KiVO (Kinetic + Visual + Observation), usted acepta cumplir con estos términos y condiciones. Esta aplicación utiliza Inteligencia Artificial para evaluar la accesibilidad arquitectónica, pero sus resultados son sugerencias y no certificaciones legales.
            </p>

            <h3 className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold mb-3">
              <AlertCircle className="w-4 h-4 text-orange-500" />
              2. Limitación de Responsabilidad
            </h3>
            <p className="mb-4">
              KiVO proporciona análisis basados en visión por computadora. Estos análisis pueden contener errores o imprecisiones. <strong>Esta herramienta no sustituye la auditoría profesional de un arquitecto certificado o un experto en accesibilidad.</strong> Los desarrolladores no se hacen responsables de construcciones o modificaciones realizadas basándose únicamente en esta aplicación.
            </p>

            <h3 className="text-gray-900 dark:text-white font-semibold mb-3">3. Privacidad de Datos</h3>
            <p className="mb-4">
              Las imágenes cargadas son procesadas por Google Gemini API. Al subir una imagen, usted garantiza que tiene los derechos para usarla y que no infringe la privacidad de terceros. KiVO almacena los datos de los proyectos localmente en su dispositivo (LocalStorage).
            </p>

            <h3 className="text-gray-900 dark:text-white font-semibold mb-3">4. Uso Adecuado</h3>
            <p className="mb-4">
              Usted se compromete a no utilizar el servicio para actividades ilegales, discriminatorias o que violen los derechos de propiedad intelectual.
            </p>
            
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-8 border-t dark:border-gray-700 pt-4">
              Última actualización: Octubre 2023. KiVO es una herramienta de demostración tecnológica.
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Entendido, Aceptar
          </button>
        </div>
      </div>
    </div>
  );
};