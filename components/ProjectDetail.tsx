import React, { useState } from 'react';
import { Project, AnalysisItem } from '../types';
import { ArrowLeft, Upload, Camera, Trash2, Loader2, Sparkles, Download, Eye, User, AlertTriangle, CheckCircle, XCircle, Info, Accessibility } from 'lucide-react';
import { CameraCapture } from './CameraCapture';
import { ImageViewer } from './ImageViewer';
import ReactMarkdown from 'react-markdown';
import { compressImage } from '../services/imageUtils';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
  onUpdateProject: (project: Project) => void;
  onStartAnalysis: (projectId: string, analysisId: string, imageBase64: string) => void;
}

export const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack, onUpdateProject, onStartAnalysis }) => {
  const [showCamera, setShowCamera] = useState(false);
  const [processingImage, setProcessingImage] = useState(false);
  const [viewImage, setViewImage] = useState<string | null>(null);

  const handleImageAdd = async (base64Image: string) => {
    setShowCamera(false);
    setProcessingImage(true);
    
    try {
      // Compress image before storing to avoid LocalStorage quota limits
      const compressedImage = await compressImage(base64Image);

      const newAnalysis: AnalysisItem = {
        id: Date.now().toString(),
        imageUrl: compressedImage,
        result: null,
        loading: true // Start loading immediately
      };

      const updatedProject = {
        ...project,
        analyses: [newAnalysis, ...project.analyses]
      };

      onUpdateProject(updatedProject);
      // Trigger the analysis in App.tsx (persists even if user leaves component)
      onStartAnalysis(project.id, newAnalysis.id, compressedImage);

    } catch (error) {
      console.error("Error processing image", error);
      alert("Hubo un error al procesar la imagen. Intenta con una imagen más pequeña.");
    } finally {
      setProcessingImage(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProcessingImage(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        handleImageAdd(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRetryAnalysis = (analysisId: string, imageUrl: string) => {
    // Set loading state locally first
    const updatedProject = {
        ...project,
        analyses: project.analyses.map(a => a.id === analysisId ? { ...a, loading: true, error: undefined } : a)
    };
    onUpdateProject(updatedProject);
    onStartAnalysis(project.id, analysisId, imageUrl);
  };

  const deleteAnalysis = (id: string) => {
    onUpdateProject({
      ...project,
      analyses: project.analyses.filter(a => a.id !== id)
    });
  };

  const handleDownloadPDF = (analysis: AnalysisItem) => {
    if (!analysis.result) return;
    
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const { verdict, summary, categories, fullReportMarkdown, timestamp } = analysis.result;
    // Fallback for old data format
    const isLegacy = !categories;
    const markdownContent = fullReportMarkdown || analysis.result.markdown || "";

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Informe KiVO</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #1f2937; max-width: 800px; margin: 0 auto; }
            h1 { color: #4f46e5; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px; margin-bottom: 10px; }
            h2 { color: #111827; margin-top: 30px; border-bottom: 1px solid #e5e7eb; padding-bottom: 5px;}
            h3 { color: #374151; margin-bottom: 5px; }
            .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
            .meta { color: #6b7280; font-size: 0.9em; }
            .logo { font-weight: bold; font-size: 1.5em; color: #4f46e5; }
            .image-container { margin-bottom: 30px; text-align: center; background: #f9fafb; padding: 20px; border-radius: 8px; }
            img { max-width: 100%; max-height: 400px; border-radius: 4px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
            .verdict-box { 
                padding: 20px; 
                background: #f3f4f6; 
                border-radius: 8px; 
                margin-bottom: 30px; 
                border-left: 5px solid #4f46e5;
            }
            .verdict-title { font-weight: bold; text-transform: uppercase; color: #6b7280; font-size: 0.8em; margin-bottom: 5px; }
            .verdict-value { font-size: 1.5em; font-weight: bold; color: #111827; }
            
            .category { margin-bottom: 20px; padding: 15px; border: 1px solid #e5e7eb; border-radius: 8px; page-break-inside: avoid; }
            .cat-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
            .cat-title { font-weight: bold; font-size: 1.1em; color: #111827; }
            .badge { padding: 4px 8px; border-radius: 4px; font-size: 0.8em; font-weight: bold; text-transform: uppercase; }
            .badge-positive { background: #d1fae5; color: #065f46; }
            .badge-warning { background: #fef3c7; color: #92400e; }
            .badge-negative { background: #fee2e2; color: #b91c1c; }
            
            ul { margin: 0; padding-left: 20px; }
            li { margin-bottom: 8px; line-height: 1.5; }
            
            .footer { margin-top: 50px; text-align: center; color: #9ca3af; font-size: 0.8em; border-top: 1px solid #e5e7eb; padding-top: 20px; }
            
            @media print {
              body { padding: 0; }
              button { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="logo">KiVO</div>
            <div class="meta">Fecha: ${new Date(timestamp).toLocaleDateString()}</div>
          </div>
          
          <h1>Informe de Accesibilidad</h1>
          
          <div class="image-container">
            <img src="${analysis.imageUrl}" alt="Espacio analizado" />
          </div>

          <div class="verdict-box">
             <div class="verdict-title">Veredicto General</div>
             <div class="verdict-value">${verdict || "Informe de Análisis"}</div>
             <p style="margin-top: 10px;">${summary || ""}</p>
          </div>
          
          ${!isLegacy && categories ? `
            <h2>Resumen por Categorías</h2>
            ${categories.map(c => `
              <div class="category">
                <div class="cat-header">
                  <div class="cat-title">${c.title}</div>
                  <span class="badge badge-${c.status}">${c.status === 'positive' ? 'Bueno' : c.status === 'negative' ? 'Crítico' : 'Mejorable'}</span>
                </div>
                <ul>
                  ${c.details.map(d => `<li>${d}</li>`).join('')}
                </ul>
              </div>
            `).join('')}
          ` : ''}

          <h2>Detalles Técnicos</h2>
          <div style="line-height: 1.6; white-space: pre-wrap;">${markdownContent}</div>

          <div class="footer">
            Generado por KiVO - Kinetic + Visual + Observation
          </div>
          
          <script>
            window.onload = () => { setTimeout(() => window.print(), 500); }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(html);
    printWindow.document.close();
  };

  const renderStatusIcon = (status: string) => {
    switch (status) {
      case 'positive': return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'negative': return <XCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default: return <Info className="w-5 h-5 text-gray-500" />;
    }
  };

  const getCategoryIcon = (title: string) => {
    const t = title.toLowerCase();
    if (t.includes('motriz') || t.includes('físic') || t.includes('rampa')) return <User className="w-5 h-5" />;
    if (t.includes('visual') || t.includes('cieg') || t.includes('señal')) return <Eye className="w-5 h-5" />;
    if (t.includes('general') || t.includes('confort')) return <Accessibility className="w-5 h-5" />;
    return <Info className="w-5 h-5" />;
  };

  if (showCamera) {
    return <CameraCapture onCapture={handleImageAdd} onClose={() => setShowCamera(false)} />;
  }

  // Show a global loading overlay when processing images
  if (processingImage) {
    return (
      <div className="fixed inset-0 z-50 bg-white/80 dark:bg-gray-900/80 flex flex-col items-center justify-center backdrop-blur-sm">
        <Loader2 className="w-12 h-12 animate-spin text-indigo-600 dark:text-indigo-400 mb-4" />
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Procesando imagen...</h3>
        <p className="text-gray-500 dark:text-gray-400">Optimizando para análisis</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {viewImage && <ImageViewer imageUrl={viewImage} onClose={() => setViewImage(null)} />}
      
      <div className="flex items-center gap-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <button 
          onClick={onBack}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
        >
          <ArrowLeft className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{project.title}</h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{project.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 flex flex-col items-center justify-center gap-4 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group cursor-pointer relative overflow-hidden shadow-sm">
          <input 
            type="file" 
            accept="image/*" 
            className="absolute inset-0 opacity-0 cursor-pointer z-10"
            onChange={handleFileUpload}
          />
          <div className="bg-indigo-50 dark:bg-indigo-900/50 p-4 rounded-full group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
            <Upload className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Subir Imagen</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Selecciona una foto de tu galería</p>
          </div>
        </div>

        {/* Camera Card */}
        <button 
          onClick={() => setShowCamera(true)}
          className="bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 p-8 flex flex-col items-center justify-center gap-4 text-center hover:border-indigo-400 dark:hover:border-indigo-500 transition-colors group shadow-sm"
        >
          <div className="bg-indigo-50 dark:bg-indigo-900/50 p-4 rounded-full group-hover:bg-indigo-100 dark:group-hover:bg-indigo-900 transition-colors">
            <Camera className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Tomar Foto</h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Usa la cámara para analizar el entorno</p>
          </div>
        </button>
      </div>

      <div className="space-y-8 mt-8">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-l-4 border-indigo-600 pl-3">
          Análisis ({project.analyses.length})
        </h3>

        {project.analyses.length === 0 && (
          <div className="text-center py-12 text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700">
            <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No hay análisis todavía. ¡Sube o toma una foto para comenzar!</p>
          </div>
        )}

        {project.analyses.map((analysis) => (
          <div key={analysis.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col xl:flex-row">
            {/* Image Section - Clickable for gallery */}
            <div className="xl:w-1/3 bg-gray-100 dark:bg-gray-900 relative h-72 xl:h-auto group cursor-zoom-in" onClick={() => setViewImage(analysis.imageUrl)}>
               <img 
                 src={analysis.imageUrl} 
                 alt="Espacio analizado" 
                 className="w-full h-full object-cover transition-transform group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Eye className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 drop-shadow-md" />
               </div>
               <button 
                onClick={(e) => { e.stopPropagation(); deleteAnalysis(analysis.id); }}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                title="Eliminar análisis"
               >
                 <Trash2 className="w-4 h-4" />
               </button>
            </div>

            {/* Analysis Content */}
            <div className="xl:w-2/3 p-6 flex flex-col">
              {analysis.loading ? (
                <div className="flex-1 flex flex-col items-center justify-center text-indigo-600 dark:text-indigo-400 min-h-[300px]">
                  <Loader2 className="w-10 h-10 animate-spin mb-4" />
                  <p className="font-medium">Analizando accesibilidad con IA...</p>
                  <p className="text-sm text-gray-400 mt-2">Identificando barreras y elementos positivos</p>
                </div>
              ) : analysis.error ? (
                 <div className="flex-1 flex flex-col items-center justify-center text-red-500 dark:text-red-400 min-h-[300px]">
                    <AlertTriangle className="w-10 h-10 mb-2" />
                    <p className="font-semibold">{analysis.error}</p>
                    <button 
                      onClick={() => handleRetryAnalysis(analysis.id, analysis.imageUrl)}
                      className="mt-4 text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      Intentar de nuevo
                    </button>
                 </div>
              ) : analysis.result ? (
                <div className="flex flex-col h-full">
                  {/* Verdict & Summary */}
                  <div className="mb-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                        <div className="bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-800 dark:text-indigo-200 px-4 py-2 rounded-lg font-bold inline-block">
                             {analysis.result.verdict || "Análisis Completado"}
                        </div>
                        <button 
                            onClick={() => handleDownloadPDF(analysis)}
                            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 hover:text-indigo-600 dark:hover:text-indigo-400 border border-gray-200 dark:border-gray-600 hover:border-indigo-300 dark:hover:border-indigo-500 px-3 py-1.5 rounded-lg transition-colors bg-white dark:bg-gray-700 shadow-sm"
                        >
                            <Download className="w-4 h-4" />
                            Descargar PDF
                        </button>
                    </div>
                    {analysis.result.summary && (
                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">{analysis.result.summary}</p>
                    )}
                  </div>

                  {/* Categories Grid */}
                  {analysis.result.categories ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                        {analysis.result.categories.map((cat, idx) => (
                            <div key={idx} className="border border-gray-100 dark:border-gray-700 rounded-lg p-4 bg-gray-50/50 dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                                <div className="flex items-center justify-between mb-3">
                                    <div className="flex items-center gap-2 font-semibold text-gray-800 dark:text-gray-200">
                                        {getCategoryIcon(cat.title)}
                                        <span className="text-sm">{cat.title}</span>
                                    </div>
                                    <div title={cat.status === 'positive' ? 'Bueno' : cat.status === 'negative' ? 'Crítico' : 'Mejorable'}>
                                        {renderStatusIcon(cat.status)}
                                    </div>
                                </div>
                                <ul className="space-y-1.5">
                                    {cat.details.slice(0, 3).map((detail, i) => (
                                        <li key={i} className="text-xs text-gray-600 dark:text-gray-400 flex items-start gap-1.5">
                                            <span className="mt-1 block w-1 h-1 rounded-full bg-gray-400 dark:bg-gray-500 shrink-0" />
                                            {detail}
                                        </li>
                                    ))}
                                    {cat.details.length > 3 && (
                                        <li className="text-xs text-indigo-500 dark:text-indigo-400 font-medium pt-1">
                                            +{cat.details.length - 3} más...
                                        </li>
                                    )}
                                </ul>
                            </div>
                        ))}
                      </div>
                  ) : (
                    // Legacy markdown fallback
                    <div className="prose prose-indigo prose-sm max-w-none mb-6 line-clamp-6 dark:text-gray-300 dark:prose-invert">
                         <ReactMarkdown>{analysis.result.markdown || ""}</ReactMarkdown>
                    </div>
                  )}
                  
                  {/* Actions / Info */}
                  <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 flex items-center justify-between text-xs text-gray-400 dark:text-gray-500">
                     <span>Analizado el {new Date(analysis.result.timestamp).toLocaleDateString()}</span>
                     <span className="flex items-center gap-1">
                        <Info className="w-3 h-3" />
                        Resultados generados por IA
                     </span>
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                   <button 
                      onClick={() => handleRetryAnalysis(analysis.id, analysis.imageUrl)}
                      className="group flex flex-col items-center gap-3 p-6 rounded-xl hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                    >
                      <div className="bg-indigo-100 dark:bg-indigo-900/50 p-4 rounded-full group-hover:scale-110 transition-transform">
                          <Sparkles className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <span className="text-indigo-600 dark:text-indigo-400 font-semibold">Generar Análisis de Accesibilidad</span>
                    </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};