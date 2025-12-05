import React, { useState, useEffect } from 'react';
import { User, Project, ViewState, AnalysisItem } from './types';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { ProjectDetail } from './components/ProjectDetail';
import { Accessibility, LogOut, Download, Share, X, FileText, Moon, Sun } from 'lucide-react';
import { TermsModal } from './components/TermsModal';
import { useTheme } from './context/ThemeContext';
import { useToast } from './context/ToastContext';
import { analyzeAccessibility } from './services/gemini';

const STORAGE_KEY_USER = 'kivo_user';
const STORAGE_KEY_PROJECTS = 'kivo_projects';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('AUTH');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallModal, setShowInstallModal] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showTerms, setShowTerms] = useState(false);

  // Context Hooks
  const { theme, toggleTheme } = useTheme();
  const { addToast } = useToast();

  // Load initial data
  useEffect(() => {
    const savedUser = localStorage.getItem(STORAGE_KEY_USER);
    
    if (savedUser) {
      setUser(JSON.parse(savedUser));
      setCurrentView('DASHBOARD');
    }

    const savedProjects = localStorage.getItem(STORAGE_KEY_PROJECTS);
    if (savedProjects) {
      setProjects(JSON.parse(savedProjects));
    }

    // Check if app is already running in standalone mode
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsStandalone(true);
    }
  }, []);

  // Listen for PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Persist projects whenever they change
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(projects));
  }, [projects]);

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));
    setCurrentView('DASHBOARD');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY_USER);
    setCurrentView('AUTH');
    setSelectedProjectId(null);
  };

  const handleCreateProject = (title: string, description: string) => {
    const newProject: Project = {
      id: Date.now().toString(),
      title,
      description,
      createdAt: Date.now(),
      analyses: []
    };
    setProjects([newProject, ...projects]);
    addToast('Proyecto creado exitosamente', 'success');
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  // Centralized Analysis Logic to persist across navigation
  const handleStartAnalysis = async (projectId: string, analysisId: string, imageBase64: string) => {
    addToast('Iniciando análisis de imagen...', 'loading');

    try {
      const analysisData = await analyzeAccessibility(imageBase64);
      
      setProjects(currentProjects => {
        const targetProject = currentProjects.find(p => p.id === projectId);
        if (!targetProject) return currentProjects;

        const newAnalyses = targetProject.analyses.map(a => 
            a.id === analysisId 
            ? { 
                ...a, 
                loading: false, 
                result: { 
                    ...analysisData, 
                    timestamp: Date.now() 
                } 
                } 
            : a
        );

        return currentProjects.map(p => 
            p.id === projectId ? { ...p, analyses: newAnalyses } : p
        );
      });

      addToast('Análisis completado exitosamente', 'success');

    } catch (error) {
       console.error(error);
       const errorMessage = "Error al analizar la imagen. Por favor intenta de nuevo.";
       
       setProjects(currentProjects => {
        const targetProject = currentProjects.find(p => p.id === projectId);
        if (!targetProject) return currentProjects;

        const newAnalyses = targetProject.analyses.map(a => 
            a.id === analysisId 
            ? { ...a, loading: false, error: errorMessage } 
            : a
        );
         return currentProjects.map(p => 
            p.id === projectId ? { ...p, analyses: newAnalyses } : p
        );
       });

       addToast('Error al realizar el análisis', 'error');
    }
  };

  const handleDeleteProject = (projectId: string) => {
      if (window.confirm("¿Estás seguro de que deseas eliminar este proyecto y todos sus análisis? Esta acción no se puede deshacer.")) {
        setProjects(projects.filter(p => p.id !== projectId));
        if (selectedProjectId === projectId) {
            setSelectedProjectId(null);
            setCurrentView('DASHBOARD');
        }
        addToast('Proyecto eliminado', 'info');
      }
  };

  const handleRenameProject = (projectId: string, newTitle: string, newDesc: string) => {
      setProjects(projects.map(p => 
        p.id === projectId 
            ? { ...p, title: newTitle, description: newDesc } 
            : p
      ));
      addToast('Proyecto actualizado', 'success');
  };

  const handleSelectProject = (project: Project) => {
    setSelectedProjectId(project.id);
    setCurrentView('PROJECT_DETAIL');
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
    } else {
      setShowInstallModal(true);
    }
  };

  // Render Logic
  if (currentView === 'AUTH' || !user) {
    return <Login onLogin={handleLogin} />;
  }

  const selectedProject = projects.find(p => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300 flex flex-col">
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}
      
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => { setCurrentView('DASHBOARD'); setSelectedProjectId(null); }}>
            <div className="bg-indigo-600 p-1.5 rounded-lg">
               <Accessibility className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white tracking-tight">KiVO</span>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-4">
            
            {/* Theme Toggle */}
            <button
                onClick={toggleTheme}
                className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
            >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {!isStandalone && (
              <button
                onClick={handleInstallClick}
                className={`flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-200 dark:border-indigo-800 px-3 py-1.5 rounded-lg transition-colors text-sm font-medium ${deferredPrompt ? 'animate-pulse' : ''}`}
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">Instalar App</span>
                <span className="sm:hidden">Instalar</span>
              </button>
            )}

            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user.name}</span>
              <button 
                onClick={() => setShowTerms(true)}
                className="text-xs text-gray-400 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1"
              >
                <FileText className="w-3 h-3" />
                Términos
              </button>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Cerrar Sesión"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'DASHBOARD' && (
          <Dashboard 
            user={user} 
            projects={projects} 
            onCreateProject={handleCreateProject}
            onSelectProject={handleSelectProject}
            onDeleteProject={handleDeleteProject}
            onRenameProject={handleRenameProject}
          />
        )}

        {currentView === 'PROJECT_DETAIL' && selectedProject && (
          <ProjectDetail 
            project={selectedProject} 
            onBack={() => { setCurrentView('DASHBOARD'); setSelectedProjectId(null); }}
            onUpdateProject={handleUpdateProject}
            onStartAnalysis={handleStartAnalysis}
          />
        )}
      </main>

      {/* Install Instructions Modal */}
      {showInstallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-sm w-full p-6 relative">
            <button 
              onClick={() => setShowInstallModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
            
            <div className="flex flex-col items-center text-center mb-6">
              <div className="bg-indigo-100 dark:bg-indigo-900/50 p-3 rounded-full mb-4">
                <Download className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Instalar KiVO</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">
                Agrega esta aplicación a tu pantalla de inicio para una mejor experiencia.
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-left">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                  <span className="text-indigo-600 dark:text-indigo-400"></span> iOS (iPhone/iPad)
                </h4>
                <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 list-decimal pl-4">
                  <li>Toca el botón <strong>Compartir</strong> <Share className="w-3 h-3 inline mx-1" /> en la barra del navegador.</li>
                  <li>Desliza hacia abajo y selecciona <strong>"Agregar a Inicio"</strong>.</li>
                </ol>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg text-left">
                <h4 className="font-semibold text-gray-900 dark:text-white text-sm mb-2 flex items-center gap-2">
                   <span className="text-green-600 dark:text-green-400">🤖</span> Android
                </h4>
                <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2 list-decimal pl-4">
                  <li>Toca el menú del navegador (tres puntos).</li>
                  <li>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</li>
                </ol>
              </div>
            </div>

            <button
              onClick={() => setShowInstallModal(false)}
              className="w-full mt-6 bg-indigo-600 text-white font-medium py-2.5 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;